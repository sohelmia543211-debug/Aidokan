window.addEventListener('DOMContentLoaded', async () => {
  const userPhone = localStorage.getItem('userPhone');
  const userData = JSON.parse(localStorage.getItem('asolNokolUser') || '{}');

  if (!userPhone && !userData.phone_number) {
    window.location.href = "login.html";
    return;
  }

  const phone = userPhone || userData.phone_number;

  try {
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('phone_number', phone)
      .single();

    if (error) throw error;

    if (data) {
      // sub_category_key অথবা sub_category চেক করা হচ্ছে
      const subCatKey = (data.sub_category_key || data.sub_category || '').toLowerCase().trim();
      const displaySubCat = data.sub_category || subCatKey || 'General';
      
      document.getElementById('userSubCategoryText').innerText = displaySubCat.toUpperCase();
      
      if (data.profile_image) {
        document.getElementById('profilePreview').src = data.profile_image;
      }
      
      // সাব-ক্যাটাগরি অনুযায়ী ডাইনামিক ফিল্ড সেটআপ
      setupDynamicFields(subCatKey, data.documents || {});
    }
  } catch (err) {
    console.error("User Load Error:", err.message);
  }
});

// Category Key-based Dynamic Document & Image Fields Setup
function setupDynamicFields(subCategoryKey, existingDocs) {
  const container = document.getElementById('dynamicDocFields');
  let html = '';
  const docs = existingDocs || {};

  // ১. মেডিসিনের জন্য (medicine)
  if (subCategoryKey === 'medicine' || subCategoryKey.includes('medicine')) {
    html = `
      <div class="cyber-file-upload p-4 rounded-2xl space-y-3">
        <label class="block text-xs font-bold text-slate-800"><i class="fa-solid fa-user-doctor text-sky-600 mr-1"></i> বিএমডিসি নম্বর (BMDC Number) *</label>
        <input type="text" id="field1_num" required class="w-full cyber-input-light rounded-xl px-4 py-2.5 text-xs" placeholder="BMDC নম্বর লিখুন" value="${docs.doc_1_no || ''}">
        
        <label class="block text-[11px] font-semibold text-slate-600 pt-1">BMDC সার্টিফিকেটের ছবি আপলোড *</label>
        <input type="file" id="field1_file" accept="image/*" class="text-xs text-slate-500 w-full">
        ${docs.doc_1_img ? `<p class="text-[10px] text-emerald-600 font-bold"><i class="fa-solid fa-circle-check"></i> আগে আপলোড করা আছে</p>` : ''}
      </div>

      <div class="cyber-file-upload p-4 rounded-2xl space-y-3">
        <label class="block text-xs font-bold text-slate-800"><i class="fa-solid fa-pills text-sky-600 mr-1"></i> ড্রাগ লাইসেন্স নম্বর (Drug License) *</label>
        <input type="text" id="field2_num" required class="w-full cyber-input-light rounded-xl px-4 py-2.5 text-xs" placeholder="ড্রাগ লাইসেন্স নম্বর লিখুন" value="${docs.doc_2_no || ''}">
        
        <label class="block text-[11px] font-semibold text-slate-600 pt-1">ড্রাগ লাইসেন্স পেপারের ছবি *</label>
        <input type="file" id="field2_file" accept="image/*" class="text-xs text-slate-500 w-full">
        ${docs.doc_2_img ? `<p class="text-[10px] text-emerald-600 font-bold"><i class="fa-solid fa-circle-check"></i> আগে আপলোড করা আছে</p>` : ''}
      </div>
    `;
  } 
  // ২. ফুড ও এগ্রিকালচারের জন্য (food / agriculture)
  else if (subCategoryKey === 'food' || subCategoryKey === 'agriculture') {
    html = `
      <div class="cyber-file-upload p-4 rounded-2xl space-y-3">
        <label class="block text-xs font-bold text-slate-800"><i class="fa-solid fa-id-card text-sky-600 mr-1"></i> ট্রেড লাইসেন্স নম্বর (Trade License) *</label>
        <input type="text" id="field1_num" required class="w-full cyber-input-light rounded-xl px-4 py-2.5 text-xs" placeholder="ট্রেড লাইসেন্স নম্বর লিখুন" value="${docs.doc_1_no || ''}">
        
        <label class="block text-[11px] font-semibold text-slate-600 pt-1">ট্রেড লাইসেন্সের ছবি আপলোড *</label>
        <input type="file" id="field1_file" accept="image/*" class="text-xs text-slate-500 w-full">
        ${docs.doc_1_img ? `<p class="text-[10px] text-emerald-600 font-bold"><i class="fa-solid fa-circle-check"></i> আগে আপলোড করা আছে</p>` : ''}
      </div>

      <div class="cyber-file-upload p-4 rounded-2xl space-y-3">
        <label class="block text-xs font-bold text-slate-800"><i class="fa-solid fa-certificate text-sky-600 mr-1"></i> বিএসটিআই (BSTI / Agri) রেজিস্ট্রেশন নম্বর *</label>
        <input type="text" id="field2_num" required class="w-full cyber-input-light rounded-xl px-4 py-2.5 text-xs" placeholder="BSTI বা অনুমোদনের নম্বর লিখুন" value="${docs.doc_2_no || ''}">
        
        <label class="block text-[11px] font-semibold text-slate-600 pt-1">BSTI / অনুমোদন সার্টিফিকেটের ছবি *</label>
        <input type="file" id="field2_file" accept="image/*" class="text-xs text-slate-500 w-full">
        ${docs.doc_2_img ? `<p class="text-[10px] text-emerald-600 font-bold"><i class="fa-solid fa-circle-check"></i> আগে আপলোড করা আছে</p>` : ''}
      </div>
    `;
  }
  // ৩. অন্যান্য সব সাধারণ সাব-ক্যাটাগরির জন্য (General / Electronics / Clothing etc.)
  else {
    html = `
      <div class="cyber-file-upload p-4 rounded-2xl space-y-3">
        <label class="block text-xs font-bold text-slate-800"><i class="fa-solid fa-file-invoice text-sky-600 mr-1"></i> ট্রেড লাইসেন্স নম্বর (Trade License) *</label>
        <input type="text" id="field1_num" required class="w-full cyber-input-light rounded-xl px-4 py-2.5 text-xs" placeholder="ট্রেড লাইসেন্স নম্বর লিখুন" value="${docs.doc_1_no || ''}">
        
        <label class="block text-[11px] font-semibold text-slate-600 pt-1">ট্রেড লাইসেন্সের ছবি আপলোড *</label>
        <input type="file" id="field1_file" accept="image/*" class="text-xs text-slate-500 w-full">
        ${docs.doc_1_img ? `<p class="text-[10px] text-emerald-600 font-bold"><i class="fa-solid fa-circle-check"></i> আগে আপলোড করা আছে</p>` : ''}
      </div>

      <div class="cyber-file-upload p-4 rounded-2xl space-y-3">
        <label class="block text-xs font-bold text-slate-800"><i class="fa-solid fa-address-card text-sky-600 mr-1"></i> জাতীয় পরিচয়পত্র (NID) নম্বর *</label>
        <input type="text" id="field2_num" required class="w-full cyber-input-light rounded-xl px-4 py-2.5 text-xs" placeholder="NID নম্বর লিখুন" value="${docs.doc_2_no || ''}">
        
        <label class="block text-[11px] font-semibold text-slate-600 pt-1">NID কার্ডের ছবি আপলোড *</label>
        <input type="file" id="field2_file" accept="image/*" class="text-xs text-slate-500 w-full">
        ${docs.doc_2_img ? `<p class="text-[10px] text-emerald-600 font-bold"><i class="fa-solid fa-circle-check"></i> আগে আপলোড করা আছে</p>` : ''}
      </div>
    `;
  }

  container.innerHTML = html;
}

