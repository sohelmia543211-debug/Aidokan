import { porisoyProsno } from './porisoy_1_prosno.js';

export function checkPorisoyIntent(text) {
    const lowerText = text.toLowerCase();
    let matched = porisoyProsno.some(p => lowerText.includes(p.toLowerCase()));
    
    if (matched) {
        return "আমি এই শপের স্মার্ট সেলসম্যান এআই! আপনার পছন্দমতো সেরা পণ্যগুলো খুঁজে দিতে এবং অর্ডার কনফার্ম করতে আমি সবসময় প্রস্তুত। বলুন, কী দেখাতে পারি?";
    }
    return null;
}