document.addEventListener('DOMContentLoaded', async () => {
    // URL search params theke 'code' ba 'id' get kora
    const urlParams = new URLSearchParams(window.location.search);
    let rawCode = urlParams.get('code') || urlParams.get('id') || '';
    const cleanCode = rawCode.trim();

    if (!cleanCode) {
        renderError("সিকিউরড কিউআর কোড পাওয়া যায়নি!");
        return;
    }

    try {
        // ১. product_item_codes টেবিল থেকে unique_code দিয়ে ফেচ করা
        const { data: itemCode, error: codeErr } = await supabaseClient
            .from('product_item_codes')
            .select('*')
            .eq('unique_code', cleanCode)
            .maybeSingle();

        if (codeErr || !itemCode) {
            renderError("অপ্রমাণিত বা অবৈধ কিউআর কোড! এই পণ্যটি আসল নকল সিস্টেমে নিবন্ধিত নয়।");
            return;
        }

        // ২. products টেবিল থেকে প্রোডাক্টের ডাটা ফেচ করা
        const { data: product, error: prdErr } = await supabaseClient
            .from('products')
            .select('*')
            .eq('id', itemCode.product_id)
            .single();

        if (prdErr || !product) {
            renderError("পণ্য সম্পর্কিত বিস্তারিত তথ্য পাওয়া যায়নি।");
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
                .single();

            if (user) {
                merchantName = user.org_name || user.full_name || merchantName;
                merchantPhone = user.phone_number || null;
            }
        }

        // ৪. প্রথমবারের মতো স্ক্যান হলে status 'is_scanned: true' আপডেট করা
        if (!itemCode.is_scanned) {
            await supabaseClient
                .from('product_item_codes')
                .update({ is_scanned: true })
                .eq('id', itemCode.id);
        }

        // কার্ড রেন্ডার করা
        renderVerificationCard(product, itemCode, merchantName, merchantPhone);

    } catch (err) {
        console.error("Verification Error:", err.message);
        renderError("সার্ভারে সমস্যা হয়েছে! অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।");
    }
});

function renderVerificationCard(product, itemCode, merchantName, merchantPhone) {
    const contentArea = document.getElementById('content-area');

    const isOriginal = product.status && product.status.toLowerCase() === 'approved';
    const statusText = isOriginal ? '১০০% আসল ও রেজিস্টার্ড পণ্য' : 'যাচাইকরণ প্রক্রিয়াধীন';
    const statusIcon = isOriginal ? 'fa-shield-check' : 'fa-clock';

    // Image URL handle (jsonb array)
    let imageUrl = '';
    if (product.product_images && Array.isArray(product.product_images) && product.product_images.length > 0) {
        imageUrl = product.product_images[0];
    } else if (typeof product.product_images === 'string') {
        imageUrl = product.product_images;
    }

    contentArea.innerHTML = `
        <div class="card-header">
            <div class="badge-icon">
                <i class="fa-solid ${statusIcon}"></i>
            </div>
            <h2>অফিসিয়ালি ভেরিফাইড প্রোডাক্ট</h2>
            <div class="status-badge">
                <i class="fa-solid fa-check-double"></i> ${statusText}
            </div>
        </div>

        ${imageUrl ? `
        <div class="verified-image-container">
            <img src="${imageUrl}" alt="${product.title}" class="verified-img" onerror="this.parentElement.style.display='none'">
        </div>` : ''}

        <div class="card-body">
            <div class="info-group">
                <span class="label">পণ্যের নাম:</span>
                <span class="value">${product.title || 'N/A'}</span>
            </div>

            <div class="info-group">
                <span class="label">ইউনিক সিকিউর কোড:</span>
                <span class="value font-mono text-xs text-sky-600">${itemCode.unique_code}</span>
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
                <span class="value text-rose-600">${product.exp_date}</span>
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
                    <a href="tel:${merchantPhone}" style="color: #0284c7; text-decoration: none;">
                        <i class="fa-solid fa-phone"></i> ${merchantPhone}
                    </a>
                </span>
            </div>` : ''}

            ${product.description ? `
            <div style="margin-top: 15px; padding-top: 12px; border-top: 1px dashed #e2e8f0;">
                <span class="label" style="display:block; margin-bottom: 6px;">পণ্যের বিবরণ:</span>
                <p style="font-size: 13px; color: #334155; line-height: 1.5;">${product.description}</p>
            </div>` : ''}
        </div>
    `;
}

function renderError(message) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="state-container">
            <i class="fa-solid fa-triangle-exclamation" style="font-size: 48px; color: #ef4444; margin-bottom: 12px;"></i>
            <h3 style="color: #ef4444; margin-bottom: 8px;">ভেরিফিকেশন ব্যর্থ হয়েছে</h3>
            <p style="color: #64748b; font-size: 13px;">${message}</p>
        </div>
    `;
}