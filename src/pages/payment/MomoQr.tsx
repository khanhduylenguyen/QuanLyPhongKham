import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, QrCode, Smartphone } from "lucide-react";
import { MOMO_CONFIG } from "@/config/momo.config";

const MomoQr = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [orderId, setOrderId] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);

  useEffect(() => {
    // Get order info from URL params
    const orderIdParam = searchParams.get("orderId");
    const amountParam = searchParams.get("amount");

    if (orderIdParam) {
      setOrderId(orderIdParam);
    }
    if (amountParam) {
      setAmount(Number(amountParam));
    }

    // Simulate loading QR code
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [searchParams]);

  const handleSimulatePayment = () => {
    // In dev mode, simulate successful payment
    if (MOMO_CONFIG.devMode) {
      const callbackUrl = `/payment/momo/callback?partnerCode=${MOMO_CONFIG.partnerCode}&orderId=${orderId}&resultCode=0&amount=${amount}&transId=MOCK${Date.now()}&message=Thanh toán thành công&signature=mock_signature`;
      window.location.href = callbackUrl;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center mb-2">
            <div className="bg-pink-100 p-3 rounded-full">
              <Smartphone className="h-8 w-8 text-pink-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Thanh toán MoMo
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Quét mã QR bằng ứng dụng MoMo
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 text-pink-600 animate-spin mb-4" />
              <p className="text-gray-600">Đang tạo mã QR...</p>
            </div>
          ) : (
            <>
              {/* QR Code Display */}
              <div className="flex flex-col items-center">
                <div className="bg-white p-6 rounded-lg border-4 border-pink-200 shadow-lg mb-4">
                  <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded">
                    {MOMO_CONFIG.devMode ? (
                      <div className="text-center">
                        <QrCode className="h-32 w-32 text-pink-600 mx-auto mb-2" />
                        <p className="text-xs text-gray-500 font-mono">
                          DEV MODE
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          QR Code Simulation
                        </p>
                      </div>
                    ) : (
                      <QrCode className="h-48 w-48 text-gray-400" />
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center max-w-xs">
                  Mở ứng dụng MoMo và quét mã QR để thanh toán
                </p>
              </div>

              {/* Payment Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Mã đơn hàng:</span>
                  <span className="text-sm font-mono font-semibold text-gray-900">
                    {orderId || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Số tiền:</span>
                  <span className="text-lg font-bold text-pink-600">
                    {formatCurrency(amount)}
                  </span>
                </div>
              </div>

              {/* Dev Mode Notice */}
              {MOMO_CONFIG.devMode && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-xs text-yellow-800 text-center mb-3">
                    ⚠️ Chế độ phát triển: Đây là trang giả lập
                  </p>
                  <Button
                    onClick={handleSimulatePayment}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                  >
                    Simulate Thanh toán thành công
                  </Button>
                </div>
              )}

              {/* Instructions */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-900">
                  Hướng dẫn thanh toán:
                </h4>
                <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Mở ứng dụng MoMo trên điện thoại</li>
                  <li>Chọn tính năng "Quét mã"</li>
                  <li>Quét mã QR trên màn hình</li>
                  <li>Xác nhận thanh toán trong ứng dụng</li>
                </ol>
              </div>

              {/* Cancel Button */}
              <Button
                onClick={() => navigate("/patient/payments")}
                variant="outline"
                className="w-full"
              >
                Hủy thanh toán
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MomoQr;

