/**
 * SMS Service
 * Gửi SMS nhắc nhở lịch hẹn
 * 
 * Lưu ý: Cần tích hợp với dịch vụ SMS thực tế như:
 * - Twilio
 * - AWS SNS
 * - Vietnamese SMS providers (Viettel, VinaPhone, etc.)
 */

import type { Appointment } from "./reminders";

interface SMSConfig {
  useSMS?: boolean;
  smsProvider?: "twilio" | "aws" | "vietnamese" | "api";
  smsApiEndpoint?: string;
  smsApiKey?: string;
}

// Get SMS config from environment variables
const getSMSConfig = (): SMSConfig => {
  const config = {
    useSMS: import.meta.env.VITE_USE_SMS === "true",
    smsProvider: (import.meta.env.VITE_SMS_PROVIDER || "api") as SMSConfig["smsProvider"],
    smsApiEndpoint: import.meta.env.VITE_SMS_API_ENDPOINT,
    smsApiKey: import.meta.env.VITE_SMS_API_KEY,
  };

  if (import.meta.env.MODE === "development" || import.meta.env.DEV) {
    console.log("[SMS Config]", {
      useSMS: config.useSMS,
      provider: config.smsProvider,
      hasEndpoint: !!config.smsApiEndpoint,
      hasApiKey: !!config.smsApiKey,
    });
  }

  return config;
};

// Format appointment reminder message
function formatReminderMessage(appointment: Appointment, reminderType: "24h" | "2h"): string {
  const date = new Date(`${appointment.date}T${appointment.time}:00`);
  const dateStr = date.toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = appointment.time;

  const hoursText = reminderType === "24h" ? "24 giờ" : "2 giờ";

  return `[ClinicCare] Nhắc nhở: Bạn có lịch hẹn với ${appointment.doctorName} (${appointment.specialty}) vào ${dateStr} lúc ${timeStr} (còn ${hoursText}). Vui lòng có mặt đúng giờ. Hotline: 1900-xxxx.`;
}

// Send SMS via API
async function sendSMSViaAPI(
  phone: string,
  message: string,
  config: SMSConfig
): Promise<boolean> {
  try {
    const response = await fetch(config.smsApiEndpoint!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(config.smsApiKey && { Authorization: `Bearer ${config.smsApiKey}` }),
      },
      body: JSON.stringify({
        to: phone,
        message,
      }),
    });

    if (!response.ok) {
      throw new Error(`SMS API returned ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error("[SMS Service] Error sending SMS via API:", error);
    return false;
  }
}

/**
 * Gửi SMS nhắc nhở lịch hẹn
 */
export async function sendAppointmentReminderSMS(
  phone: string,
  appointment: Appointment,
  reminderType: "24h" | "2h"
): Promise<{ success: boolean; error?: string }> {
  const config = getSMSConfig();

  // Format phone number (remove spaces, ensure +84 format if needed)
  const formattedPhone = phone.replace(/\s+/g, "").replace(/^0/, "+84");

  const message = formatReminderMessage(appointment, reminderType);

  try {
    let success = false;
    let errorMessage: string | undefined;

    // If SMS is configured, send via API
    if (config.useSMS && config.smsApiEndpoint) {
      console.log("[SMS Service] Attempting to send SMS via API...");
      success = await sendSMSViaAPI(formattedPhone, message, config);
      if (!success) {
        errorMessage = "Không thể gửi SMS qua API. Vui lòng kiểm tra cấu hình SMS service.";
      }
    }
    // If not configured, fallback to console log (development)
    else {
      console.warn(
        "[SMS Service] SMS service not configured. SMS will only be logged to console."
      );
      console.warn(
        "[SMS Service] Để gửi SMS thật, vui lòng cấu hình SMS API endpoint."
      );
      console.log(`📱 SMS would be sent to ${formattedPhone}:`);
      console.log(`   ${message}`);

      // In development, return success to not block flow
      if (import.meta.env.MODE === "development" || import.meta.env.DEV) {
        return { success: true };
      }

      // In production, return error
      return {
        success: false,
        error: "Không thể gửi SMS. Vui lòng kiểm tra cấu hình SMS service.",
      };
    }

    if (success) {
      console.log(`[SMS Service] ✅ SMS sent successfully to ${formattedPhone}`);
      return { success: true };
    } else {
      console.error(`[SMS Service] ❌ Failed to send SMS: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage || "Không thể gửi SMS. Vui lòng kiểm tra cấu hình SMS service.",
      };
    }
  } catch (error) {
    console.error("[SMS Service] Error in sendAppointmentReminderSMS:", error);
    const errorMsg = error instanceof Error ? error.message : "Lỗi không xác định";
    return {
      success: false,
      error: `Lỗi khi gửi SMS: ${errorMsg}`,
    };
  }
}

