window.addEventListener('DOMContentLoaded', async () => {
  const userPhone = localStorage.getItem('userPhone');
  const userData = JSON.parse(localStorage.getItem('asolNokolUser') || '{}');

  if (!userPhone && !userData.phone_number) {
    window.location.href = "login.html";
    return;
  }

  const phone = userPhone || userData.phone_number;
  document.getElementById('navUserPhone').innerText = phone;

  try {
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('phone_number', phone)
      .single();

    if (error) throw error;

    if (data) {
      // ১. প্রোফাইল ইনফরমেশন সেট করা
      document.getElementById('profileOrgName').innerText = data.org_name || data.full_name || 'মার্চেন্ট প্রতিষ্ঠান';
      document.getElementById('profileCategory').innerText = `মেইন ক্যাটাগরি: ${data.main_category || 'Merchant'} | সাব-ক্যাটাগরি: ${data.sub_category || 'General'}`;
      document.getElementById('profilePhone').innerHTML = `<i class="fa-solid fa-phone text-sky-600"></i> ${data.phone_number}`;
      document.getElementById('userIdDisplay').innerText = `#AN-${data.id ? data.id.toString().slice(0, 4) : '2070'}`;

      // ২. প্রোফাইল পিকচার রেন্ডারিং
      if (data.profile_image && data.profile_image.trim() !== '') {
        const imgElement = document.getElementById('userProfileImage');
        const iconElement = document.getElementById('userFallbackIcon');
        imgElement.src = data.profile_image;
        imgElement.classList.remove('hidden');
        if (iconElement) iconElement.classList.add('hidden');
      }

      // ৩. ডাইনামিক ডকুমেন্ট স্ট্যাটাস, ব্যাজ ও বাটন পারমিশন কন্ট্রোল
      updateDocumentAndPermissionStatus(data);

      // ৪. ইউজারের কেনা সাবস্ক্রিপশন ও প্যাকেজ লোড করা
      loadUserSubscription(data.id);

      // ৫. ইউজার প্রোডাক্ট লোড
      loadUserProducts(data.id);
    }
  } catch (err) {
    console.error("Dashboard Sync Error:", err.message);
  }
});

