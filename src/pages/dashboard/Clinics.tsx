import { useMemo, useRef, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Search, RefreshCw, Download, MapPin, Building2, Users, Clock, Eye, Edit, Trash2, PlusCircle } from "lucide-react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, PieChart, Pie, Cell } from "recharts";
import { getSettings } from "@/lib/settings";

type ClinicType = "headquarter" | "branch" | "department";
type ClinicStatus = "active" | "suspended" | "maintenance";

export interface ClinicItem {
  id: string; // code: PK001
  name: string;
  address: string;
  type: ClinicType;
  status: ClinicStatus;
  hours: string; // e.g., 7h00 - 21h00
  manager: string; // e.g., Bs. Trần Minh
  phone?: string;
  email?: string;
  doctors: number;
  staff?: number;
  rooms?: { clinic?: number; lab?: number; beds?: number };
  equipments?: Array<{ name: string; status: "ok" | "warning" | "due"; inspectedAt?: string }>;
  note?: string;
  mapUrl?: string;
}

const typeOptions: { value: ClinicType; label: string }[] = [
  { value: "headquarter", label: "Phòng khám chính" },
  { value: "branch", label: "Chi nhánh" },
  { value: "department", label: "Phòng chức năng" },
];

const statusOptions: { value: ClinicStatus; label: string }[] = [
  { value: "active", label: "Hoạt động" },
  { value: "suspended", label: "Tạm ngưng" },
  { value: "maintenance", label: "Bảo trì" },
];

const statusBadge = (s: ClinicStatus) => {
  if (s === "active") return <Badge className="bg-[#16a34a]/10 text-[#16a34a] border-0">Hoạt động</Badge>;
  if (s === "suspended") return <Badge className="bg-[#f59e0b]/10 text-[#f59e0b] border-0">Tạm ngưng</Badge>;
  return <Badge className="bg-red-50 text-red-600 border-0">Bảo trì</Badge>;
};

const initialClinics: ClinicItem[] = [
  { id: "PK001", name: "Phòng khám Trung tâm", address: "123 Nguyễn Trãi, Q1", type: "headquarter", status: "active", hours: "7h00 - 21h00", manager: "Bs. Trần Minh", doctors: 12, phone: "028 1234 5678", email: "center@cliniccare.vn", rooms: { clinic: 8, lab: 2, beds: 6 }, equipments: [ { name: "Máy X-quang", status: "ok" }, { name: "Máy xét nghiệm huyết học", status: "warning" } ] },
  { id: "PK002", name: "Chi nhánh 2 - Bình Thạnh", address: "57 Xô Viết Nghệ Tĩnh", type: "branch", status: "suspended", hours: "8h00 - 17h00", manager: "Bs. Lê Hương", doctors: 8, rooms: { clinic: 5, lab: 1, beds: 2 }, equipments: [ { name: "Máy siêu âm", status: "ok" } ] },
  { id: "PK003", name: "Phòng Xét nghiệm", address: "Nội bộ", type: "department", status: "active", hours: "Theo lịch", manager: "Ds. Phạm Tuấn", doctors: 3, rooms: { clinic: 2, lab: 2, beds: 0 }, equipments: [ { name: "PCR", status: "due" } ] },
];

const CLINICS_STORAGE_KEY = "cliniccare:clinics";

// Load clinics from localStorage or use initial data
export const loadClinics = (): ClinicItem[] => {
  try {
    const stored = localStorage.getItem(CLINICS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialClinics;
    }
  } catch {
    // Fallback to initial data if parse fails
  }
  return initialClinics;
};

// Save clinics to localStorage
export const saveClinics = (clinics: ClinicItem[]) => {
  try {
    localStorage.setItem(CLINICS_STORAGE_KEY, JSON.stringify(clinics));
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent("clinicsUpdated"));
  } catch {
    // Ignore storage errors
  }
};

const clinicSchema = z.object({
  name: z.string().min(2, "Tên tối thiểu 2 ký tự"),
  id: z.string().min(3, "Mã tối thiểu 3 ký tự"),
  address: z.string().min(1, "Địa chỉ bắt buộc"),
  type: z.enum(["headquarter", "branch", "department"]),
  status: z.enum(["active", "suspended", "maintenance"]),
  hours: z.string().min(1, "Giờ hoạt động bắt buộc"),
  manager: z.string().min(1, "Người phụ trách bắt buộc"),
  phone: z.string().optional(),
  email: z.string().email("Email không hợp lệ").optional(),
  mapUrl: z.string().url("URL không hợp lệ").optional(),
  note: z.string().optional(),
});