// Image live preview function
function previewImage(input, previewId) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById(previewId).src = e.target.result;
    }
    reader.readAsDataURL(input.files[0]);
  }
}

// Upload file to Supabase Storage
async function uploadToStorage(file, path) {
  if (!file) return null;
  const fileExt = file.name.split('.').pop();
  const fileName = `${path}_${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabaseClient.storage
    .from('documents')
    .upload(fileName, file, { upsert: true });

  if (error) {
    console.warn("Storage upload warn (falling back to Base64):", error.message);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  }

  const { data: publicUrlData } = supabaseClient.storage
    .from('documents')
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}

// Handle Form Submission
async function handleDocSubmit(event) {
  event.preventDefault();

  const num1 = document.getElementById('field1_num')?.value.trim();
  const num2 = document.getElementById('field2_num')?.value.trim();
  const profileImgFile = document.getElementById('profileImgInput')?.files[0];
  const file1 = document.getElementById('field1_file')?.files[0];
  const file2 = document.getElementById('field2_file')?.files[0];

  const submitBtn = document.getElementById('submitBtn');

  if (!num1 || !num2) {
    alert("দয়া করে সকল প্রয়োজনীয় নম্বর ও ঘর পূরণ করুন!");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-base"></i> তথ্য ও ফাইল আপলোড হচ্ছে...`;

  const userPhone = localStorage.getItem('userPhone');
  const userData = JSON.parse(localStorage.getItem('asolNokolUser') || '{}');
  const phone = userPhone || userData.phone_number;

  try {
    // আগের ইউজার ডেটা ফেচ করা যেন পুরনো ডকুমেন্টের ছবি মুছে না যায়
    const { data: currentUser } = await supabaseClient
      .from('users')
      .select('documents, profile_image')
      .eq('phone_number', phone)
      .single();

    const existingDocs = currentUser?.documents || {};

    // নতুন ফাইল দিলে আপলোড হবে, না দিলে পুরনো URL বজায় থাকবে
    let profileUrl = currentUser?.profile_image || null;
    let doc1Url = existingDocs.doc_1_img || '';
    let doc2Url = existingDocs.doc_2_img || '';

    if (profileImgFile) profileUrl = await uploadToStorage(profileImgFile, `profile_${phone}`);
    if (file1) doc1Url = await uploadToStorage(file1, `doc1_${phone}`);
    if (file2) doc2Url = await uploadToStorage(file2, `doc2_${phone}`);

    const docPayload = {
      doc_1_no: num1,
      doc_1_img: doc1Url,
      doc_2_no: num2,
      doc_2_img: doc2Url,
      submitted_at: new Date().toISOString()
    };

    // সিকিউরিটি আপডেট: ইউজার ডকুমেন্টস আপডেট করলেই is_verified সরাসরি false হয়ে যাবে
    const updatePayload = { 
      documents: docPayload,
      is_verified: false 
    };
    
    if (profileUrl) {
      updatePayload.profile_image = profileUrl;
    }

    const { error } = await supabaseClient
      .from('users')
      .update(updatePayload)
      .eq('phone_number', phone);

    if (error) throw error;

    alert("আপনার ডকুমেন্টস সফলভাবে আপডেট হয়েছে! এডমিন পুনরায় ভেরিফাই না করা পর্যন্ত অ্যাকাউন্ট পেন্ডিং থাকবে।");
    window.location.href = "dashboardmine.html";

  } catch (err) {
    alert("সমস্যা হয়েছে: " + err.message);
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<i class="fa-solid fa-cloud-arrow-up text-base"></i> সকল তথ্য ও ফাইল সাবমিট করুন`;
  }
}