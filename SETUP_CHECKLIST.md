# ✅ Checklist cấu hình EmailJS

## 📋 Thông tin bạn đã có:
- [x] Tài khoản EmailJS
- [x] Email Service (Gmail) - Service ID: `service_hd1binp`

## 📝 Các bước cần làm:

### Bước 1: Tạo Email Template
- [ ] Vào **Email Templates** trong sidebar
- [ ] Click **"Create New Template"**
- [ ] **Template Name:** `OTP Verification`
- [ ] **Subject:** `Mã OTP xác thực đăng ký`
- [ ] **Content:** Mở file `emailjs-template.html` và copy toàn bộ nội dung vào
- [ ] **Service:** Chọn Gmail (service_hd1binp)
- [ ] **Save** template
- [ ] **Copy Template ID:** `template_xxxxx` ← Lưu lại đây

### Bước 2: Lấy Public Key
- [ ] Vào **Account** trong sidebar
- [ ] Tìm phần **"Public Key"** hoặc **"API Keys"**
- [ ] **Copy Public Key:** `xxxxxxxxxxxxx` ← Lưu lại đây

### Bước 3: Tạo file .env
- [ ] Tạo file `.env` ở root project (cùng cấp với `package.json`)
- [ ] Copy nội dung sau và điền thông tin:

```env
VITE_USE_EMAILJS=true
VITE_EMAILJS_SERVICE_ID=service_hd1binp
VITE_EMAILJS_TEMPLATE_ID=template_xxxxx
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
```

### Bước 4: Test
- [ ] Khởi động lại dev server: `npm run dev`
- [ ] Vào trang đăng ký
- [ ] Nhập email và gửi OTP
- [ ] Kiểm tra email inbox (và spam folder)
- [ ] ✅ Nhận được email với OTP đẹp mắt!

---

## 📚 File hướng dẫn chi tiết:
- **EMAILJS_SETUP_GUIDE.md** - Hướng dẫn từng bước chi tiết
- **emailjs-template.html** - Template HTML để copy vào EmailJS

---

## 🆘 Nếu gặp lỗi:
1. Kiểm tra lại các ID đã copy đúng chưa
2. Đảm bảo file `.env` ở đúng vị trí (root project)
3. Khởi động lại dev server sau khi tạo `.env`
4. Kiểm tra Email History trong EmailJS để xem có lỗi gì không

