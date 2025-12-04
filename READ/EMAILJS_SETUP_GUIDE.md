# Hướng dẫn chi tiết cấu hình EmailJS - Từng bước

## 📋 Tổng quan
Bạn đã có:
- ✅ Tài khoản EmailJS
- ✅ Email Service (Gmail) - Service ID: `service_hd1binp`

Bạn cần tạo:
- 📝 Email Template (để hiển thị OTP)
- 🔑 Lấy Public Key
- ⚙️ Tạo file `.env` để cấu hình

---

## BƯỚC 1: Tạo Email Template

### 1.1. Vào trang Email Templates
1. Trong sidebar bên trái, click vào **"Email Templates"** (icon grid)
2. Hoặc vào: https://dashboard.emailjs.com/admin/templates

### 1.2. Tạo Template mới
1. Click nút **"Create New Template"** (hoặc "Add New Template")
2. Bạn sẽ thấy form tạo template

### 1.3. Điền thông tin Template

**Template Name:**
```
OTP Verification
```
(Tên này chỉ để bạn quản lý, không ảnh hưởng đến email)

**Subject (Tiêu đề email):**
```
Mã OTP xác thực đăng ký
```

**Content (Nội dung email - HTML):**

Copy toàn bộ code HTML này vào:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px; 
      margin: 20px auto; 
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 30px 20px;
    }
    .otp-box { 
      background: #f8f9fa; 
      border: 3px solid #667eea; 
      border-radius: 12px;
      padding: 30px; 
      text-align: center; 
      margin: 30px 0; 
    }
    .otp-code { 
      font-size: 42px; 
      font-weight: bold; 
      color: #667eea; 
      letter-spacing: 8px; 
      font-family: 'Courier New', monospace;
      margin: 10px 0;
    }
    .warning {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer { 
      margin-top: 30px; 
      font-size: 12px; 
      color: #666; 
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>🔐 Xác thực đăng ký tài khoản</h1>
    </div>
    <div class="content">
      <p>Xin chào,</p>
      <p>Cảm ơn bạn đã đăng ký tài khoản! Để hoàn tất quá trình đăng ký, vui lòng sử dụng mã OTP bên dưới:</p>
      
      <div class="otp-box">
        <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Mã OTP của bạn:</p>
        <div class="otp-code">{{otp_code}}</div>
      </div>
      
      <div class="warning">
        <strong>⚠️ Lưu ý:</strong>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Mã OTP này có hiệu lực trong <strong>5 phút</strong></li>
          <li>Không chia sẻ mã này với bất kỳ ai</li>
          <li>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này</li>
        </ul>
      </div>
      
      <p>Vui lòng nhập mã OTP vào form đăng ký để hoàn tất quá trình.</p>
      
      <div class="footer">
        <p><strong>Trân trọng,</strong><br>Đội ngũ ClinicCare</p>
        <p style="font-size: 11px; color: #999; margin-top: 10px;">
          Email này được gửi tự động, vui lòng không trả lời.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
```

### 1.4. Thiết lập Template Variables

Trong EmailJS, bạn cần đảm bảo các biến sau được sử dụng:
- `{{to_email}}` - Email người nhận (EmailJS tự động thêm)
- `{{otp_code}}` - Mã OTP (bạn vừa thêm vào HTML)

### 1.5. Chọn Service
- Trong phần "Service", chọn **"Gmail"** (service bạn đã tạo)
- Hoặc để mặc định, EmailJS sẽ dùng service đầu tiên

### 1.6. Lưu Template
1. Click nút **"Save"** hoặc **"Save Template"**
2. **QUAN TRỌNG:** Copy **Template ID** (sẽ hiển thị sau khi lưu, dạng: `template_xxxxx`)

---

## BƯỚC 2: Lấy Public Key

### 2.1. Vào Account Settings
1. Trong sidebar, click vào **"Account"** (icon building)
2. Hoặc vào: https://dashboard.emailjs.com/admin/integration

### 2.2. Tìm Public Key
1. Trong trang Account, tìm phần **"API Keys"** hoặc **"Public Key"**
2. Copy **Public Key** (dạng: `xxxxxxxxxxxxx`)

---

## BƯỚC 3: Tạo file .env trong project

### 3.1. Tạo file .env
1. Vào thư mục root của project (cùng cấp với `package.json`)
2. Tạo file mới tên `.env`

### 3.2. Điền thông tin vào .env

Copy và điền thông tin của bạn:

```env
# EmailJS Configuration
VITE_USE_EMAILJS=true
VITE_EMAILJS_SERVICE_ID=service_hd1binp
VITE_EMAILJS_TEMPLATE_ID=template_xxxxx
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
```

**Thay thế:**
- `service_hd1binp` → Service ID của bạn (nếu khác)
- `template_xxxxx` → Template ID bạn vừa copy ở Bước 1.6
- `your_public_key_here` → Public Key bạn vừa copy ở Bước 2.2

### 3.3. Lưu file
Lưu file `.env` và đảm bảo nó ở root của project.

---

## BƯỚC 4: Kiểm tra và Test

### 4.1. Khởi động lại Dev Server
```bash
# Dừng server hiện tại (Ctrl+C)
# Sau đó chạy lại:
npm run dev
```

### 4.2. Test gửi email
1. Vào trang đăng ký của ứng dụng
2. Nhập email của bạn
3. Click "Gửi mã OTP"
4. Kiểm tra email inbox (và cả spam folder)
5. Bạn sẽ nhận được email với mã OTP đẹp mắt!

### 4.3. Kiểm tra Console
- Trong development mode, OTP vẫn sẽ được log ra console để bạn test
- Nếu có lỗi, kiểm tra console để xem chi tiết

---

## ❗ Xử lý lỗi thường gặp

### Lỗi: "Service ID not found"
- Kiểm tra lại Service ID trong file `.env`
- Đảm bảo Service đã được kích hoạt trong EmailJS dashboard

### Lỗi: "Template ID not found"
- Kiểm tra lại Template ID trong file `.env`
- Đảm bảo Template đã được lưu và có Service được chọn

### Lỗi: "Public Key invalid"
- Kiểm tra lại Public Key trong file `.env`
- Đảm bảo không có khoảng trắng thừa

### Email không đến
- Kiểm tra spam folder
- Kiểm tra email trong Email History của EmailJS
- Xem có lỗi gì trong Request Details không

### Dev server không nhận biến môi trường
- Đảm bảo file `.env` ở root của project
- Khởi động lại dev server sau khi tạo/sửa `.env`
- Kiểm tra tên biến có đúng format `VITE_` không

---

## 📝 Tóm tắt thông tin cần copy

Sau khi hoàn thành, bạn sẽ có:
- ✅ **Service ID:** `service_hd1binp` (hoặc của bạn)
- ✅ **Template ID:** `template_xxxxx` (copy từ Bước 1.6)
- ✅ **Public Key:** `xxxxxxxxxxxxx` (copy từ Bước 2.2)

Điền các thông tin này vào file `.env` và bạn đã xong!

---

## 🎉 Hoàn thành!

Nếu bạn gặp khó khăn ở bước nào, hãy cho tôi biết và tôi sẽ hỗ trợ!

