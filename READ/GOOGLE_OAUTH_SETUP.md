# 🔐 Hướng dẫn cấu hình Đăng nhập bằng Google

## 📋 Tổng quan

Tính năng đăng nhập bằng Google đã được tích hợp sẵn trong ứng dụng. Bạn chỉ cần cấu hình Google OAuth Client ID để kích hoạt tính năng này.

## 🚀 Các bước cấu hình

### Bước 1: Tạo OAuth 2.0 Client ID trong Google Cloud Console

1. **Truy cập Google Cloud Console**
   - Vào: https://console.cloud.google.com/
   - Đăng nhập bằng tài khoản Google của bạn

2. **Tạo Project mới (nếu chưa có)**
   - Click vào dropdown project ở trên cùng
   - Click **"New Project"**
   - Nhập tên project: `Medi Path Ease` (hoặc tên bạn muốn)
   - Click **"Create"**

3. **Cấu hình OAuth Consent Screen**
   - Vào **APIs & Services** > **OAuth consent screen**
   - Chọn **User Type:**
     - **External** (cho development và public users) - Khuyến nghị
     - **Internal** (chỉ cho G Suite users)
   - Click **"Create"**
   - Điền thông tin:
     - **App name:** `Medi Path Ease` (hoặc tên bạn muốn)
     - **User support email:** Email của bạn
     - **Developer contact information:** Email của bạn
   - Click **"Save and Continue"**
   - **Scopes:** Click **"Add or Remove Scopes"**
     - Chọn: `.../auth/userinfo.email`
     - Chọn: `.../auth/userinfo.profile`
     - Click **"Update"** > **"Save and Continue"**
   - **Test users:** (Nếu chọn External)
     - Click **"Add Users"**
     - Thêm email của bạn để test
     - Click **"Save and Continue"**
   - Click **"Back to Dashboard"**

4. **Tạo OAuth Client ID**
   - Vào **APIs & Services** > **Credentials**
   - Click **"Create Credentials"** > **"OAuth client ID"**
   - Chọn **Application type:** `Web application`
   - **Name:** `Medi Path Ease Web Client`
   - **Authorized JavaScript origins:**
     - Thêm: `http://localhost:8080` (cho development)
     - Thêm: `http://localhost:3000` (nếu bạn dùng port khác)
     - ⚠️ **Lưu ý:** Khi deploy production, thêm domain thật của bạn
   - **Authorized redirect URIs:**
     - Thêm: `http://localhost:8080` (cho development)
     - Thêm: `http://localhost:3000` (nếu bạn dùng port khác)
     - ⚠️ **Lưu ý:** Khi deploy production, thêm domain thật của bạn
   - Click **"Create"**
   - **Copy Client ID:** `xxxxx-xxxxx.apps.googleusercontent.com` ← **Lưu lại ngay!**

### Bước 2: Tạo file .env

1. **Tạo file `.env` ở root project** (cùng cấp với `package.json`)

2. **Thêm nội dung sau vào file `.env`:**

```env
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=xxxxx-xxxxx.apps.googleusercontent.com
```

**Thay `xxxxx-xxxxx.apps.googleusercontent.com` bằng Client ID bạn vừa copy ở Bước 1.**

**Ví dụ:**
```env
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
```

### Bước 3: Khởi động lại Dev Server

1. **Dừng dev server** (nếu đang chạy): Nhấn `Ctrl + C` trong terminal

2. **Khởi động lại:**
```bash
npm run dev
```

⚠️ **Lưu ý:** Phải khởi động lại server sau khi tạo/sửa file `.env`!

### Bước 4: Test đăng nhập bằng Google

1. **Mở trình duyệt:** `http://localhost:8080/login`

2. **Kiểm tra nút Google:**
   - Nếu thấy nút **"Đăng nhập bằng Google"** (icon Google màu xanh) → ✅ Đã cấu hình đúng
   - Nếu không thấy nút → Kiểm tra lại file `.env` và khởi động lại server

3. **Test đăng nhập:**
   - Click nút **"Đăng nhập bằng Google"**
   - Chọn tài khoản Google (phải là email đã thêm vào Test users nếu dùng External)
   - Cho phép ứng dụng truy cập thông tin
   - ✅ Đăng nhập thành công và tự động chuyển đến dashboard!

## 📝 Cấu hình cho Production

Khi deploy lên production, bạn cần:

1. **Thêm domain production vào Google Cloud Console:**
   - Vào **APIs & Services** > **Credentials**
   - Click vào OAuth Client ID bạn đã tạo
   - Thêm vào **Authorized JavaScript origins:**
     - `https://yourdomain.com`
   - Thêm vào **Authorized redirect URIs:**
     - `https://yourdomain.com`
   - Click **"Save"**

2. **Cập nhật file `.env` trên server:**
   - Thêm `VITE_GOOGLE_CLIENT_ID` với cùng Client ID
   - Hoặc sử dụng environment variables của hosting platform

3. **Publish OAuth App (nếu dùng External):**
   - Vào **OAuth consent screen**
   - Click **"Publish App"** (sau khi test xong)
   - ⚠️ **Lưu ý:** App phải được verify bởi Google nếu có nhiều users

## 🔍 Troubleshooting

### ❌ Không thấy nút Google login
- ✅ Kiểm tra file `.env` đã tạo đúng chưa
- ✅ Kiểm tra `VITE_GOOGLE_CLIENT_ID` có giá trị hợp lệ không
- ✅ Khởi động lại dev server
- ✅ Kiểm tra console (F12) xem có lỗi gì không

### ❌ Lỗi "redirect_uri_mismatch"
- ✅ Kiểm tra **Authorized redirect URIs** trong Google Cloud Console
- ✅ Đảm bảo URL trong console khớp với URL bạn đang dùng (ví dụ: `http://localhost:8080`)

### ❌ Lỗi "access_denied"
- ✅ Kiểm tra email bạn dùng có trong **Test users** không (nếu dùng External)
- ✅ Kiểm tra OAuth consent screen đã được cấu hình đầy đủ chưa

### ❌ Lỗi "invalid_client"
- ✅ Kiểm tra Client ID trong file `.env` đã đúng chưa
- ✅ Đảm bảo không có khoảng trắng thừa trong Client ID

## 📚 Tài liệu tham khảo

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [React OAuth Google Package](https://www.npmjs.com/package/@react-oauth/google)

## ✅ Checklist

- [ ] Đã tạo project trong Google Cloud Console
- [ ] Đã cấu hình OAuth consent screen
- [ ] Đã tạo OAuth Client ID
- [ ] Đã thêm `http://localhost:8080` vào Authorized origins và redirect URIs
- [ ] Đã tạo file `.env` với `VITE_GOOGLE_CLIENT_ID`
- [ ] Đã khởi động lại dev server
- [ ] Đã test đăng nhập bằng Google thành công

---

**🎉 Chúc mừng! Bạn đã cấu hình xong đăng nhập bằng Google!**

