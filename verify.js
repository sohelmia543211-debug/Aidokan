document.addEventListener('DOMContentLoaded', async () => {
    // URL search params থেকে 'code' বা 'id' সংগ্রহ করা
    const urlParams = new URLSearchParams(window.location.search);
    let rawCode = urlParams.get('code') || urlParams.get('id') || '';
    const cleanCode = rawCode.trim();

    if (!cleanCode) {
        renderError("সিকিউরড কিউআর কোড পাওয়া যায়নি!");
        return;
    }

    try {
        // ১. product_item_codes টেবিল থেকে unique_code দিয়ে ডাটা ফেচ করা
        const { data: itemCode, error: codeErr } = await supabaseClient
            .from('product_item_codes')
            .select('*')
            .eq('unique_code', cleanCode)
            .maybeSingle();

        if (codeErr || !itemCode) {
            renderError("অবৈধ বা অপ্রমাণিত কিউআর কোড! এই পণ্যটি 'আসল নকল' সিস্টেমে নিবন্ধিত নয়।");
            return;
        }

        // ২. products টেবিল থেকে মূল প্রোডাক্টের ডাটা ফেচ করা
        const { data: product, error: prdErr } = await supabaseClient
            .from('products')
            .select('*')
            .eq('id', itemCode.product_id)
            .single();

        if (prdErr || !product) {
            renderError("পণ্য সম্পর্কিত বিস্তারিত তথ্য ডাটাবেজে পাওয়া যায়নি।");
            return;
        }

        // ৩. মার্চেন্ট বা প্রতিষ্ঠানের তথ্য ফেচ করা
        let merchantName = 'অফিসিয়াল মার্চেন্ট';
        let merchantPhone = null;

        if (product.merchant_id) {
            const { data: user } = await supabaseClient
                .from('users')
                .select('org_name, full_name, phone_number')
                .eq('id', product.merchant_id)
                .maybeSingle();

            if (user) {
                merchantName = user.org_name || user.full_name || merchantName;
                merchantPhone = user.phone_number || null;
            }
        }

        // ৪. লোকেশন ডিটেকশন (প্রথমে জিপিএস, না পেলে ব্যাকগ্রাউন্ড আইপি ট্র্যাকিং)
        getLocationAndProcess(product, itemCode, merchantName, merchantPhone);

    } catch (err) {
        console.error("Verification Error:", err.message);
        renderError("সার্ভারে সংযোগে সমস্যা হয়েছে! অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন।");
    }
});

// স্মার্ট লোকেশন ট্র্যাকার (GPS -> IP Fallback)
function getLocationAndProcess(product, itemCode, merchantName, merchantPhone) {
    let gpsHandled = false;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                gpsHandled = true;
                const currentLat = position.coords.latitude;
                const currentLng = position.coords.longitude;
                await processSecurityAndLocation(product, itemCode, merchantName, merchantPhone, currentLat, currentLng, "GPS Location");
            },
            async (error) => {
                // জিপিএস পারমিশন ব্লক বা ফেইল করলে অটো আইপি (IP) দিয়ে লোকেশন আনবে
                if (!gpsHandled) {
                    gpsHandled = true;
                    await fetchLocationByIPAndProcess(product, itemCode, merchantName, merchantPhone);
                }
            },
            { timeout: 5000, enableHighAccuracy: true }
        );

        // ৫ সেকেন্ডের মধ্যে জিপিএস না সাড়া দিলে আইপিতে সুইচ করবে
        setTimeout(async () => {
            if (!gpsHandled) {
                gpsHandled = true;
                await fetchLocationByIPAndProcess(product, itemCode, merchantName, merchantPhone);
            }
        }, 5500);
    } else {
        fetchLocationByIPAndProcess(product, itemCode, merchantName, merchantPhone);
    }
}

// IP Address দিয়ে ব্যাকগ্রাউন্ডে লোকেশন বের করার ফিক্সড ফাংশন (ip-api.com)
async function fetchLocationByIPAndProcess(product, itemCode, merchantName, merchantPhone) {
    try {
        const response = await fetch('https://ip-api.com/json/?fields=status,message,country,regionName,city,lat,lon');
        const data = await response.json();
        
        if (data && data.status === 'success') {
            const lat = data.lat;
            const lon = data.lon;
            const locationName = `${data.city || ''}, ${data.regionName || ''}, ${data.country || ''} (IP Based)`.trim();
            
            await processSecurityAndLocation(product, itemCode, merchantName, merchantPhone, lat, lon, locationName);
        } else {
            await processSecurityAndLocation(product, itemCode, merchantName, merchantPhone, null, null, "Bangladesh (Default)");
        }
    } catch (err) {
        console.warn("IP Geolocation failed:", err);
        await processSecurityAndLocation(product, itemCode, merchantName, merchantPhone, null, null, "Offline Location");
    }
}

