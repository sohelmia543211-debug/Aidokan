function verifyPin() {
    const input = document.getElementById('pinInput').value.trim();

    // রেজাল্ট বক্সগুলো আগের জায়গায় হাইড করা
    document.getElementById('successResult').classList.add('hidden');
    document.getElementById('fakeResult').classList.add('hidden');
    document.getElementById('usedResult').classList.add('hidden');

    if (!input) {
        alert('দয়া করে পিন দিন!');
        return;
    }

    // প্রোডাক্টের পিন টেস্ট (যেমন: 8829)
    if (input === '8829' || input === '1234') {
        document.getElementById('productName').innerText = "অরিজিনাল স্নিকার্স (A-Grade)";
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
    // ভুল পিন
    else {
        document.getElementById('fakeResult').classList.remove('hidden');
    }
}

function openScanner() {
    alert('কিউআর স্ক্যানার ক্যামেরা চালু করা হচ্ছে...');
}