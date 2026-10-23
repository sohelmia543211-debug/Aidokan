document.addEventListener('DOMContentLoaded', async () => {
    // URL search params theke 'code' ba 'id' songroh kora
    const urlParams = new URLSearchParams(window.location.search);
    let rawCode = urlParams.get('code') || urlParams.get('id') || '';
    const cleanCode = rawCode.trim();

    if (!cleanCode) {
        renderError("Secured QR code pawa jayni!");
        return;
    }

    try {
        // 1. product_item_codes table theke unique_code diye data fetch kora
        const { data: itemCode, error: codeErr } = await supabaseClient
            .from('product_item_codes')
            .select('*')
            .eq('unique_code', cleanCode)
            .maybeSingle();

        if (codeErr || !itemCode) {
            renderError("Oboidho ba oprobanito QR code! Ei ponnoti 'Asol Nokol' system-e registered noy.");
            return;
        }

        // 2. products table theke mul product-er data fetch kora
        const { data: product, error: prdErr } = await supabaseClient
            .from('products')
            .select('*')
            .eq('id', itemCode.product_id)
            .single();

        if (prdErr || !product) {
            renderError("Ponno somporkito bistarito tothyo database-e pawa jayni.");
            return;
        }

        // 3. Merchant ba protishthaner tothyo fetch kora
        let merchantName = 'Official Merchant';
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

        // 4. Location detection (GPS -> Background IP Fallback)
        getLocationAndProcess(product, itemCode, merchantName, merchantPhone);

    } catch (err) {
        console.error("Verification Error:", err.message);
        renderError("Server-e somoshya hoyeche! Anugroh kore kichukhon por chesta korun.");
    }
});

// Smart Location Tracker (Background tracking only)
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
                if (!gpsHandled) {
                    gpsHandled = true;
                    await fetchLocationByIPAndProcess(product, itemCode, merchantName, merchantPhone);
                }
            },
            { timeout: 5000, enableHighAccuracy: true }
        );

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

// IP Address দিয়ে ব্যাকগ্রাউন্ড লোকেশন সেভ করার ফাংশন
async function fetchLocationByIPAndProcess(product, itemCode, merchantName, merchantPhone) {
    try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        
        if (data && data.latitude && data.longitude) {
            const lat = parseFloat(data.latitude);
            const lon = parseFloat(data.longitude);
            const locationName = `${data.city || ''}, ${data.region || ''}, ${data.country_name || ''} (IP Based)`.trim();
            
            await processSecurityAndLocation(product, itemCode, merchantName, merchantPhone, lat, lon, locationName);
            return;
        }
    } catch (err) {
        console.warn("Primary IP Geolocation failed, trying backup...", err);
    }

    try {
        const res2 = await fetch('https://www.geoplugin.net/json.gp');
        const data2 = await res2.json();

        if (data2 && data2.geoplugin_latitude && data2.geoplugin_longitude) {
            const lat = parseFloat(data2.geoplugin_latitude);
            const lon = parseFloat(data2.geoplugin_longitude);
            const locationName = `${data2.geoplugin_city || ''}, ${data2.geoplugin_region || ''}, ${data2.geoplugin_countryName || ''} (GeoPlugin)`.trim();

            await processSecurityAndLocation(product, itemCode, merchantName, merchantPhone, lat, lon, locationName);
            return;
        }
    } catch (err2) {
        console.warn("Backup IP API failed:", err2);
    }

    await processSecurityAndLocation(product, itemCode, merchantName, merchantPhone, 23.8103, 90.4125, "Bangladesh (Default IP)");
}

