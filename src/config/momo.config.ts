// MoMo Payment Gateway Configuration
// https://developers.momo.vn/#/docs/en/aiov2/?id=payment-method

export const MOMO_CONFIG = {
  partnerCode: "MOMO",
  accessKey: "F8BBA842ECF85",
  secretKey: "K951B6PE1waDMi640xX08PD3vg6EkVlz",
  apiUrl: "https://test-payment.momo.vn/v2/gateway/api/create",
  // For production, use: https://payment.momo.vn/v2/gateway/api/create
  // For backend proxy, use: /api/payment/momo/create
  useProxy: import.meta.env.VITE_MOMO_USE_PROXY === "true",
  proxyUrl: import.meta.env.VITE_MOMO_PROXY_URL || "/api/payment/momo/create",
  // Enable development mode to simulate payments (bypasses API call)
  devMode: import.meta.env.DEV && import.meta.env.VITE_MOMO_DEV_MODE !== "false",
};

// Helper to get redirect and IPN URLs based on current origin
export const getMomoUrls = () => {
  const origin = window.location.origin;
  return {
    redirectUrl: `${origin}/payment/momo/callback`,
    ipnUrl: `${origin}/payment/momo/ipn`, // IPN (Instant Payment Notification) endpoint
  };
};
