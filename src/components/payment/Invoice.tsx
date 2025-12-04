import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  Printer,
  Receipt,
  Building2,
  User,
  Calendar,
  CreditCard,
} from "lucide-react";
import {
  Payment,
  formatCurrency,
  getPaymentMethodLabel,
  getAppointmentById,
} from "@/lib/payment";
import { toast } from "sonner";
import { generateInvoicePDF } from "@/lib/pdf";
import { useState } from "react";

interface InvoiceProps {
  payment: Payment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const Invoice = ({ payment, open, onOpenChange }: InvoiceProps) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  // Get appointment info
  const appointment = getAppointmentById(payment.appointmentId);
  
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      setIsGeneratingPDF(true);
      await generateInvoicePDF(payment);
      toast.success("Đã tải hóa đơn PDF thành công!");
    } catch (error: any) {
      console.error("Error downloading PDF:", error);
      toast.error(error.message || "Không thể tải hóa đơn PDF. Vui lòng thử lại.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-[#007BFF]" />
            Hóa đơn điện tử
          </DialogTitle>
          <DialogDescription>
            Hóa đơn thanh toán dịch vụ khám bệnh
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 print:p-8">
          {/* Invoice Header */}
          <Card className="print:border-none print:shadow-none">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-6 w-6 text-[#007BFF]" />
                    <h2 className="text-2xl font-bold text-gray-900">ClinicCare</h2>
                  </div>
                  <p className="text-sm text-gray-600">
                    123 Đường ABC, Quận 1, TP.HCM
                  </p>
                  <p className="text-sm text-gray-600">Điện thoại: 1900 xxxx</p>
                  <p className="text-sm text-gray-600">Email: contact@cliniccare.vn</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-1">Mã hóa đơn</p>
                  <p className="text-lg font-bold text-gray-900">{payment.id}</p>
                  {payment.transactionId && (
                    <>
                      <p className="text-sm text-gray-500 mt-2 mb-1">Mã giao dịch</p>
                      <p className="text-sm font-mono text-gray-700">{payment.transactionId}</p>
                    </>
                  )}
                </div>
              </div>

              <Separator className="my-4" />

              {/* Invoice Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Thông tin khách hàng
                  </p>
                  {appointment && (
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{appointment.patientName}</p>
                      {appointment.patientPhone && <p>{appointment.patientPhone}</p>}
                      {appointment.patientEmail && <p>{appointment.patientEmail}</p>}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Thông tin dịch vụ
                  </p>
                  {appointment && (
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Bác sĩ: {appointment.doctorName}</p>
                      <p>Chuyên khoa: {appointment.specialty}</p>
                      <p>
                        {new Date(appointment.date).toLocaleDateString("vi-VN")} lúc{" "}
                        {appointment.time}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="my-4" />

              {/* Payment Details */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Dịch vụ khám bệnh</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(payment.amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Phương thức thanh toán
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {getPaymentMethodLabel(payment.method)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-gray-900">Tổng cộng</span>
                  <span className="text-xl font-bold text-[#007BFF]">
                    {formatCurrency(payment.amount)}
                  </span>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Footer */}
              <div className="text-center text-xs text-gray-500 space-y-1">
                <p>Ngày thanh toán: {formatDate(payment.completedAt || payment.createdAt)}</p>
                <p className="mt-2">
                  Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!
                </p>
                <p className="mt-1">
                  Hóa đơn điện tử có giá trị pháp lý theo quy định của pháp luật
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2 print:hidden">
            <Button
              variant="outline"
              onClick={handlePrint}
              className="flex-1"
            >
              <Printer className="h-4 w-4 mr-2" />
              In hóa đơn
            </Button>
            <Button
              variant="outline"
              onClick={handleDownload}
              className="flex-1"
              disabled={isGeneratingPDF}
            >
              <Download className="h-4 w-4 mr-2" />
              {isGeneratingPDF ? "Đang tạo PDF..." : "Tải PDF"}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Đóng
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Invoice;

