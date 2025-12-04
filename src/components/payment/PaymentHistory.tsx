import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  Download,
  Filter,
  Receipt,
  Search,
} from "lucide-react";
import {
  Payment,
  loadPayments,
  formatCurrency,
  getPaymentMethodLabel,
  getPaymentMethodIcon,
} from "@/lib/payment";
import { getCurrentUser } from "@/lib/auth";
import { toast } from "sonner";
import Invoice from "./Invoice";
import { generateInvoicePDF } from "@/lib/pdf";

const PaymentHistory = () => {
  const user = getCurrentUser();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [downloadingPaymentId, setDownloadingPaymentId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = () => {
      const allPayments = loadPayments();
      
      // Filter by user's appointments (in a real app, we'd match by user ID)
      // For now, show all payments
      setPayments(allPayments.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    };

    loadData();

    // Listen for updates
    const handleStorage = () => loadData();
    window.addEventListener("storage", handleStorage);
    window.addEventListener("paymentsUpdated", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("paymentsUpdated", handleStorage);
    };
  }, []);

  const filteredPayments = payments.filter((payment) => {
    if (filterStatus === "all") return true;
    return payment.status === filterStatus;
  });

  const getStatusBadge = (status: Payment["status"]) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-50 text-green-600 border-green-200">
            Thành công
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-50 text-yellow-600 border-yellow-200">
            Đang xử lý
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-50 text-red-600 border-red-200">
            Thất bại
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-gray-50 text-gray-600 border-gray-200">
            Đã hủy
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewInvoice = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsInvoiceOpen(true);
  };

  const handleDownloadInvoice = async (payment: Payment) => {
    try {
      setDownloadingPaymentId(payment.id);
      await generateInvoicePDF(payment);
      toast.success("Đã tải hóa đơn PDF thành công!");
    } catch (error: any) {
      console.error("Error downloading PDF:", error);
      toast.error(error.message || "Không thể tải hóa đơn PDF. Vui lòng thử lại.");
    } finally {
      setDownloadingPaymentId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[#007BFF]" />
                Lịch sử thanh toán
              </CardTitle>
              <CardDescription className="mt-2">
                Xem tất cả các giao dịch thanh toán của bạn
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter */}
          <div className="mb-6 flex items-center gap-4">
            <Filter className="h-4 w-4 text-[#687280]" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="completed">Thành công</SelectItem>
                <SelectItem value="pending">Đang xử lý</SelectItem>
                <SelectItem value="failed">Thất bại</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-[#687280]">
              Tổng cộng: <span className="font-medium text-gray-900">{filteredPayments.length}</span> giao dịch
            </div>
          </div>

          {/* Payments Table */}
          {filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-16 w-16 text-[#687280] mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Chưa có giao dịch nào
              </p>
              <p className="text-sm text-[#687280]">
                {filterStatus !== "all"
                  ? "Không có giao dịch nào với trạng thái này"
                  : "Các giao dịch thanh toán sẽ hiển thị ở đây"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã giao dịch</TableHead>
                    <TableHead>Phương thức</TableHead>
                    <TableHead>Số tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày thanh toán</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{payment.id}</span>
                          {payment.transactionId && (
                            <span className="text-xs text-gray-500">
                              {payment.transactionId}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {getPaymentMethodIcon(payment.method)}
                          </span>
                          <span>{getPaymentMethodLabel(payment.method)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-[#007BFF]">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(payment.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {payment.status === "completed" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewInvoice(payment)}
                              >
                                <Receipt className="h-4 w-4 mr-1" />
                                Xem hóa đơn
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadInvoice(payment)}
                                disabled={downloadingPaymentId === payment.id}
                                title="Tải hóa đơn PDF"
                              >
                                <Download className={`h-4 w-4 ${downloadingPaymentId === payment.id ? "animate-pulse" : ""}`} />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Dialog */}
      {selectedPayment && (
        <Invoice
          payment={selectedPayment}
          open={isInvoiceOpen}
          onOpenChange={setIsInvoiceOpen}
        />
      )}
    </div>
  );
};

export default PaymentHistory;

