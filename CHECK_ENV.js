// Copy và paste code này vào Console sau khi gõ 'allow pasting'
// Hoặc gõ từng dòng thủ công

console.log("=== KIỂM TRA BIẾN MÔI TRƯỜNG ===");
console.log("VITE_USE_EMAILJS:", import.meta.env.VITE_USE_EMAILJS);
console.log("VITE_EMAILJS_SERVICE_ID:", import.meta.env.VITE_EMAILJS_SERVICE_ID);
console.log("VITE_EMAILJS_TEMPLATE_ID:", import.meta.env.VITE_EMAILJS_TEMPLATE_ID);
console.log("VITE_EMAILJS_PUBLIC_KEY:", import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
console.log("MODE:", import.meta.env.MODE);

// Kiểm tra kết quả
const allDefined = 
  import.meta.env.VITE_USE_EMAILJS !== undefined &&
  import.meta.env.VITE_EMAILJS_SERVICE_ID !== undefined &&
  import.meta.env.VITE_EMAILJS_TEMPLATE_ID !== undefined &&
  import.meta.env.VITE_EMAILJS_PUBLIC_KEY !== undefined;

if (allDefined) {
  console.log("✅ TẤT CẢ BIẾN MÔI TRƯỜNG ĐÃ ĐƯỢC ĐỌC!");
} else {
  console.log("❌ MỘT SỐ BIẾN MÔI TRƯỜNG CHƯA ĐƯỢC ĐỌC!");
  console.log("💡 Hãy restart server và kiểm tra lại file .env");
}

