document.addEventListener('DOMContentLoaded', async () => {
    // URL noise/bracket clean korar function
    const urlParams = new URLSearchParams(window.location.search);
    let rawId = urlParams.get('id') || '';
    
    // Extracted clean item_code (e.g., 56587)
    const cleanId = rawId.replace(/[^a-zA-Z0-9_-]/g, '').trim();

    if (!cleanId) {
        renderError("Item ID পাওয়া যায়নি!");
        return;
    }

    try {
        // Supabase 'gigs' table theke item_code দিয়ে fetch
        const { data: gig, error } = await supabaseClient
            .from('gigs')
            .select('*')
            .eq('item_code', cleanId)
            .single();

        if (error || !gig) {
            renderError("ডাটা পাওয়া যায়নি অথবা পণ্যটি সঠিক নয়।");
            return;
        }

        renderVerificationCard(gig);
    } catch (err) {
        console.error(err);
        renderError("সার্ভার ত্রুটি! আবার চেষ্টা করুন।");
    }
});

function renderVerificationCard(gig) {
    const contentArea = document.getElementById('content-area');

    const formattedDate = gig.created_at 
        ? new Date(gig.created_at).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'N/A';

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

        ${gig.image_url ? `
        <div class="verified-image-container">
            <img src="${gig.image_url}" alt="${gig.gig_title || 'Product Image'}" class="verified-img" onerror="this.parentElement.style.display='none'">
        </div>` : ''}

        <div class="card-body">
            <div class="info-group">
                <span class="label">Product / Service Name:</span>
                <span class="value">${gig.gig_title || 'N/A'}</span>
            </div>

            ${gig.short_description ? `
            <div class="info-group">
                <span class="label">Short Description:</span>
                <span class="value">${gig.short_description}</span>
            </div>` : ''}

            <div class="info-group">
                <span class="label">Code / Reg No:</span>
                <span class="value">${gig.item_code}</span>
            </div>

            ${gig.price ? `
            <div class="info-group">
                <span class="label">Price:</span>
                <span class="value price-tag">৳ ${gig.price}</span>
            </div>` : ''}

            <div class="info-group">
                <span class="label">Status:</span>
                <span class="value">${gig.status || 'Approved'}</span>
            </div>

            <div class="info-group">
                <span class="label">Verification Date:</span>
                <span class="value">${formattedDate}</span>
            </div>

            ${gig.gig_description ? `
            <div class="info-group" style="flex-direction: column; align-items: flex-start; gap: 4px; margin-top: 10px;">
                <span class="label">Description:</span>
                <p style="font-size: 13px; color: #475569; line-height: 1.4;">${gig.gig_description}</p>
            </div>` : ''}
        </div>
    `;
}

function renderError(message) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="state-container">
            <i class="fa-solid fa-triangle-exclamation" style="font-size: 48px; color: #ef4444; margin-bottom: 12px;"></i>
            <h3 style="color: #ef4444; margin-bottom: 8px;">Verification Failed</h3>
            <p style="color: #64748b;">${message}</p>
        </div>
    `;
}