// স্পিড চেক, লোকেশন আপডেট ও স্ক্যান হিস্ট্রি লগ করার ফাংশন
async function processSecurityAndLocation(product, itemCode, merchantName, merchantPhone, currentLat, currentLng, locationSource) {
    let isFraudulentMovement = false;
    let newScanCount = (itemCode.scan_count || 0) + 1;
    const now = new Date();

    // ১. সময় ও দূরত্বের যৌক্তিকতা পরীক্ষা (Velocity Check)
    if (itemCode.first_scan_lat && itemCode.first_scan_lng && itemCode.updated_at && currentLat && currentLng) {
        const lastScanTime = new Date(itemCode.updated_at);
        const timeDiffHours = (now - lastScanTime) / (1000 * 60 * 60); // ঘণ্টায় সময়
        const distanceKm = getDistanceFromLatLonInKm(
            itemCode.first_scan_lat, itemCode.first_scan_lng,
            currentLat, currentLng
        );

        if (timeDiffHours > 0) {
            const calculatedSpeed = distanceKm / timeDiffHours;
            // যদি ভ্রমণের গতি ৭০ কিমি/ঘণ্টার বেশি হয় এবং দূরত্ব ১০ কিমির বেশি হয়
            if (calculatedSpeed > 70 && distanceKm > 10) {
                isFraudulentMovement = true;
            }
        }
    }

    // ২. মূল product_item_codes টেবিলে আপডেট পে-লোড
    let updatePayload = {
        scan_count: newScanCount,
        is_scanned: true,
        updated_at: now.toISOString()
    };

    if (!itemCode.first_scan_lat && currentLat) {
        updatePayload.first_scan_lat = currentLat;
        updatePayload.first_scan_lng = currentLng;
    }

    if (currentLat) {
        updatePayload.last_scan_lat = currentLat;
        updatePayload.last_scan_lng = currentLng;
    }

    await supabaseClient
        .from('product_item_codes')
        .update(updatePayload)
        .eq('id', itemCode.id);

    // ৩. প্রতিটি স্ক্যানের জন্য আলাদা হিস্ট্রি লগ (product_scan_logs) ইনসার্ট করা
    await supabaseClient
        .from('product_scan_logs')
        .insert([{
            product_id: product.id,
            item_code_id: itemCode.id,
            unique_code: itemCode.unique_code,
            latitude: currentLat || null,
            longitude: currentLng || null,
            location_name: locationSource || null,
            is_suspicious: isFraudulentMovement,
            scanned_at: now.toISOString()
        }]);

    // ৪. ভেরিফিকেশন কার্ড রেন্ডার করা
    renderVerificationCard(product, itemCode, merchantName, merchantPhone, isFraudulentMovement, newScanCount, currentLat, currentLng, locationSource);
}

// দুই পয়েন্টের দূরত্ব নির্ণয়ের সূত্র (Haversine formula)
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // পৃথিবীর ব্যাসার্ধ (কিমি)
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