// Document Banner, Badge & Action Permission Logic
function updateDocumentAndPermissionStatus(user) {
  const bannerContainer = document.getElementById('docBannerContainer');
  const bannerIcon = document.getElementById('docBannerIcon');
  const bannerTitle = document.getElementById('docBannerTitle');
  const bannerSub = document.getElementById('docBannerSub');
  const bannerBtn = document.getElementById('docBannerBtn');
  const createGigBtns = document.querySelectorAll('a[href="create_gig.html"]');
  const statusTag = document.getElementById('statusTag');
  const statAccountStatus = document.getElementById('statAccountStatus');
  const merchantBadge = document.getElementById('merchantBadge');

  const isVerified = user.is_verified === true || user.is_verified === 'true';
  const hasDocuments = user.documents && (user.documents.doc_1_no || user.documents.doc_1_img);

  if (isVerified) {
    bannerContainer.className = "cyber-glass-light rounded-3xl p-6 sm:p-8 border border-emerald-300/60 bg-gradient-to-r from-emerald-50/50 via-white to-sky-50/50 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg";
    bannerIcon.className = "w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-600 text-2xl shrink-0 mx-auto";
    bannerIcon.innerHTML = `<i class="fa-solid fa-circle-check"></i>`;
    
    bannerTitle.innerText = "আপনার অ্যাকাউন্ট ভেরিফাইড (Verified)";
    bannerSub.innerText = "আপনার সমস্ত লাইসেন্স ও কাগজপত্র অনুমোদিত হয়েছে। আপনি এখন পণ্য তৈরি করতে পারবেন।";
    
    bannerBtn.className = "w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/30 transition flex items-center justify-center gap-2.5 shrink-0";
    bannerBtn.innerHTML = `<i class="fa-solid fa-user-check text-base"></i> ভেরিফাইড ডকুমেন্টস দেখুন/আপডেট করুন`;

    if (statusTag) statusTag.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-600"></i> ভেরিফাইড মার্চেন্ট`;
    if (statAccountStatus) statAccountStatus.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-600"></i> ভেরিফাইড`;

    if (merchantBadge) {
      merchantBadge.className = "absolute -bottom-2 -right-2 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-md font-extrabold flex items-center gap-1 shadow";
      merchantBadge.innerHTML = `<i class="fa-solid fa-shield-check"></i> ACTIVE`;
    }

    createGigBtns.forEach(btn => {
      btn.onclick = null;
      btn.classList.remove('opacity-50', 'cursor-not-allowed');
    });
  } 
  else if (hasDocuments) {
    bannerContainer.className = "cyber-glass-light rounded-3xl p-6 sm:p-8 border border-sky-300/60 bg-gradient-to-r from-sky-50/50 via-white to-indigo-50/50 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg";
    bannerIcon.className = "w-14 h-14 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-600 text-2xl shrink-0 mx-auto";
    bannerIcon.innerHTML = `<i class="fa-solid fa-clock-rotate-left animate-spin"></i>`;
    
    bannerTitle.innerText = "ডকুমেন্টস পেন্ডিং আছে (Pending Verification)";
    bannerSub.innerText = "আপনার কাগজপত্র জমা হয়েছে এবং এডমিন প্যানেলে রিভিউ চলছে। এডমিন অনুমোদন দেওয়া পর্যন্ত অপেক্ষা করুন।";
    
    bannerBtn.className = "w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-sky-500/30 transition flex items-center justify-center gap-2.5 shrink-0";
    bannerBtn.innerHTML = `<i class="fa-solid fa-spinner text-base"></i> পেন্ডিং ডকুমেন্টস দেখুন`;

    if (statusTag) statusTag.innerHTML = `<i class="fa-solid fa-clock text-sky-600"></i> ভেরিফিকেশন পেন্ডিং`;
    if (statAccountStatus) statAccountStatus.innerHTML = `<i class="fa-solid fa-clock text-amber-500"></i> পেন্ডিং`;

    if (merchantBadge) {
      merchantBadge.className = "absolute -bottom-2 -right-2 bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-md font-extrabold flex items-center gap-1 shadow";
      merchantBadge.innerHTML = `<i class="fa-solid fa-clock"></i> PENDING`;
    }

    createGigBtns.forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        alert("আপনার অ্যাকাউন্ট এখনো ভেরিফাইড নয়! এডমিন আপনার কাগজপত্র রিভিউ করে অনুমোদন দিলে আপনি নতুন পণ্য তৈরি করতে পারবেন।");
      };
    });
  } 
  else {
    bannerContainer.className = "cyber-glass-light rounded-3xl p-6 sm:p-8 border border-amber-300/60 bg-gradient-to-r from-amber-50/50 via-white to-sky-50/50 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg";
    bannerIcon.className = "w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-600 text-2xl shrink-0 mx-auto";
    bannerIcon.innerHTML = `<i class="fa-solid fa-file-shield"></i>`;
    
    bannerTitle.innerText = "ব্যবসার ডকুমেন্টস আপলোড করুন (Unverified)";
    bannerSub.innerText = "পণ্য তৈরি বা সার্ভিস দিতে ট্রেড লাইসেন্স ও প্রয়োজনীয় কাগজপত্র সাবমিট করুন।";
    
    bannerBtn.className = "w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-amber-500/30 transition flex items-center justify-center gap-2.5 shrink-0";
    bannerBtn.innerHTML = `<i class="fa-solid fa-folder-open text-base"></i> ডকুমেন্টস আপলোড করুন`;

    if (statusTag) statusTag.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-amber-600"></i> আনভেরিফাইড`;
    if (statAccountStatus) statAccountStatus.innerHTML = `<i class="fa-solid fa-circle-xmark text-red-500"></i> অপূর্ণাঙ্গ`;

    if (merchantBadge) {
      merchantBadge.className = "absolute -bottom-2 -right-2 bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-md font-extrabold flex items-center gap-1 shadow";
      merchantBadge.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> UNVERIFIED`;
    }

    createGigBtns.forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        alert("পণ্য তৈরি করতে প্রথমে আপনার ব্যবসার প্রয়োজনীয় কাগজপত্র আপলোড করুন!");
        window.location.href = "Documents.html";
      };
    });
  }
}

// Load User Subscription Status
async function loadUserSubscription(userId) {
  try {
    const { data, error } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    const planElem = document.getElementById('statSubPlan');
    const statusElem = document.getElementById('statSubStatus');
    const qrElem = document.getElementById('statQrLimit');

    if (data) {
      planElem.innerText = data.plan_name + " Plan";
      qrElem.innerText = (data.qr_limit || 0).toLocaleString() + " QR";

      if (data.payment_status === 'Pending') {
        statusElem.innerText = "পেমেন্ট পেন্ডিং (Review)";
        statusElem.className = "text-[10px] text-amber-600 font-mono font-bold";
      } else if (data.payment_status === 'Active' || data.payment_status === 'Approved') {
        statusElem.innerText = "সক্রিয় (Active)";
        statusElem.className = "text-[10px] text-emerald-600 font-mono font-bold";
      } else {
        statusElem.innerText = data.payment_status;
        statusElem.className = "text-[10px] text-slate-600 font-mono font-bold";
      }
    } else {
      planElem.innerText = "কোনো প্ল্যান নেই";
      statusElem.innerText = "সাবস্ক্রাইব করুন";
      statusElem.className = "text-[10px] text-sky-600 font-mono font-bold";
      qrElem.innerText = "0 QR";
    }
  } catch (err) {
    console.error("Subscription Load Error:", err.message);
  }
}

// Load User Products
async function loadUserProducts(userId) {
  const grid = document.getElementById('gigsRecyclerView');
  try {
    const { data, error } = await supabaseClient
      .from('gigs')
      .select('*')
      .eq('merchant_id', userId);

    if (error) throw error;

    if (!data || data.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full text-center py-12 text-slate-500 text-xs font-mono cyber-glass-light rounded-2xl border border-dashed border-slate-300">
          <i class="fa-solid fa-box-archive text-3xl mb-2 text-slate-400 block"></i> কোনো পণ্য পাওয়া যায়নি। <br>নতুন পণ্য যোগ করতে ওপরের বা পাশের বাটন ব্যবহার করুন।
        </div>
      `;
      document.getElementById('statGigCount').innerText = "00";
      return;
    }

    document.getElementById('statGigCount').innerText = data.length < 10 ? '0' + data.length : data.length;
    
    let html = '';
    data.forEach(item => {
      html += `
        <div class="cyber-glass-light p-5 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between hover:border-sky-400 transition shadow-sm">
          <div>
            <h4 class="font-bold text-slate-900 text-sm truncate flex items-center gap-2">
              <i class="fa-solid fa-cube text-sky-600 text-xs"></i> ${item.title || 'পণ্য'}
            </h4>
            <p class="text-xs text-slate-600 mt-1.5 line-clamp-2">${item.description || 'বিবরণ উপলব্ধ নয়'}</p>
          </div>
          <div class="flex justify-between items-center pt-3 border-t border-slate-100">
            <span class="text-xs text-sky-700 font-mono font-bold">মূল্য: ৳ ${item.price || '0'}</span>
            <span class="text-[10px] px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg font-mono font-bold">
              <i class="fa-solid fa-check"></i> সিকিউরড
            </span>
          </div>
        </div>
      `;
    });
    grid.innerHTML = html;

  } catch (err) {
    console.error("Products Error:", err.message);
    grid.innerHTML = `<div class="col-span-full text-center py-8 text-red-500 text-xs font-mono">প্রোডাক্ট ডেটা রিড করতে সমস্যা হয়েছে।</div>`;
  }
}

function handleLogout() {
  localStorage.clear();
  window.location.href = "login.html";
}