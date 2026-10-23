document.addEventListener('DOMContentLoaded', async () => {
    // URL search params থেকে 'code' বা 'id' সংগ্রহ করা
    const urlParams = new URLSearchParams(window.location.search);
    let rawCode = urlParams.get('code') || urlParams.get('id') || '';
    const cleanCode = rawCode.trim();

    if (!cleanCode) {
        renderError("সিকিউরড কিউআর কোড পাওয়া যায়নি!");
        return;
    }

    try {
        // ১. product_item_codes টেবিল থেকে unique_code দিয়ে ডাটা ফেচ করা
        const { data: itemCode, error: codeErr } = await supabaseClient
            .from('product_item_codes')
            .select('*')
            .eq('unique_code', cleanCode)
            .maybeSingle();

        if (codeErr || !itemCode) {
            renderError("অবৈধ বা অপ্রমাণিত কিউআর কোড! এই পণ্যটি 'আসল নকল' সিস্টেমে নিবন্ধিত নয়।");
            return;
        }

        // ২. products টেবিল থেকে মূল প্রোডাক্টের ডাটা ফেচ করা
        const { data: product, error: prdErr } = await supabaseClient
            .from('products')
            .select('*')
            .eq('id', itemCode.product_id)
            .single();

        if (prdErr || !product) {
            renderError("পণ্য সম্পর্কিত বিস্তারিত তথ্য ডাটাবেজে পাওয়া যায়নি।");
            return;
        }

        // ৩. মার্চেন্ট বা প্রতিষ্ঠানের তথ্য ফেচ করা
        let merchantName = 'অফিসিয়াল মার্চেন্ট';
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

        // ৪. প্রথমবার স্ক্যানিং ট্র্যাকিং চেক
        const wasAlreadyScanned = itemCode.is_scanned === true;

        // যদি আগে স্ক্যান না হয়ে থাকে, তবে এখন true করে দেওয়া
        if (!wasAlreadyScanned) {
            await supabaseClient
                .from('product_item_codes')
                .update({ is_scanned: true })
                .eq('id', itemCode.id);
        }

        // কার্ড রেন্ডার করা
        renderVerificationCard(product, itemCode, merchantName, merchantPhone, wasAlreadyScanned);

    } catch (err) {
        console.error("Verification Error:", err.message);
        renderError("সার্ভারে সংযোগে সমস্যা হয়েছে! অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন।");
    }
});

function renderVerificationCard(product, itemCode, merchantName, merchantPhone, wasAlreadyScanned) {
    const contentArea = document.getElementById('content-area');

    // স্ট্যাটাস ও ভেরিফিকেশন লজিক
    const isApproved = product.status && product.status.toLowerCase() === 'approved';
    
    let statusText = '১০০% আসল ও রেজিস্টার্ড পণ্য';
    let statusIcon = 'fa-circle-check';
    let headerStyle = '';

    if (!isApproved) {
        statusText = 'যাচাইকরণ প্রক্রিয়াধীন';
        statusIcon = 'fa-clock';
        headerStyle = 'background: linear-gradient(135deg, #d97706 0%, #b45309 100%);';
    } else if (wasAlreadyScanned) {
        statusText = 'সতর্কতা: পণ্যটি ইতিপূর্বে একবার স্ক্যান হয়েছে!';
        statusIcon = 'fa-triangle-exclamation';
        headerStyle = 'background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);';
    }

    // ছবির URL হ্যান্ডেল করা (JSON array বা string)
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
        <div class="card-header" style="${headerStyle}">
            <div class="badge-icon">
                <i class="fa-solid ${statusIcon}"></i>
            </div>
            <h2>অফিসিয়ালি ভেরিফাইড প্রোডাক্ট</h2>
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
                <span class="label">মেয়াদ উত্তীর্ণ:</span>
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
            <h3 style="color: #ef4444; font-size: 18px; font-weight: 700; margin-bottom: 8px;">ভেরিফিকেশন ব্যর্থ হয়েছে</h3>
            <p style="color: #64748b; font-size: 13px; line-height: 1.5;">${message}</p>
        </div>
    `;
}