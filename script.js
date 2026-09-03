import { checkAknumberIntent } from './aknumberp.js';

const SUPABASE_URL = "https://inubstmbcquaxwazxkir.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImludWJzdG1iY3F1YXh3YXp4a2lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2MzQyMzEsImV4cCI6MjEwMTIxMDIzMX0.bTmvyAeE-mdRrFI0LhEEu2JV9YPA158lG6h3riKjVRo";
const GEMINI_API_KEY = "AQ.Ab8RN6JMK4ZiC9wmsRmBoZ_meUaPIMgjFQuRCg9Cab9dViYzug";

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

async function sendMessage() {
    const inputField = document.getElementById('user-input');
    const text = inputField.value.trim();
    if (!text) return;

    appendMessage(text, 'user-message');
    inputField.value = '';

    const aiMsgDiv = appendTypingIndicator();

    let matchedImages = [];
    const lowerText = text.toLowerCase();
    
    productsList.forEach(p => {
        if (p.name && lowerText.includes(p.name.toLowerCase())) {
            if (p.image_url_1) matchedImages.push(p.image_url_1);
        }
    });

    let inventoryInfo = productsList.map(p => `- ${p.name}: দাম ${p.price} BDT`).join('\n');

    try {
        let porisoyReply = checkAknumberIntent(text);

        if (porisoyReply) {
            aiMsgDiv.className = "message ai-message";
            aiMsgDiv.innerHTML = ""; 
            typeWriterEffect(aiMsgDiv, porisoyReply, 15, () => {
                scrollToBottom();
                if (matchedImages.length > 0) appendImagesToMessage(aiMsgDiv, matchedImages);
            });
            speakText(porisoyReply);
            return;
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                text: `তুমি একজন বাংলাদেশি ই-কমার্স দোকানের বন্ধুভাবাপন্ন ও চটপটে এআই সেলসম্যান। তোমার দোকানের নাম "AI Dokan"। দোকানের মালিকের নাম শোহেল ভাই।
আমাদের বর্তমান স্টকে থাকা প্রোডাক্টগুলোর তালিকা নিচে দেওয়া হলো:
${inventoryInfo}

গ্রাহক এখন তোমাকে এই কথাটি বলেছে: "${text}"

নির্দেশনা:
১. গ্রাহক যেভাবে কথা বলুক না কেন, তুমি একজন চমৎকার স্মার্ট সেলসম্যানের মতো তার কথার উত্তর দাও।
২. যদি সে কোনো নির্দিষ্ট প্রোডাক্ট চায় এবং সেটি স্টকে থাকে, তাহলে তার দাম ও বিবরণসহ বুঝিয়ে বলো।
৩. উত্তরটি সাবলীল বাংলায় এবং সংক্ষিপ্তভাবে দাও।`
                            }
                        ]
                    }
                ]
            })
        });

        const data = await response.json();
        let replyText = "দুঃখিত ভাই, এই মুহূর্তে এআই রেসপন্স পেতে একটু সমস্যা হচ্ছে। একটু পরে আবার ট্রাই করুন!";

        if (data.candidates && data.candidates[0].content.parts[0].text) {
            replyText = data.candidates[0].content.parts[0].text;
        }

        aiMsgDiv.className = "message ai-message";
        aiMsgDiv.innerHTML = ""; 
        
        typeWriterEffect(aiMsgDiv, replyText, 15, () => {
            scrollToBottom();
            if (matchedImages.length > 0) {
                appendImagesToMessage(aiMsgDiv, matchedImages);
            }
        });

        speakText(replyText);

    } catch (error) {
        console.error("Gemini API Error:", error);
        aiMsgDiv.className = "message ai-message";
        aiMsgDiv.innerHTML = "নেটওয়ার্কের সমস্যার কারণে এআই কানেক্ট করা যায়নি ভাই!";
        scrollToBottom();
    }
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