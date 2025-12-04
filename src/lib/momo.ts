// MoMo Payment Gateway Integration
// https://developers.momo.vn/#/docs/en/aiov2/?id=payment-method

import { MOMO_CONFIG, getMomoUrls } from "@/config/momo.config";

export interface MomoPaymentRequest {
  orderId: string;
  amount: number;
  orderInfo: string;
  extraData?: string;
}

export interface MomoPaymentResponse {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  responseTime: number;
  message: string;
  resultCode: number;
  payUrl?: string;
  qrCodeUrl?: string;
  deeplink?: string;
  deeplinkWeb?: string;
}

/**
 * Generate HMAC SHA256 signature for MoMo payment
 */
async function generateSignature(rawSignature: string, secretKey: string): Promise<string> {
  // Use Web Crypto API for browser environment
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretKey);
  const messageData = encoder.encode(rawSignature);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Create MoMo payment request
 */
export async function createMomoPayment(
  request: MomoPaymentRequest
): Promise<MomoPaymentResponse> {
  const { partnerCode, accessKey, secretKey, apiUrl } = MOMO_CONFIG;
  const { redirectUrl, ipnUrl } = getMomoUrls();

  // Generate requestId and orderId
  const requestId = `${partnerCode}${Date.now()}`;
  const orderId = request.orderId || requestId;
  const amount = String(request.amount);
  const orderInfo = request.orderInfo || "pay with MoMo";
  const extraData = request.extraData || "";
  const requestType = "captureWallet";

  // Create raw signature string (must be in exact order)
  const rawSignature = [
    `accessKey=${accessKey}`,
    `amount=${amount}`,
    `extraData=${extraData}`,
    `ipnUrl=${ipnUrl}`,
    `orderId=${orderId}`,
    `orderInfo=${orderInfo}`,
    `partnerCode=${partnerCode}`,
    `redirectUrl=${redirectUrl}`,
    `requestId=${requestId}`,
    `requestType=${requestType}`,
  ].join("&");

  console.log("--------------------RAW SIGNATURE----------------");
  console.log(rawSignature);

  // Generate signature
  const signature = await generateSignature(rawSignature, secretKey);

  console.log("--------------------SIGNATURE----------------");
  console.log(signature);

  // Create request body
  const requestBody = {
    partnerCode,
    accessKey,
    requestId,
    amount,
    orderId,
    orderInfo,
    redirectUrl,
    ipnUrl,
    extraData,
    requestType,
    signature,
    lang: "vi",
  };

  console.log("Sending MoMo payment request...");
  console.log("Request body:", JSON.stringify(requestBody, null, 2));

  // Development mode: Simulate MoMo payment
  if (MOMO_CONFIG.devMode) {
    console.warn("⚠️ MoMo DEV MODE: Simulating payment (bypassing API call)");
    console.warn("⚠️ In production, you need a backend proxy to avoid CORS issues");
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Generate a mock payment URL that redirects to QR code page
    const mockPayUrl = `${window.location.origin}/payment/momo/qr?orderId=${orderId}&amount=${amount}`;
    
    return {
      partnerCode,
      orderId,
      requestId,
      amount: Number(amount),
      responseTime: Date.now(),
      message: "Success (Dev Mode)",
      resultCode: 0,
      payUrl: mockPayUrl,
    };
  }

  // Determine which URL to use (proxy or direct)
  const targetUrl = MOMO_CONFIG.useProxy ? MOMO_CONFIG.proxyUrl : apiUrl;

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data: MomoPaymentResponse = await response.json();
    console.log("MoMo API Response:", data);

    if (data.resultCode !== 0) {
      throw new Error(data.message || "MoMo payment request failed");
    }

    return data;
  } catch (error: any) {
    console.error("MoMo payment error:", error);
    
    // Check if it's a CORS/network error
    if (error.message?.includes("Failed to fetch") || error.message?.includes("NetworkError") || error.name === "TypeError") {
      const errorMessage = MOMO_CONFIG.useProxy
        ? "Không thể kết nối đến server thanh toán. Vui lòng kiểm tra cấu hình proxy."
        : "Lỗi CORS: MoMo API không cho phép gọi trực tiếp từ trình duyệt. Bạn cần thiết lập backend proxy hoặc bật chế độ development.";
      
      throw new Error(`${errorMessage} (Chi tiết: ${error.message})`);
    }
    
    throw error;
  }
}

/**
 * Verify MoMo callback signature
 */
export async function verifyMomoCallback(params: Record<string, string>): Promise<boolean> {
  const { secretKey } = MOMO_CONFIG;
  const {
    partnerCode,
    accessKey,
    amount,
    extraData,
    message,
    orderId,
    orderInfo,
    orderType,
    requestId,
    resultCode,
    transId,
    responseTime,
    signature,
  } = params;

  // Create raw signature string for callback verification
  // Format: accessKey=$accessKey&amount=$amount&extraData=$extraData&message=$message&orderId=$orderId&orderInfo=$orderInfo&orderType=$orderType&partnerCode=$partnerCode&payType=$payType&requestId=$requestId&responseTime=$responseTime&resultCode=$resultCode&transId=$transId
  const rawSignature = [
    `accessKey=${accessKey}`,
    `amount=${amount}`,
    `extraData=${extraData || ""}`,
    `message=${message || ""}`,
    `orderId=${orderId}`,
    `orderInfo=${orderInfo || ""}`,
    `orderType=${orderType || ""}`,
    `partnerCode=${partnerCode}`,
    `requestId=${requestId}`,
    `responseTime=${responseTime}`,
    `resultCode=${resultCode}`,
    `transId=${transId}`,
  ].join("&");

  const expectedSignature = await generateSignature(rawSignature, secretKey);
  return expectedSignature === signature;
}

