/**
 * OTP Service
 * Quản lý việc generate, store và verify OTP
 */

import { sendOTPEmail } from "./email";

const OTP_STORAGE_KEY = "cliniccare:otp";
const OTP_EXPIRY_TIME = 5 * 60 * 1000; // 5 phút

interface OTPData {
  code: string;
  email: string;
  expiresAt: number;
  attempts: number;
}

/**
 * Generate mã OTP 6 số ngẫu nhiên
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Gửi OTP đến email (gửi email thật)
 */
export async function sendOTP(email: string): Promise<{ success: boolean; otp?: string; error?: string }> {
  try {
    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + OTP_EXPIRY_TIME;

    // Lưu OTP vào localStorage (trong production sẽ lưu vào database)
    const otpData: OTPData = {
      code: otp,
      email,
      expiresAt,
      attempts: 0,
    };

    localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(otpData));

    // Gửi email thật đến người dùng
    const emailResult = await sendOTPEmail(email, otp);
    
    if (!emailResult.success) {
      // Nếu không gửi được email, vẫn log OTP để test trong development
      console.warn(`[OTP Service] Failed to send email: ${emailResult.error}`);
      console.log(`🔐 OTP Code for ${email}: ${otp}`);
      
      // Trong development, vẫn return success để không block flow
      if (process.env.NODE_ENV === "development") {
        return { 
          success: true, 
          otp: otp, 
          error: emailResult.error 
        };
      }
      
      return { 
        success: false, 
        error: emailResult.error || "Không thể gửi email OTP" 
      };
    }

    // Email đã được gửi thành công
    console.log(`[OTP Service] OTP email sent to ${email}`);
    
    // Trong development, vẫn log OTP để dễ test
    if (process.env.NODE_ENV === "development") {
      console.log(`🔐 OTP Code for ${email}: ${otp}`);
    }

    return { 
      success: true, 
      otp: process.env.NODE_ENV === "development" ? otp : undefined 
    };
  } catch (error) {
    console.error("Error sending OTP:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Có lỗi xảy ra khi gửi OTP" 
    };
  }
}

/**
 * Verify OTP code
 */
export function verifyOTP(email: string, code: string): { valid: boolean; message?: string } {
  try {
    const raw = localStorage.getItem(OTP_STORAGE_KEY);
    if (!raw) {
      return { valid: false, message: "Mã OTP không tồn tại hoặc đã hết hạn" };
    }

    const otpData: OTPData = JSON.parse(raw);

    // Kiểm tra email
    if (otpData.email !== email) {
      return { valid: false, message: "Email không khớp" };
    }

    // Kiểm tra hết hạn
    if (Date.now() > otpData.expiresAt) {
      localStorage.removeItem(OTP_STORAGE_KEY);
      return { valid: false, message: "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới" };
    }

    // Kiểm tra số lần thử
    if (otpData.attempts >= 5) {
      localStorage.removeItem(OTP_STORAGE_KEY);
      return { valid: false, message: "Đã vượt quá số lần thử. Vui lòng yêu cầu mã mới" };
    }

    // Kiểm tra mã OTP
    if (otpData.code !== code) {
      otpData.attempts += 1;
      localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(otpData));
      const remainingAttempts = 5 - otpData.attempts;
      return {
        valid: false,
        message: remainingAttempts > 0
          ? `Mã OTP không đúng. Còn ${remainingAttempts} lần thử`
          : "Đã vượt quá số lần thử. Vui lòng yêu cầu mã mới",
      };
    }

    // OTP hợp lệ - xóa OTP khỏi storage
    localStorage.removeItem(OTP_STORAGE_KEY);
    return { valid: true };
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return { valid: false, message: "Có lỗi xảy ra khi xác thực OTP" };
  }
}

/**
 * Kiểm tra xem có OTP đang chờ xác thực không
 */
export function getPendingOTPEmail(): string | null {
  try {
    const raw = localStorage.getItem(OTP_STORAGE_KEY);
    if (!raw) return null;

    const otpData: OTPData = JSON.parse(raw);
    
    // Kiểm tra hết hạn
    if (Date.now() > otpData.expiresAt) {
      localStorage.removeItem(OTP_STORAGE_KEY);
      return null;
    }

    return otpData.email;
  } catch {
    return null;
  }
}

/**
 * Xóa OTP khỏi storage
 */
export function clearOTP(): void {
  localStorage.removeItem(OTP_STORAGE_KEY);
}

