# Hướng dẫn cấu hình Email Service

Để hệ thống có thể gửi email OTP thật đến người dùng, bạn cần cấu hình một trong các phương thức sau:

## Phương án 1: Sử dụng EmailJS (Khuyến nghị - Không cần backend)

EmailJS là dịch vụ miễn phí cho phép gửi email từ frontend mà không cần backend server.

### Bước 1: Đăng ký tài khoản EmailJS
1. Truy cập https://www.emailjs.com/
2. Đăng ký tài khoản miễn phí (100 emails/tháng)
3. Xác thực email của bạn

### Bước 2: Tạo Email Service
1. Vào Dashboard → Email Services
2. Click "Add New Service"
3. Chọn email provider (Gmail, Outlook, hoặc Custom SMTP)
4. Kết nối email của bạn
5. Copy **Service ID**

### Bước 3: Tạo Email Template
1. Vào Dashboard → Email Templates
2. Click "Create New Template"
3. Thiết lập template như sau:

**Subject:**
```
Mã OTP xác thực đăng ký
```

**Content (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .otp-box { background: #f4f4f4; border: 2px dashed #007BFF; padding: 20px; text-align: center; margin: 20px 0; }
    .otp-code { font-size: 32px; font-weight: bold; color: #007BFF; letter-spacing: 5px; }
    .footer { margin-top: 30px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Xác thực đăng ký tài khoản</h2>
    <p>Xin chào,</p>
    <p>Bạn đã yêu cầu mã OTP để xác thực đăng ký tài khoản. Mã OTP của bạn là:</p>
    <div class="otp-box">
      <div class="otp-code">{{otp_code}}</div>
    </div>
    <p>Mã OTP này có hiệu lực trong <strong>5 phút</strong>.</p>
    <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
    <div class="footer">
      <p>Trân trọng,<br>Đội ngũ ClinicCare</p>
    </div>
  </div>
</body>
</html>
```

4. Sử dụng các biến:
   - `{{to_email}}` - Email người nhận
   - `{{otp_code}}` - Mã OTP
5. Copy **Template ID**

### Bước 4: Lấy Public Key
1. Vào Dashboard → Account → General
2. Copy **Public Key**

### Bước 5: Cấu hình trong project
Tạo file `.env` ở root của project với nội dung:

```env
VITE_USE_EMAILJS=true
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

Thay thế các giá trị bằng thông tin bạn đã copy ở các bước trên.

---

## Phương án 2: Sử dụng Backend API

Nếu bạn đã có backend server, bạn có thể tạo API endpoint để gửi email.

### Backend API Endpoint

Tạo endpoint: `POST /api/auth/send-otp`

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "subject": "Mã OTP xác thực đăng ký"
}
```

**Response:**
```json
{
  "success": true
}
```

### Cấu hình trong project

Tạo file `.env` ở root của project:

```env
VITE_EMAIL_API_ENDPOINT=http://localhost:3000/api/auth/send-otp
```

Hoặc nếu API của bạn ở domain khác:
```env
VITE_EMAIL_API_ENDPOINT=https://your-api-domain.com/api/auth/send-otp
```

---

## Phương án 3: Development Mode (Không cấu hình)

Nếu không cấu hình gì, hệ thống sẽ chỉ log OTP ra console trong development mode để bạn có thể test. Email sẽ không được gửi thật.

---

## Kiểm tra cấu hình

Sau khi cấu hình xong:
1. Khởi động lại dev server (`npm run dev`)
2. Thử đăng ký tài khoản mới
3. Kiểm tra email inbox (hoặc spam folder) để xem có nhận được OTP không

## Lưu ý

- **EmailJS**: Miễn phí 100 emails/tháng, không cần backend
- **Backend API**: Cần có server riêng, linh hoạt hơn
- Trong development mode, OTP vẫn sẽ được log ra console để dễ test
- Đảm bảo file `.env` không được commit lên Git (đã có trong `.gitignore`)

