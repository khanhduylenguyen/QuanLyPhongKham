import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { updatePaymentStatus, getPaymentById } from "@/lib/payment";
import { verifyMomoCallback } from "@/lib/momo";
import { toast } from "sonner";

const MomoCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "failed" | "error">("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get all query parameters
        const params: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          params[key] = value;
        });

        console.log("[MomoCallback] Received params:", params);

        const {
          partnerCode,
          orderId,
          resultCode,
          transId,
          amount,
          message: momoMessage,
          signature,
        } = params;

        // Check if we have required parameters
        if (!orderId || !resultCode) {
          setStatus("error");
          setMessage("Thiếu thông tin từ MoMo. Vui lòng thử lại.");
          return;
        }

        // Verify signature
        const isValid = await verifyMomoCallback(params);
        if (!isValid && signature) {
          console.warn("[MomoCallback] Signature verification failed");
          // Continue anyway for now, but log warning
        }

        // Find payment by orderId (which is paymentId)
        const payment = getPaymentById(orderId);
        if (!payment) {
          setStatus("error");
          setMessage("Không tìm thấy thông tin thanh toán.");
          return;
        }

        // Check result code
        // 0 = Success, other codes = Failed
        if (resultCode === "0") {
          // Payment successful
          updatePaymentStatus(payment.id, "completed", transId || undefined);
          
          // Update appointment status
          try {
            const storedData = localStorage.getItem(`momo_payment_${payment.id}`);
            if (storedData) {
              const { appointmentId } = JSON.parse(storedData);
              const APPOINTMENTS_KEY = "cliniccare:appointments";
              const appointments = JSON.parse(localStorage.getItem(APPOINTMENTS_KEY) || "[]");
              const updatedAppointments = appointments.map((apt: any) =>
                apt.id === appointmentId
                  ? { ...apt, status: "confirmed", paymentId: payment.id }
                  : apt
              );
              localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(updatedAppointments));
              window.dispatchEvent(new Event("appointmentsUpdated"));
              
              // Clean up
              localStorage.removeItem(`momo_payment_${payment.id}`);
            }
          } catch (error) {
            console.error("[MomoCallback] Error updating appointment:", error);
          }

          setStatus("success");
          setMessage(momoMessage || "Thanh toán thành công!");
          toast.success("Thanh toán thành công!");

          // Redirect to appointments page after 3 seconds
          setTimeout(() => {
            navigate("/patient/appointments");
          }, 3000);
        } else {
          // Payment failed
          updatePaymentStatus(payment.id, "failed");
          setStatus("failed");
          setMessage(momoMessage || "Thanh toán thất bại. Vui lòng thử lại.");
          toast.error("Thanh toán thất bại");

          // Redirect to payments page after 3 seconds
          setTimeout(() => {
            navigate("/patient/payments");
          }, 3000);
        }
      } catch (error: any) {
        console.error("[MomoCallback] Error:", error);
        setStatus("error");
        setMessage(error.message || "Có lỗi xảy ra khi xử lý thanh toán.");
        toast.error("Có lỗi xảy ra");
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Xử lý thanh toán MoMo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600">Đang xử lý thanh toán...</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Thanh toán thành công!
              </h3>
              <p className="text-sm text-gray-600 text-center mb-4">{message}</p>
              <p className="text-xs text-gray-500 text-center">
                Đang chuyển đến trang lịch hẹn...
              </p>
              <Button
                onClick={() => navigate("/patient/appointments")}
                className="mt-4 w-full bg-[#007BFF] hover:bg-[#0056B3]"
              >
                Đi đến lịch hẹn
              </Button>
            </div>
          )}

          {status === "failed" && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Thanh toán thất bại
              </h3>
              <p className="text-sm text-gray-600 text-center mb-4">{message}</p>
              <p className="text-xs text-gray-500 text-center">
                Đang chuyển đến trang thanh toán...
              </p>
              <Button
                onClick={() => navigate("/patient/payments")}
                variant="outline"
                className="mt-4 w-full"
              >
                Đi đến thanh toán
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 mb-4">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Có lỗi xảy ra
              </h3>
              <p className="text-sm text-gray-600 text-center mb-4">{message}</p>
              <div className="flex gap-2 w-full">
                <Button
                  onClick={() => navigate("/patient/payments")}
                  variant="outline"
                  className="flex-1"
                >
                  Quay lại
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-[#007BFF] hover:bg-[#0056B3]"
                >
                  Thử lại
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MomoCallback;

