import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Calendar,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Phone,
  User,
  Clock,
  Stethoscope,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Types
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

// Load doctors from localStorage (shared with Doctors page)
const STAFF_STORAGE_KEY = "cliniccare:staff";

interface Staff {
  id: string;
  fullName: string;
  role: "doctor" | "receptionist" | "nurse" | "manager";
  specialty?: string;
  status: "active" | "leave" | "suspended";
}

const loadDoctorsFromStorage = (): Array<{ id: string; name: string; specialty: string }> => {
  try {
    const stored = localStorage.getItem(STAFF_STORAGE_KEY);
    if (stored) {
      const staff: Staff[] = JSON.parse(stored);
      // Filter only active doctors
      const doctors = staff
        .filter((s) => s.role === "doctor" && s.status === "active")
        .map((s) => ({
          id: s.id,
          name: s.fullName,
          specialty: s.specialty || "Nội tổng quát",
        }));
      return doctors;
    }
  } catch {
    // Fallback to empty array if parse fails
  }
  return [];
};

// Fallback doctors if localStorage is empty
const fallbackDoctors = [
  { id: "D001", name: "BS. Lan", specialty: "Tim mạch" },
  { id: "D002", name: "BS. Minh", specialty: "Nhi khoa" },
  { id: "D003", name: "BS. Hùng", specialty: "Da liễu" },
  { id: "D004", name: "BS. Dung", specialty: "Tai Mũi Họng" },
];

