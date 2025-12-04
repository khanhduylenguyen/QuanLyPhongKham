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

---

# ✅ Checklist cấu hình Google OAuth

## 📋 Thông tin cần có:
- [ ] Tài khoản Google (Gmail)
- [ ] Truy cập Google Cloud Console

## 📝 Các bước cần làm:

### Bước 1: Tạo OAuth 2.0 Client ID trong Google Cloud Console
- [ ] Truy cập: https://console.cloud.google.com/
- [ ] Tạo project mới hoặc chọn project có sẵn
- [ ] Vào **APIs & Services** > **Credentials**
- [ ] Click **"Create Credentials"** > **"OAuth client ID"**
- [ ] Nếu chưa có OAuth consent screen, cần cấu hình:
  - **User Type:** External (cho development) hoặc Internal (cho G Suite)
  - **App name:** Medi Path Ease (hoặc tên bạn muốn)
  - **User support email:** Email của bạn
  - **Developer contact:** Email của bạn
  - **Scopes:** Thêm `.../auth/userinfo.email` và `.../auth/userinfo.profile`
  - **Test users:** Thêm email của bạn (nếu chọn External)
- [ ] Tạo OAuth Client ID:
  - **Application type:** Web application
  - **Name:** Medi Path Ease Web Client
  - **Authorized JavaScript origins:** 
    - `http://localhost:8080` (cho development)
    - `http://localhost:3000` (nếu dùng port khác)
  - **Authorized redirect URIs:** 
    - `http://localhost:8080` (cho development)
    - `http://localhost:3000` (nếu dùng port khác)
- [ ] Click **"Create"**
- [ ] **Copy Client ID:** `xxxxx-xxxxx.apps.googleusercontent.com` ← Lưu lại đây

### Bước 2: Cập nhật file .env
- [ ] Mở file `.env` ở root project
- [ ] Thêm dòng sau (thay `YOUR_GOOGLE_CLIENT_ID_HERE` bằng Client ID vừa copy):

```env
VITE_GOOGLE_CLIENT_ID=xxxxx-xxxxx.apps.googleusercontent.com
```

### Bước 3: Test
- [ ] Khởi động lại dev server: `npm run dev`
- [ ] Vào trang đăng nhập: `http://localhost:8080/login`
- [ ] Click nút **"Đăng nhập bằng Google"**
- [ ] Chọn tài khoản Google
- [ ] Cho phép ứng dụng truy cập thông tin
- [ ] ✅ Đăng nhập thành công!

---

## 📚 Lưu ý:
- **Development:** Chỉ cần thêm `http://localhost:8080` vào Authorized origins
- **Production:** Cần thêm domain thực tế (ví dụ: `https://yourdomain.com`)
- **OAuth Consent Screen:** Cần publish app nếu muốn người dùng ngoài test users sử dụng
- **Security:** Không commit file `.env` lên Git (đã có trong `.gitignore`)

## 🆘 Nếu gặp lỗi:
1. Kiểm tra Client ID đã copy đúng chưa (không có khoảng trắng)
2. Đảm bảo Authorized origins đúng với URL bạn đang dùng
3. Khởi động lại dev server sau khi cập nhật `.env`
4. Kiểm tra Console trong browser để xem lỗi chi tiết
5. Đảm bảo đã thêm email vào Test users (nếu dùng External app type)

