// Supabase SDK Import
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Apnar Supabase Credentials Boshan
const SUPABASE_URL = 'https://YOUR_SUPABASE_URL.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async () => {
    // URL param parsing & cleaning
    const urlParams = new URLSearchParams(window.location.search);
    let rawId = urlParams.get('id') || '';
    
    // Extracted clean item_code (e.g., 56587)
    const cleanId = rawId.replace(/[^a-zA-Z0-9_-]/g, '').trim();

    if (!cleanId) {
        renderError("Item ID পাওয়া যায়নি!");
        return;
    }

    try {
        // 1. Supabase 'gigs' table theke item_code diye fetch
        const { data: gig, error: gigError } = await supabase
            .from('gigs')
            .select('*')
            .eq('item_code', cleanId)
            .single();

        if (gigError || !gig) {
            renderError("তথ্য পাওয়া যায়নি অথবা পণ্যটি নিবন্ধিত নয়।");
            return;
        }

        // 2. Dynamic Merchant / User details fetch from 'users' table
        let merchantName = 'অফিসিয়াল মার্চেন্ট';
        let merchantPhone = null;

        if (gig.user_id) {
            const { data: userData } = await supabase
                .from('users')
                .select('org_name, full_name, phone_number')
                .eq('id', gig.user_id)
                .single();

            if (userData) {
                merchantName = userData.org_name || userData.full_name || merchantName;
                merchantPhone = userData.phone_number || null;
            }
        }

        renderVerificationCard(gig, merchantName, merchantPhone);
    } catch (err) {
        console.error("Verification Error:", err);
        renderError("সার্ভার সমস্যা! অনুগ্রহ করে আবার চেষ্টা করুন।");
    }
});

function renderVerificationCard(gig, merchantName, merchantPhone) {
    const contentArea = document.getElementById('content-area');

    // Status formatting
    const isApproved = gig.status && gig.status.toLowerCase() === 'approved';
    const statusText = isApproved ? '১০০% অরিজিনাল ও নিবন্ধিত' : 'যাচাইকরণ প্রক্রিয়াধীন';
    const statusIcon = isApproved ? 'fa-circle-check' : 'fa-clock';
    const statusBgClass = isApproved ? '' : 'style="background: rgba(245, 158, 11, 0.2); border-color: rgba(245, 158, 11, 0.4);"' ;

    // Created At Date Formatting
    const formattedDate = gig.created_at 
        ? new Date(gig.created_at).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'N/A';

    contentArea.innerHTML = `
        <div class="card-header">
            <div class="badge-icon">
                <i class="fa-solid ${statusIcon}"></i>
            </div>
            <h2>অফিসিয়ালি ভেরিফাইড প্রোডাক্ট</h2>
            <div class="status-badge" ${statusBgClass}>
                <i class="fa-solid fa-shield-check"></i> ${statusText}
            </div>
        </div>

        ${gig.image_url ? `
        <div class="verified-image-container">
            <img src="${gig.image_url}" alt="${gig.gig_title || 'Product Image'}" class="verified-img" onerror="this.parentElement.style.display='none'">
        </div>` : ''}

        <div class="card-body">
            <div class="info-group">
                <span class="label">প্রোডাক্টের নাম:</span>
                <span class="value">${gig.gig_title || 'N/A'}</span>
            </div>

            ${gig.short_description ? `
            <div class="info-group">
                <span class="label">সংক্ষিপ্ত বিবরণ:</span>
                <span class="value">${gig.short_description}</span>
            </div>` : ''}

            <div class="info-group">
                <span class="label">কোড / রেজি নম্বর:</span>
                <span class="value font-mono">${gig.item_code}</span>
            </div>

            ${gig.price ? `
            <div class="info-group">
                <span class="label">মূল্য:</span>
                <span class="value price-tag">৳ ${gig.price}</span>
            </div>` : ''}

            <div class="info-group">
                <span class="label">মার্চেন্ট / প্রতিষ্ঠান:</span>
                <span class="value">${merchantName}</span>
            </div>

            ${(gig.show_phone && merchantPhone) ? `
            <div class="info-group">
                <span class="label">যোগাযোগ:</span>
                <span class="value"><a href="tel:${merchantPhone}" style="color: #0284c7; text-decoration: none;"><i class="fa-solid fa-phone"></i> ${merchantPhone}</a></span>
            </div>` : ''}

            <div class="info-group">
                <span class="label">রেজিস্ট্রেশনের তারিখ:</span>
                <span class="value">${formattedDate}</span>
            </div>

            ${gig.gig_description ? `
            <div class="description-box" style="margin-top: 15px; padding-top: 12px; border-top: 1px dashed #e2e8f0;">
                <span class="label" style="display:block; margin-bottom: 6px;">বিস্তারিত তথ্য:</span>
                <p style="font-size: 13px; color: #334155; line-height: 1.5; white-space: pre-line;">${gig.gig_description}</p>
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
            <p style="color: #64748b;">${message}</p>
        </div>
    `;
}