# Hướng dẫn cấu hình Nhắc nhở Lịch hẹn Tự động

Hệ thống tự động gửi nhắc nhở Email/SMS cho bệnh nhân:
- **24 giờ** trước lịch hẹn
- **2 giờ** trước lịch hẹn

## Tính năng

✅ Tự động kiểm tra và gửi nhắc nhở
✅ Hỗ trợ Email và SMS
✅ Chỉ gửi cho lịch hẹn đã xác nhận (status: "confirmed")
✅ Tránh gửi trùng lặp (tracking reminders đã gửi)
✅ Chạy tự động trong background

## Cấu hình Email

### Phương án 1: Sử dụng EmailJS (Khuyến nghị)

1. **Tạo Email Template cho Reminder trong EmailJS:**

   - Vào [EmailJS Dashboard](https://dashboard.emailjs.com/)
   - Tạo template mới cho appointment reminders
   - Sử dụng các biến sau trong template:

   ```
   {{to_email}} - Email người nhận
   {{patient_name}} - Tên bệnh nhân
   {{doctor_name}} - Tên bác sĩ
   {{specialty}} - Chuyên khoa
   {{appointment_date}} - Ngày khám (định dạng: Thứ Hai, 31 tháng 10, 2024)
   {{appointment_time}} - Giờ khám (ví dụ: 09:00)
   {{hours_until}} - Thời gian còn lại (24 giờ hoặc 2 giờ)
   {{appointment_id}} - Mã lịch hẹn
   {{subject}} - Tiêu đề email
   ```

   **Ví dụ Template:**

   ```html
   <h2>Nhắc nhở Lịch hẹn</h2>
   <p>Xin chào {{patient_name}},</p>
   <p>Đây là email nhắc nhở về lịch hẹn của bạn:</p>
   <ul>
     <li><strong>Bác sĩ:</strong> {{doctor_name}}</li>
     <li><strong>Chuyên khoa:</strong> {{specialty}}</li>
     <li><strong>Ngày:</strong> {{appointment_date}}</li>
     <li><strong>Giờ:</strong> {{appointment_time}}</li>
     <li><strong>Mã lịch hẹn:</strong> {{appointment_id}}</li>
   </ul>
   <p><strong>Lưu ý:</strong> Lịch hẹn của bạn sẽ diễn ra sau {{hours_until}} nữa.</p>
   <p>Vui lòng có mặt đúng giờ tại phòng khám.</p>
   <p>Trân trọng,<br>Đội ngũ ClinicCare</p>
   ```

2. **Copy Template ID** và thêm vào file `.env`:

   ```env
   VITE_USE_EMAILJS=true
   VITE_EMAILJS_SERVICE_ID=your_service_id
   VITE_EMAILJS_TEMPLATE_ID=your_otp_template_id
   VITE_EMAILJS_REMINDER_TEMPLATE_ID=your_reminder_template_id
   VITE_EMAILJS_PUBLIC_KEY=your_public_key
   ```

   > **Lưu ý:** Nếu không có `VITE_EMAILJS_REMINDER_TEMPLATE_ID`, hệ thống sẽ sử dụng `VITE_EMAILJS_TEMPLATE_ID` (template OTP).

### Phương án 2: Sử dụng Backend API

Nếu bạn có backend server, tạo API endpoint để gửi email nhắc nhở:

**Endpoint:** `POST /api/appointments/send-reminder`

**Request Body:**
```json
{
  "email": "patient@example.com",
  "appointment": {
    "id": "A001",
    "patientName": "Nguyễn Văn A",
    "doctorName": "BS. Lan",
    "specialty": "Tim mạch",
    "date": "2024-10-31",
    "time": "09:00",
    "notes": "Khám lại định kỳ"
  },
  "reminderType": "24h",
  "subject": "Nhắc nhở lịch hẹn - Còn 24 giờ"
}
```

**Response:**
```json
{
  "success": true
}
```

**Cấu hình trong `.env`:**
```env
VITE_EMAIL_REMINDER_API_ENDPOINT=https://your-api-domain.com/api/appointments/send-reminder
```

## Cấu hình SMS

### Sử dụng SMS API

1. **Tích hợp với dịch vụ SMS** (Twilio, AWS SNS, hoặc nhà cung cấp SMS Việt Nam)

2. **Tạo Backend API endpoint** để gửi SMS:

   **Endpoint:** `POST /api/sms/send`

   **Request Body:**
   ```json
   {
     "to": "+84901234567",
     "message": "[ClinicCare] Nhắc nhở: Bạn có lịch hẹn với BS. Lan (Tim mạch) vào Thứ Hai, 31 tháng 10, 2024 lúc 09:00 (còn 24 giờ). Vui lòng có mặt đúng giờ. Hotline: 1900-xxxx."
   }
   ```

   **Response:**
   ```json
   {
     "success": true
   }
   ```

3. **Cấu hình trong `.env`:**
   ```env
   VITE_USE_SMS=true
   VITE_SMS_API_ENDPOINT=https://your-api-domain.com/api/sms/send
   VITE_SMS_API_KEY=your_sms_api_key
   ```

## Cấu hình Tần suất Kiểm tra

Mặc định, hệ thống kiểm tra và gửi nhắc nhở mỗi **30 phút**. Bạn có thể thay đổi trong `.env`:

```env
VITE_REMINDER_CHECK_INTERVAL=30
```

> **Lưu ý:** Giá trị tính bằng phút. Khuyến nghị: 15-60 phút.

## Cách hoạt động

1. **Tự động chạy:** Reminder service tự động khởi động khi ứng dụng load
2. **Kiểm tra định kỳ:** Mỗi X phút (mặc định 30 phút), hệ thống sẽ:
   - Tải tất cả lịch hẹn từ localStorage
   - Lọc các lịch hẹn đã xác nhận (status: "confirmed")
   - Kiểm tra thời gian còn lại:
     - **24h reminder:** Gửi khi còn 23-25 giờ
     - **2h reminder:** Gửi khi còn 1.5-2.5 giờ
   - Gửi email/SMS nếu chưa gửi
   - Lưu trạng thái đã gửi vào appointment

3. **Tránh trùng lặp:** Mỗi loại reminder chỉ gửi 1 lần, được track trong `appointment.reminders`

## Testing trong Development

Trong development mode (không cấu hình email/SMS), hệ thống sẽ:
- Log thông tin reminder ra console
- Vẫn return success để không block flow
- Cho phép test logic mà không cần cấu hình thật

**Ví dụ console log:**
```
📧 Reminder Email would be sent to patient@example.com:
   Lịch hẹn với BS. Lan (Tim mạch)
   Ngày: Thứ Hai, 31 tháng 10, 2024 lúc 09:00
   Còn 24 giờ nữa
```

## Kiểm tra Reminder đã gửi

Reminder status được lưu trong appointment object:

```typescript
{
  id: "A001",
  // ... other fields
  reminders: {
    sent24h: true,
    sent24hAt: "2024-10-30T09:00:00.000Z",
    sent2h: true,
    sent2hAt: "2024-10-31T07:00:00.000Z"
  }
}
```

## Troubleshooting

### Reminder không được gửi

1. **Kiểm tra appointment status:**
   - Chỉ gửi cho lịch hẹn có `status: "confirmed"`
   - Không gửi cho `pending`, `cancelled`, hoặc `completed`

2. **Kiểm tra thời gian:**
   - 24h reminder: Chỉ gửi khi còn 23-25 giờ
   - 2h reminder: Chỉ gửi khi còn 1.5-2.5 giờ
   - Không gửi cho lịch hẹn đã qua

3. **Kiểm tra cấu hình:**
   - Email: Kiểm tra EmailJS config hoặc API endpoint
   - SMS: Kiểm tra SMS API endpoint và key
   - Xem console logs để debug

4. **Kiểm tra đã gửi chưa:**
   - Xem `appointment.reminders.sent24h` và `appointment.reminders.sent2h`
   - Nếu đã `true`, reminder sẽ không gửi lại

### Manual Trigger (Testing)

Bạn có thể trigger reminder check thủ công trong console:

```javascript
import { triggerReminderCheck } from '@/lib/reminders';
triggerReminderCheck().then(result => {
  console.log('Reminders sent:', result);
});
```

## Tác động

✅ **Giảm tỷ lệ bỏ lỡ lịch hẹn:** Nhắc nhở kịp thời giúp bệnh nhân nhớ lịch hẹn
✅ **Cải thiện trải nghiệm:** Bệnh nhân cảm thấy được quan tâm
✅ **Tăng hiệu quả:** Giảm no-show, tối ưu lịch làm việc của bác sĩ

