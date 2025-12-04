/**
 * Email Service
 * Gửi email OTP và nhắc nhở lịch hẹn
 */

interface EmailConfig {
  // Có thể sử dụng EmailJS hoặc Backend API
  useEmailJS?: boolean;
  emailJSServiceId?: string;
  emailJSTemplateId?: string;
  emailJSPublicKey?: string;
  // Template ID cho appointment reminders (có thể khác với OTP template)
  emailJSReminderTemplateId?: string;
  // Hoặc sử dụng Backend API
  apiEndpoint?: string;
  reminderApiEndpoint?: string;
}

// Lấy config từ environment variables hoặc config
const getEmailConfig = (): EmailConfig => {
  // Debug: Log raw environment variables để kiểm tra Vite có đọc được không
  console.log("[Email Config Debug] Raw env vars:", {
    VITE_USE_EMAILJS: import.meta.env.VITE_USE_EMAILJS,
    VITE_EMAILJS_SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID,
    VITE_EMAILJS_TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    VITE_EMAILJS_PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
    type: typeof import.meta.env.VITE_USE_EMAILJS,
    mode: import.meta.env.MODE,
  });

  const config = {
    useEmailJS: import.meta.env.VITE_USE_EMAILJS === "true",
    emailJSServiceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
    emailJSTemplateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    emailJSPublicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
    emailJSReminderTemplateId: import.meta.env.VITE_EMAILJS_REMINDER_TEMPLATE_ID,
    apiEndpoint: import.meta.env.VITE_EMAIL_API_ENDPOINT || "/api/auth/send-otp",
    reminderApiEndpoint: import.meta.env.VITE_EMAIL_REMINDER_API_ENDPOINT || "/api/appointments/send-reminder",
  };
  
  // Log config để debug
  console.log("[Email Config]", {
    useEmailJS: config.useEmailJS,
    hasServiceId: !!config.emailJSServiceId,
    hasTemplateId: !!config.emailJSTemplateId,
    hasReminderTemplateId: !!config.emailJSReminderTemplateId,
    hasPublicKey: !!config.emailJSPublicKey,
    apiEndpoint: config.apiEndpoint,
    reminderApiEndpoint: config.reminderApiEndpoint,
    canSendEmail: !!(config.useEmailJS && config.emailJSServiceId && config.emailJSTemplateId && config.emailJSPublicKey),
  });
  
  return config;
};

/**
 * Gửi OTP qua EmailJS (không cần backend)
 */
async function sendOTPViaEmailJS(
  email: string,
  otp: string,
  config: EmailConfig
): Promise<boolean> {
  try {
    // Load EmailJS script nếu chưa có
    if (typeof (window as any).emailjs === "undefined") {
      console.log("[EmailJS] Loading EmailJS script...");
      await loadEmailJSScript();
      console.log("[EmailJS] Script loaded successfully");
    }

    const emailjs = (window as any).emailjs;
    
    // Initialize EmailJS với public key
    emailjs.init(config.emailJSPublicKey!);
    
    const templateParams = {
      to_email: email,
      otp_code: otp,
      subject: "Mã OTP xác thực đăng ký",
    };

    console.log("[EmailJS] Sending email with params:", {
      serviceId: config.emailJSServiceId,
      templateId: config.emailJSTemplateId,
      to: email,
    });

    const result = await emailjs.send(
      config.emailJSServiceId!,
      config.emailJSTemplateId!,
      templateParams
    );

    console.log("[EmailJS] Email sent successfully:", result);
    return true;
  } catch (error) {
    console.error("[EmailJS] Error sending email:", error);
    if (error instanceof Error) {
      console.error("[EmailJS] Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
    return false;
  }
}

/**
 * Load EmailJS script
 */
function loadEmailJSScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).emailjs) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    script.async = true;
    script.onload = () => {
      console.log("[EmailJS] Script loaded, initializing...");
      // Không init ở đây nữa, sẽ init trong sendOTPViaEmailJS với public key
      resolve();
    };
    script.onerror = () => {
      console.error("[EmailJS] Failed to load script");
      reject(new Error("Failed to load EmailJS script"));
    };
    document.head.appendChild(script);
  });
}

/**
 * Gửi OTP qua Backend API
 */
async function sendOTPViaAPI(
  email: string,
  otp: string,
  config: EmailConfig
): Promise<boolean> {
  try {
    const response = await fetch(config.apiEndpoint!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        otp,
        subject: "Mã OTP xác thực đăng ký",
      }),
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error("Error sending email via API:", error);
    return false;
  }
}

/**
 * Gửi email OTP đến người dùng
 */