function renderVerificationCard(product, itemCode, merchantName, merchantPhone, isFraudulentMovement, scanCount, lat, lng, locationSource) {
    const contentArea = document.getElementById('content-area');
    const isApproved = product.status && product.status.toLowerCase() === 'approved';

    let statusText = '১০০% আসল ও রেজিস্টার্ড পণ্য';
    let statusIcon = 'fa-circle-check';
    let headerStyle = '';

    if (!isApproved) {
        statusText = 'যাচাইকরণ প্রক্রিয়াধীন';
        statusIcon = 'fa-clock';
        headerStyle = 'background: linear-gradient(135deg, #d97706 0%, #b45309 100%);';
    } else if (isFraudulentMovement) {
        statusText = 'সতর্কতা: অসম্ভব সময়ে দূরবর্তী স্থান থেকে নকল কিউআর স্ক্যান বা জালিয়াতির চেষ্টা!';
        statusIcon = 'fa-triangle-exclamation';
        headerStyle = 'background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);';
    }

    let imageUrl = '';
    if (product.product_images) {
        if (Array.isArray(product.product_images) && product.product_images.length > 0) {
            imageUrl = product.product_images[0];
        } else if (typeof product.product_images === 'string') {
            try {
                const parsed = JSON.parse(product.product_images);
                imageUrl = Array.isArray(parsed) ? parsed[0] : product.product_images;
            } catch (e) {
                imageUrl = product.product_images;
            }
        }
    }

    // গুগল ম্যাপস ও লোকেশন ট্যাগ
    let mapLinkHtml = '';
    if (lat && lng) {
        const googleMapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
        mapLinkHtml = `
            <div class="info-group" style="background: rgba(14, 165, 233, 0.1); padding: 8px 12px; border-radius: 12px; margin-top: 8px;">
                <span class="label">স্ক্যানকৃত লোকেশন:</span>
                <span class="value">
                    <a href="${googleMapUrl}" target="_blank" style="color: #0284c7; text-decoration: underline; font-weight: 700;">
                        <i class="fa-solid fa-location-dot"></i> ম্যাপে দেখুন (${locationSource})
                    </a>
                </span>
            </div>
        `;
    }

    contentArea.innerHTML = `
        <div class="card-header" style="${headerStyle}">
            <div class="badge-icon">
                <i class="fa-solid ${statusIcon}"></i>
            </div>
            <h2>অফিসিয়ালি ভেরিফাইড প্রোডাক্ট</h2>
            <div class="status-badge">
                <i class="fa-solid fa-shield-check"></i> ${statusText}
            </div>
        </div>

        ${imageUrl ? `
        <div class="verified-image-container">
            <img src="${imageUrl}" alt="${product.title || 'পণ্য'}" class="verified-img" onerror="this.parentElement.style.display='none'">
        </div>` : ''}

        <div class="card-body">
            <div class="info-group">
                <span class="label">পণ্যের নাম:</span>
                <span class="value">${product.title || 'N/A'}</span>
            </div>

            <div class="info-group">
                <span class="label">সিকিউর কোড:</span>
                <span class="value font-mono text-xs" style="color: #0284c7; font-weight: 700;">${itemCode.unique_code}</span>
            </div>

            <div class="info-group">
                <span class="label">মোট স্ক্যান সংখ্যা:</span>
                <span class="value font-mono" style="color: #0284c7; font-weight: 700;">${scanCount} বার</span>
            </div>

            ${mapLinkHtml}

            <div class="info-group">
                <span class="label">মূল্য (Price):</span>
                <span class="value price-tag">৳ ${product.price || 0}</span>
            </div>

            <div class="info-group">
                <span class="label">ব্যাচ নম্বর (Batch):</span>
                <span class="value font-mono">${product.batch_no || 'N/A'}</span>
            </div>

            ${product.mfg_date ? `
            <div class="info-group">
                <span class="label">উৎপাদন তারিখ:</span>
                <span class="value">${product.mfg_date}</span>
            </div>` : ''}

            ${product.exp_date ? `
            <div class="info-group">
                <span class="label">মেয়াদ উত্তীর্ণ:</span>
                <span class="value" style="color: #e11d48; font-weight: 700;">${product.exp_date}</span>
            </div>` : ''}

            ${product.license_no ? `
            <div class="info-group">
                <span class="label">লাইসেন্স/অনুমোদন:</span>
                <span class="value font-mono">${product.license_no}</span>
            </div>` : ''}

            <div class="info-group">
                <span class="label">মার্চেন্ট / প্রতিষ্ঠান:</span>
                <span class="value">${merchantName}</span>
            </div>

            ${merchantPhone ? `
            <div class="info-group">
                <span class="label">যোগাযোগ:</span>
                <span class="value">
                    <a href="tel:${merchantPhone}" style="color: #0284c7; text-decoration: none; font-weight: 700;">
                        <i class="fa-solid fa-phone"></i> ${merchantPhone}
                    </a>
                </span>
            </div>` : ''}

            ${product.description ? `
            <div style="margin-top: 15px; padding-top: 12px; border-top: 1px dashed #e2e8f0;">
                <span class="label" style="display:block; margin-bottom: 6px; font-weight: 600;">পণ্যের বিবরণ:</span>
                <p style="font-size: 13px; color: #334155; line-height: 1.6; white-space: pre-line;">${product.description}</p>
            </div>` : ''}
        </div>
    `;
}

function renderError(message) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="state-container" style="padding: 40px 20px;">
            <i class="fa-solid fa-circle-xmark" style="font-size: 52px; color: #ef4444; margin-bottom: 14px;"></i>
            <h3 style="color: #ef4444; font-size: 18px; font-weight: 700; margin-bottom: 8px;">ভেরিফিকেশন ব্যর্থ হয়েছে</h3>
            <p style="color: #64748b; font-size: 13px; line-height: 1.5;">${message}</p>
        </div>
    `;
}