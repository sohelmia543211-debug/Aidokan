// পিন ভেরিফিকেশন ফাংশন
function verifyPin() {
    const input = document.getElementById('pinInput').value.trim();

    // রেজাল্ট বক্সগুলো আগের জায়গায় হাইড করা
    document.getElementById('successResult').classList.add('hidden');
    document.getElementById('fakeResult').classList.add('hidden');
    document.getElementById('usedResult').classList.add('hidden');

    if (!input) {
        alert('দয়া করে একটি গোপন পিন ইনপুট দিন!');
        return;
    }

    // প্রোডাক্ট পিন টেস্ট (যেমন: 8829 বা 1234)
    if (input === '8829' || input === '1234') {
        document.getElementById('productName').innerText = "অরিজিনাল ইলেকট্রিক গ্রাইন্ডার (A-Grade)";
        document.getElementById('successResult').classList.remove('hidden');
    } 
    // ডাক্তারের পিন টেস্ট (যেমন: DOC101)
    else if (input === 'DOC101') {
        document.getElementById('productName').innerText = "ডা. মো: আরিফুল ইসলাম (BMDC: A-12345)";
        document.getElementById('successResult').classList.remove('hidden');
    } 
    // পূর্বে ব্যবহৃত পিন (যেমন: 0000)
    else if (input === '0000') {
        document.getElementById('usedResult').classList.remove('hidden');
    } 
    // ভুল/অবৈধ পিন
    else {
        document.getElementById('fakeResult').classList.remove('hidden');
    }
}

// সরাসরি কিউআর স্ক্যানার ওপেন করার ফাংশন
function openScanner() {
    alert('কিউআর স্ক্যানার ক্যামেরা চালু করা হচ্ছে...');
    // পরবর্তীতে এখানে ক্যামেরা ব্যাকগ্রাউন্ড স্ক্যানার বা স্ক্যানার মোডাল যুক্ত করা যাবে।
}

// Enter কী চাপলে যেন ভেরিফাই বাটন চাপ পড়ে
document.addEventListener('DOMContentLoaded', () => {
    const pinInput = document.getElementById('pinInput');
    if (pinInput) {
        pinInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                verifyPin();
            }
        });
    }
});