// Form schema
const appointmentSchema = z.object({
  patientName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  patientPhone: z
    .string()
    .min(10, "Số điện thoại không hợp lệ")
    .regex(/^(0|\+84)[0-9]{9,10}$/, "Số điện thoại không đúng định dạng"),
  patientEmail: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  doctorId: z.string().min(1, "Vui lòng chọn bác sĩ"),
  date: z.string().min(1, "Vui lòng chọn ngày"),
  time: z.string().min(1, "Vui lòng chọn giờ"),
  notes: z.string().optional(),
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

const Appointments = () => {
  // Load doctors from localStorage, with fallback
  const [doctors, setDoctors] = useState<Array<{ id: string; name: string; specialty: string }>>(() => {
    const loaded = loadDoctorsFromStorage();
    return loaded.length > 0 ? loaded : fallbackDoctors;
  });

  // Listen for storage changes to update doctors list in real-time
  useEffect(() => {
    const handleStorageChange = () => {
      const loaded = loadDoctorsFromStorage();
      if (loaded.length > 0) {
        setDoctors(loaded);
      }
    };

    // Listen to custom event for same-tab updates
    window.addEventListener("staffUpdated", handleStorageChange);
    // Listen to storage event for cross-tab updates
    window.addEventListener("storage", handleStorageChange);

    // Also check on mount
    handleStorageChange();

    return () => {
      window.removeEventListener("staffUpdated", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // State
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: "A023",
      patientName: "Nguyễn Văn A",
      patientPhone: "0901234567",
      patientEmail: "nguyenvana@email.com",
      doctorId: "D001",
      doctorName: "BS. Lan",
      specialty: "Tim mạch",
      date: "2024-10-31",
      time: "09:00",
      notes: "Bệnh nhân cần khám lại định kỳ",
      status: "confirmed",
      createdAt: "2024-10-30T10:00:00",
    },
    {
      id: "A024",
      patientName: "Trần Thị B",
      patientPhone: "0907654321",
      patientEmail: "tranthib@email.com",
      doctorId: "D002",
      doctorName: "BS. Minh",
      specialty: "Nhi khoa",
      date: "2024-10-31",
      time: "10:30",
      status: "pending",
      createdAt: "2024-10-30T14:00:00",
    },
    {
      id: "A025",
      patientName: "Lê Văn C",
      patientPhone: "0912345678",
      doctorId: "D003",
      doctorName: "BS. Hùng",
      specialty: "Da liễu",
      date: "2024-11-01",
      time: "14:00",
      status: "confirmed",
      createdAt: "2024-10-29T09:00:00",
    },
  ]);

  // Persist to localStorage for cross-module sync (Patients)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cliniccare:appointments");
      if (saved) {
        const parsed = JSON.parse(saved) as Appointment[];
        if (Array.isArray(parsed) && parsed.length) setAppointments(parsed);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("cliniccare:appointments", JSON.stringify(appointments));
    } catch {}
  }, [appointments]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDoctor, setFilterDoctor] = useState("all");
  const [filterStatus, setFilterStatus] = useState<AppointmentStatus | "all">("all");

  // Form for create/edit
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientName: "",
      patientPhone: "",
      patientEmail: "",
      doctorId: "",
      date: "",
      time: "",
      notes: "",
      status: "pending",
    },
  });

  // Filter appointments
  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.patientPhone.includes(searchQuery) ||
      apt.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDoctor = filterDoctor === "all" || apt.doctorId === filterDoctor;
    const matchesStatus = filterStatus === "all" || apt.status === filterStatus;
    return matchesSearch && matchesDoctor && matchesStatus;
  });

  // Status label và color
  const getStatusInfo = (status: AppointmentStatus) => {
    switch (status) {
      case "confirmed":
        return { label: "Đã xác nhận", color: "bg-[#4CAF50]/10 text-[#4CAF50]" };
      case "pending":
        return { label: "Đang chờ", color: "bg-[#FF9800]/10 text-[#FF9800]" };
      case "cancelled":
        return { label: "Đã hủy", color: "bg-red-50 text-red-600" };
      case "completed":
        return { label: "Hoàn thành", color: "bg-blue-50 text-blue-600" };
    }
  };

  // Create new appointment
  const handleCreate = () => {
    setSelectedAppointment(null);
    form.reset({
      patientName: "",
      patientPhone: "",
      patientEmail: "",
      doctorId: "",
      date: "",
      time: "",
      notes: "",
      status: "pending",
    });
    setIsCreateDialogOpen(true);
  };

  // Edit appointment
  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    const doctor = doctors.find((d) => d.id === appointment.doctorId);
    form.reset({
      patientName: appointment.patientName,
      patientPhone: appointment.patientPhone,
      patientEmail: appointment.patientEmail || "",
      doctorId: appointment.doctorId,
      date: appointment.date,
      time: appointment.time,
      notes: appointment.notes || "",
      status: appointment.status,
    });
    setIsEditDialogOpen(true);
  };

  // View appointment
  const handleView = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsViewDialogOpen(true);
  };

  // Delete appointment
  const handleDelete = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDeleteDialogOpen(true);
  };

  // Submit create
  const onSubmitCreate = (data: AppointmentFormValues) => {
    const doctor = doctors.find((d) => d.id === data.doctorId);
    if (!doctor) return;

    const newAppointment: Appointment = {
      id: `A${String(appointments.length + 1).padStart(3, "0")}`,
      patientName: data.patientName,
      patientPhone: data.patientPhone,
      patientEmail: data.patientEmail || undefined,
      doctorId: data.doctorId,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      date: data.date,
      time: data.time,
      notes: data.notes,
      status: data.status,
      createdAt: new Date().toISOString(),
    };

    setAppointments([...appointments, newAppointment]);
    setIsCreateDialogOpen(false);
    form.reset();
    toast.success("Tạo lịch hẹn thành công!");
  };

  // Submit edit
  const onSubmitEdit = (data: AppointmentFormValues) => {
    if (!selectedAppointment) return;

    const doctor = doctors.find((d) => d.id === data.doctorId);
    if (!doctor) return;

    const updatedAppointments = appointments.map((apt) =>
      apt.id === selectedAppointment.id
        ? {
            ...apt,
            patientName: data.patientName,
            patientPhone: data.patientPhone,
            patientEmail: data.patientEmail || undefined,
            doctorId: data.doctorId,
            doctorName: doctor.name,
            specialty: doctor.specialty,
            date: data.date,
            time: data.time,
            notes: data.notes,
            status: data.status,
          }
        : apt
    );

    setAppointments(updatedAppointments);
    setIsEditDialogOpen(false);
    setSelectedAppointment(null);
    toast.success("Cập nhật lịch hẹn thành công!");
  };

  // Confirm delete
  const confirmDelete = () => {
    if (!selectedAppointment) return;

    setAppointments(
      appointments.filter((apt) => apt.id !== selectedAppointment.id)
    );
    setIsDeleteDialogOpen(false);
    setSelectedAppointment(null);
    toast.success("Đã xóa lịch hẹn!");
  };

  // Render form fields
  const renderFormFields = () => (
    <>
      <FormField
        control={form.control}
        name="patientName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Họ và tên bệnh nhân *</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Nguyễn Văn A"
                className="border-[#E5E7EB]"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="patientPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số điện thoại *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="0901234567"
                  className="border-[#E5E7EB]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="patientEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="email@example.com"
                  className="border-[#E5E7EB]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="doctorId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bác sĩ *</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger className="border-[#E5E7EB]">
                  <SelectValue placeholder="Chọn bác sĩ" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ngày khám *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="date"
                  className="border-[#E5E7EB]"
                  min={new Date().toISOString().split("T")[0]}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Giờ khám *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="time"
                  className="border-[#E5E7EB]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Trạng thái *</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger className="border-[#E5E7EB]">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="pending">Đang chờ</SelectItem>
                <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ghi chú</FormLabel>
            <FormControl>
              <textarea
                {...field}
                rows={3}
                placeholder="Ghi chú về lịch hẹn..."
                className="flex min-h-[80px] w-full rounded-md border border-[#E5E7EB] bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Quản lý lịch khám
            </h1>
            <p className="text-[#687280] mt-1">
              Xem và quản lý tất cả các cuộc hẹn ({filteredAppointments.length})
            </p>
          </div>
          <Button
            onClick={handleCreate}
            className="bg-[#007BFF] hover:bg-[#0056B3]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Đặt lịch mới
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-[#E5E7EB]">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#687280]" />
                <Input
                  placeholder="Tìm kiếm bệnh nhân, số điện thoại, ID..."
                  className="pl-10 border-[#E5E7EB]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={filterDoctor} onValueChange={setFilterDoctor}>
                <SelectTrigger className="border-[#E5E7EB]">
                  <SelectValue placeholder="Chọn bác sĩ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả bác sĩ</SelectItem>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filterStatus}
                onValueChange={(value) =>
                  setFilterStatus(value as AppointmentStatus | "all")
                }
              >
                <SelectTrigger className="border-[#E5E7EB]">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="pending">Đang chờ</SelectItem>
                  <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className="border-[#E5E7EB]"
                onClick={() => {
                  setSearchQuery("");
                  setFilterDoctor("all");
                  setFilterStatus("all");
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Xóa lọc
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle>Danh sách lịch hẹn</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-[#687280] mx-auto mb-4 opacity-50" />
                <p className="text-[#687280]">Không tìm thấy lịch hẹn nào</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAppointments.map((appointment) => {
                  const statusInfo = getStatusInfo(appointment.status);
                  return (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            appointment.status === "confirmed"
                              ? "bg-[#4CAF50]"
                              : appointment.status === "pending"
                              ? "bg-[#FF9800]"
                              : appointment.status === "cancelled"
                              ? "bg-red-500"
                              : "bg-blue-500"
                          }`}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <p className="font-medium text-gray-900">
                              {appointment.patientName}
                            </p>
                            <Badge
                              variant="outline"
                              className={`text-xs ${statusInfo.color} border-0`}
                            >
                              {statusInfo.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-[#687280]">
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {appointment.patientPhone}
                            </span>
                            <span className="flex items-center gap-1">
                              <Stethoscope className="h-3 w-3" />
                              {appointment.doctorName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(appointment.date).toLocaleDateString("vi-VN")} - {appointment.time}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(appointment)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(appointment)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(appointment)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Đặt lịch hẹn mới</DialogTitle>
            <DialogDescription>
              Điền thông tin để tạo lịch hẹn mới cho bệnh nhân
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitCreate)} className="space-y-4">
              {renderFormFields()}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" className="bg-[#007BFF] hover:bg-[#0056B3]">
                  Tạo lịch hẹn
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa lịch hẹn</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin lịch hẹn #{selectedAppointment?.id}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-4">
              {renderFormFields()}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" className="bg-[#007BFF] hover:bg-[#0056B3]">
                  Cập nhật
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chi tiết lịch hẹn #{selectedAppointment?.id}</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#687280]">Bệnh nhân</Label>
                  <p className="font-medium text-gray-900">
                    {selectedAppointment.patientName}
                  </p>
                </div>
                <div>
                  <Label className="text-[#687280]">Số điện thoại</Label>
                  <p className="font-medium text-gray-900">
                    {selectedAppointment.patientPhone}
                  </p>
                </div>
                {selectedAppointment.patientEmail && (
                  <div>
                    <Label className="text-[#687280]">Email</Label>
                    <p className="font-medium text-gray-900">
                      {selectedAppointment.patientEmail}
                    </p>
                  </div>
                )}
                <div>
                  <Label className="text-[#687280]">Bác sĩ</Label>
                  <p className="font-medium text-gray-900">
                    {selectedAppointment.doctorName}
                  </p>
                </div>
                <div>
                  <Label className="text-[#687280]">Chuyên khoa</Label>
                  <p className="font-medium text-gray-900">
                    {selectedAppointment.specialty}
                  </p>
                </div>
                <div>
                  <Label className="text-[#687280]">Ngày khám</Label>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedAppointment.date).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div>
                  <Label className="text-[#687280]">Giờ khám</Label>
                  <p className="font-medium text-gray-900">
                    {selectedAppointment.time}
                  </p>
                </div>
                <div>
                  <Label className="text-[#687280]">Trạng thái</Label>
                  <div className="mt-1">
                    <Badge
                      variant="outline"
                      className={`${getStatusInfo(selectedAppointment.status).color} border-0`}
                    >
                      {getStatusInfo(selectedAppointment.status).label}
                    </Badge>
                  </div>
                </div>
              </div>
              {selectedAppointment.notes && (
                <div>
                  <Label className="text-[#687280]">Ghi chú</Label>
                  <p className="mt-1 text-gray-900">{selectedAppointment.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Đóng
            </Button>
            {selectedAppointment && (
              <Button
                onClick={() => {
                  setIsViewDialogOpen(false);
                  handleEdit(selectedAppointment);
                }}
                className="bg-[#007BFF] hover:bg-[#0056B3]"
              >
                Chỉnh sửa
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa lịch hẹn</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa lịch hẹn #{selectedAppointment?.id} của{" "}
              {selectedAppointment?.patientName}? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Appointments;
