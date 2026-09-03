const SUPABASE_URL = "https://inubstmbcquaxwazxkir.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImludWJzdG1iY3F1YXh3YXp4a2lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2MzQyMzEsImV4cCI6MjEwMTIxMDIzMX0.bTmvyAeE-mdRrFI0LhEEu2JV9YPA158lG6h3riKjVRo";

// আপনার দেওয়া জেমিনি এপিআই কি
const GEMINI_API_KEY = "AIzaSyDTXnZRL3Nmw3MeOd5m8N62VGh_TqD5Bnw";

let supabaseClient = null;
let productsList = [];
let isVoiceEnabled = true;

try {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (e) {
    console.error("Supabase Init Error:", e);
}

async function fetchProducts() {
    if (!supabaseClient) return;
    try {
        let { data, error } = await supabaseClient.from('products').select('*');
        if (!error) {
            productsList = data || [];
        }
    } catch (err) {
        console.error("Products fetch error:", err);
    }
}
fetchProducts();

function startVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("আপনার ব্রাউজার ভয়েস রিকগনিশন সাপোর্ট করে না!");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'bn-BD'; 
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    const micBtn = document.getElementById('mic-btn');
    micBtn.classList.add('listening');

    recognition.onresult = function(event) {
        const speechToText = event.results[0][0].transcript;
        document.getElementById('user-input').value = speechToText;
        micBtn.classList.remove('listening');
        sendMessage(); 
    };

    recognition.onerror = function() {
        micBtn.classList.remove('listening');
    };

    recognition.onend = function() {
        micBtn.classList.remove('listening');
    };

    recognition.start();
}

function toggleVoice() {
    isVoiceEnabled = !isVoiceEnabled;
    const btn = document.getElementById('voiceToggleBtn');
    if (isVoiceEnabled) {
        btn.className = "voice-control active";
        btn.innerText = "🔊 রিয়েল-টাইম ভয়েস: অন";
    } else {
        btn.className = "voice-control";
        btn.innerText = "🔇 রিয়েল-টাইম ভয়েস: অফ";
        window.speechSynthesis.cancel();
    }
}

function speakText(text) {
    if (!isVoiceEnabled) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'bn-BD';
    utterance.rate = 1.1;
    window.speechSynthesis.speak(utterance);
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// আসল Gemini AI API ব্যবহার করে মানুষের মতো কথা বলানোর ফাংশন
async function getGeminiAIResponse(userText, productContext) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    // এআইকে সিস্টেম নির্দেশিকা দিয়ে দেওয়া হচ্ছে যেন সে শোহেল ভাইয়ের পারফেক্ট সেলসম্যান হয়
    const systemInstruction = "তুমি শোহেল ভাইয়ের ই-কমার্স শপের একজন অত্যন্ত প্রফেশনাল, বিনয়ী এবং স্মার্ট সেলসম্যান। কাস্টমার সাধারণ কথা (যেমন কেমন আছো, সালাম, হাই-হ্যালো) বললে খুব সুন্দর ও হাসিমুখে বাংলায় তার জবাব দেবে। আর যদি কাস্টমার কোনো পণ্যের কথা বলে বা আমাদের ডাটাবেজে থাকা প্রduct এর প্রসঙ্গ আসে, তবে নিচের প্রডাক্ট লিস্ট থেকে তথ্য নিয়ে তাকে সাহায্য করবে।";
    
    const prompt = `${systemInstruction}\n\nবর্তমান শপের প্রডাক্ট ডাটাবেজ:\n${productContext}\n\nকাস্টমারের মেসেজ: "${userText}"\n\nসেলসম্যান হিসেবে একদম স্বাভাবিক ও প্রীতিকর বাংলায় উত্তর দাও:`;

    const requestBody = {
        contents: [{
            parts: [{ text: prompt }]
        }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        
        const data = await response.json();
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            return data.candidates[0].content.parts[0].text.trim();
        }
    } catch (error) {
        console.error("Gemini API Error:", error);
    }

    // যদি কোনো কারণে এআই কানেক্ট না হয়, তবে সাধারণ ফলব্যাক উত্তর
    return `আপনার কথাটি বুঝতে পেরেছি শোহেল ভাই। আমাদের শপে চমৎকার সব কালেকশন রয়েছে। বলুন কী দেখতে চান?`;
}

async function sendMessage() {
    const inputField = document.getElementById('user-input');
    const text = inputField.value.trim();
    if (!text) return;

    appendMessage(text, 'user-message');
    inputField.value = '';

    const aiMsgDiv = appendTypingIndicator();

    let matchedImages = [];
    let matchedProducts = [];
    const lowerText = text.toLowerCase();
    
    // প্রডাক্ট ম্যাচিং চেক করা
    productsList.forEach(p => {
        if (p.name && (lowerText.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(lowerText))) {
            matchedProducts.push(p);
            if (p.image_url_1) matchedImages.push(p.image_url_1);
        }
    });

    // সুপাবেজ থেকে পাওয়া প্রডাক্টগুলোর একটি ছোট সামারি টেক্সট তৈরি করা যেন জেমিনি সেটা বুঝতে পারে
    let productContextSummary = "কোনো নির্দিষ্ট প্রডাক্ট ম্যাচ করেনি।";
    if (productsList.length > 0) {
        productContextSummary = productsList.map(p => `নাম: ${p.name}, দাম: ${p.price} BDT, বিবরণ: ${p.description || 'নেই'}`).join("; ");
    }

    if (matchedProducts.length > 0) {
        matchedProducts.forEach(p => {
            if (p.image_url_1) matchedImages.push(p.image_url_1);
        });
    }

    // জেমিনি এআই থেকে স্মার্ট উত্তর নিয়ে আসা
    let replyText = await getGeminiAIResponse(text, productContextSummary);

    aiMsgDiv.className = "message ai-message";
    aiMsgDiv.innerHTML = ""; 
    
    typeWriterEffect(aiMsgDiv, replyText, 15, () => {
        scrollToBottom();
        if (matchedImages.length > 0) {
            appendImagesToMessage(aiMsgDiv, matchedImages);
        }
    });

    speakText(replyText);
}

function typeWriterEffect(element, text, speed, callback) {
    let i = 0;
    element.innerHTML = "";
    
    function typing() {
        if (i < text.length) {
            element.innerHTML = formatMessageText(text.substring(0, i + 1));
            scrollToBottom();
            i += 2; 
            setTimeout(typing, speed);
        } else {
            element.innerHTML = formatMessageText(text);
            if (callback) callback();
        }
    }
    typing();
}

function formatMessageText(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
}

function appendMessage(text, className) {
    const chatContainer = document.getElementById('chat-container');
    const div = document.createElement('div');
    div.className = `message ${className}`;
    div.innerHTML = formatMessageText(text);
    chatContainer.appendChild(div);
    scrollToBottom();
    return div;
}

function appendTypingIndicator() {
    const chatContainer = document.getElementById('chat-container');
    const div = document.createElement('div');
    div.className = `message ai-message typing-indicator`;
    div.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    chatContainer.appendChild(div);
    scrollToBottom();
    return div;
}

function appendImagesToMessage(msgDiv, images) {
    const imgDiv = document.createElement('div');
    imgDiv.className = 'product-images';
    images.forEach(url => {
        const img = document.createElement('img');
        img.src = url;
        img.onerror = function() { this.style.display = 'none'; };
        imgDiv.appendChild(img);
    });
    msgDiv.appendChild(imgDiv);
    scrollToBottom();
}

function scrollToBottom() {
    const chatContainer = document.getElementById('chat-container');
    chatContainer.scrollTop = chatContainer.scrollHeight;
}