document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get('id') || '56587';

    // ডেমো বা ডাটাবেস থেকে ডেটা লোড
    setTimeout(() => {
        const dbData = {
            gig_title: "Premium Electric Spice Grinder",
            category: "Merchant / Factory",
            subCategory: "Electronics & Appliances",
            item_code: itemId,
            price: "577",
            // এখানে আপনার Supabase টেবিলের আসল image_url বসবে
            image_url: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=400&auto=format&fit=crop", 
            verifiedBy: "TopTopBD Official",
            status: "Approved",
            created_at: "October 20, 2026"
        };

        renderVerificationCard(dbData);
    }, 500);
});

function renderVerificationCard(data) {
    const contentArea = document.getElementById('content-area');

    contentArea.innerHTML = `
        <div class="card-header">
            <div class="badge-icon">
                <i class="fa-solid fa-circle-check"></i>
            </div>
            <h2>Officially Verified Product</h2>
            <div class="status-badge">
                <i class="fa-solid fa-check"></i> 100% Original & Registered
            </div>
        </div>

        <!-- ইমেজ ট্যাগ যাতে ব্রোকেন না দেখায় onerror হ্যান্ডਲার সহ -->
        ${data.image_url ? `
        <div class="verified-image-container">
            <img src="${data.image_url}" alt="${data.gig_title}" class="verified-img" onerror="this.style.display='none'">
        </div>` : ''}

        <div class="card-body">
            <div class="info-group">
                <span class="label">Product / Service Name:</span>
                <span class="value">${data.gig_title}</span>
            </div>
            <div class="info-group">
                <span class="label">Categories:</span>
                <span class="value">${data.category}</span>
            </div>
            <div class="info-group">
                <span class="label">Sub-categories:</span>
                <span class="value">${data.subCategory}</span>
            </div>
            <div class="info-group">
                <span class="label">Code / Reg No:</span>
                <span class="value">${data.item_code}</span>
            </div>
            ${data.price ? `
            <div class="info-group">
                <span class="label">Price:</span>
                <span class="value price-tag">৳ ${data.price}</span>
            </div>` : ''}
            <div class="info-group">
                <span class="label">Merchant / Organization:</span>
                <span class="value">${data.verifiedBy}</span>
            </div>
            <div class="info-group">
                <span class="label">Verification Date:</span>
                <span class="value">${data.created_at}</span>
            </div>
        </div>
    `;
}