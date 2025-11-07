import { useEffect, useMemo, useRef, useState } from "react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  UserRound,
  UserPlus,
  Search,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Stethoscope,
  CalendarDays,
  Upload,
  Download,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, AreaChart, Area } from "recharts";
import { uploadAttachment } from "@/lib/api";
import { CLINIC_NAME } from "@/lib/config";

// Types
export type PatientStatus = "treating" | "completed" | "pending";

interface Patient {
  id: string;
  fullName: string;
  gender: "male" | "female";
  age: number;
  phone: string;
  doctor: string;
  lastVisit: string; // ISO date
  status: PatientStatus;
}

// Mock data
const initialPatients: Patient[] = [
  {
    id: "P001",
    fullName: "Nguyễn Thị Mai",
    gender: "female",
    age: 32,
    phone: "0908123456",
    doctor: "BS. Lan",
    lastVisit: "2025-10-25",
    status: "treating",
  },
  {
    id: "P002",
    fullName: "Trần Văn A",
    gender: "male",
    age: 45,
    phone: "0912345678",
    doctor: "BS. Hùng",
    lastVisit: "2025-10-27",
    status: "completed",
  },
];

const patientSchema = z.object({
  fullName: z.string().min(2, "Họ tên tối thiểu 2 ký tự"),
  gender: z.enum(["male", "female"]),
  age: z.coerce.number().min(0).max(120),
  phone: z
    .string()
    .min(10, "Số điện thoại không hợp lệ")
    .regex(/^(0|\+84)[0-9]{9,10}$/, "Số điện thoại không đúng định dạng"),
  doctor: z.string().min(1, "Vui lòng nhập bác sĩ phụ trách"),
  lastVisit: z.string().min(1, "Vui lòng nhập ngày khám gần nhất"),
  status: z.enum(["treating", "completed", "pending"]).default("treating"),
});

type PatientFormValues = z.infer<typeof patientSchema>;

const PATIENTS_STORAGE_KEY = "cliniccare:patients";
const STAFF_STORAGE_KEY = "cliniccare:staff";

// Load patients from localStorage or use initial data
const loadPatients = (): Patient[] => {
  try {
    const stored = localStorage.getItem(PATIENTS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialPatients;
    }
  } catch {
    // Fallback to initial data if parse fails
  }
  return initialPatients;
};

// Load doctors from staff storage (for dropdown)
interface Staff {
  id: string;
  fullName: string;
  role: "doctor" | "receptionist" | "nurse" | "manager";
  status: "active" | "leave" | "suspended";
}

const loadDoctorsForPatients = (): Array<{ id: string; name: string }> => {
  try {
    const stored = localStorage.getItem(STAFF_STORAGE_KEY);
    if (stored) {
      const staff: Staff[] = JSON.parse(stored);
      return staff
        .filter((s) => s.role === "doctor" && s.status === "active")
        .map((s) => ({ id: s.id, name: s.fullName }));
    }
  } catch {
    // Fallback to empty array
  }
  return [];
};

// Save patients to localStorage
const savePatients = (patients: Patient[]) => {
  try {
    localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(patients));
  } catch {
    // Ignore storage errors
  }
};

