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
      document.getElementById('profileOrgName').innerText = data.org_name || data.full_name || 'মার্চেন্ট প্রতিষ্ঠান';
      document.getElementById('profileCategory').innerText = `মেইন ক্যাটাগরি: ${data.main_category || 'Merchant'} | সাব-ক্যাটাগরি: ${data.sub_category || 'General'}`;
      document.getElementById('profilePhone').innerHTML = `<i class="fa-solid fa-phone text-sky-600"></i> ${data.phone_number}`;
      document.getElementById('userIdDisplay').innerText = `#AN-${data.id ? data.id.toString().slice(0, 4) : '2070'}`;

      loadUserProducts(data.id);
    }
  } catch (err) {
    console.error("Dashboard Sync Error:", err.message);
  }
});

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
          <i class="fa-solid fa-box-archive text-3xl mb-2 text-slate-400 block"></i> কোনো পণ্য পাওয়া যায়নি। <br>নতুন পণ্য যোগ করতে ওপরের বা পাশের বাটন ব্যবহার করুন।
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
            <p class="text-xs text-slate-600 mt-1.5 line-clamp-2">${item.description || 'বিবরণ উপলব্ধ নয়'}</p>
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
    grid.innerHTML = `<div class="col-span-full text-center py-8 text-red-500 text-xs font-mono">প্রোডাক্ট ডেটা রিড করতে সমস্যা হয়েছে।</div>`;
  }
}

function handleLogout() {
  localStorage.clear();
  window.location.href = "login.html";
}