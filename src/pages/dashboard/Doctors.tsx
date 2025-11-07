import { CLINIC_NAME } from "@/lib/config";
import { createStaffAccount } from "@/lib/auth";
import { useMemo, useRef, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  UserRound,
  UserPlus,
  Users,
  Search,
  RefreshCw,
  ShieldCheck,
  Eye,
  Edit,
  Trash2,
  Stethoscope,
  CalendarDays,
} from "lucide-react";

// Types
export type StaffRole = "doctor" | "receptionist" | "nurse" | "manager";
export type StaffStatus = "active" | "leave" | "suspended";

interface Staff {
  id: string;
  avatar?: string;
  fullName: string;
  role: StaffRole;
  specialty?: string; // only for doctors
  todayAppointments: number;
  email: string;
  phone: string;
  gender?: "male" | "female" | "other";
  dob?: string; // ISO
  address?: string;
  degree?: string;
  experienceYears?: number;
  status: StaffStatus;
  rating?: number;
}

// Mock data
const specialties = [
  "Nội tổng quát",
  "Nhi",
  "Tai Mũi Họng",
  "Da liễu",
  "Tim mạch",
  "Sản phụ khoa",
];

const initialStaff: Staff[] = [
  {
    id: "S001",
    fullName: "BS. Nguyễn Thị Lan",
    role: "doctor",
    specialty: "Nội tổng quát",
    todayAppointments: 12,
    email: "lan.nguyen@cliniccare.vn",
    phone: "0901234567",
    gender: "female",
    status: "active",
    rating: 4.8,
    degree: "ThS. Nội tổng quát",
    experienceYears: 8,
  },
  {
    id: "S002",
    fullName: "Trần Minh",
    role: "receptionist",
    todayAppointments: 0,
    email: "minh.tran@cliniccare.vn",
    phone: "0907654321",
    status: "active",
  },
  {
    id: "S003",
    fullName: "BS. Phạm Hùng",
    role: "doctor",
    specialty: "Tim mạch",
    todayAppointments: 6,
    email: "hung.pham@cliniccare.vn",
    phone: "0912345678",
    status: "leave",
    rating: 4.6,
    degree: "BSCKI. Tim mạch",
    experienceYears: 10,
  },
];

// Schemas
const staffSchema = z.object({
  fullName: z.string().min(2, "Họ tên ít nhất 2 ký tự"),
  role: z.enum(["doctor", "receptionist", "nurse", "manager"]),
  specialty: z.string().optional(),
  email: z.string().email("Email không hợp lệ"),
  phone: z
    .string()
    .min(10, "Số điện thoại không hợp lệ")
    .regex(/^(0|\+84)[0-9]{9,10}$/, "Số điện thoại không đúng định dạng"),
  status: z.enum(["active", "leave", "suspended"]).default("active"),
  username: z.string().min(3, "Tên đăng nhập ít nhất 3 ký tự").optional(),
  password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự").optional(),
  createAccount: z.boolean().default(false), // Checkbox để quyết định có tạo tài khoản không
}).refine((data) => {
  // Nếu muốn tạo tài khoản và role là doctor hoặc receptionist, thì username và password là bắt buộc
  if (data.createAccount && (data.role === "doctor" || data.role === "receptionist")) {
    return data.username && data.username.length >= 3 && data.password && data.password.length >= 6;
  }
  return true;
}, {
  message: "Vui lòng nhập tên đăng nhập (tối thiểu 3 ký tự) và mật khẩu (tối thiểu 6 ký tự) để tạo tài khoản",
  path: ["username"], // Hiển thị lỗi ở trường username
});

const permissionKeys = [
  { key: "view_appointments", label: "Xem lịch khám" },
  { key: "manage_patients", label: "Quản lý bệnh nhân" },
  { key: "edit_doctors", label: "Chỉnh sửa thông tin bác sĩ khác" },
  { key: "view_reports", label: "Xem báo cáo doanh thu" },
] as const;