export async function sendOTPEmail(
  email: string,
  otp: string
): Promise<{ success: boolean; error?: string }> {
  const config = getEmailConfig();

  try {
    let success = false;
    let errorMessage: string | undefined;

    // Nếu có config EmailJS, sử dụng EmailJS
    if (config.useEmailJS && config.emailJSServiceId && config.emailJSTemplateId && config.emailJSPublicKey) {
      console.log("[Email Service] Attempting to send via EmailJS...");
      success = await sendOTPViaEmailJS(email, otp, config);
      if (!success) {
        errorMessage = "Không thể gửi email qua EmailJS. Vui lòng kiểm tra cấu hình EmailJS.";
      }
    }
    // Nếu không, thử gọi Backend API
    else if (config.apiEndpoint && config.apiEndpoint !== "/api/auth/send-otp") {
      console.log("[Email Service] Attempting to send via API...");
      success = await sendOTPViaAPI(email, otp, config);
      if (!success) {
        errorMessage = "Không thể gửi email qua API. Vui lòng kiểm tra kết nối API.";
      }
    }
    // Nếu không có config nào, fallback về console log (development)
    else {
      console.warn(
        "[Email Service] ❌ Email service not configured. OTP will only be logged to console."
      );
      console.warn(
        "[Email Service] Để gửi email thật, vui lòng cấu hình EmailJS hoặc Backend API."
      );
      console.warn("[Email Service] Config status:", {
        useEmailJS: config.useEmailJS,
        hasServiceId: !!config.emailJSServiceId,
        hasTemplateId: !!config.emailJSTemplateId,
        hasPublicKey: !!config.emailJSPublicKey,
        missing: [
          !config.useEmailJS && "VITE_USE_EMAILJS",
          !config.emailJSServiceId && "VITE_EMAILJS_SERVICE_ID",
          !config.emailJSTemplateId && "VITE_EMAILJS_TEMPLATE_ID",
          !config.emailJSPublicKey && "VITE_EMAILJS_PUBLIC_KEY",
        ].filter(Boolean),
      });
      console.warn(
        "[Email Service] 💡 Hãy kiểm tra file .env và khởi động lại server (npm run dev) sau khi cập nhật .env"
      );
      console.log(`📧 OTP Email would be sent to ${email}: ${otp}`);
      
      // Trong development, vẫn return success để không block flow
      // Không return error vì đây là expected behavior trong dev mode
      if (import.meta.env.MODE === "development" || import.meta.env.DEV) {
        return { success: true };
    }

      // Trong production, return error
      return {
        success: false,
        error: "Không thể gửi email. Vui lòng kiểm tra cấu hình email service.",
      };
    }

    if (success) {
      console.log(`[Email Service] ✅ Email sent successfully to ${email}`);
      return { success: true };
    } else {
      console.error(`[Email Service] ❌ Failed to send email: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage || "Không thể gửi email. Vui lòng kiểm tra cấu hình email service.",
      };
    }
  } catch (error) {
    console.error("[Email Service] Error in sendOTPEmail:", error);
    const errorMsg = error instanceof Error ? error.message : "Lỗi không xác định";
    return {
      success: false,
      error: `Lỗi khi gửi email: ${errorMsg}`,
    };
  }
}

/**
 * Appointment reminder email interface
 */
interface AppointmentReminderData {
  id: string;
  patientName: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  notes?: string;
}

/**
 * Gửi email nhắc nhở lịch hẹn qua EmailJS
 */
async function sendReminderViaEmailJS(
  email: string,
  appointment: AppointmentReminderData,
  reminderType: "24h" | "2h",
  config: EmailConfig
): Promise<boolean> {
  try {
    // Load EmailJS script nếu chưa có
    if (typeof (window as any).emailjs === "undefined") {
      console.log("[EmailJS] Loading EmailJS script...");
      await loadEmailJSScript();
      console.log("[EmailJS] Script loaded successfully");
    }

    const emailjs = (window as any).emailjs;
    
    // Initialize EmailJS với public key
    emailjs.init(config.emailJSPublicKey!);
    
    const appointmentDate = new Date(`${appointment.date}T${appointment.time}:00`);
    const dateStr = appointmentDate.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const timeStr = appointment.time;
    const hoursText = reminderType === "24h" ? "24 giờ" : "2 giờ";

    // Use reminder template if available, otherwise use OTP template
    const templateId = config.emailJSReminderTemplateId || config.emailJSTemplateId!;
    
    const templateParams = {
      to_email: email,
      patient_name: appointment.patientName,
      doctor_name: appointment.doctorName,
      specialty: appointment.specialty,
      appointment_date: dateStr,
      appointment_time: timeStr,
      hours_until: hoursText,
      appointment_id: appointment.id,
      subject: `Nhắc nhở lịch hẹn - Còn ${hoursText}`,
    };

    console.log("[EmailJS] Sending reminder email with params:", {
      serviceId: config.emailJSServiceId,
      templateId,
      to: email,
      reminderType,
    });

    const result = await emailjs.send(
      config.emailJSServiceId!,
      templateId,
      templateParams
    );

    console.log("[EmailJS] Reminder email sent successfully:", result);
    return true;
  } catch (error) {
    console.error("[EmailJS] Error sending reminder email:", error);
    if (error instanceof Error) {
      console.error("[EmailJS] Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
    return false;
  }
}

/**
 * Gửi email nhắc nhở lịch hẹn qua Backend API
 */
async function sendReminderViaAPI(
  email: string,
  appointment: AppointmentReminderData,
  reminderType: "24h" | "2h",
  config: EmailConfig
): Promise<boolean> {
  try {
    const response = await fetch(config.reminderApiEndpoint!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        appointment,
        reminderType,
        subject: `Nhắc nhở lịch hẹn - Còn ${reminderType === "24h" ? "24 giờ" : "2 giờ"}`,
      }),
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error("Error sending reminder email via API:", error);
    return false;
  }
}

/**
 * Gửi email nhắc nhở lịch hẹn đến bệnh nhân
 */
export async function sendAppointmentReminderEmail(
  email: string,
  appointment: AppointmentReminderData,
  reminderType: "24h" | "2h"
): Promise<{ success: boolean; error?: string }> {
  const config = getEmailConfig();

  try {
    let success = false;
    let errorMessage: string | undefined;

    // Nếu có config EmailJS, sử dụng EmailJS
    if (config.useEmailJS && config.emailJSServiceId && config.emailJSPublicKey) {
      const templateId = config.emailJSReminderTemplateId || config.emailJSTemplateId;
      if (templateId) {
        console.log("[Email Service] Attempting to send reminder via EmailJS...");
        success = await sendReminderViaEmailJS(email, appointment, reminderType, config);
        if (!success) {
          errorMessage = "Không thể gửi email nhắc nhở qua EmailJS. Vui lòng kiểm tra cấu hình EmailJS.";
        }
      } else {
        errorMessage = "Thiếu EmailJS Template ID cho nhắc nhở lịch hẹn.";
      }
    }
    // Nếu không, thử gọi Backend API
    else if (config.reminderApiEndpoint && config.reminderApiEndpoint !== "/api/appointments/send-reminder") {
      console.log("[Email Service] Attempting to send reminder via API...");
      success = await sendReminderViaAPI(email, appointment, reminderType, config);
      if (!success) {
        errorMessage = "Không thể gửi email nhắc nhở qua API. Vui lòng kiểm tra kết nối API.";
      }
    }
    // Nếu không có config nào, fallback về console log (development)
    else {
      const appointmentDate = new Date(`${appointment.date}T${appointment.time}:00`);
      const dateStr = appointmentDate.toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const hoursText = reminderType === "24h" ? "24 giờ" : "2 giờ";
      
      console.warn(
        "[Email Service] Email service not configured. Reminder will only be logged to console."
      );
      console.warn(
        "[Email Service] Để gửi email thật, vui lòng cấu hình EmailJS hoặc Backend API."
      );
      console.log(`📧 Reminder Email would be sent to ${email}:`);
      console.log(`   Lịch hẹn với ${appointment.doctorName} (${appointment.specialty})`);
      console.log(`   Ngày: ${dateStr} lúc ${appointment.time}`);
      console.log(`   Còn ${hoursText} nữa`);
      
      // Trong development, vẫn return success để không block flow
      if (import.meta.env.MODE === "development" || import.meta.env.DEV) {
        return { success: true };
      }

      // Trong production, return error
      return {
        success: false,
        error: "Không thể gửi email. Vui lòng kiểm tra cấu hình email service.",
      };
    }

    if (success) {
      console.log(`[Email Service] ✅ Reminder email sent successfully to ${email}`);
      return { success: true };
    } else {
      console.error(`[Email Service] ❌ Failed to send reminder email: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage || "Không thể gửi email. Vui lòng kiểm tra cấu hình email service.",
      };
    }
  } catch (error) {
    console.error("[Email Service] Error in sendAppointmentReminderEmail:", error);
    const errorMsg = error instanceof Error ? error.message : "Lỗi không xác định";
    return {
      success: false,
      error: `Lỗi khi gửi email: ${errorMsg}`,
    };
  }
}