const Clinics = () => {
  const [clinics, setClinics] = useState<ClinicItem[]>(() => loadClinics());
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<ClinicType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<ClinicStatus | "all">("all");
  const [selected, setSelected] = useState<ClinicItem | null>(null);
  const [openSheet, setOpenSheet] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const printRef = useRef<HTMLDivElement | null>(null);

  const form = useForm<z.infer<typeof clinicSchema>>({
    resolver: zodResolver(clinicSchema),
    defaultValues: {
      name: "",
      id: "",
      address: "",
      type: "headquarter",
      status: "active",
      hours: "7h00 - 21h00",
      manager: "",
      phone: "",
      email: "",
      mapUrl: "",
      note: "",
    },
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clinics.filter((c) => {
      const byQuery = !q || [c.name, c.id, c.address].some((v) => v.toLowerCase().includes(q));
      const byType = filterType === "all" || c.type === filterType;
      const byStatus = filterStatus === "all" || c.status === filterStatus;
      return byQuery && byType && byStatus;
    });
  }, [clinics, query, filterType, filterStatus]);

  const exportCSV = () => {
    const headers = ["Mã", "Tên", "Địa chỉ", "Loại", "Trạng thái", "Giờ", "Người phụ trách", "Số bác sĩ"];
    const rows = filtered.map((c) => [c.id, c.name, c.address, c.type, c.status, c.hours, c.manager, String(c.doctors)]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clinics_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Đã xuất CSV");
  };

  const onCreate = (data: z.infer<typeof clinicSchema>) => {
    // Auto-generate ID if not provided or if ID already exists
    let clinicId = data.id.trim();
    setClinics((prev) => {
      // Check if ID already exists
      const idExists = prev.some((c) => c.id === clinicId);
      if (idExists || !clinicId || !clinicId.startsWith("PK")) {
        // Auto-generate ID based on existing clinics
        const existingIds = prev.map((c) => c.id).filter((id) => id.startsWith("PK"));
        const maxNum = existingIds.length > 0
          ? Math.max(...existingIds.map((id) => {
              const num = parseInt(id.replace("PK", ""));
              return isNaN(num) ? 0 : num;
            }))
          : 0;
        clinicId = `PK${String(maxNum + 1).padStart(3, "0")}`;
      }
      const newItem: ClinicItem = { doctors: 0, ...data, id: clinicId } as ClinicItem;
      const updated = [newItem, ...prev];
      saveClinics(updated);
      return updated;
    });
    setOpenCreate(false);
    form.reset();
    toast.success("Đã thêm phòng khám");
  };

  const onEdit = (data: z.infer<typeof clinicSchema>) => {
    if (!selected) return;
    setClinics((prev) => {
      const updated = prev.map((c) => (c.id === selected.id ? { ...c, ...data } : c));
      saveClinics(updated);
      return updated;
    });
    setOpenEdit(false);
    setSelected(null);
    toast.success("Đã cập nhật");
  };

  const onDelete = () => {
    if (!selected) return;
    setClinics((prev) => {
      const updated = prev.filter((c) => c.id !== selected.id);
      saveClinics(updated);
      return updated;
    });
    setOpenDelete(false);
    setSelected(null);
    toast.success("Đã xóa phòng khám");
  };

  const openEditWith = (c: ClinicItem) => {
    setSelected(c);
    form.reset({
      name: c.name,
      id: c.id,
      address: c.address,
      type: c.type,
      status: c.status,
      hours: c.hours,
      manager: c.manager,
      phone: c.phone || "",
      email: c.email || "",
      mapUrl: c.mapUrl || "",
      note: c.note || "",
    });
    setOpenEdit(true);
  };

  const Stats = () => {
    const byBranch = clinics.map((c) => ({ name: c.id, value: c.doctors }));
    const byType = [
      { name: "Chính", value: clinics.filter((c) => c.type === "headquarter").length, color: "#007BFF" },
      { name: "Chi nhánh", value: clinics.filter((c) => c.type === "branch").length, color: "#34d399" },
      { name: "Phòng chức năng", value: clinics.filter((c) => c.type === "department").length, color: "#f59e0b" },
    ];
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-[#E5E7EB]">
          <CardHeader>
            <CardTitle>Lượt bác sĩ theo cơ sở (minh họa)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byBranch}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#687280" />
                <YAxis stroke="#687280" />
                <Tooltip />
                <Bar dataKey="value" fill="#007BFF" radius={[8,8,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle>Phân bố loại cơ sở</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={byType} cx="50%" cy="50%" dataKey="value" outerRadius={80} label={({ name, percent }) => `${name}: ${(percent*100).toFixed(0)}%`}>
                  {byType.map((e, i) => (<Cell key={i} fill={e.color} />))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    );
  };

  const RenderForm = ({ onSubmit }: { onSubmit: (v: z.infer<typeof clinicSchema>) => void }) => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Tên *</FormLabel>
              <FormControl><Input {...field} placeholder="VD: Phòng khám Trung tâm" className="border-[#E5E7EB]" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="id" render={({ field }) => (
            <FormItem>
              <FormLabel>Mã *</FormLabel>
              <FormControl><Input {...field} placeholder="VD: PK001" className="border-[#E5E7EB]" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="address" render={({ field }) => (
          <FormItem>
            <FormLabel>Địa chỉ *</FormLabel>
            <FormControl><Input {...field} placeholder="Số, đường, quận" className="border-[#E5E7EB]" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField control={form.control} name="type" render={({ field }) => (
            <FormItem>
              <FormLabel>Loại *</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl><SelectTrigger className="border-[#E5E7EB]"><SelectValue placeholder="Chọn loại" /></SelectTrigger></FormControl>
                <SelectContent>
                  {typeOptions.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem>
              <FormLabel>Trạng thái *</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl><SelectTrigger className="border-[#E5E7EB]"><SelectValue placeholder="Chọn trạng thái" /></SelectTrigger></FormControl>
                <SelectContent>
                  {statusOptions.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="hours" render={({ field }) => (
            <FormItem>
              <FormLabel>Giờ hoạt động *</FormLabel>
              <FormControl><Input {...field} placeholder="VD: 7h00 - 21h00" className="border-[#E5E7EB]" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField control={form.control} name="manager" render={({ field }) => (
            <FormItem>
              <FormLabel>Người phụ trách *</FormLabel>
              <FormControl><Input {...field} placeholder="VD: Bs. Trần Minh" className="border-[#E5E7EB]" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem>
              <FormLabel>Điện thoại</FormLabel>
              <FormControl><Input {...field} placeholder="028 ...." className="border-[#E5E7EB]" /></FormControl>
            </FormItem>
          )} />
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl><Input {...field} type="email" placeholder="email@cliniccare.vn" className="border-[#E5E7EB]" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="mapUrl" render={({ field }) => (
            <FormItem>
              <FormLabel>Google Map URL</FormLabel>
              <FormControl><Input {...field} placeholder="https://maps.google.com/..." className="border-[#E5E7EB]" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="note" render={({ field }) => (
            <FormItem>
              <FormLabel>Ghi chú</FormLabel>
              <FormControl><Input {...field} placeholder="Ghi chú nội bộ" className="border-[#E5E7EB]" /></FormControl>
            </FormItem>
          )} />
        </div>
        <DialogFooter>
          <Button type="submit" className="bg-[#007BFF] hover:bg-[#0056B3]">Lưu</Button>
        </DialogFooter>
      </form>
    </Form>
  );

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Top toolbar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#687280]" />
              <Input placeholder="Tìm theo tên / mã / địa chỉ" className="pl-10 border-[#E5E7EB]" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-[#E5E7EB]" onClick={() => {
              setClinics(initialClinics);
              saveClinics(initialClinics);
            }}><RefreshCw className="h-4 w-4 mr-2" />Làm mới</Button>
            <Button variant="outline" className="border-[#E5E7EB]" onClick={exportCSV}><Download className="h-4 w-4 mr-2" />Xuất CSV</Button>
            <Button className="bg-[#007BFF] hover:bg-[#0056B3]" onClick={() => { form.reset({ name: "", id: "PK" + String(clinics.length + 1).padStart(3, "0"), address: "", type: "headquarter", status: "active", hours: "7h00 - 21h00", manager: "", phone: "", email: "", mapUrl: "", note: "" }); setOpenCreate(true); }}>
              <PlusCircle className="h-4 w-4 mr-2" />Thêm phòng khám
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-[#E5E7EB]">
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
            <Select value={filterType} onValueChange={(v) => setFilterType(v as ClinicType | "all")}> 
              <SelectTrigger className="border-[#E5E7EB]"><SelectValue placeholder="Loại" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                {typeOptions.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as ClinicStatus | "all")}> 
              <SelectTrigger className="border-[#E5E7EB]"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {statusOptions.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-[#E5E7EB]" onClick={() => { setQuery(""); setFilterType("all"); setFilterStatus("all"); }}>Xóa lọc</Button>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle>Danh sách phòng khám</CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={printRef} className="w-full overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Mã</th>
                    <th className="text-left py-3 px-2">Tên phòng khám</th>
                    <th className="text-left py-3 px-2">Địa chỉ</th>
                    <th className="text-left py-3 px-2">Số bác sĩ</th>
                    <th className="text-left py-3 px-2">Trạng thái</th>
                    <th className="text-left py-3 px-2">Giờ hoạt động</th>
                    <th className="text-left py-3 px-2">Người phụ trách</th>
                    <th className="text-left py-3 px-2">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="border-b hover:bg-[#F9FAFB]">
                      <td className="py-3 px-2">{c.id}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2 text-gray-900">
                          <Building2 className="h-4 w-4" />
                          <span className="font-medium">{c.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1 text-[#687280]"><MapPin className="h-4 w-4" />{c.address}</div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1"><Users className="h-4 w-4" />{c.doctors}</div>
                        {c.doctors > getSettings().thresholds.capacityDoctorsWarning && (
                          <div className="mt-1 text-xs text-[#f59e0b]">Vượt ngưỡng {getSettings().thresholds.capacityDoctorsWarning} bác sĩ</div>
                        )}
                      </td>
                      <td className="py-3 px-2">{statusBadge(c.status)}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1"><Clock className="h-4 w-4" />{c.hours}</div>
                      </td>
                      <td className="py-3 px-2">{c.manager}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => { setSelected(c); setOpenSheet(true); }}><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditWith(c)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-red-600" onClick={() => { setSelected(c); setOpenDelete(true); }}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Stats />
      </div>

      {/* Detail sheet */}
      <Sheet open={openSheet} onOpenChange={setOpenSheet}>
        <SheetContent side="right" className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Chi tiết phòng khám</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="space-y-5 py-2">
              <div>
                <div className="text-lg font-semibold text-gray-900">{selected.name} ({selected.id})</div>
                <div className="text-sm text-[#687280] flex items-center gap-2"><MapPin className="h-4 w-4" />{selected.address}</div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-[#687280]">Loại</div>
                  <div className="font-medium">{selected.type === "headquarter" ? "Phòng khám chính" : selected.type === "branch" ? "Chi nhánh" : "Phòng chức năng"}</div>
                </div>
                <div>
                  <div className="text-[#687280]">Trạng thái</div>
                  <div>{statusBadge(selected.status)}</div>
                </div>
                <div>
                  <div className="text-[#687280]">Giờ hoạt động</div>
                  <div className="font-medium">{selected.hours}</div>
                </div>
                <div>
                  <div className="text-[#687280]">Người phụ trách</div>
                  <div className="font-medium">{selected.manager}</div>
                </div>
                <div>
                  <div className="text-[#687280]">Liên hệ</div>
                  <div className="font-medium">{selected.phone || "-"} • {selected.email || "-"}</div>
                </div>
                <div>
                  <div className="text-[#687280]">Bác sĩ</div>
                  <div className="font-medium">{selected.doctors}</div>
                </div>
              </div>

              {/* Facility & Equipment */}
              <Card className="border-[#E5E7EB]">
                <CardHeader><CardTitle className="text-base">Cơ sở vật chất & Thiết bị</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div><div className="text-[#687280]">Phòng khám</div><div className="font-medium">{selected.rooms?.clinic ?? 0}</div></div>
                    <div><div className="text-[#687280]">Phòng xét nghiệm</div><div className="font-medium">{selected.rooms?.lab ?? 0}</div></div>
                    <div><div className="text-[#687280]">Giường bệnh</div><div className="font-medium">{selected.rooms?.beds ?? 0}</div></div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {(selected.equipments || []).map((eq, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded border border-[#E5E7EB]">
                        <div className="text-sm">{eq.name}</div>
                        <div className="text-xs">
                          {eq.status === "ok" && <Badge className="bg-[#16a34a]/10 text-[#16a34a] border-0">Tốt</Badge>}
                          {eq.status === "warning" && <Badge className="bg-[#f59e0b]/10 text-[#f59e0b] border-0">Cảnh báo</Badge>}
                          {eq.status === "due" && <Badge className="bg-red-50 text-red-600 border-0">Đến hạn</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Create */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thêm phòng khám</DialogTitle>
            <DialogDescription>Nhập thông tin cơ bản của cơ sở</DialogDescription>
          </DialogHeader>
          <RenderForm onSubmit={onCreate} />
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cập nhật phòng khám</DialogTitle>
            <DialogDescription>{selected?.name}</DialogDescription>
          </DialogHeader>
          <RenderForm onSubmit={onEdit} />
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa phòng khám</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa {selected?.name}? Hành động này không thể hoàn tác.
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

export default Clinics;