export type PermissionKey = (typeof permissionKeys)[number]["key"];

const STAFF_STORAGE_KEY = "cliniccare:staff";

// Load staff from localStorage or use initial data
const loadStaff = (): Staff[] => {
  try {
    const stored = localStorage.getItem(STAFF_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialStaff;
    }
  } catch {
    // Fallback to initial data if parse fails
  }
  return initialStaff;
};

// Save staff to localStorage
const saveStaff = (staff: Staff[]) => {
  try {
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(staff));
    // Dispatch custom event to notify other components (like Appointments)
    window.dispatchEvent(new CustomEvent("staffUpdated"));
  } catch {
    // Ignore storage errors
  }
};

const Doctors = () => {
  const [staff, setStaff] = useState<Staff[]>(() => loadStaff());
  const [query, setQuery] = useState("");
  const [filterRole, setFilterRole] = useState<StaffRole | "all">("all");
  const [filterStatus, setFilterStatus] = useState<StaffStatus | "all">("all");
  const [filterSpecialty, setFilterSpecialty] = useState<string | "all">("all");

  const [selected, setSelected] = useState<Staff | null>(null);
  const [openPreview, setOpenPreview] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openPermission, setOpenPermission] = useState(false);
  const [openSchedule, setOpenSchedule] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  const printRef = useRef<HTMLDivElement | null>(null);

  const [permissions, setPermissions] = useState<Record<string, boolean>>({});

  const form = useForm<z.infer<typeof staffSchema>>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      fullName: "",
      role: "doctor",
      specialty: "",
      email: "",
      phone: "",
      status: "active",
      username: "",
      password: "",
      createAccount: false,
    },
  });

  const filtered = useMemo(() => {
    return staff.filter((s) => {
      const q = query.trim().toLowerCase();
      const byQuery =
        !q ||
        s.fullName.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        (s.specialty || "").toLowerCase().includes(q);
      const byRole = filterRole === "all" || s.role === filterRole;
      const byStatus = filterStatus === "all" || s.status === filterStatus;
      const bySpec = filterSpecialty === "all" || (s.specialty || "") === filterSpecialty;
      return byQuery && byRole && byStatus && bySpec;
    });
  }, [staff, query, filterRole, filterStatus, filterSpecialty]);

  const resetFilters = () => {
    setQuery("");
    setFilterRole("all");
    setFilterStatus("all");
    setFilterSpecialty("all");
  };

  const exportCSV = () => {
    const headers = [
      "ID",
      "Họ tên",
      "Vai trò",
      "Chuyên khoa",
      "Số lịch hôm nay",
      "Email",
      "SĐT",
      "Trạng thái",
    ];
    const rows = filtered.map((s) => [
      s.id,
      s.fullName,
      s.role,
      s.specialty || "",
      String(s.todayAppointments),
      s.email,
      s.phone,
      s.status,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `doctors_staff_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Đã xuất CSV (mở bằng Excel)");
  };

  const printPDF = () => {
    const printContents = printRef.current?.innerHTML || "";
    const w = window.open("", "_blank", "width=1024,height=768");
    if (!w) return;
    w.document.open();
    w.document.write(`<!doctype html><html><head><title>${CLINIC_NAME} - Doctors & Staff</title>
      <style>
        body{font-family: Inter,system-ui,sans-serif; padding:24px}
        table{width:100%; border-collapse:collapse}
        th,td{border:1px solid #e5e7eb; padding:8px; font-size:12px; text-align:left}
        th{background:#f9fafb}
        .brand{display:flex; align-items:center; gap:10px; margin-bottom:16px}
        .logo{display:inline-flex; width:36px; height:36px; border-radius:8px; background:#007BFF; align-items:center; justify-content:center;}
        .logo svg{color:#fff}
        h1{margin:0; font-size:18px}
        .muted{color:#687280; font-size:12px}
        @media print { .wm:after{content:'${CLINIC_NAME}'; position:fixed; top:50%; left:50%; transform:translate(-50%,-50%) rotate(-30deg); font-size:80px; color:rgba(0,0,0,.06); z-index:0} .content{position:relative; z-index:1} }
      </style>
    </head><body class="wm">
      <div class="brand">
        <div class="logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        </div>
        <div>
           <h1>${CLINIC_NAME} - Danh sách Bác sĩ & Nhân viên</h1>
          <div class="muted">Ngày in: ${new Date().toLocaleString("vi-VN")}</div>
        </div>
      </div>
      <div class="content">${printContents}</div>
    </body></html>`);
    w.document.close();
    w.focus();
    w.print();
  };

  const statusPill = (status: StaffStatus) => {
    if (status === "active") return <Badge className="bg-[#16a34a]/10 text-[#16a34a] border-0">Đang làm việc</Badge>;
    if (status === "leave") return <Badge className="bg-[#f59e0b]/10 text-[#f59e0b] border-0">Nghỉ phép</Badge>;
    return <Badge className="bg-red-50 text-red-600 border-0">Tạm ngưng</Badge>;
  };

  const onCreate = (data: z.infer<typeof staffSchema>) => {
    // Kiểm tra nếu muốn tạo tài khoản nhưng thiếu username/password
    if (data.createAccount) {
      if (!data.username || !data.password) {
        toast.error("Vui lòng nhập tên đăng nhập và mật khẩu để tạo tài khoản");
        return;
      }
      
      // Chỉ tạo tài khoản cho doctor và receptionist
      if (data.role === "doctor" || data.role === "receptionist") {
        const accountResult = createStaffAccount(
          data.fullName,
          data.email,
          data.phone,
          data.username,
          data.password,
          data.role as "doctor" | "receptionist"
        );
        
        if (!accountResult) {
          toast.error("Tạo tài khoản thất bại. Email, số điện thoại hoặc tên đăng nhập đã tồn tại.");
          return;
        }
        
        toast.success("Đã tạo tài khoản đăng nhập cho " + data.fullName);
      } else {
        toast.error("Chỉ có thể tạo tài khoản cho Bác sĩ hoặc Lễ tân");
        return;
      }
    }
    
    const newStaff: Staff = {
      id: `S${String(staff.length + 1).padStart(3, "0")}`,
      fullName: data.fullName,
      role: data.role,
      specialty: data.role === "doctor" ? data.specialty || "Nội tổng quát" : undefined,
      todayAppointments: 0,
      email: data.email,
      phone: data.phone,
      status: data.status,
    };
    setStaff((prev) => {
      const updated = [newStaff, ...prev];
      saveStaff(updated);
      return updated;
    });
    setOpenCreate(false);
    form.reset();
    toast.success("Đã thêm nhân sự");
  };

  const onEdit = (data: z.infer<typeof staffSchema>) => {
    if (!selected) return;
    setStaff((prev) => {
      const updated = prev.map((s) =>
        s.id === selected.id
          ? {
              ...s,
              fullName: data.fullName,
              role: data.role,
              specialty: data.role === "doctor" ? data.specialty || s.specialty : undefined,
              email: data.email,
              phone: data.phone,
              status: data.status,
            }
          : s,
      );
      saveStaff(updated);
      return updated;
    });
    setOpenEdit(false);
    setSelected(null);
    toast.success("Đã cập nhật thông tin");
  };

  const onDelete = () => {
    if (!selected) return;
    setStaff((prev) => {
      const updated = prev.filter((s) => s.id !== selected.id);
      saveStaff(updated);
      return updated;
    });
    setOpenDelete(false);
    setSelected(null);
    toast.success("Đã xóa nhân sự");
  };

  const openEditWith = (s: Staff) => {
    setSelected(s);
    form.reset({
      fullName: s.fullName,
      role: s.role,
      specialty: s.specialty || "",
      email: s.email,
      phone: s.phone,
      status: s.status,
      username: "",
      password: "",
      createAccount: false, // Khi edit không tạo tài khoản mới
    });
    setOpenEdit(true);
  };

  const openPermissionWith = (s: Staff) => {
    setSelected(s);
    setPermissions({});
    setOpenPermission(true);
  };

  // Weekly schedule with hourly shifts
  type ShiftKey = "morning" | "afternoon" | "evening";
  type DayKey = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";
  type Shift = { enabled: boolean; start: string; end: string };
  type DaySchedule = Record<ShiftKey, Shift>;
  const defaultSchedule: Record<DayKey, DaySchedule> = {
    Mon: {
      morning: { enabled: true, start: "08:00", end: "11:30" },
      afternoon: { enabled: true, start: "13:30", end: "17:00" },
      evening: { enabled: false, start: "18:00", end: "20:00" },
    },
    Tue: {
      morning: { enabled: true, start: "08:00", end: "11:30" },
      afternoon: { enabled: false, start: "13:30", end: "17:00" },
      evening: { enabled: false, start: "18:00", end: "20:00" },
    },
    Wed: {
      morning: { enabled: true, start: "08:00", end: "11:30" },
      afternoon: { enabled: true, start: "13:30", end: "17:00" },
      evening: { enabled: false, start: "18:00", end: "20:00" },
    },
    Thu: {
      morning: { enabled: false, start: "08:00", end: "11:30" },
      afternoon: { enabled: true, start: "13:30", end: "17:00" },
      evening: { enabled: false, start: "18:00", end: "20:00" },
    },
    Fri: {
      morning: { enabled: true, start: "08:00", end: "11:30" },
      afternoon: { enabled: true, start: "13:30", end: "17:00" },
      evening: { enabled: false, start: "18:00", end: "20:00" },
    },
    Sat: {
      morning: { enabled: false, start: "08:00", end: "11:30" },
      afternoon: { enabled: true, start: "13:30", end: "17:00" },
      evening: { enabled: false, start: "18:00", end: "20:00" },
    },
  };
  const [schedule, setSchedule] = useState<Record<DayKey, DaySchedule>>(defaultSchedule);

  const renderForm = (onSubmit: (v: z.infer<typeof staffSchema>) => void, isCreate: boolean = false) => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Họ và tên *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="VD: BS. Nguyễn Văn A" className="border-[#E5E7EB]" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vai trò *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="border-[#E5E7EB]">
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="doctor">Bác sĩ</SelectItem>
                    <SelectItem value="receptionist">Lễ tân</SelectItem>
                    <SelectItem value="nurse">Y tá</SelectItem>
                    <SelectItem value="manager">Quản lý</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="specialty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chuyên khoa (nếu là Bác sĩ)</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="border-[#E5E7EB]">
                      <SelectValue placeholder="Chọn chuyên khoa" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {specialties.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="email@cliniccare.vn" className="border-[#E5E7EB]" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số điện thoại *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="0901234567" className="border-[#E5E7EB]" />
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
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="border-[#E5E7EB]">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Đang làm việc</SelectItem>
                  <SelectItem value="leave">Nghỉ phép</SelectItem>
                  <SelectItem value="suspended">Tạm ngưng</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Tạo tài khoản đăng nhập - Chỉ hiển thị khi tạo mới */}
        {isCreate && (
          <div className="border-t pt-4">
            <FormField
              control={form.control}
              name="createAccount"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Tạo tài khoản đăng nhập cho bác sĩ/nhân viên</FormLabel>
                    <p className="text-sm text-[#687280]">
                      Chỉ áp dụng cho Bác sĩ và Lễ tân
                    </p>
                  </div>
                </FormItem>
              )}
            />
            
            {form.watch("createAccount") && (form.watch("role") === "doctor" || form.watch("role") === "receptionist") && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên đăng nhập *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="VD: bs.nguyenvana" className="border-[#E5E7EB]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu *</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" placeholder="Tối thiểu 6 ký tự" className="border-[#E5E7EB]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>
        )}
        
        <DialogFooter>
          <Button type="submit" className="bg-[#007BFF] hover:bg-[#0056B3]">
            Lưu
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header Tools */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#687280]" />
              <Input
                placeholder="Tìm theo tên, mã, chuyên khoa, vai trò..."
                className="pl-10 border-[#E5E7EB]"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={viewMode === "table" ? "default" : "outline"} onClick={() => setViewMode("table")}>
              Bảng
            </Button>
            <Button variant={viewMode === "card" ? "default" : "outline"} onClick={() => setViewMode("card")}>
              Card
            </Button>
            <Button variant="outline" className="border-[#E5E7EB]" onClick={() => {
              setStaff(initialStaff);
              saveStaff(initialStaff);
            }}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Làm mới
            </Button>
            <Button variant="outline" className="border-[#E5E7EB]" onClick={exportCSV}>Xuất CSV</Button>
            <Button variant="outline" className="border-[#E5E7EB]" onClick={printPDF}>Xuất PDF</Button>
            <Button className="bg-[#007BFF] hover:bg-[#0056B3]" onClick={() => setOpenCreate(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Thêm nhân sự
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-[#E5E7EB]">
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
            <Select value={filterRole} onValueChange={(v) => setFilterRole(v as StaffRole | "all")}> 
              <SelectTrigger className="border-[#E5E7EB]"><SelectValue placeholder="Vai trò" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                <SelectItem value="doctor">Bác sĩ</SelectItem>
                <SelectItem value="receptionist">Lễ tân</SelectItem>
                <SelectItem value="nurse">Y tá</SelectItem>
                <SelectItem value="manager">Quản lý</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSpecialty} onValueChange={(v) => setFilterSpecialty(v as string | "all")}> 
              <SelectTrigger className="border-[#E5E7EB]"><SelectValue placeholder="Chuyên khoa" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả chuyên khoa</SelectItem>
                {specialties.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as StaffStatus | "all")}> 
              <SelectTrigger className="border-[#E5E7EB]"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Đang làm việc</SelectItem>
                <SelectItem value="leave">Nghỉ phép</SelectItem>
                <SelectItem value="suspended">Tạm ngưng</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-[#E5E7EB]" onClick={resetFilters}>Xóa lọc</Button>
          </CardContent>
        </Card>

        {/* Table/Card View */}
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle>Danh sách bác sĩ & nhân viên</CardTitle>
          </CardHeader>
          <CardContent>
            {viewMode === "table" ? (
              <div ref={printRef} className="w-full overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Ảnh</th>
                      <th className="text-left py-3 px-2">Họ tên</th>
                      <th className="text-left py-3 px-2">Vai trò</th>
                      <th className="text-left py-3 px-2">Chuyên khoa</th>
                      <th className="text-left py-3 px-2">Số lịch hôm nay</th>
                      <th className="text-left py-3 px-2">Trạng thái</th>
                      <th className="text-left py-3 px-2">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s) => (
                      <tr key={s.id} className="border-b hover:bg-[#F9FAFB]">
                        <td className="py-3 px-2">
                          <div className="h-9 w-9 rounded-full bg-[#007BFF]/10 flex items-center justify-center text-[#007BFF] font-semibold">
                            {s.fullName.split(" ").pop()?.[0]}
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="font-medium text-gray-900">{s.fullName}</div>
                          <div className="text-xs text-[#687280]">{s.email}</div>
                        </td>
                        <td className="py-3 px-2">
                          {s.role === "doctor" ? "Bác sĩ" : s.role === "receptionist" ? "Lễ tân" : s.role === "nurse" ? "Y tá" : "Quản lý"}
                        </td>
                        <td className="py-3 px-2">{s.specialty || "-"}</td>
                        <td className="py-3 px-2">{s.todayAppointments}</td>
                        <td className="py-3 px-2">{statusPill(s.status)}</td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => { setSelected(s); setOpenPreview(true); }}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openEditWith(s)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openPermissionWith(s)}>
                              <ShieldCheck className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => { setSelected(s); setOpenSchedule(true); }}>
                              <CalendarDays className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-600" onClick={() => { setSelected(s); setOpenDelete(true);} }>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((s) => (
                  <Card key={s.id} className="border-[#E5E7EB]">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-[#007BFF]/10 flex items-center justify-center text-[#007BFF] font-semibold">
                          {s.fullName.split(" ").pop()?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 truncate">{s.fullName}</div>
                          <div className="text-xs text-[#687280] truncate">{s.email}</div>
                        </div>
                        {statusPill(s.status)}
                      </div>
                      <div className="mt-3 text-sm text-[#687280] flex items-center gap-4">
                        <span className="flex items-center gap-1"><Stethoscope className="h-4 w-4" />{s.role === "doctor" ? s.specialty || "Bác sĩ" : s.role === "receptionist" ? "Lễ tân" : s.role === "nurse" ? "Y tá" : "Quản lý"}</span>
                        <span className="flex items-center gap-1"><Users className="h-4 w-4" />{s.todayAppointments}</span>
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setSelected(s); setOpenPreview(true); }}>Xem</Button>
                        <Button variant="outline" size="sm" onClick={() => openEditWith(s)}>Sửa</Button>
                        <Button variant="outline" size="sm" onClick={() => openPermissionWith(s)}>Phân quyền</Button>
                        <Button variant="outline" size="sm" onClick={() => { setSelected(s); setOpenSchedule(true); }}>Lịch</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview Panel */}
      <Sheet open={openPreview} onOpenChange={setOpenPreview}>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Thông tin chi tiết</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="space-y-5 py-2">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-[#007BFF]/10 flex items-center justify-center text-[#007BFF] font-semibold">
                  {selected.fullName.split(" ").pop()?.[0]}
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900">{selected.fullName}</div>
                  <div className="text-sm text-[#687280]">{selected.email} • {selected.phone}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-[#687280]">Vai trò</div>
                  <div className="font-medium">
                    {selected.role === "doctor" ? "Bác sĩ" : selected.role === "receptionist" ? "Lễ tân" : selected.role === "nurse" ? "Y tá" : "Quản lý"}
                  </div>
                </div>
                <div>
                  <div className="text-[#687280]">Trạng thái</div>
                  <div>{statusPill(selected.status)}</div>
                </div>
                <div>
                  <div className="text-[#687280]">Chuyên khoa</div>
                  <div className="font-medium">{selected.specialty || "-"}</div>
                </div>
                <div>
                  <div className="text-[#687280]">Lịch hôm nay</div>
                  <div className="font-medium">{selected.todayAppointments}</div>
                </div>
                <div>
                  <div className="text-[#687280]">Bằng cấp</div>
                  <div className="font-medium">{selected.degree || "-"}</div>
                </div>
                <div>
                  <div className="text-[#687280]">Kinh nghiệm</div>
                  <div className="font-medium">{selected.experienceYears ? `${selected.experienceYears} năm` : "-"}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setOpenPreview(false); openEditWith(selected); }}>
                  <Edit className="h-4 w-4 mr-2" /> Cập nhật
                </Button>
                <Button variant="outline" onClick={() => openPermissionWith(selected)}>
                  <ShieldCheck className="h-4 w-4 mr-2" /> Phân quyền
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Create Dialog */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thêm bác sĩ / nhân viên</DialogTitle>
            <DialogDescription>Nhập thông tin cơ bản của nhân sự</DialogDescription>
          </DialogHeader>
          {renderForm(onCreate, true)}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cập nhật thông tin</DialogTitle>
            <DialogDescription>{selected?.fullName}</DialogDescription>
          </DialogHeader>
          {renderForm(onEdit, false)}
        </DialogContent>
      </Dialog>

      {/* Permission Dialog */}
      <Dialog open={openPermission} onOpenChange={setOpenPermission}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Phân quyền người dùng</DialogTitle>
            <DialogDescription>{selected?.fullName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {permissionKeys.map((p) => (
              <label key={p.key} className="flex items-center gap-3 text-sm">
                <Checkbox
                  checked={!!permissions[p.key]}
                  onCheckedChange={(v) => setPermissions((prev) => ({ ...prev, [p.key]: !!v }))}
                />
                {p.label}
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => { setOpenPermission(false); toast.success("Đã lưu phân quyền"); }} className="bg-[#007BFF] hover:bg-[#0056B3]">
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Dialog - hourly shifts + timeline */}
      <Dialog open={openSchedule} onOpenChange={setOpenSchedule}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lịch làm việc {selected ? `- ${selected.fullName}` : ""}</DialogTitle>
            <DialogDescription>Thiết lập ca trực trong tuần</DialogDescription>
          </DialogHeader>
          <div className="overflow-auto space-y-6">
            <div className="rounded-md border border-[#E5E7EB]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Thứ</th>
                    <th className="text-left py-2 px-2">Sáng</th>
                    <th className="text-left py-2 px-2">Chiều</th>
                    <th className="text-left py-2 px-2">Tối</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(schedule).map(([day, ses]) => (
                    <tr key={day} className="border-b">
                      <td className="py-2 px-2">{day}</td>
                      {(["morning","afternoon","evening"] as ("morning"|"afternoon"|"evening")[]).map((k) => (
                        <td key={k} className="py-2 px-2">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={ses[k].enabled}
                              onCheckedChange={(v) =>
                                setSchedule((prev) => ({
                                  ...prev,
                                  [day]: { ...prev[day], [k]: { ...prev[day][k], enabled: !!v } },
                                }))
                              }
                            />
                            <Input
                              type="time"
                              value={ses[k].start}
                              onChange={(e) =>
                                setSchedule((prev) => ({
                                  ...prev,
                                  [day]: { ...prev[day], [k]: { ...prev[day][k], start: e.target.value } },
                                }))
                              }
                              className="h-8 w-24"
                            />
                            <span>—</span>
                            <Input
                              type="time"
                              value={ses[k].end}
                              onChange={(e) =>
                                setSchedule((prev) => ({
                                  ...prev,
                                  [day]: { ...prev[day], [k]: { ...prev[day][k], end: e.target.value } },
                                }))
                              }
                              className="h-8 w-24"
                            />
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Xem trước timeline (08:00–20:00)</div>
              <div className="space-y-2">
                {(Object.keys(schedule) as ("Mon"|"Tue"|"Wed"|"Thu"|"Fri"|"Sat")[]).map((day) => (
                  <div key={day} className="flex items-center gap-3">
                    <div className="w-10 text-xs text-[#687280]">{day}</div>
                    <div className="relative flex-1 h-6 rounded bg-[#F3F4F6]">
                      {(["morning","afternoon","evening"] as ("morning"|"afternoon"|"evening")[]).map((k) => {
                        const sh = schedule[day][k];
                        if (!sh.enabled) return null;
                        const toMinutes = (t: string) => { const [hh, mm] = t.split(":").map((x) => parseInt(x)); return hh * 60 + mm; };
                        const start = Math.max(480, toMinutes(sh.start));
                        const end = Math.min(1200, toMinutes(sh.end));
                        const left = ((start - 480) / (1200 - 480)) * 100;
                        const width = Math.max(0, ((end - start) / (1200 - 480)) * 100);
                        const color = k === "morning" ? "#60a5fa" : k === "afternoon" ? "#34d399" : "#f59e0b";
                        return (
                          <div key={k} style={{ left: `${left}%`, width: `${width}%`, background: color }} className="absolute h-6 rounded" title={`${sh.start} - ${sh.end}`} />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setOpenSchedule(false);
                toast.success("Đã lưu lịch làm việc");
              }}
              className="bg-[#007BFF] hover:bg-[#0056B3]"
            >
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa nhân sự</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa {selected?.fullName}? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={onDelete}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Doctors;
