# 🚀 Hướng dẫn nhanh: Cấu hình Endpoint

## 📝 Tạo file `.env`

Tạo file `.env` ở root của project (cùng cấp với `package.json`) với nội dung sau:

```env
# ============================================
# EMAIL - Chọn 1 trong 2 phương án
# ============================================

# PHƯƠNG ÁN 1: EmailJS (Không cần backend)
VITE_USE_EMAILJS=true
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_EMAILJS_REMINDER_TEMPLATE_ID=your_reminder_template_id

# PHƯƠNG ÁN 2: Backend API (Cần server)
# VITE_EMAIL_API_ENDPOINT=https://your-api.com/api/auth/send-otp
# VITE_EMAIL_REMINDER_API_ENDPOINT=https://your-api.com/api/appointments/send-reminder

# ============================================
# SMS (Tùy chọn)
# ============================================
VITE_USE_SMS=false
# VITE_SMS_API_ENDPOINT=https://your-api.com/api/sms/send
# VITE_SMS_API_KEY=your_api_key

# ============================================
# REMINDER SETTINGS
# ============================================
VITE_REMINDER_CHECK_INTERVAL=30
```

---

## 🔍 Cách lấy Endpoint

### Nếu bạn có Backend Server:

1. **Hỏi backend developer** về endpoint URL
2. **Xem API documentation** của backend
3. **Kiểm tra trong code backend:**
   ```javascript
   // Ví dụ: app.post('/api/auth/send-otp', ...)
   // Endpoint sẽ là: https://your-domain.com/api/auth/send-otp
   ```

### Nếu bạn dùng Third-party Service:

1. **EmailJS:** Không cần endpoint, chỉ cần Service ID, Template ID, Public Key
2. **SendGrid:** Endpoint: `https://api.sendgrid.com/v3/mail/send`
3. **Twilio (SMS):** Endpoint: `https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json`
4. **AWS SNS:** Endpoint: `https://sns.{region}.amazonaws.com/`

### Nếu bạn tự tạo Backend:

Xem ví dụ trong `ENDPOINT_SETUP_GUIDE.md` phần "Ví dụ Backend Implementation"

---

## ✅ Checklist nhanh

- [ ] Đã tạo file `.env` ở root project
- [ ] Đã điền endpoint hoặc EmailJS config
- [ ] Đã restart dev server (`npm run dev`)
- [ ] Đã kiểm tra console log (F12) để xem config
- [ ] Đã test gửi email/SMS

---

## 🧪 Test Endpoint

### Cách 1: Dùng Browser Console

Mở browser console (F12) và chạy:

```javascript
// Test email endpoint
fetch('https://your-api.com/api/auth/send-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    otp: '123456'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

### Cách 2: Dùng Postman

1. Tạo request mới
2. Method: `POST`
3. URL: `https://your-api.com/api/auth/send-otp`
4. Headers: `Content-Type: application/json`
5. Body (JSON):
   ```json
   {
     "email": "test@example.com",
     "otp": "123456"
   }
   ```
6. Send và xem response

---

## 📞 Cần giúp đỡ?

- **Chi tiết hơn:** Xem `ENDPOINT_SETUP_GUIDE.md`
- **EmailJS setup:** Xem `EMAIL_SETUP.md`
- **Reminder setup:** Xem `APPOINTMENT_REMINDERS_SETUP.md`


