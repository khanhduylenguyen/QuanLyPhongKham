// Payment service - Mock payment gateway
// In production, this would integrate with real payment gateways (VNPay, Momo, ZaloPay)

export type PaymentMethod = "vnpay" | "momo" | "zalopay" | "cash";

export interface Payment {
  id: string;
  appointmentId: string;
  amount: number;
  method: PaymentMethod;
  status: "pending" | "completed" | "failed" | "cancelled";
  transactionId?: string;
  createdAt: string;
  completedAt?: string;
  notes?: string;
}

export interface PaymentRequest {
  appointmentId: string;
  amount: number;
  method: PaymentMethod;
  description?: string;
}

const PAYMENTS_STORAGE_KEY = "cliniccare:payments";

// Load payments from localStorage
export const loadPayments = (): Payment[] => {
  try {
    const stored = localStorage.getItem(PAYMENTS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {}
  return [];
};

// Save payments to localStorage
export const savePayments = (payments: Payment[]) => {
  try {
    localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(payments));
  } catch {}
};

// Create payment
export const createPayment = (request: PaymentRequest): Payment => {
  const payments = loadPayments();
  const payment: Payment = {
    id: `PAY${String(payments.length + 1).padStart(6, "0")}`,
    appointmentId: request.appointmentId,
    amount: request.amount,
    method: request.method,
    status: "pending",
    createdAt: new Date().toISOString(),
    notes: request.description,
  };
  
  payments.push(payment);
  savePayments(payments);
  return payment;
};

// Process payment
export const processPayment = async (
  paymentId: string,
  method: PaymentMethod
): Promise<{ success: boolean; transactionId?: string; redirectUrl?: string; error?: string }> => {
  const payments = loadPayments();
  const payment = payments.find((p) => p.id === paymentId);
  
  if (!payment) {
    return { success: false, error: "Payment not found" };
  }

  // Handle MoMo payment - redirect to MoMo gateway
  if (method === "momo") {
    try {
      const { createMomoPayment } = await import("@/lib/momo");
      const momoResponse = await createMomoPayment({
        orderId: paymentId,
        amount: payment.amount,
        orderInfo: payment.notes || `Thanh toán lịch hẹn ${paymentId}`,
      });

      if (momoResponse.payUrl) {
        // Store payment info for callback
        localStorage.setItem(
          `momo_payment_${paymentId}`,
          JSON.stringify({ appointmentId: payment.appointmentId })
        );
        return { success: true, redirectUrl: momoResponse.payUrl };
      } else {
        payment.status = "failed";
        savePayments(payments);
        return { success: false, error: momoResponse.message || "Không thể tạo thanh toán MoMo" };
      }
    } catch (error: any) {
      payment.status = "failed";
      savePayments(payments);
      
      // Provide more helpful error messages
      let errorMessage = error.message || "Lỗi kết nối MoMo";
      
      // If it's a CORS error, provide guidance
      if (errorMessage.includes("CORS") || errorMessage.includes("Failed to fetch")) {
        errorMessage = "Lỗi kết nối: MoMo API yêu cầu backend proxy. Vui lòng chọn phương thức thanh toán khác hoặc liên hệ quản trị viên.";
      }
      
      return { success: false, error: errorMessage };
    }
  }

  // For other payment methods, use mock processing
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Mock: 90% success rate
  const success = Math.random() > 0.1;

  if (success) {
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    payment.status = "completed";
    payment.transactionId = transactionId;
    payment.completedAt = new Date().toISOString();
    savePayments(payments);
    return { success: true, transactionId };
  } else {
    payment.status = "failed";
    savePayments(payments);
    return { success: false, error: "Payment failed. Please try again." };
  }
};

// Update payment status
export const updatePaymentStatus = (
  paymentId: string,
  status: Payment["status"],
  transactionId?: string
): void => {
  const payments = loadPayments();
  const payment = payments.find((p) => p.id === paymentId);
  if (payment) {
    payment.status = status;
    if (transactionId) {
      payment.transactionId = transactionId;
    }
    if (status === "completed" || status === "failed") {
      payment.completedAt = new Date().toISOString();
    }
    savePayments(payments);
  }
};

// Get payment by appointment ID
export const getPaymentByAppointmentId = (appointmentId: string): Payment | null => {
  const payments = loadPayments();
  return payments.find((p) => p.appointmentId === appointmentId) || null;
};

// Get appointment by ID (helper function)
export const getAppointmentById = (appointmentId: string): any | null => {
  try {
    const APPOINTMENTS_KEY = "cliniccare:appointments";
    const appointments = JSON.parse(localStorage.getItem(APPOINTMENTS_KEY) || "[]");
    return appointments.find((apt: any) => apt.id === appointmentId) || null;
  } catch {
    return null;
  }
};

// Get payment by ID
export const getPaymentById = (paymentId: string): Payment | null => {
  const payments = loadPayments();
  return payments.find((p) => p.id === paymentId) || null;
};

// Get payments by user (filter by appointment patient)
export const getPaymentsByUser = (userId: string): Payment[] => {
  const payments = loadPayments();
  // In a real app, we'd need to match by user ID through appointments
  // For now, return all payments
  return payments;
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// Get payment method label
export const getPaymentMethodLabel = (method: PaymentMethod): string => {
  switch (method) {
    case "vnpay":
      return "VNPay";
    case "momo":
      return "Ví MoMo";
    case "zalopay":
      return "ZaloPay";
    case "cash":
      return "Tiền mặt";
    default:
      return "Không xác định";
  }
};

// Get payment method icon (emoji for now, can be replaced with icons)
export const getPaymentMethodIcon = (method: PaymentMethod): string => {
  switch (method) {
    case "vnpay":
      return "💳";
    case "momo":
      return "📱";
    case "zalopay":
      return "💙";
    case "cash":
      return "💵";
    default:
      return "💰";
  }
};

