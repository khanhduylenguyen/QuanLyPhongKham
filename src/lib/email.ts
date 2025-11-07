/**
 * Email Service
 * Gửi email OTP thật đến người dùng
 */

interface EmailConfig {
  // Có thể sử dụng EmailJS hoặc Backend API
  useEmailJS?: boolean;
  emailJSServiceId?: string;
  emailJSTemplateId?: string;
  emailJSPublicKey?: string;
  // Hoặc sử dụng Backend API
  apiEndpoint?: string;
}

// Lấy config từ environment variables hoặc config
const getEmailConfig = (): EmailConfig => {
  return {
    useEmailJS: import.meta.env.VITE_USE_EMAILJS === "true",
    emailJSServiceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
    emailJSTemplateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    emailJSPublicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
    apiEndpoint: import.meta.env.VITE_EMAIL_API_ENDPOINT || "/api/auth/send-otp",
  };
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
      await loadEmailJSScript();
    }

    const emailjs = (window as any).emailjs;
    
    const templateParams = {
      to_email: email,
      otp_code: otp,
      subject: "Mã OTP xác thực đăng ký",
    };

    await emailjs.send(
      config.emailJSServiceId!,
      config.emailJSTemplateId!,
      templateParams,
      config.emailJSPublicKey!
    );

    return true;
  } catch (error) {
    console.error("Error sending email via EmailJS:", error);
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
      (window as any).emailjs.init({});
      resolve();
    };
    script.onerror = () => reject(new Error("Failed to load EmailJS"));
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

    // Nếu có config EmailJS, sử dụng EmailJS
    if (config.useEmailJS && config.emailJSServiceId && config.emailJSTemplateId && config.emailJSPublicKey) {
      success = await sendOTPViaEmailJS(email, otp, config);
    }
    // Nếu không, thử gọi Backend API
    else if (config.apiEndpoint) {
      success = await sendOTPViaAPI(email, otp, config);
    }
    // Nếu không có config nào, fallback về console log (development)
    else {
      console.warn(
        "Email service not configured. OTP will only be logged to console."
      );
      console.log(`📧 OTP Email would be sent to ${email}: ${otp}`);
      
      // Trong development, vẫn return success để không block flow
      success = process.env.NODE_ENV === "development";
    }

    if (success) {
      return { success: true };
    } else {
      return {
        success: false,
        error: "Không thể gửi email. Vui lòng kiểm tra cấu hình email service.",
      };
    }
  } catch (error) {
    console.error("Error in sendOTPEmail:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Lỗi không xác định",
    };
  }
}

