# 🔧 Sửa lỗi: Email đang dùng template "Contact Us" thay vì template OTP

## 🔍 Vấn đề
Từ Email History, tôi thấy:
- ✅ Email đang được gửi thành công
- ✅ Service Gmail hoạt động bình thường
- ❌ **Đang dùng template "Contact Us" thay vì template OTP**

## 🎯 Giải pháp

### Cách 1: Tạo Template OTP mới (Khuyến nghị)

1. **Vào EmailJS Dashboard:**
   - Truy cập: https://dashboard.emailjs.com/admin/templates
   - Click **"Create New Template"**

2. **Điền thông tin:**
   - **Template Name:** `OTP Verification`
   - **Subject:** `Mã OTP xác thực đăng ký`
   - **Content:** Mở file `emailjs-template.html` và copy toàn bộ nội dung vào
   - **Service:** Chọn Gmail (service_hd1binp)

3. **Lưu và lấy Template ID:**
   - Click **"Save"**
   - **Copy Template ID** (dạng: `template_xxxxx`)

4. **Cập nhật file `.env`:**
   - Mở file `.env` ở root project
   - Thay `VITE_EMAILJS_TEMPLATE_ID` bằng Template ID mới:
     ```env
     VITE_EMAILJS_TEMPLATE_ID=template_xxxxx  # ← Thay bằng Template ID mới
     ```

5. **Khởi động lại dev server:**
   ```bash
   # Dừng server (Ctrl+C)
   npm run dev
   ```

### Cách 2: Tìm Template OTP hiện có (Nếu đã tạo rồi)

1. **Vào Email Templates:**
   - Truy cập: https://dashboard.emailjs.com/admin/templates
   - Tìm template có tên "OTP Verification" hoặc tương tự

2. **Nếu tìm thấy:**
   - Click vào template đó
   - Copy **Template ID** (ở URL hoặc trong thông tin template)
   - Cập nhật vào file `.env` như bước 4 ở trên

3. **Nếu không tìm thấy:**
   - Làm theo **Cách 1** để tạo template mới

## 📝 Kiểm tra file .env

Đảm bảo file `.env` có đầy đủ thông tin:

```env
VITE_USE_EMAILJS=true
VITE_EMAILJS_SERVICE_ID=service_hd1binp
VITE_EMAILJS_TEMPLATE_ID=template_xxxxx  # ← Phải là Template ID của template OTP
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
```

## ✅ Test lại

1. **Khởi động lại dev server** (quan trọng!)
2. **Mở Console** (F12) để xem logs
3. **Thử gửi OTP** từ trang đăng ký
4. **Kiểm tra Email History** trong EmailJS:
   - Template phải hiển thị "OTP Verification" (hoặc tên template bạn đặt)
   - Không còn "Contact Us" nữa
5. **Kiểm tra email inbox:**
   - Email phải có tiêu đề "Mã OTP xác thực đăng ký"
   - Email phải hiển thị mã OTP đẹp mắt (từ template HTML)

## 🆘 Nếu vẫn không được

1. **Kiểm tra Console logs:**
   - Xem `[Email Config]` để đảm bảo Template ID được load đúng
   - Xem `[EmailJS]` để xem có lỗi gì không

2. **Kiểm tra EmailJS Dashboard:**
   - Vào Email Templates
   - Đảm bảo template OTP vẫn còn tồn tại
   - Kiểm tra Template ID có đúng không

3. **Kiểm tra file `.env`:**
   - Đảm bảo không có khoảng trắng thừa
   - Đảm bảo Template ID đúng format: `template_xxxxx`

## 📚 File tham khảo

- **EMAILJS_SETUP_GUIDE.md** - Hướng dẫn chi tiết tạo template
- **emailjs-template.html** - Template HTML để copy vào EmailJS
- **SETUP_CHECKLIST.md** - Checklist đầy đủ

