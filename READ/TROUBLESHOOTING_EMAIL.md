# 🔧 Khắc phục sự cố: Email OTP không gửi được

## ❓ Vấn đề
Email OTP không còn gửi được nữa, mặc dù trước đây (ngày 5/11) vẫn hoạt động bình thường.

## 🔍 Các bước kiểm tra và khắc phục

### Bước 1: Kiểm tra file .env

1. **Kiểm tra xem file `.env` có tồn tại không:**
   - File `.env` phải ở **root của project** (cùng cấp với `package.json`)
   - File này thường bị `.gitignore` nên có thể không thấy trong Git

2. **Nếu chưa có file `.env`, tạo mới:**
   ```env
   VITE_USE_EMAILJS=true
   VITE_EMAILJS_SERVICE_ID=service_hd1binp
   VITE_EMAILJS_TEMPLATE_ID=template_xxxxx
   VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
   ```

3. **Kiểm tra nội dung file `.env`:**
   - Đảm bảo không có khoảng trắng thừa
   - Đảm bảo các giá trị được điền đúng
   - Không có dấu ngoặc kép thừa

### Bước 2: Kiểm tra Console Logs

1. **Mở Developer Console** (F12)
2. **Thử gửi OTP** từ trang đăng ký
3. **Xem các log:**
   - `[Email Config]` - Kiểm tra config có được load đúng không
   - `[Email Service]` - Xem service nào đang được sử dụng
   - `[EmailJS]` - Xem chi tiết lỗi nếu có

**Các trường hợp thường gặp:**

#### Trường hợp 1: Config không được load
```
[Email Config] {
  useEmailJS: false,
  hasServiceId: false,
  hasTemplateId: false,
  hasPublicKey: false
}
```
**Nguyên nhân:** File `.env` không tồn tại hoặc dev server chưa được restart
**Giải pháp:**
- Tạo file `.env` nếu chưa có
- **Khởi động lại dev server** (quan trọng!)
  ```bash
  # Dừng server (Ctrl+C)
  npm run dev
  ```

#### Trường hợp 2: EmailJS config có nhưng gửi thất bại
```
[EmailJS] Error sending email: ...
```
**Nguyên nhân có thể:**
- Service ID, Template ID, hoặc Public Key sai
- EmailJS service bị hết hạn hoặc bị vô hiệu hóa
- Template không tồn tại hoặc bị xóa

**Giải pháp:**
1. Vào [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Kiểm tra **Email History** để xem lỗi chi tiết
3. Kiểm tra lại các ID trong file `.env`
4. Đảm bảo Template vẫn còn tồn tại và được kích hoạt

### Bước 3: Kiểm tra EmailJS Dashboard

1. **Đăng nhập vào EmailJS Dashboard:**
   - Vào: https://dashboard.emailjs.com/
   - Đăng nhập bằng tài khoản của bạn

2. **Kiểm tra Email Service:**
   - Vào **Email Services**
   - Đảm bảo service `service_hd1binp` vẫn còn hoạt động
   - Kiểm tra xem có bị hết hạn không

3. **Kiểm tra Email Templates:**
   - Vào **Email Templates**
   - Đảm bảo template OTP vẫn còn tồn tại
   - Copy lại Template ID nếu cần

4. **Kiểm tra Public Key:**
   - Vào **Account** → **General**
   - Copy lại Public Key
   - Cập nhật vào file `.env`

5. **Kiểm tra Email History:**
   - Vào **Email History**
   - Xem các email gần đây có lỗi gì không
   - Xem chi tiết lỗi nếu có

### Bước 4: Kiểm tra Email của bạn

1. **Kiểm tra Spam Folder:**
   - Email có thể bị đưa vào thư rác (như trong hình bạn gửi)
   - Đánh dấu "Không phải spam" nếu cần

2. **Kiểm tra Email Filter:**
   - Có thể có filter tự động chặn email từ EmailJS
   - Kiểm tra cài đặt email của bạn

### Bước 5: Test lại

1. **Khởi động lại dev server:**
   ```bash
   npm run dev
   ```

2. **Mở Console (F12) và thử gửi OTP**

3. **Xem logs để debug:**
   - Nếu thấy `[Email Service] Email service not configured` → File `.env` chưa được load
   - Nếu thấy `[EmailJS] Error` → Kiểm tra lại config EmailJS
   - Nếu thấy `[Email Service] ✅ Email sent successfully` → Email đã được gửi, kiểm tra inbox/spam

## 🆘 Các lỗi thường gặp

### Lỗi: "Service ID not found"
- **Nguyên nhân:** Service ID sai hoặc service bị xóa
- **Giải pháp:** Kiểm tra lại Service ID trong EmailJS Dashboard

### Lỗi: "Template ID not found"
- **Nguyên nhân:** Template ID sai hoặc template bị xóa
- **Giải pháp:** Tạo lại template và copy Template ID mới

### Lỗi: "Public Key invalid"
- **Nguyên nhân:** Public Key sai hoặc đã thay đổi
- **Giải pháp:** Lấy lại Public Key từ EmailJS Dashboard

### Lỗi: "Email service not configured"
- **Nguyên nhân:** File `.env` không tồn tại hoặc chưa được load
- **Giải pháp:** 
  1. Tạo file `.env` ở root project
  2. Điền đầy đủ thông tin
  3. **Khởi động lại dev server**

## 📝 Checklist nhanh

- [ ] File `.env` tồn tại ở root project
- [ ] File `.env` có đầy đủ 4 biến: `VITE_USE_EMAILJS`, `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY`
- [ ] Đã khởi động lại dev server sau khi tạo/sửa `.env`
- [ ] Service ID đúng: `service_hd1binp`
- [ ] Template ID đúng (kiểm tra trong EmailJS Dashboard)
- [ ] Public Key đúng (kiểm tra trong EmailJS Dashboard)
- [ ] Đã kiểm tra Email History trong EmailJS Dashboard
- [ ] Đã kiểm tra Spam folder trong email
- [ ] Console không có lỗi khi gửi OTP

## 💡 Tips

1. **Luôn khởi động lại dev server** sau khi thay đổi file `.env`
2. **Kiểm tra Console logs** để debug nhanh
3. **Email có thể vào Spam** - luôn kiểm tra spam folder
4. **EmailJS có giới hạn** - kiểm tra quota trong dashboard
5. **Template phải có biến `{{otp_code}}`** để hiển thị OTP

## 📞 Cần hỗ trợ thêm?

Nếu vẫn không giải quyết được, vui lòng:
1. Copy toàn bộ logs từ Console
2. Chụp màn hình EmailJS Dashboard (Email History)
3. Kiểm tra file `.env` (ẩn thông tin nhạy cảm trước khi chia sẻ)

