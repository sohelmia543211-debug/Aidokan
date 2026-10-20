let activeUser = null;
let currentModalQrImg = null;

window.addEventListener('DOMContentLoaded', async () => {
  // ১. LocalStorage থেকে ইউজার ডাটা লোড করা
  const rawUser = localStorage.getItem('asolNokolUser');
  if (!rawUser) {
    window.location.href = "login.html";
    return;
  }

  activeUser = JSON.parse(rawUser);

  // পেন্ডিং স্ট্যাটাস সিকিউরিটি চেক
  if (activeUser.status === 'pending') {
    window.location.href = "fastdashboard.html";
    return;
  }

  // ২. প্রোফাইল ইনফরমেশন রেন্ডার করা
  document.getElementById('headerName').innerText = activeUser.full_name || 'ইউজার';
  if (activeUser.profile_image) {
    document.getElementById('headerAvatar').src = activeUser.profile_image;
    document.getElementById('profileAvatar').src = activeUser.profile_image;
  }

  document.getElementById('userIdText').innerText = `#AN-${activeUser.phone_number ? activeUser.phone_number.slice(-4) : '2070'}`;
  document.getElementById('profileOrgName').innerText = activeUser.org_name || activeUser.full_name;
  document.getElementById('profileCategory').innerText = `ক্যাটাগরি: ${activeUser.main_category ? activeUser.main_category.toUpperCase() : 'GENERAL'} (${activeUser.sub_category || 'Standard'})`;
  document.getElementById('profilePhone').innerHTML = `<i class="fa-solid fa-phone text-blue-400 mr-1"></i> ${activeUser.phone_number || 'N/A'}`;
  document.getElementById('profileReg').innerHTML = `<i class="fa-solid fa-file-contract text-emerald-400 mr-1"></i> রেজি: ${activeUser.registration_number || 'N/A'}`;

  // ৩. সাবস্ক্রিপশন ও গিগসমূহ লোড করা
  await loadSubscriptionValidity();
  await loadUserGigs();
});

