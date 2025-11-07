import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PatientLayout from "@/components/layout/PatientLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  Phone,
  Mail,
  FileText,
  Filter,
  Eye,
  X,
  CheckCircle2,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { toast } from "sonner";

const APPOINTMENTS_STORAGE_KEY = "cliniccare:appointments";

type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed";

interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  notes?: string;
  status: AppointmentStatus;
  createdAt: string;
}

// Load appointments from localStorage
const loadAppointments = (): Appointment[] => {
  try {
    const stored = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {}
  return [];
};

// Get status info
const getStatusInfo = (status: AppointmentStatus) => {
  switch (status) {
    case "confirmed":
      return { label: "Đã xác nhận", color: "bg-[#4CAF50]/10 text-[#4CAF50] border-[#4CAF50]/20" };
    case "pending":
      return { label: "Đang chờ", color: "bg-[#FF9800]/10 text-[#FF9800] border-[#FF9800]/20" };
    case "cancelled":
      return { label: "Đã hủy", color: "bg-red-50 text-red-600 border-red-200" };
    case "completed":
      return { label: "Hoàn thành", color: "bg-blue-50 text-blue-600 border-blue-200" };
  }
};

const Appointments = () => {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filterStatus, setFilterStatus] = useState<AppointmentStatus | "all">("all");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Load appointments
  useEffect(() => {
    const loadData = () => {
      const allAppointments = loadAppointments();
      if (!user) {
        setAppointments([]);
        return;
      }

      // Filter appointments for current patient
      // Match by name, email, or phone
      const patientAppointments = allAppointments.filter((apt) => {
        const nameMatch = apt.patientName === user.name;
        const emailMatch = user.email && apt.patientEmail === user.email;
        
        // Also try to match by phone if available
        let phoneMatch = false;
        try {
          const users = JSON.parse(localStorage.getItem("cliniccare:users") || "[]");
          const userData = users.find((u: any) => u.id === user.id);
          if (userData?.phone && apt.patientPhone) {
            phoneMatch = apt.patientPhone === userData.phone;
          }
        } catch {}
        
        return nameMatch || emailMatch || phoneMatch;
      });

      // Sort by date (upcoming first)
      const sorted = patientAppointments.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`).getTime();
        const dateB = new Date(`${b.date}T${b.time}`).getTime();
        return dateA - dateB;
      });

      setAppointments(sorted);
    };

    loadData();

    // Listen for storage updates
    const handleStorage = () => loadData();
    window.addEventListener("storage", handleStorage);
    
    // Listen for custom event
    window.addEventListener("appointmentsUpdated", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("appointmentsUpdated", handleStorage);
    };
  }, [user]);

  // Filter appointments
  const filteredAppointments = appointments.filter((apt) => {
    if (filterStatus === "all") return true;
    return apt.status === filterStatus;
  });

  // Handle view details
  const handleView = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsViewDialogOpen(true);
  };

  // Handle cancel appointment
  const handleCancel = (appointment: Appointment) => {
    const allAppointments = loadAppointments();
    const updated = allAppointments.map((apt) =>
      apt.id === appointment.id ? { ...apt, status: "cancelled" as AppointmentStatus } : apt
    );
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(updated));
    setAppointments(updated.filter((apt) => {
      if (!user) return false;
      const nameMatch = apt.patientName === user.name;
      const emailMatch = user.email && apt.patientEmail === user.email;
      
      // Also try to match by phone if available
      let phoneMatch = false;
      try {
        const users = JSON.parse(localStorage.getItem("cliniccare:users") || "[]");
        const userData = users.find((u: any) => u.id === user.id);
        if (userData?.phone && apt.patientPhone) {
          phoneMatch = apt.patientPhone === userData.phone;
        }
      } catch {}
      
      return nameMatch || emailMatch || phoneMatch;
    }));
    window.dispatchEvent(new Event("appointmentsUpdated"));
    toast.success("Đã hủy lịch hẹn thành công");
    setIsViewDialogOpen(false);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Check if appointment is upcoming
  const isUpcoming = (appointment: Appointment) => {
    const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
    return appointmentDate >= new Date() && appointment.status !== "cancelled" && appointment.status !== "completed";
  };

  const upcomingAppointments = filteredAppointments.filter(isUpcoming);
  const pastAppointments = filteredAppointments.filter((apt) => !isUpcoming(apt));

  return (
    <PatientLayout>
      <div className="space-y-6">
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#007BFF]" />
                  Lịch hẹn của tôi
                </CardTitle>
                <CardDescription className="mt-2">
                  Danh sách lịch hẹn sắp tới và lịch sử, trạng thái xác nhận/hủy.
                </CardDescription>
              </div>
              <Button
                onClick={() => navigate("/patient/book")}
                className="bg-[#007BFF] hover:bg-[#0056B3]"
              >
                Đặt lịch mới
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filter */}
            <div className="mb-6 flex items-center gap-4">
              <Filter className="h-4 w-4 text-[#687280]" />
              <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="pending">Đang chờ</SelectItem>
                  <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-[#687280]">
                Tổng cộng: <span className="font-medium text-gray-900">{filteredAppointments.length}</span> lịch hẹn
              </div>
            </div>

            {/* Appointments List */}
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-[#687280] mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium text-gray-900 mb-2">Chưa có lịch hẹn nào</p>
                <p className="text-sm text-[#687280] mb-6">
                  {filterStatus !== "all"
                    ? "Không có lịch hẹn nào với trạng thái này"
                    : "Bắt đầu bằng cách đặt lịch hẹn mới"}
                </p>
                {filterStatus === "all" && (
                  <Button
                    onClick={() => navigate("/patient/book")}
                    className="bg-[#007BFF] hover:bg-[#0056B3]"
                  >
                    Đặt lịch ngay
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Upcoming Appointments */}
                {upcomingAppointments.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-[#007BFF]" />
                      Lịch hẹn sắp tới ({upcomingAppointments.length})
                    </h3>
                    <div className="space-y-3">
                      {upcomingAppointments.map((appointment) => {
                        const statusInfo = getStatusInfo(appointment.status);
                        return (
                          <div
                            key={appointment.id}
                            className="p-4 rounded-lg border border-[#E5E7EB] bg-white hover:shadow-md transition-all cursor-pointer"
                            onClick={() => handleView(appointment)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                                  <span className="text-xs text-[#687280]">ID: {appointment.id}</span>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Stethoscope className="h-4 w-4 text-[#007BFF]" />
                                    <span className="font-medium text-gray-900">{appointment.doctorName}</span>
                                    <span className="text-sm text-[#687280]">• {appointment.specialty}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-[#687280]" />
                                    <span className="text-sm text-gray-700">
                                      {formatDate(appointment.date)} lúc {appointment.time}
                                    </span>
                                  </div>
                                  {appointment.notes && (
                                    <div className="flex items-start gap-2 mt-2">
                                      <FileText className="h-4 w-4 text-[#687280] mt-0.5" />
                                      <span className="text-sm text-[#687280]">{appointment.notes}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleView(appointment);
                                }}
                                className="ml-4"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Past Appointments */}
                {pastAppointments.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Lịch sử ({pastAppointments.length})</h3>
                    <div className="space-y-3">
                      {pastAppointments.map((appointment) => {
                        const statusInfo = getStatusInfo(appointment.status);
                        return (
                          <div
                            key={appointment.id}
                            className="p-4 rounded-lg border border-[#E5E7EB] bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer opacity-75"
                            onClick={() => handleView(appointment)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                                  <span className="text-xs text-[#687280]">ID: {appointment.id}</span>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Stethoscope className="h-4 w-4 text-[#687280]" />
                                    <span className="font-medium text-gray-700">{appointment.doctorName}</span>
                                    <span className="text-sm text-[#687280]">• {appointment.specialty}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-[#687280]" />
                                    <span className="text-sm text-[#687280]">
                                      {formatDate(appointment.date)} lúc {appointment.time}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleView(appointment);
                                }}
                                className="ml-4"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#007BFF]" />
              Chi tiết lịch hẹn
            </DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về lịch hẹn của bạn
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-[#687280]">Mã lịch hẹn</p>
                  <p className="text-base font-semibold text-gray-900">{selectedAppointment.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-[#687280]">Trạng thái</p>
                  <Badge className={getStatusInfo(selectedAppointment.status).color}>
                    {getStatusInfo(selectedAppointment.status).label}
                  </Badge>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-[#007BFF] mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[#687280]">Bác sĩ</p>
                    <p className="text-base text-gray-900">{selectedAppointment.doctorName}</p>
                    <p className="text-sm text-[#687280]">{selectedAppointment.specialty}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-[#007BFF] mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[#687280]">Thời gian</p>
                    <p className="text-base text-gray-900">
                      {formatDate(selectedAppointment.date)} lúc {selectedAppointment.time}
                    </p>
                  </div>
                </div>

                {selectedAppointment.patientPhone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-[#007BFF] mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[#687280]">Số điện thoại</p>
                      <p className="text-base text-gray-900">{selectedAppointment.patientPhone}</p>
                    </div>
                  </div>
                )}

                {selectedAppointment.patientEmail && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-[#007BFF] mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[#687280]">Email</p>
                      <p className="text-base text-gray-900">{selectedAppointment.patientEmail}</p>
                    </div>
                  </div>
                )}

                {selectedAppointment.notes && (
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-[#007BFF] mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[#687280]">Ghi chú</p>
                      <p className="text-base text-gray-900">{selectedAppointment.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedAppointment &&
              isUpcoming(selectedAppointment) &&
              selectedAppointment.status !== "cancelled" && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (confirm("Bạn có chắc chắn muốn hủy lịch hẹn này?")) {
                      handleCancel(selectedAppointment);
                    }
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Hủy lịch hẹn
                </Button>
              )}
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PatientLayout>
  );
};

export default Appointments;
