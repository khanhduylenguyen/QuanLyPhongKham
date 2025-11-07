import { useEffect, useState, useRef } from "react";
import PatientLayout from "@/components/layout/PatientLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Calendar,
  User,
  Stethoscope,
  Activity,
  TestTube,
  Image as ImageIcon,
  Eye,
  X,
  Download,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { listEHR, type EHRRecord } from "@/lib/api";

interface EHRWithId extends EHRRecord {
  id: string;
}

const Records = () => {
  const user = getCurrentUser();
  const [records, setRecords] = useState<EHRWithId[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<EHRWithId | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isLoadingRef = useRef(false);

  // Load records
  useEffect(() => {
    if (!user) {
      setRecords([]);
      setIsLoading(false);
      return;
    }

    const loadRecords = async () => {
      // Prevent multiple simultaneous loads
      if (isLoadingRef.current) return;
      
      isLoadingRef.current = true;
      setIsLoading(true);

      try {
        const ehrRecords = await listEHR(user.id);
        // Sort by visit date (newest first)
        const sorted = ehrRecords.sort((a, b) => {
          const dateA = new Date(a.visitDate).getTime();
          const dateB = new Date(b.visitDate).getTime();
          return dateB - dateA;
        });
        setRecords(sorted);
      } catch (error) {
        console.error("Error loading records:", error);
        setRecords([]);
      } finally {
        setIsLoading(false);
        isLoadingRef.current = false;
      }
    };

    // Load immediately on mount or user change
    loadRecords();

    // Listen for custom updates only (not all storage events)
    const handleEhrUpdate = () => {
      if (!isLoadingRef.current) {
        loadRecords();
      }
    };

    window.addEventListener("ehrUpdated", handleEhrUpdate);

    return () => {
      window.removeEventListener("ehrUpdated", handleEhrUpdate);
    };
  }, [user?.id]); // Only depend on user.id, not the whole user object

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleView = (record: EHRWithId) => {
    setSelectedRecord(record);
    setIsViewDialogOpen(true);
  };

  const handleDownload = (record: EHRWithId) => {
    // Create a printable version
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Hồ sơ bệnh án - ${formatDate(record.visitDate)}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
            h1 { color: #007BFF; border-bottom: 2px solid #007BFF; padding-bottom: 10px; }
            .section { margin: 20px 0; padding: 15px; border: 1px solid #E5E7EB; border-radius: 8px; }
            .label { font-weight: bold; color: #687280; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            table th, table td { padding: 8px; text-align: left; border: 1px solid #E5E7EB; }
            table th { background-color: #F9FAFB; }
          </style>
        </head>
        <body>
          <h1>HỒ SƠ BỆNH ÁN</h1>
          <div class="section">
            <p><span class="label">Ngày khám:</span> ${formatDate(record.visitDate)}</p>
            <p><span class="label">Bác sĩ:</span> ${record.doctor}</p>
            <p><span class="label">Chẩn đoán:</span> ${record.diagnosis}</p>
            ${record.conclusion ? `<p><span class="label">Kết luận:</span> ${record.conclusion}</p>` : ""}
          </div>
          ${record.vitals ? `
          <div class="section">
            <h3>Chỉ số sinh tồn</h3>
            <table>
              ${record.vitals.bpSys && record.vitals.bpDia ? `<tr><td>Huyết áp</td><td>${record.vitals.bpSys}/${record.vitals.bpDia} mmHg</td></tr>` : ""}
              ${record.vitals.hr ? `<tr><td>Nhịp tim</td><td>${record.vitals.hr} bpm</td></tr>` : ""}
              ${record.vitals.weight ? `<tr><td>Cân nặng</td><td>${record.vitals.weight} kg</td></tr>` : ""}
              ${record.vitals.height ? `<tr><td>Chiều cao</td><td>${record.vitals.height} m</td></tr>` : ""}
              ${record.vitals.bmi ? `<tr><td>BMI</td><td>${record.vitals.bmi}</td></tr>` : ""}
            </table>
          </div>
          ` : ""}
          ${record.labs && record.labs.length > 0 ? `
          <div class="section">
            <h3>Kết quả xét nghiệm</h3>
            <table>
              <tr><th>Tên xét nghiệm</th><th>Kết quả</th><th>Đơn vị</th><th>Tham chiếu</th><th>Trạng thái</th></tr>
              ${record.labs.map(lab => `
                <tr>
                  <td>${lab.name}</td>
                  <td>${lab.result}</td>
                  <td>${lab.unit || "-"}</td>
                  <td>${lab.ref || "-"}</td>
                  <td>${lab.status === "bt" ? "Bình thường" : lab.status || "-"}</td>
                </tr>
              `).join("")}
            </table>
          </div>
          ` : ""}
        </body>
      </html>
    `;

    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ho-so-benh-an-${record.visitDate.split("T")[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <PatientLayout>
      <div className="space-y-6">
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#007BFF]" />
              Hồ sơ bệnh án của tôi
            </CardTitle>
            <CardDescription>
              Xem hồ sơ khám, kết quả xét nghiệm, hình ảnh và toa thuốc đã kê.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 border-4 border-[#007BFF] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-[#687280]">Đang tải dữ liệu...</p>
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-[#687280] mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium text-gray-900 mb-2">Chưa có hồ sơ bệnh án nào</p>
                <p className="text-sm text-[#687280]">
                  Hồ sơ bệnh án sẽ được tạo sau khi bạn khám và được bác sĩ ghi nhận.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {records.map((record) => (
                  <div
                    key={record.id}
                    className="p-4 rounded-lg border border-[#E5E7EB] bg-white hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Calendar className="h-4 w-4 text-[#007BFF]" />
                          <span className="font-semibold text-gray-900">
                            {formatDate(record.visitDate)}
                          </span>
                          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                            {record.diagnosis}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Stethoscope className="h-4 w-4 text-[#687280]" />
                            <span className="text-sm text-gray-700">{record.doctor}</span>
                          </div>
                          {record.conclusion && (
                            <div className="flex items-start gap-2">
                              <FileText className="h-4 w-4 text-[#687280] mt-0.5" />
                              <span className="text-sm text-[#687280]">{record.conclusion}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-4 mt-3">
                            {record.vitals && (
                              <Badge variant="outline" className="text-xs">
                                <Activity className="h-3 w-3 mr-1" />
                                Có chỉ số sinh tồn
                              </Badge>
                            )}
                            {record.labs && record.labs.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                <TestTube className="h-3 w-3 mr-1" />
                                {record.labs.length} xét nghiệm
                              </Badge>
                            )}
                            {record.images && record.images.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                <ImageIcon className="h-3 w-3 mr-1" />
                                {record.images.length} hình ảnh
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(record)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Xem chi tiết
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(record)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Tải về
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#007BFF]" />
              Chi tiết hồ sơ bệnh án
            </DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về lần khám này
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-[#687280] mb-1">Ngày khám</p>
                  <p className="text-base font-semibold text-gray-900">
                    {formatDate(selectedRecord.visitDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#687280] mb-1">Bác sĩ</p>
                  <p className="text-base font-semibold text-gray-900">{selectedRecord.doctor}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-[#687280] mb-1">Chẩn đoán</p>
                  <p className="text-base font-semibold text-gray-900">{selectedRecord.diagnosis}</p>
                </div>
                {selectedRecord.conclusion && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-[#687280] mb-1">Kết luận</p>
                    <p className="text-base text-gray-900">{selectedRecord.conclusion}</p>
                  </div>
                )}
              </div>

              {/* Vitals */}
              {selectedRecord.vitals && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="h-5 w-5 text-[#007BFF]" />
                      Chỉ số sinh tồn
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {selectedRecord.vitals.bpSys && selectedRecord.vitals.bpDia && (
                        <div>
                          <p className="text-sm font-medium text-[#687280] mb-1">Huyết áp</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {selectedRecord.vitals.bpSys}/{selectedRecord.vitals.bpDia}
                          </p>
                          <p className="text-xs text-[#687280]">mmHg</p>
                        </div>
                      )}
                      {selectedRecord.vitals.hr && (
                        <div>
                          <p className="text-sm font-medium text-[#687280] mb-1">Nhịp tim</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {selectedRecord.vitals.hr}
                          </p>
                          <p className="text-xs text-[#687280]">bpm</p>
                        </div>
                      )}
                      {selectedRecord.vitals.weight && (
                        <div>
                          <p className="text-sm font-medium text-[#687280] mb-1">Cân nặng</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {selectedRecord.vitals.weight}
                          </p>
                          <p className="text-xs text-[#687280]">kg</p>
                        </div>
                      )}
                      {selectedRecord.vitals.height && (
                        <div>
                          <p className="text-sm font-medium text-[#687280] mb-1">Chiều cao</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {selectedRecord.vitals.height}
                          </p>
                          <p className="text-xs text-[#687280]">m</p>
                        </div>
                      )}
                      {selectedRecord.vitals.bmi && (
                        <div>
                          <p className="text-sm font-medium text-[#687280] mb-1">BMI</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {selectedRecord.vitals.bmi}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Labs */}
              {selectedRecord.labs && selectedRecord.labs.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TestTube className="h-5 w-5 text-[#007BFF]" />
                      Kết quả xét nghiệm
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="text-left p-3 text-sm font-semibold text-gray-900 border-b">
                              Tên xét nghiệm
                            </th>
                            <th className="text-left p-3 text-sm font-semibold text-gray-900 border-b">
                              Kết quả
                            </th>
                            <th className="text-left p-3 text-sm font-semibold text-gray-900 border-b">
                              Đơn vị
                            </th>
                            <th className="text-left p-3 text-sm font-semibold text-gray-900 border-b">
                              Tham chiếu
                            </th>
                            <th className="text-left p-3 text-sm font-semibold text-gray-900 border-b">
                              Trạng thái
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedRecord.labs.map((lab, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                              <td className="p-3 text-sm text-gray-900">{lab.name}</td>
                              <td className="p-3 text-sm font-semibold text-gray-900">
                                {lab.result}
                              </td>
                              <td className="p-3 text-sm text-[#687280]">{lab.unit || "-"}</td>
                              <td className="p-3 text-sm text-[#687280]">{lab.ref || "-"}</td>
                              <td className="p-3">
                                <Badge
                                  variant="outline"
                                  className={
                                    lab.status === "bt"
                                      ? "bg-green-50 text-green-600 border-green-200"
                                      : "bg-amber-50 text-amber-600 border-amber-200"
                                  }
                                >
                                  {lab.status === "bt" ? "Bình thường" : lab.status || "-"}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Images */}
              {selectedRecord.images && selectedRecord.images.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-[#007BFF]" />
                      Hình ảnh ({selectedRecord.images.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedRecord.images.map((imageUrl, index) => (
                        <div key={index} className="relative aspect-square">
                          <img
                            src={imageUrl}
                            alt={`Hình ảnh ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg border border-[#E5E7EB]"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder.svg";
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Đóng
            </Button>
            {selectedRecord && (
              <Button
                onClick={() => {
                  if (selectedRecord) handleDownload(selectedRecord);
                }}
                className="bg-[#007BFF] hover:bg-[#0056B3]"
              >
                <Download className="h-4 w-4 mr-2" />
                Tải về
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PatientLayout>
  );
};

export default Records;
