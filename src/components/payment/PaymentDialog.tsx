import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  CreditCard,
  Smartphone,
  Wallet,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  PaymentMethod,
  createPayment,
  processPayment,
  formatCurrency,
  getPaymentMethodLabel,
  getPaymentMethodIcon,
} from "@/lib/payment";
import { toast } from "sonner";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
  amount: number;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  onPaymentSuccess?: (paymentId: string, transactionId: string) => void;
}

const PaymentDialog = ({
  open,
  onOpenChange,
  appointmentId,
  amount,
  doctorName,
  specialty,
  date,
  time,
  onPaymentSuccess,
}: PaymentDialogProps) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "failed">("idle");
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast.error("Vui lòng chọn phương thức thanh toán");
      return;
    }

    setIsProcessing(true);
    setPaymentStatus("processing");

    try {
      // Create payment record
      const payment = createPayment({
        appointmentId,
        amount,
        method: selectedMethod,
        description: `Thanh toán lịch hẹn với ${doctorName} - ${specialty}`,
      });

      // Process payment
      const result = await processPayment(payment.id, selectedMethod);

      // Handle MoMo redirect
      if (result.success && result.redirectUrl && selectedMethod === "momo") {
        // Redirect to MoMo payment page
        window.location.href = result.redirectUrl;
        return; // Don't close dialog, user will be redirected
      }

      if (result.success && result.transactionId) {
        setPaymentStatus("success");
        setTransactionId(result.transactionId);
        toast.success("Thanh toán thành công!");
        
        // Update appointment status to confirmed
        try {
          const APPOINTMENTS_KEY = "cliniccare:appointments";
          const appointments = JSON.parse(localStorage.getItem(APPOINTMENTS_KEY) || "[]");
          const updatedAppointments = appointments.map((apt: any) =>
            apt.id === appointmentId
              ? { ...apt, status: "confirmed", paymentId: payment.id }
              : apt
          );
          localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(updatedAppointments));
          window.dispatchEvent(new Event("appointmentsUpdated"));
        } catch {}

        // Call success callback
        if (onPaymentSuccess) {
          onPaymentSuccess(payment.id, result.transactionId);
        }

        // Close dialog after 2 seconds
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        setPaymentStatus("failed");
        const errorMsg = result.error || "Thanh toán thất bại. Vui lòng thử lại.";
        toast.error(errorMsg);
        console.error("Payment error:", errorMsg);
      }
    } catch (error: any) {
      setPaymentStatus("failed");
      const errorMsg = error?.message || "Có lỗi xảy ra. Vui lòng thử lại.";
      toast.error(errorMsg);
      console.error("Payment exception:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setSelectedMethod(null);
      setPaymentStatus("idle");
      setTransactionId(null);
      onOpenChange(false);
    }
  };

  const paymentMethods: Array<{
    value: PaymentMethod;
    label: string;
    icon: React.ReactNode;
    description: string;
  }> = [
    {
      value: "vnpay",
      label: "VNPay",
      icon: <CreditCard className="h-5 w-5" />,
      description: "Thanh toán qua thẻ ngân hàng",
    },
    {
      value: "momo",
      label: "Ví MoMo",
      icon: <Smartphone className="h-5 w-5" />,
      description: "Thanh toán qua ví điện tử MoMo",
    },
    {
      value: "zalopay",
      label: "ZaloPay",
      icon: <Wallet className="h-5 w-5" />,
      description: "Thanh toán qua ZaloPay",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Thanh toán lịch hẹn</DialogTitle>
          <DialogDescription>
            Chọn phương thức thanh toán để hoàn tất đặt lịch
          </DialogDescription>
        </DialogHeader>

        {paymentStatus === "success" ? (
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Thanh toán thành công!
              </h3>
              <p className="text-sm text-gray-600 text-center mb-4">
                Lịch hẹn của bạn đã được xác nhận
              </p>
              {transactionId && (
                <div className="bg-gray-50 rounded-lg p-3 w-full">
                  <p className="text-xs text-gray-500 mb-1">Mã giao dịch</p>
                  <p className="text-sm font-mono font-semibold text-gray-900">
                    {transactionId}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : paymentStatus === "failed" ? (
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Thanh toán thất bại
              </h3>
              <p className="text-sm text-gray-600 text-center">
                Vui lòng thử lại hoặc chọn phương thức thanh toán khác
              </p>
            </div>
            <Button
              onClick={() => {
                setPaymentStatus("idle");
                setSelectedMethod(null);
              }}
              className="w-full"
            >
              Thử lại
            </Button>
          </div>
        ) : (
          <>
            {/* Appointment Summary */}
            <Card className="bg-gray-50">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Bác sĩ:</span>
                  <span className="text-sm font-medium text-gray-900">{doctorName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Chuyên khoa:</span>
                  <span className="text-sm font-medium text-gray-900">{specialty}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Thời gian:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(date).toLocaleDateString("vi-VN")} lúc {time}
                  </span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-gray-900">
                      Tổng tiền:
                    </span>
                    <span className="text-lg font-bold text-[#007BFF]">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Chọn phương thức thanh toán</Label>
              <RadioGroup
                value={selectedMethod || ""}
                onValueChange={(value) => setSelectedMethod(value as PaymentMethod)}
              >
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div key={method.value}>
                      <RadioGroupItem
                        value={method.value}
                        id={method.value}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={method.value}
                        className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 peer-data-[state=checked]:border-[#007BFF] peer-data-[state=checked]:bg-blue-50"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          {method.icon}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{method.label}</div>
                          <div className="text-sm text-gray-500">{method.description}</div>
                        </div>
                        <div className="text-2xl">{getPaymentMethodIcon(method.value)}</div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isProcessing}
                className="w-full sm:w-auto"
              >
                Hủy
              </Button>
              <Button
                onClick={handlePayment}
                disabled={!selectedMethod || isProcessing}
                className="w-full sm:w-auto bg-[#007BFF] hover:bg-[#0056B3]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    Thanh toán {formatCurrency(amount)}
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;