// Speed check, location update & scan history log
async function processSecurityAndLocation(product, itemCode, merchantName, merchantPhone, currentLat, currentLng, locationSource) {
    let isFraudulentMovement = false;
    let newScanCount = (itemCode.scan_count || 0) + 1;
    const now = new Date();

    if (itemCode.first_scan_lat && itemCode.first_scan_lng && itemCode.updated_at && currentLat && currentLng) {
        const lastScanTime = new Date(itemCode.updated_at);
        const timeDiffHours = (now - lastScanTime) / (1000 * 60 * 60);
        const distanceKm = getDistanceFromLatLonInKm(
            itemCode.first_scan_lat, itemCode.first_scan_lng,
            currentLat, currentLng
        );

        if (timeDiffHours > 0) {
            const calculatedSpeed = distanceKm / timeDiffHours;
            if (calculatedSpeed > 70 && distanceKm > 10) {
                isFraudulentMovement = true;
            }
        }
    }

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

    renderVerificationCard(product, itemCode, merchantName, merchantPhone, isFraudulentMovement, newScanCount);
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
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

// Fixed UI Render Function
function renderVerificationCard(product, itemCode, merchantName, merchantPhone, isFraudulentMovement, scanCount) {
    const contentArea = document.getElementById('content-area');
    const isApproved = product.status && product.status.toLowerCase() === 'approved';

    let statusText = '১০০% আসল ও রেজিস্টার্ড পণ্য';
    let statusIcon = 'fa-circle-check';
    let headerStyle = 'background: linear-gradient(135deg, #10b981 0%, #059669 100%);';

    if (!isApproved) {
        statusText = 'যাচাইকরণ প্রক্রিয়াধীন';
        statusIcon = 'fa-clock';
        headerStyle = 'background: linear-gradient(135deg, #d97706 0%, #b45309 100%);';
    } else if (isFraudulentMovement) {
        statusText = 'সতর্কতা: অসম্ভব সময়ে নকল কিউআর স্ক্যান বা জালিয়াতির চেষ্টা!';
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

    contentArea.innerHTML = `
        <div class="card-header" style="${headerStyle}; padding: 22px 16px; text-align: center; border-radius: 16px 16px 0 0;">
            <div class="badge-icon" style="font-size: 38px; color: #ffffff; margin-bottom: 8px;">
                <i class="fa-solid ${statusIcon}"></i>
            </div>
            <h2 style="font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 8px;">অফিসিয়ালি ভেরিফাইড প্রোডাক্ট</h2>
            
            <!-- 100% Asol o Registered Ponno Badge Highlight -->
            <div class="status-badge" style="display: inline-block; background: rgba(255, 255, 255, 0.25); backdrop-filter: blur(4px); border: 1px solid rgba(255, 255, 255, 0.4); color: #ffffff; padding: 8px 16px; border-radius: 30px; font-size: 15px; font-weight: 700; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                <i class="fa-solid fa-shield-check"></i> ${statusText}
            </div>
        </div>

        ${imageUrl ? `
        <div class="verified-image-container" style="text-align: center; margin-top: 15px;">
            <img src="${imageUrl}" alt="${product.title || 'পণ্য'}" class="verified-img" style="max-width: 140px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);" onerror="this.parentElement.style.display='none'">
        </div>` : ''}

        <div class="card-body" style="padding: 16px;">
            
            <!-- Company / Merchant Name (Top Highlighted) -->
            <div class="info-group" style="background: #f8fafc; padding: 12px 14px; border-radius: 10px; border-left: 4px solid #0284c7; margin-bottom: 12px;">
                <span class="label" style="font-size: 12px; color: #64748b; display: block; font-weight: 600;">কোম্পানি / মার্চেন্ট:</span>
                <span class="value" style="font-size: 18px; font-weight: 700; color: #0f172a;">${merchantName}</span>
            </div>

            <div class="info-group">
                <span class="label">পণ্যের নাম:</span>
                <span class="value" style="font-weight: 600;">${product.title || 'N/A'}</span>
            </div>

            <div class="info-group">
                <span class="label">সিকিউর কোড:</span>
                <span class="value font-mono text-xs" style="color: #0284c7; font-weight: 700;">${itemCode.unique_code}</span>
            </div>

            <div class="info-group">
                <span class="label">মোট স্ক্যান সংখ্যা:</span>
                <span class="value font-mono" style="color: #0284c7; font-weight: 700;">${scanCount} বার</span>
            </div>

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

            <!-- Phone Number (Show only if available) -->
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
        <div class="state-container" style="padding: 40px 20px; text-align: center;">
            <i class="fa-solid fa-circle-xmark" style="font-size: 52px; color: #ef4444; margin-bottom: 14px;"></i>
            <h3 style="color: #ef4444; font-size: 18px; font-weight: 700; margin-bottom: 8px;">ভেরিফিকেশন ব্যর্থ হয়েছে</h3>
            <p style="color: #64748b; font-size: 13px; line-height: 1.5;">${message}</p>
        </div>
    `;
}