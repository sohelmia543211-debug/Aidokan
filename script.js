import { checkPorisoyIntent } from './porisoy_1_ottor.js';

const SUPABASE_URL = "https://inubstmbcquaxwazxkir.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImludWJzdG1iY3F1YXh3YXp4a2lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2MzQyMzEsImV4cCI6MjEwMTIxMDIzMX0.bTmvyAeE-mdRrFI0LhEEu2JV9YPA158lG6h3riKjVRo";

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

// ১. স্পিচ টু টেক্সট (কথা বলে টেক্সট ইনপুট করা)
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

// ২. টেক্সট টু স্পিচ (এআই-এর উত্তর মুখে বলে শোনানো)
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
    
    // প্রোডাক্ট ম্যাচিং এবং নির্দিষ্ট প্রোডাক্ট বা দাম খোঁজা
    let foundProduct = null;
    productsList.forEach(p => {
        if (p.name && lowerText.includes(p.name.toLowerCase())) {
            foundProduct = p;
            if (p.image_url_1) matchedImages.push(p.image_url_1);
        }
    });

    let replyText = "";

    setTimeout(() => {
        // আলাদা ফাইল থেকে পরিচয় বা হাই-হ্যালো চেক করা
        let porisoyReply = checkPorisoyIntent(text);

        if (porisoyReply) {
            replyText = porisoyReply;
        }
        else if (lowerText.includes('দাম') || lowerText.includes('price') || lowerText.includes('কত')) {
            if (foundProduct) {
                replyText = `ভাই, আমাদের **${foundProduct.name}** এর দাম মাত্র **${foundProduct.price} BDT**! স্টক আছে **${foundProduct.stock || 'প্রচুর'}**। নিতে চাইলে অর্ডার কনফার্ম করে ফেলতে পারেন! 😊`;
            } else {
                let listStr = productsList.map(p => `• ${p.name} - ${p.price} BDT`).join('\n');
                replyText = `কোন প্রোডাক্টটার দাম জানতে চান ভাই? আমাদের স্টকে এগুলো আছে:\n${listStr}`;
            }
        } 
        else if (lowerText.includes('ডেলিভারি') || lowerText.includes('delivery') || lowerText.includes('ক্যাশ অন') || lowerText.includes('cod')) {
            replyText = `অবশ্যই ভাই! আমাদের সারা বাংলাদেশে ক্যাশ অন ডেলিভারি (COD) সুবিধা রয়েছে। ঢাকার ভেতরে ডেলিভারি চার্জ ৬০ টাকা এবং ঢাকার বাইরে ১২০ টাকা। বলুন কোন প্রোডাক্টটি পাঠাবো?`;
        } 
        else if (lowerText.includes('তালিকা') || lowerText.includes('লিস্ট') || lowerText.includes('product') || lowerText.includes('পণ্য') || lowerText.includes('কী আছে')) {
            let listStr = productsList.map(p => `• **${p.name}** - দাম: ${p.price} BDT (স্টক: ${p.stock || 'আছে'})`).join('\n');
            replyText = `শোহেল ভাইয়ের শপের সেরা কালেকশনগুলো দেখে নিন:\n${listStr}\n\nআপনার পছন্দমতো কোনটা লাগবে বলুন!`;
        } 
        else if (foundProduct) {
            replyText = `বাহ! দারুন পছন্দ ভাই। **${foundProduct.name}-এর** দাম মাত্র **${foundProduct.price} BDT**। এটা অর্ডার করতে চাইলে আপনার ঠিকানা ও ফোন নম্বর দিন!`;
        } 
        else {
            replyText = `কথাটি ঠিক বুঝতে পারিনি ভাই! আমাদের কোনো নির্দিষ্ট প্রোডাক্ট বা দাম সম্পর্কে জানতে চাইলে বলুন, অথবা লিখে জানান কী লাগবে!`;
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
    }, 600);
}

// টাইপরাইটার ইফেক্ট ফাংশন
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

// গ্লোবাল উইন্ডো স্কোপে ফাংশনগুলো বাইন্ড করা যাতে HTML থেকে কল করা যায়
window.startVoiceRecognition = startVoiceRecognition;
window.toggleVoice = toggleVoice;
window.handleKeyPress = handleKeyPress;
window.sendMessage = sendMessage;