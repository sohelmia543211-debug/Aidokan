// Supabase Credentials
const SUPABASE_URL = 'https://dzytdijmabiebefhgkkc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6eXRkaWptYWJpZWJlZmhna2tjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxOTE3MTAsImV4cCI6MjA4NTc2NzcxMH0.ni86vJbes2k0UmkpYp5gs-fqXF5uD9nzumAnfMpi9Hs';

// Supabase Client Initialize
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
    fetchMainCategories();
});

// ১. মূল ক্যাটাগরি ডাটাবেস থেকে লোড করা
async function fetchMainCategories() {
    const mainCatSelect = document.getElementById('mainCategory');
    if (!mainCatSelect) return;
    
    try {
        const { data, error } = await supabaseClient
            .from('main_categories')
            .select('key_name, label_bn');

        if (error) throw error;

        mainCatSelect.innerHTML = ''; // আগের অপশন ক্লিয়ার করা

        if (!data || data.length === 0) {
            mainCatSelect.innerHTML = '<option value="">ক্যাটাগরি পাওয়া যায়নি</option>';
            return;
        }

        data.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.key_name;
            option.textContent = cat.label_bn;
            mainCatSelect.appendChild(option);
        });

        // অটোমেটিক প্রথম মূল ক্যাটাগরি সিলেক্ট করে সাব-ক্যাটাগরি লোড করা
        mainCatSelect.selectedIndex = 0;
        loadSubCategories();

    } catch (err) {
        console.error('Error fetching main categories:', err.message);
        alert('ক্যাটাগরি লোড করতে সমস্যা হয়েছে: ' + err.message);
    }
}

// ২. মূল ক্যাটাগরির ওপর ভিত্তি করে সাব-ক্যাটাগরি লোড করা
async function loadSubCategories() {
    const mainCatSelect = document.getElementById('mainCategory');
    const subCatSelect = document.getElementById('subCategory');

    if (!mainCatSelect || !subCatSelect) return;

    const mainCatKey = mainCatSelect.value;

    if (!mainCatKey) {
        subCatSelect.innerHTML = '<option value="">-- প্রথমে মূল ক্যাটাগরি সিলেক্ট করুন --</option>';
        subCatSelect.disabled = true;
        return;
    }

    subCatSelect.disabled = true;
    subCatSelect.innerHTML = '<option value="">লোড হচ্ছে...</option>';

    try {
        const { data, error } = await supabaseClient
            .from('sub_categories')
            .select('name_bn')
            .eq('main_category_key', mainCatKey);

        if (error) throw error;

        if (!data || data.length === 0) {
            subCatSelect.innerHTML = '<option value="">কোনো সাব-ক্যাটাগরি পাওয়া যায়নি</option>';
            return;
        }

        subCatSelect.innerHTML = '<option value="">-- সাব-ক্যাটাগরি সিলেক্ট করুন --</option>';
        data.forEach(sub => {
            const option = document.createElement('option');
            option.value = sub.name_bn;
            option.textContent = sub.name_bn;
            subCatSelect.appendChild(option);
        });

        subCatSelect.disabled = false;

    } catch (err) {
        console.error('Error fetching sub categories:', err.message);
        subCatSelect.innerHTML = '<option value="">সাব-ক্যাটাগরি পেতে সমস্যা হয়েছে</option>';
    }
}

// ৩. স্টেপ ১ থেকে স্টেপ ২ এ যাওয়া (ইনপুট ভ্যালিডেশন)
function goToStep2() {
    const mainCat = document.getElementById('mainCategory').value;
    const subCat = document.getElementById('subCategory').value;
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phoneNumber').value.trim();
    const password = document.getElementById('password').value;

    const phoneRegex = /^01[3-9]\d{8}$/;

    if (!mainCat || !subCat || !fullName || !email || !phone || !password) {
        alert('অনুগ্রহ করে প্রথম ধাপের সব তথ্য সঠিকভাবে পূরণ করুন!');
        return;
    }

    if (!phoneRegex.test(phone)) {
        alert('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)');
        return;
    }

    if (password.length < 6) {
        alert('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে!');
        return;
    }

    // UI স্টেপ পরিবর্তন
    document.getElementById('step1').classList.add('hidden');
    document.getElementById('step2').classList.remove('hidden');
    
    document.getElementById('dot2').classList.add('active');
    document.getElementById('stepLine').classList.add('active');
    document.getElementById('stepSubText').innerText = "Step 2: মোবাইল নম্বর ভেরিফাই করুন";

    document.getElementById('displayPhone').innerText = phone;
}

// ৪. আবার প্রথম স্টেপে ফেরত যাওয়া
function goToStep1() {
    document.getElementById('step2').classList.add('hidden');
    document.getElementById('step1').classList.remove('hidden');

    document.getElementById('dot2').classList.remove('active');
    document.getElementById('stepLine').classList.remove('active');
    document.getElementById('stepSubText').innerText = "Step 1: আপনার সাধারণ তথ্য দিন";
}

// ৫. ওটিপি চেক করে ডেটাবেসে সেভ করা এবং fastdashboard.html এ নিয়ে যাওয়া
async function verifyAndSubmit() {
    const otp = document.getElementById('otpCode').value.trim();
    const msg = document.getElementById('otpMessage');

    if (otp !== '1234') {
        msg.style.color = '#f87171';
        msg.textContent = '✕ ভুল ওটিপি কোড! সঠিক কোড: 1234';
        return;
    }

    msg.style.color = '#34d399';
    msg.textContent = '✓ মোবাইল নম্বর সফলভাবে ভেরিফাইড হয়েছে!';

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> অ্যাকাউন্ট তৈরি হচ্ছে...';

    const mainCat = document.getElementById('mainCategory').value;
    const subCat = document.getElementById('subCategory').value;
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phoneNumber').value.trim();
    const password = document.getElementById('password').value;

    try {
        const { data, error } = await supabaseClient
            .from('users')
            .insert([
                {
                    main_category: mainCat,
                    sub_category: subCat,
                    full_name: fullName,
                    email: email,
                    phone_number: phone,
                    password_hash: password,
                    status: 'pending'
                }
            ]);

        if (error) throw error;

        alert('রেজিস্ট্রেশন সফল হয়েছে!');
        
        // ড্যাশবোর্ডে পাঠাবার পূর্বে লোকাল স্টোরেজে তথ্য সেভ রাখা
        localStorage.setItem('userPhone', phone);
        localStorage.setItem('userName', fullName);

        // রিডাইরেক্ট fastdashboard.html
        window.location.href = 'fastdashboard.html';

    } catch (err) {
        console.error('Registration failed:', err.message);
        alert('রেজিস্ট্রেশন করতে সমস্যা হয়েছে: ' + err.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-check-circle"></i> Verify & Submit';
    }
}