// Supabase থেকে ইউজারের সব গিগ টেনে এনে RecyclerView আকারে দেখানো
async function loadUserGigs() {
  const userId = activeUser.id || localStorage.getItem('user_id');
  const recyclerView = document.getElementById('gigsRecyclerView');

  try {
    const { data: gigs, error } = await supabaseClient
      .from('gigs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    document.getElementById('statGigCount').innerText = gigs ? String(gigs.length).padStart(2, '0') : '00';

    if (!gigs || gigs.length === 0) {
      recyclerView.innerHTML = `
        <div class="col-span-full text-center py-12 cyber-glass rounded-3xl space-y-3 border border-slate-800">
          <i class="fa-solid fa-box-open text-4xl text-gray-500"></i>
          <p class="text-gray-400 text-sm font-medium">আপনি এখনো কোনো গিগ তৈরি করেননি!</p>
          <a href="create_gig.html" class="inline-block px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition">
            <i class="fa-solid fa-plus mr-1"></i> প্রথম গিগ তৈরি করুন
          </a>
        </div>
      `;
      return;
    }

    // RecyclerView কার্ডগুলো জেনারেট করা
    recyclerView.innerHTML = gigs.map(gig => {
      const isApproved = gig.status && gig.status.toLowerCase() === 'approved';
      const statusBadge = isApproved
        ? `<span class="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold"><i class="fa-solid fa-circle-check"></i> Approved</span>`
        : `<span class="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold"><i class="fa-solid fa-clock"></i> Pending Approval</span>`;

      // এখানে toptopbd এর পরিবর্তে Vercel ডোমেন এবং item_id দিয়ে ভেরিফিকেশন লিংক সেট করা হলো
      const verifyUrl = `https://aidokan.vercel.app/verify.html?id=${gig.item_code}`;

      return `
        <div class="cyber-glass p-5 rounded-3xl space-y-4 border border-slate-800 relative flex flex-col justify-between">
          <div>
            <div class="flex justify-between items-start gap-2 mb-2">
              <h4 class="text-base font-extrabold text-white leading-tight">${gig.gig_title}</h4>
              ${statusBadge}
            </div>

            <p class="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-3">${gig.gig_description || ''}</p>

            <div class="flex flex-wrap gap-2 text-[11px] font-mono text-gray-300">
              ${gig.item_code ? `<span class="bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-lg">কোড: ${gig.item_code}</span>` : ''}
              ${gig.price ? `<span class="bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-lg text-amber-400 font-bold">৳ ${gig.price}</span>` : ''}
            </div>
          </div>

          <div class="pt-3 border-t border-slate-800/80">
            ${isApproved ? `
              <button onclick="openQrModal('${gig.gig_title.replace(/'/g, "\\'")}', '${verifyUrl}')" class="w-full py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition flex items-center justify-center gap-2">
                <i class="fa-solid fa-qrcode"></i> QR কোড দেখুন ও ডাউনলোড করুন
              </button>
            ` : `
              <button disabled class="w-full py-2.5 rounded-xl bg-gray-800/50 border border-gray-700/50 text-gray-500 text-xs font-bold cursor-not-allowed flex items-center justify-center gap-2">
                <i class="fa-solid fa-lock"></i> অনুমোদনের পর QR চালু হবে
              </button>
            `}
          </div>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error("Gigs Load Error:", err);
    recyclerView.innerHTML = `<p class="col-span-full text-center text-red-400 text-xs">গিগ লোড করতে সমস্যা হয়েছে!</p>`;
  }
}

// QR MODAL OPEN & DOWNLOAD LOGIC
function openQrModal(title, urlText) {
  document.getElementById('modalGigTitle').innerText = title;
  const box = document.getElementById('modalQrBox');
  box.innerHTML = '';

  new QRCode(box, {
    text: urlText,
    width: 180,
    height: 180,
    colorDark : "#030712",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.H
  });

  document.getElementById('qrModal').classList.remove('hidden');
}

function closeQrModal() {
  document.getElementById('qrModal').classList.add('hidden');
}

function downloadModalQr() {
  const qrImg = document.querySelector('#modalQrBox img');
  if (qrImg && qrImg.src) {
    const link = document.createElement('a');
    link.href = qrImg.src;
    link.download = `AsolNokol_Gig_QR_${Date.now()}.png`;
    link.click();
  } else {
    alert("QR কোড ডাউনলোড করা সম্ভব হচ্ছে না।");
  }
}

// Supabase থেকে সাবস্ক্রিপশন মেয়াদ চেক করার ফাংশন
async function loadSubscriptionValidity() {
  const userId = activeUser.id || localStorage.getItem('user_id');
  if (!userId) {
    setSubscriptionUI('মেয়াদ নেই', 'N/A', 'অনুমোদিত নয়');
    return;
  }

  try {
    const { data, error } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('payment_status', 'Approved')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;

    if (data && data.length > 0) {
      const sub = data[0];
      const expiryDate = new Date(sub.expiry_date);
      const today = new Date();

      const diffTime = expiryDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const formattedExpiry = expiryDate.toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      let planText = 'স্ট্যান্ডার্ড';
      if (sub.subscription_plan === '1_year') planText = '১ বছর';
      else if (sub.subscription_plan === '2_years') planText = '২ বছর';
      else if (sub.subscription_plan === '5_years') planText = '৫ বছর';
      else if (sub.subscription_plan === '10_years') planText = '১০ বছর';

      if (diffDays > 0) {
        setSubscriptionUI(`${diffDays} দিন বাকি`, formattedExpiry, planText);
      } else {
        setSubscriptionUI('মেয়াদ শেষ', formattedExpiry, planText, true);
      }
    } else {
      setSubscriptionUI('পেন্ডিং / সাবমিট হয়নি', 'N/A', 'অপেক্ষমাণ');
    }
  } catch (err) {
    console.error("Subscription Load Error:", err);
    setSubscriptionUI('চেক করতে ব্যর্থ', 'N/A', 'ত্রুটি');
  }
}

function setSubscriptionUI(daysLeft, expiryDateText, planName, isExpired = false) {
  const daysElem = document.getElementById('subDaysLeft');
  const expiryElem = document.getElementById('subExpiryDate');
  const planElem = document.getElementById('subPlanName');

  if (daysElem) {
    daysElem.innerText = daysLeft;
    if (isExpired) daysElem.className = "text-2xl font-black text-red-400 mt-0.5";
  }
  if (expiryElem) expiryElem.innerText = expiryDateText;
  if (planElem) planElem.innerText = planName;
}

function handleLogout() {
  localStorage.removeItem('asolNokolUser');
  localStorage.removeItem('user_id');
  window.location.href = "login.html";
}