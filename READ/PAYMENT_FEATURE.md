# 💳 TÍNH NĂNG THANH TOÁN ONLINE

## 📋 Tổng quan

Hệ thống thanh toán online đã được tích hợp vào Medi-Path-Ease với các tính năng:
- ✅ Thanh toán qua VNPay, MoMo, ZaloPay
- ✅ Dialog thanh toán tự động sau khi đặt lịch
- ✅ Lịch sử thanh toán đầy đủ
- ✅ Hóa đơn điện tử
- ✅ Tự động xác nhận lịch hẹn sau khi thanh toán thành công

---

## 🎯 Các Component đã tạo

### 1. **PaymentDialog** (`src/components/payment/PaymentDialog.tsx`)
- Dialog chọn phương thức thanh toán
- Hiển thị thông tin lịch hẹn và tổng tiền
- Xử lý thanh toán và cập nhật trạng thái lịch hẹn
- Hỗ trợ 3 phương thức: VNPay, MoMo, ZaloPay

### 2. **PaymentHistory** (`src/components/payment/PaymentHistory.tsx`)
- Hiển thị lịch sử tất cả các giao dịch
- Filter theo trạng thái (thành công, đang xử lý, thất bại, đã hủy)
- Xem và tải hóa đơn

### 3. **Invoice** (`src/components/payment/Invoice.tsx`)
- Hóa đơn điện tử đầy đủ thông tin
- In hóa đơn
- Tải PDF (sẽ được cập nhật)

### 4. **Payment Service** (`src/lib/payment.ts`)
- Quản lý payments trong LocalStorage
- Mock payment gateway (90% success rate)
- Các helper functions để xử lý payment

### 5. **Pricing Service** (`src/lib/pricing.ts`)
- Lấy giá theo chuyên khoa
- Format currency

---

## 🔄 Flow thanh toán

1. **Bệnh nhân đặt lịch** → `Book.tsx`
2. **Sau khi đặt lịch thành công** → Hiển thị `PaymentDialog`
3. **Chọn phương thức thanh toán** → VNPay/MoMo/ZaloPay
4. **Xử lý thanh toán** → Mock payment gateway (2 giây delay)
5. **Nếu thành công**:
   - Cập nhật trạng thái lịch hẹn → `confirmed`
   - Lưu payment record
   - Hiển thị thông báo thành công
   - Tự động chuyển đến trang lịch hẹn
6. **Nếu thất bại**:
   - Hiển thị thông báo lỗi
   - Cho phép thử lại

---

## 📊 Cấu trúc dữ liệu

### Payment Interface
```typescript
interface Payment {
  id: string;                    // PAY000001
  appointmentId: string;          // A001
  amount: number;                 // 200000
  method: PaymentMethod;          // "vnpay" | "momo" | "zalopay" | "cash"
  status: "pending" | "completed" | "failed" | "cancelled";
  transactionId?: string;         // TXN123456789
  createdAt: string;              // ISO date string
  completedAt?: string;           // ISO date string
  notes?: string;
}
```

### Pricing theo chuyên khoa
- Nội tổng quát: 150,000 VND
- Nhi khoa: 180,000 VND
- Tim mạch: 250,000 VND
- Tai Mũi Họng: 200,000 VND
- Chấn thương chỉnh hình: 300,000 VND
- Xét nghiệm: 250,000 VND
- Da liễu: 200,000 VND
- Dinh dưỡng: 150,000 VND

---

## 🚀 Cách sử dụng

### 1. Đặt lịch và thanh toán
1. Vào `/patient/book`
2. Chọn chuyên khoa, bác sĩ, ngày giờ
3. Submit form
4. Dialog thanh toán tự động hiển thị
5. Chọn phương thức và thanh toán

### 2. Xem lịch sử thanh toán
1. Vào `/patient/payments`
2. Xem tất cả giao dịch
3. Filter theo trạng thái
4. Click "Xem hóa đơn" để xem chi tiết

### 3. Xem hóa đơn
1. Từ Payment History, click "Xem hóa đơn"
2. Hoặc từ chi tiết lịch hẹn (nếu có payment)
3. In hoặc tải PDF

---

## 🔧 Tích hợp Payment Gateway thật

Hiện tại hệ thống sử dụng **mock payment gateway**. Để tích hợp payment gateway thật:

### VNPay
1. Đăng ký tài khoản VNPay
2. Lấy API credentials
3. Cập nhật `processPayment()` trong `src/lib/payment.ts`
4. Tích hợp VNPay SDK

### MoMo
1. Đăng ký tài khoản MoMo
2. Lấy API credentials
3. Cập nhật `processPayment()` trong `src/lib/payment.ts`
4. Tích hợp MoMo SDK

### ZaloPay
1. Đăng ký tài khoản ZaloPay
2. Lấy API credentials
3. Cập nhật `processPayment()` trong `src/lib/payment.ts`
4. Tích hợp ZaloPay SDK

**Lưu ý:** Cần có backend API để xử lý payment gateway vì cần bảo mật credentials.

---

## 📝 Các tính năng có thể mở rộng

1. **Hoàn tiền (Refund)**
   - Xử lý hoàn tiền khi hủy lịch hẹn
   - Quản lý refund requests

2. **Payment Plans**
   - Thanh toán trả góp
   - Gói khám định kỳ

3. **Promo Codes**
   - Mã giảm giá
   - Voucher

4. **Payment Notifications**
   - Email xác nhận thanh toán
   - SMS thông báo

5. **Payment Analytics**
   - Thống kê doanh thu
   - Báo cáo thanh toán

---

## 🐛 Troubleshooting

### Payment không thành công
- Kiểm tra console log
- Xác nhận payment record đã được tạo
- Thử lại với phương thức khác

### Không thấy Payment Dialog
- Kiểm tra `showPaymentDialog` state
- Xác nhận appointment đã được tạo thành công
- Kiểm tra console errors

### Hóa đơn không hiển thị thông tin
- Kiểm tra appointment data trong localStorage
- Xác nhận `appointmentId` đúng

---

## ✅ Checklist triển khai

- [x] PaymentDialog component
- [x] PaymentHistory component
- [x] Invoice component
- [x] Payment service với mock gateway
- [x] Pricing service
- [x] Tích hợp vào Book.tsx
- [x] Route và menu item
- [x] Cập nhật appointment status sau payment
- [ ] Tích hợp payment gateway thật (VNPay/MoMo/ZaloPay)
- [ ] Backend API cho payment
- [ ] Email/SMS notifications
- [ ] PDF generation cho invoice
- [ ] Refund functionality

---

## 📞 Hỗ trợ

Nếu có vấn đề hoặc câu hỏi, vui lòng liên hệ team phát triển.

---

**Tính năng đã sẵn sàng sử dụng!** 🎉