const Patients = () => {
  const [patients, setPatients] = useState<Patient[]>(() => loadPatients());
  const [availableDoctors, setAvailableDoctors] = useState<Array<{ id: string; name: string }>>(() => loadDoctorsForPatients());
  const [query, setQuery] = useState("");
  const [filterGender, setFilterGender] = useState<"all" | "male" | "female">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | PatientStatus>("all");
  const [filterDoctor, setFilterDoctor] = useState<string | "all">("all");

  // Listen for staff changes to update doctor list
  useEffect(() => {
    const handleStaffUpdate = () => {
      setAvailableDoctors(loadDoctorsForPatients());
    };
    window.addEventListener("staffUpdated", handleStaffUpdate);
    window.addEventListener("storage", handleStaffUpdate);
    return () => {
      window.removeEventListener("staffUpdated", handleStaffUpdate);
      window.removeEventListener("storage", handleStaffUpdate);
    };
  }, []);

  // Listen for new patient registration
  useEffect(() => {
    const handlePatientRegistered = () => {
      // Reload patients from storage when a new patient is registered
      const updatedPatients = loadPatients();
      setPatients(updatedPatients);
      toast.info("Có bệnh nhân mới đăng ký");
    };
    
    window.addEventListener("patientRegistered", handlePatientRegistered);
    // Also listen to storage changes (in case user registers in another tab)
    window.addEventListener("storage", (e) => {
      if (e.key === "cliniccare:patients") {
        const updatedPatients = loadPatients();
        setPatients(updatedPatients);
      }
    });
    
    return () => {
      window.removeEventListener("patientRegistered", handlePatientRegistered);
    };
  }, []);

  const [selected, setSelected] = useState<Patient | null>(null);
  const [openPreview, setOpenPreview] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [attachments, setAttachments] = useState<{ name: string; url: string; type: string }[]>([]);
  const [previewFile, setPreviewFile] = useState<{ url: string; type: string } | null>(null);
  const [ehrOpen, setEhrOpen] = useState(false);
  const [ehrData, setEhrData] = useState<any | null>(null);

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      fullName: "",
      gender: "female",
      age: 30,
      phone: "",
      doctor: "",
      lastVisit: new Date().toISOString().slice(0, 10),
      status: "treating",
    },
  });

  // Advanced table states
  const [sortKey, setSortKey] = useState<keyof Patient | "lastVisit">("lastVisit");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [visible, setVisible] = useState<Record<string, boolean>>({
    avatar: true,
    fullName: true,
    gender: true,
    age: true,
    phone: true,
    doctor: true,
    lastVisit: true,
    status: true,
    actions: true,
  });

  const filtered = useMemo(() => {
    return patients.filter((p) => {
      const q = query.trim().toLowerCase();
      const byQ =
        !q ||
        p.fullName.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.phone.includes(q);
      const byG = filterGender === "all" || p.gender === filterGender;
      const byS = filterStatus === "all" || p.status === filterStatus;
      const byD = filterDoctor === "all" || p.doctor === filterDoctor;
      return byQ && byG && byS && byD;
    });
  }, [patients, query, filterGender, filterStatus, filterDoctor]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let va: any = a[sortKey as keyof Patient];
      let vb: any = b[sortKey as keyof Patient];
      if (sortKey === "lastVisit") {
        va = new Date(a.lastVisit).getTime();
        vb = new Date(b.lastVisit).getTime();
      }
      if (typeof va === "string") va = va.toString().toLowerCase();
      if (typeof vb === "string") vb = vb.toString().toLowerCase();
      const cmp = va > vb ? 1 : va < vb ? -1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  const toggleSort = (key: keyof Patient | "lastVisit") => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const printRef = useRef<HTMLDivElement | null>(null);

  const exportCSV = () => {
    const cols = [
      ["ID", "Họ tên", "Giới tính", "Tuổi", "SĐT", "Bác sĩ", "Lần khám", "Trạng thái"],
      ...sorted.map((p) => [
        p.id,
        p.fullName,
        p.gender === "female" ? "Nữ" : "Nam",
        String(p.age),
        p.phone,
        p.doctor,
        new Date(p.lastVisit).toLocaleDateString("vi-VN"),
        p.status,
      ]),
    ];
    const csv = cols.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `patients_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Đã xuất CSV");
  };

  const exportPDF = () => {
    const html = printRef.current?.innerHTML || "";
    const w = window.open("", "_blank", "width=1024,height=768");
    if (!w) return;
    w.document.open();
    w.document.write(`<!doctype html><html><head><title>${CLINIC_NAME} - Patients</title>
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
        /* Watermark */
        @media print {
          .wm:after{
            content:"${CLINIC_NAME}";
            position:fixed; top:40%; left:50%; transform:translate(-50%,-50%) rotate(-30deg);
            font-size:72px; color:rgba(0,0,0,.06); letter-spacing:4px; white-space:nowrap;
            z-index:0; pointer-events:none;
          }
          .content{position:relative; z-index:1}
        }
      </style>
    </head><body class="wm">
      <div class="brand"><div class="logo">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
      </div><div><h1>${CLINIC_NAME} - Danh sách Bệnh nhân</h1><div class="muted">Ngày in: ${new Date().toLocaleString('vi-VN')}</div></div></div>
      <div class="content">${html}</div>
    </body></html>`);
    w.document.close();
    w.focus();
    w.print();
  };

  const printAttachmentWithWatermark = (file: { url: string; type: string }) => {
    const w = window.open("", "_blank", "width=1024,height=768");
    if (!w) return;
    const isPdf = file.type.includes("pdf");
    w.document.open();
    w.document.write(`<!doctype html><html><head><title>${CLINIC_NAME} - Attachment</title>
      <style>
        body,html{height:100%; margin:0}
        .brand{position:fixed; top:16px; left:16px; display:flex; align-items:center; gap:8px; font-family:Inter,system-ui,sans-serif}
        .logo{display:inline-flex; width:28px; height:28px; border-radius:6px; background:#007BFF; align-items:center; justify-content:center; color:#fff}
        @media print{ .wm:after{content:'${CLINIC_NAME}'; position:fixed; top:50%; left:50%; transform:translate(-50%,-50%) rotate(-30deg); font-size:80px; color:rgba(0,0,0,.06); z-index:0}}
        .content{position:relative; z-index:1; height:100%}
        iframe,img{width:100%; height:100%; border:0}
      </style>
    </head><body class="wm">
      <div class="brand"><div class="logo">C</div><div>${CLINIC_NAME}</div></div>
      <div class="content">${isPdf ? `<iframe src='${file.url}'></iframe>` : `<img src='${file.url}' />`}</div>
    </body></html>`);
    w.document.close();
    w.focus();
    w.print();
  };

  const printPrescription = (pr: { date: string; drugs: Array<{ name: string; dose: string }> }) => {
    if (!selected) return;
    const w = window.open("", "_blank", "width=1024,height=768");
    if (!w) return;
    const rows = pr.drugs
      .map((d) => `<tr><td style='padding:6px;border:1px solid #e5e7eb'>${d.name}</td><td style='padding:6px;border:1px solid #e5e7eb'>${d.dose}</td></tr>`) 
      .join("");
    w.document.open();
    w.document.write(`<!doctype html><html><head><title>${CLINIC_NAME} - Prescription</title>
      <style>
        body{font-family: Inter,system-ui,sans-serif; padding:24px}
        .brand{display:flex; align-items:center; gap:10px; margin-bottom:16px}
        .logo{display:inline-flex; width:36px; height:36px; border-radius:8px; background:#007BFF; align-items:center; justify-content:center; color:#fff}
        table{width:100%; border-collapse:collapse; margin-top:8px}
        th{background:#f9fafb}
        th,td{font-size:13px}
        @media print { .wm:after{content:'${CLINIC_NAME}'; position:fixed; top:50%; left:50%; transform:translate(-50%,-50%) rotate(-30deg); font-size:80px; color:rgba(0,0,0,.06); z-index:0} .content{position:relative; z-index:1} }
      </style>
    </head><body class='wm'>
      <div class='brand'><div class='logo'>Rx</div><div><div style='font-weight:600'>${CLINIC_NAME}</div><div style='color:#687280;font-size:12px'>ĐƠN THUỐC</div></div></div>
      <div class='content'>
        <div style='font-size:13px;margin-bottom:8px'>
          Bệnh nhân: <b>${selected.fullName}</b> • Giới tính: ${selected.gender === 'female' ? 'Nữ' : 'Nam'} • Tuổi: ${selected.age}<br/>
          Bác sĩ phụ trách: ${selected.doctor} • Ngày kê: ${new Date(pr.date).toLocaleDateString('vi-VN')}
        </div>
        <table>
          <thead><tr><th style='text-align:left;padding:6px;border:1px solid #e5e7eb'>Thuốc</th><th style='text-align:left;padding:6px;border:1px solid #e5e7eb'>Liều dùng</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div style='display:flex;justify-content:space-between;margin-top:32px;font-size:13px'>
          <div>
            <div><b>Hướng dẫn:</b></div>
            <div>- Uống đúng liều, đúng giờ. Nếu có phản ứng lạ, liên hệ ngay bác sĩ.</div>
          </div>
          <div style='text-align:center'>
            <div>Chữ ký bác sĩ</div>
            <div style='height:60px'></div>
            <div>_____________________</div>
          </div>
        </div>
      </div>
    </body></html>`);
    w.document.close();
    w.focus();
    w.print();
  };

  const resetFilters = () => {
    setQuery("");
    setFilterGender("all");
    setFilterStatus("all");
    setFilterDoctor("all");
  };

  const statusPill = (status: PatientStatus) => {
    if (status === "treating") return <Badge className="bg-[#16a34a]/10 text-[#16a34a] border-0">Đang điều trị</Badge>;
    if (status === "pending") return <Badge className="bg-[#f59e0b]/10 text-[#f59e0b] border-0">Chờ xác nhận</Badge>;
    return <Badge className="bg-blue-50 text-blue-600 border-0">Hoàn thành</Badge>;
  };

  const onCreate = (data: PatientFormValues) => {
    const newPatient: Patient = {
      id: `P${String(patients.length + 1).padStart(3, "0")}`,
      fullName: data.fullName,
      gender: data.gender,
      age: data.age,
      phone: data.phone,
      doctor: data.doctor,
      lastVisit: data.lastVisit,
      status: data.status,
    };
    setPatients((prev) => {
      const updated = [newPatient, ...prev];
      savePatients(updated);
      return updated;
    });
    setOpenCreate(false);
    form.reset();
    toast.success("Đã thêm bệnh nhân");
  };

  const onEdit = (data: PatientFormValues) => {
    if (!selected) return;
    setPatients((prev) => {
      const updated = prev.map((p) =>
        p.id === selected.id
          ? { ...p, ...data }
          : p,
      );
      savePatients(updated);
      return updated;
    });
    setOpenEdit(false);
    setSelected(null);
    toast.success("Đã cập nhật bệnh nhân");
  };

  const onDelete = () => {
    if (!selected) return;
    setPatients((prev) => {
      const updated = prev.filter((p) => p.id !== selected.id);
      savePatients(updated);
      return updated;
    });
    setOpenDelete(false);
    setSelected(null);
    toast.success("Đã xóa bệnh nhân");
  };

  const openEditWith = (p: Patient) => {
    setSelected(p);
    form.reset({
      fullName: p.fullName,
      gender: p.gender,
      age: p.age,
      phone: p.phone,
      doctor: p.doctor,
      lastVisit: p.lastVisit,
      status: p.status,
    });
    setOpenEdit(true);
  };

  const renderForm = (onSubmit: (v: PatientFormValues) => void) => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Họ và tên *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="VD: Nguyễn Văn A" className="border-[#E5E7EB]" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giới tính *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="border-[#E5E7EB]"><SelectValue placeholder="Chọn giới tính" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Nam</SelectItem>
                    <SelectItem value="female">Nữ</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tuổi *</FormLabel>
                <FormControl>
                  <Input type="number" {...field} className="border-[#E5E7EB]" />
                </FormControl>
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
                  <Input {...field} placeholder="0901xxxxxx" className="border-[#E5E7EB]" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="doctor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bác sĩ phụ trách *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="border-[#E5E7EB]">
                      <SelectValue placeholder="Chọn bác sĩ" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableDoctors.length > 0 ? (
                      availableDoctors.map((doc) => (
                        <SelectItem key={doc.id} value={doc.name}>
                          {doc.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>Chưa có bác sĩ nào</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastVisit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lần khám gần nhất *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="border-[#E5E7EB]" />
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
                  <SelectTrigger className="border-[#E5E7EB]"><SelectValue placeholder="Chọn trạng thái" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="treating">Đang điều trị</SelectItem>
                  <SelectItem value="pending">Chờ xác nhận</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit" className="bg-[#007BFF] hover:bg-[#0056B3]">Lưu</Button>
        </DialogFooter>
      </form>
    </Form>
  );

  // Stats mock
  const totalTreating = patients.filter((p) => p.status === "treating").length;
  const newInWeek = 5;
  const todayAppointments = 12;
  const pieData = [
    { name: "Đang điều trị", value: patients.filter((p) => p.status === "treating").length, color: "#22c55e" },
    { name: "Hoàn thành", value: patients.filter((p) => p.status === "completed").length, color: "#3b82f6" },
    { name: "Chờ xác nhận", value: patients.filter((p) => p.status === "pending").length, color: "#f59e0b" },
  ];
  const barData = [
    { name: "1", value: 20 },
    { name: "2", value: 26 },
    { name: "3", value: 22 },
    { name: "4", value: 30 },
    { name: "5", value: 28 },
    { name: "6", value: 34 },
    { name: "7", value: 31 },
    { name: "8", value: 25 },
    { name: "9", value: 35 },
    { name: "10", value: 38 },
    { name: "11", value: 32 },
    { name: "12", value: 40 },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header tools */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#687280]" />
              <Input
                placeholder="Tìm theo tên, số điện thoại, mã hồ sơ..."
                className="pl-10 border-[#E5E7EB]"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-[#E5E7EB]" onClick={() => {
              setPatients(initialPatients);
              savePatients(initialPatients);
            }}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Làm mới
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-[#E5E7EB]">Cột hiển thị</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {Object.keys(visible).map((k) => (
                  <DropdownMenuCheckboxItem key={k} checked={visible[k]} onCheckedChange={(v) => setVisible((p) => ({ ...p, [k]: !!v }))}>
                    {k}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" className="border-[#E5E7EB]" onClick={exportCSV}>Xuất CSV</Button>
            <Button variant="outline" className="border-[#E5E7EB]" onClick={exportPDF}>Xuất PDF</Button>
            <Button className="bg-[#007BFF] hover:bg-[#0056B3]" onClick={() => setOpenCreate(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Thêm bệnh nhân
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-[#E5E7EB]">
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
            <Select value={filterGender} onValueChange={(v) => setFilterGender(v as any)}>
              <SelectTrigger className="border-[#E5E7EB]"><SelectValue placeholder="Giới tính" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="male">Nam</SelectItem>
                <SelectItem value="female">Nữ</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
              <SelectTrigger className="border-[#E5E7EB]"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="treating">Đang điều trị</SelectItem>
                <SelectItem value="pending">Chờ xác nhận</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterDoctor} onValueChange={(v) => setFilterDoctor(v as string | "all")}>
              <SelectTrigger className="border-[#E5E7EB]">
                <SelectValue placeholder="Bác sĩ phụ trách" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả bác sĩ</SelectItem>
                {availableDoctors.map((doc) => (
                  <SelectItem key={doc.id} value={doc.name}>
                    {doc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-[#E5E7EB]" onClick={resetFilters}>Xóa lọc</Button>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-[#E5E7EB]"><CardContent className="p-4"><div className="text-sm text-[#687280]">Đang điều trị</div><div className="text-2xl font-bold text-gray-900">{totalTreating}</div></CardContent></Card>
          <Card className="border-[#E5E7EB]"><CardContent className="p-4"><div className="text-sm text-[#687280]">Bệnh nhân mới (tuần)</div><div className="text-2xl font-bold text-gray-900">{newInWeek}</div></CardContent></Card>
          <Card className="border-[#E5E7EB]"><CardContent className="p-4"><div className="text-sm text-[#687280]">Lịch hẹn hôm nay</div><div className="text-2xl font-bold text-gray-900">{todayAppointments}</div></CardContent></Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-[#E5E7EB]">
            <CardHeader><CardTitle>Bệnh nhân mới theo tháng</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#687280" />
                  <YAxis stroke="#687280" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#007BFF" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="border-[#E5E7EB]">
            <CardHeader><CardTitle>Tỷ lệ trạng thái</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" outerRadius={80} innerRadius={40} label>
                    {pieData.map((e, i) => (<Cell key={i} fill={e.color} />))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card className="border-[#E5E7EB]">
          <CardHeader><CardTitle>Danh sách bệnh nhân</CardTitle></CardHeader>
          <CardContent>
            <div className="w-full overflow-auto" ref={printRef}>
              <div className="flex items-center justify-between pb-3">
                <div className="text-sm text-[#687280]">Tổng: {sorted.length}</div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#687280]">Trang:</span>
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>←</Button>
                  <span>{page}/{totalPages}</span>
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>→</Button>
                  <span className="ml-3 text-[#687280]">Hiển thị:</span>
                  <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(parseInt(v)); setPage(1); }}>
                    <SelectTrigger className="h-8 w-24 border-[#E5E7EB]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {visible.avatar && <th className="text-left py-3 px-2">Ảnh</th>}
                    {visible.fullName && <th className="text-left py-3 px-2 cursor-pointer" onClick={() => toggleSort("fullName")}>Họ tên {sortKey==='fullName' ? (sortDir==='asc'?'↑':'↓'):''}</th>}
                    {visible.gender && <th className="text-left py-3 px-2">Giới tính</th>}
                    {visible.age && <th className="text-left py-3 px-2 cursor-pointer" onClick={() => toggleSort("age")}>Tuổi {sortKey==='age' ? (sortDir==='asc'?'↑':'↓'):''}</th>}
                    {visible.phone && <th className="text-left py-3 px-2">SĐT</th>}
                    {visible.doctor && <th className="text-left py-3 px-2">Bác sĩ phụ trách</th>}
                    {visible.lastVisit && <th className="text-left py-3 px-2 cursor-pointer" onClick={() => toggleSort("lastVisit")}>Lần khám gần nhất {sortKey==='lastVisit' ? (sortDir==='asc'?'↑':'↓'):''}</th>}
                    {visible.status && <th className="text-left py-3 px-2">Trạng thái</th>}
                    {visible.actions && <th className="text-left py-3 px-2">Hành động</th>}
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((p) => (
                    <tr key={p.id} className="border-b hover:bg-[#F9FAFB]">
                      {visible.avatar && <td className="py-3 px-2">
                        <div className={`h-9 w-9 rounded-full flex items-center justify-center text-white ${p.gender === "female" ? "bg-pink-500" : "bg-blue-500"}`}>
                          {p.fullName.split(" ").pop()?.[0]}
                        </div>
                      </td>}
                      {visible.fullName && <td className="py-3 px-2">
                        <div className="font-medium text-gray-900">{p.fullName}</div>
                        <div className="text-xs text-[#687280]">#{p.id}</div>
                      </td>}
                      {visible.gender && <td className="py-3 px-2">{p.gender === "female" ? "Nữ" : "Nam"}</td>}
                      {visible.age && <td className="py-3 px-2">{p.age}</td>}
                      {visible.phone && <td className="py-3 px-2">{p.phone}</td>}
                      {visible.doctor && <td className="py-3 px-2">{p.doctor}</td>}
                      {visible.lastVisit && <td className="py-3 px-2">{new Date(p.lastVisit).toLocaleDateString("vi-VN")}</td>}
                      {visible.status && <td className="py-3 px-2">{statusPill(p.status)}</td>}
                      {visible.actions && <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => { setSelected(p); setOpenPreview(true); }}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditWith(p)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-red-600" onClick={() => { setSelected(p); setOpenDelete(true); }}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Dialog */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thêm bệnh nhân</DialogTitle>
            <DialogDescription>Nhập thông tin cơ bản của bệnh nhân</DialogDescription>
          </DialogHeader>
          {renderForm(onCreate)}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cập nhật bệnh nhân</DialogTitle>
            <DialogDescription>{selected?.fullName}</DialogDescription>
          </DialogHeader>
          {renderForm(onEdit)}
        </DialogContent>
      </Dialog>

      {/* Preview Panel */}
      <Sheet open={openPreview} onOpenChange={setOpenPreview}>
        <SheetContent side="right" className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Hồ sơ bệnh nhân</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white ${selected.gender === "female" ? "bg-pink-500" : "bg-blue-500"}`}>
                  {selected.fullName.split(" ").pop()?.[0]}
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900">{selected.fullName}</div>
                  <div className="text-sm text-[#687280]">#{selected.id} • {selected.phone}</div>
                </div>
              </div>

              <Tabs defaultValue="overview">
                <TabsList className="grid grid-cols-4">
                  <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                  <TabsTrigger value="visits">Lịch sử khám</TabsTrigger>
                  <TabsTrigger value="prescriptions">Đơn thuốc</TabsTrigger>
                  <TabsTrigger value="upcoming">Lịch hẹn & Tệp</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-[#687280]">Giới tính</div>
                      <div className="font-medium">{selected.gender === "female" ? "Nữ" : "Nam"}</div>
                    </div>
                    <div>
                      <div className="text-[#687280]">Tuổi</div>
                      <div className="font-medium">{selected.age}</div>
                    </div>
                    <div>
                      <div className="text-[#687280]">Bác sĩ phụ trách</div>
                      <div className="font-medium">{selected.doctor}</div>
                    </div>
                    <div>
                      <div className="text-[#687280]">Lần khám gần nhất</div>
                      <div className="font-medium">{new Date(selected.lastVisit).toLocaleDateString("vi-VN")}</div>
                    </div>
                    <div>
                      <div className="text-[#687280]">Trạng thái</div>
                      <div>{statusPill(selected.status)}</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="visits" className="mt-4">
                  <div className="space-y-3">
                    {([
                      {
                        date: "2025-10-27",
                        doctor: "BS. Hùng",
                        diagnosis: "Viêm họng cấp",
                        notes: "Cho thuốc kháng viêm",
                        vitals: { bpSys: 120, bpDia: 78, hr: 78, weight: 62, height: 1.65, bmi: 22.8 },
                        labs: [
                          { name: "CRP", result: 4.2, unit: "mg/L", ref: "0-5", status: "bt" },
                          { name: "WBC", result: 9.8, unit: "10^9/L", ref: "4-11", status: "bt" },
                        ],
                        images: [],
                        conclusion: "Theo dõi thêm 3 ngày",
                      },
                      {
                        date: "2025-10-25",
                        doctor: "BS. Lan",
                        diagnosis: "Khám tổng quát",
                        notes: "Sức khỏe ổn",
                        vitals: { bpSys: 118, bpDia: 76, hr: 75, weight: 61.5, height: 1.65, bmi: 22.6 },
                        labs: [{ name: "Glucose", result: 5.1, unit: "mmol/L", ref: "3.9-6.1", status: "bt" }],
                        images: [],
                        conclusion: "Hẹn tái khám 6 tháng",
                      },
                    ]).map((v, i) => (
                      <div key={i} className="p-3 rounded-lg border border-[#E5E7EB]">
                        <div className="text-sm font-medium text-gray-900">{new Date(v.date).toLocaleDateString("vi-VN")} • {v.doctor}</div>
                        <div className="text-sm text-[#687280]">Chẩn đoán: {v.diagnosis}</div>
                        <div className="text-sm text-[#687280]">Ghi chú: {v.notes}</div>
                        <div className="pt-2"><Button variant="outline" size="sm" onClick={() => { setEhrData(v); setEhrOpen(true); }}>Xem chi tiết</Button></div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="prescriptions" className="mt-4">
                  <div className="space-y-3">
                    {[{ date: "2025-10-27", drugs: [{ name: "Paracetamol 500mg", dose: "1 viên x 3 lần/ngày" }, { name: "Vitamin C", dose: "1 viên/ngày" }] }].map((pr, idx) => (
                      <div key={idx} className="p-3 rounded-lg border border-[#E5E7EB]">
                        <div className="text-sm font-medium text-gray-900">Đơn ngày {new Date(pr.date).toLocaleDateString("vi-VN")}</div>
                        <ul className="mt-2 list-disc pl-5 text-sm text-[#687280]">
                          {pr.drugs.map((d, i) => (<li key={i}>{d.name} — {d.dose}</li>))}
                        </ul>
                        <div className="pt-2"><Button variant="outline" size="sm" onClick={() => printPrescription(pr)}><Download className="h-4 w-4 mr-2" />Tải PDF</Button></div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="upcoming" className="mt-4">
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium mb-2">Lịch hẹn sắp tới</div>
                      <div className="space-y-2">
                        {(() => {
                          try {
                            const raw = localStorage.getItem("cliniccare:appointments");
                            const list = raw ? JSON.parse(raw) as any[] : [];
                            const items = list.filter((x) => x.patientName === selected.fullName);
                            if (!items.length) return <div className="text-sm text-[#687280]">Chưa có lịch hẹn nào (đồng bộ từ Quản lý lịch khám)</div>;
                            return items.map((a, i) => (
                              <div key={i} className="p-3 rounded-lg border border-[#E5E7EB] text-sm text-[#111827]">
                                {new Date(a.date).toLocaleDateString("vi-VN")} {a.time} • {a.doctorName} • {a.status}
                              </div>
                            ));
                          } catch {
                            return <div className="text-sm text-[#687280]">Không thể tải lịch hẹn</div>;
                          }
                        })()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-2">Tệp đính kèm</div>
                      <input
                        type="file"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          Promise.all(files.map(async (f) => {
                            const res = await uploadAttachment(selected.id, f);
                            return { name: res.name, url: res.url, type: res.type };
                          })).then((items) => {
                            setAttachments((prev) => [...prev, ...items]);
                            if (items.length) toast.success(`Đã thêm ${items.length} tệp`);
                          }).catch(() => {
                            const mapped = files.map((f) => ({ name: f.name, url: URL.createObjectURL(f), type: f.type }));
                            setAttachments((prev) => [...prev, ...mapped]);
                            if (files.length) toast.success(`Đã thêm ${files.length} tệp (fallback)`);
                          });
                        }}
                        className="block w-full text-sm"
                      />
                      <div className="mt-2 text-xs text-[#687280]">Hỗ trợ PDF/JPG/PNG, tối đa 10MB/tệp</div>
                      {!!attachments.length && (
                        <div className="mt-3 space-y-2">
                          {attachments.map((f, i) => (
                            <div key={i} className="flex items-center justify-between p-2 rounded border border-[#E5E7EB] text-sm">
                              <div className="truncate mr-2">{f.name}</div>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => setPreviewFile({ url: f.url, type: f.type })}>Xem</Button>
                                <Button variant="outline" size="sm" onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}>Xóa</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* File preview dialog */}
      <Dialog open={!!previewFile} onOpenChange={(v) => !v && setPreviewFile(null)}>
        <DialogContent className="max-w-3xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Xem tệp</DialogTitle>
          </DialogHeader>
          {previewFile && (
            previewFile.type.includes("pdf") ? (
              <iframe src={previewFile.url} className="w-full h-full" />
            ) : (
              <div className="space-y-3">
                <img src={previewFile.url} className="max-h-[70vh] w-auto mx-auto" />
                <div className="text-right"><Button variant="outline" onClick={() => printAttachmentWithWatermark(previewFile!)}>In kèm watermark</Button></div>
              </div>
            )
          )}
        </DialogContent>
      </Dialog>

      {/* EHR Detail Modal */}
      <Dialog open={ehrOpen} onOpenChange={setEhrOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Hồ sơ khám chi tiết</DialogTitle>
            <DialogDescription>
              {ehrData ? `${new Date(ehrData.date).toLocaleDateString('vi-VN')} • ${ehrData.doctor}` : ''}
            </DialogDescription>
          </DialogHeader>
          {ehrData && (
            <div className="space-y-5">
              <div>
                <div className="text-sm font-medium text-gray-900 mb-1">Chẩn đoán & Kết luận</div>
                <div className="text-sm text-[#111827]">Chẩn đoán: {ehrData.diagnosis}</div>
                <div className="text-sm text-[#111827]">Kết luận: {ehrData.conclusion}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900 mb-1">Chỉ số sinh tồn</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div className="p-2 rounded border">Huyết áp: {ehrData.vitals.bpSys}/{ehrData.vitals.bpDia} mmHg</div>
                  <div className="p-2 rounded border">Nhịp tim: {ehrData.vitals.hr} bpm</div>
                  <div className="p-2 rounded border">Cân nặng: {ehrData.vitals.weight} kg</div>
                  <div className="p-2 rounded border">Chiều cao: {ehrData.vitals.height} m</div>
                  <div className="p-2 rounded border">BMI: {ehrData.vitals.bmi}</div>
                </div>
                {/* Mini charts */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-[#E5E7EB]"><CardContent className="p-3">
                    <div className="text-xs text-[#687280] mb-2">Huyết áp theo thời gian</div>
                    <ResponsiveContainer width="100%" height={120}>
                      <AreaChart data={(ehrData.vitalsHistory || [
                        { name: 'T-4', sys: 120, dia: 78 },
                        { name: 'T-3', sys: 122, dia: 80 },
                        { name: 'T-2', sys: 118, dia: 76 },
                        { name: 'T-1', sys: 121, dia: 79 },
                        { name: 'T', sys: ehrData.vitals.bpSys, dia: ehrData.vitals.bpDia },
                      ])}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                        <XAxis dataKey="name" hide />
                        <YAxis hide />
                        <Tooltip />
                        <Area type="monotone" dataKey="sys" stroke="#ef4444" fill="#fecaca" />
                        <Area type="monotone" dataKey="dia" stroke="#3b82f6" fill="#bfdbfe" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent></Card>
                  <Card className="border-[#E5E7EB]"><CardContent className="p-3">
                    <div className="text-xs text-[#687280] mb-2">BMI theo thời gian</div>
                    <ResponsiveContainer width="100%" height={120}>
                      <LineChart data={(ehrData.vitalsHistory || [
                        { name: 'T-4', bmi: 22.4 },
                        { name: 'T-3', bmi: 22.5 },
                        { name: 'T-2', bmi: 22.6 },
                        { name: 'T-1', bmi: 22.7 },
                        { name: 'T', bmi: ehrData.vitals.bmi },
                      ])}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                        <XAxis dataKey="name" hide />
                        <YAxis hide />
                        <Tooltip />
                        <Line type="monotone" dataKey="bmi" stroke="#10b981" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent></Card>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900 mb-1">Xét nghiệm</div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Tên</th>
                      <th className="text-left py-2">Kết quả</th>
                      <th className="text-left py-2">Khoảng tham chiếu</th>
                      <th className="text-left py-2">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ehrData.labs.map((l: any, idx: number) => (
                      <tr key={idx} className="border-b">
                        <td className="py-2">{l.name}</td>
                        <td className="py-2">{l.result} {l.unit}</td>
                        <td className="py-2">{l.ref}</td>
                        <td className="py-2">{l.status === 'bt' ? 'Bình thường' : l.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {ehrData.images?.length ? (
                <div>
                  <div className="text-sm font-medium text-gray-900 mb-1">Hình ảnh</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {ehrData.images.map((url: string, i: number) => (
                      <img key={i} src={url} className="rounded border" />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa bệnh nhân</AlertDialogTitle>
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

export default Patients;
