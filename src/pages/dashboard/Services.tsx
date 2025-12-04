import { useMemo, useRef, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, RefreshCw, Download, Eye, Edit, Trash2, PlusCircle, Package, Pill as PillIcon, Syringe, FlaskConical } from "lucide-react";

type ResourceType = "service" | "medication";

type StockStatus = "in_stock" | "low" | "out";

interface ResourceItem {
  id: string;
  type: ResourceType;
  name: string;
  code: string;
  category: string;
  unit: string; // e.g., lần, viên, hộp, ống, ml
  price: number; // VND
  stock?: number; // for medication
  status: StockStatus; // for medication status or availability
  description?: string;
}

const categoriesByType: Record<ResourceType, string[]> = {
  service: ["Khám tổng quát", "Xét nghiệm", "Chẩn đoán hình ảnh", "Thủ thuật", "Tư vấn"],
  medication: ["Kháng sinh", "Giảm đau", "Huyết áp", "Tiểu đường", "Vitamin", "Vaccine"],
};

const unitsByType: Record<ResourceType, string[]> = {
  service: ["lần"],
  medication: ["viên", "vỉ", "hộp", "ống", "ml"],
};

const initialData: ResourceItem[] = [
  { id: "SV001", type: "service", name: "Khám nội tổng quát", code: "KNTQ", category: "Khám tổng quát", unit: "lần", price: 150000, status: "in_stock" },
  { id: "SV002", type: "service", name: "Xét nghiệm máu tổng quát", code: "XNMAU", category: "Xét nghiệm", unit: "lần", price: 250000, status: "in_stock" },
  { id: "MD001", type: "medication", name: "Paracetamol 500mg", code: "PARA500", category: "Giảm đau", unit: "viên", price: 2000, stock: 1200, status: "in_stock" },
  { id: "MD002", type: "medication", name: "Amoxicillin 500mg", code: "AMOX500", category: "Kháng sinh", unit: "viên", price: 3500, stock: 300, status: "low" },
  { id: "MD003", type: "medication", name: "Vitamin C 1g", code: "VITC1G", category: "Vitamin", unit: "viên", price: 2500, stock: 0, status: "out" },
];

const RESOURCES_STORAGE_KEY = "cliniccare:resources";

// Load resources from localStorage or use initial data
const loadResources = (): ResourceItem[] => {
  try {
    const stored = localStorage.getItem(RESOURCES_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialData;
    }
  } catch {
    // Fallback to initial data if parse fails
  }
  return initialData;
};

// Save resources to localStorage
const saveResources = (resources: ResourceItem[]) => {
  try {
    localStorage.setItem(RESOURCES_STORAGE_KEY, JSON.stringify(resources));
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent("resourcesUpdated"));
  } catch {
    // Ignore storage errors
  }
};

const resourceSchema = z.object({
  type: z.enum(["service", "medication"]),
  name: z.string().min(2, "Tên tối thiểu 2 ký tự"),
  code: z.string().min(2, "Mã tối thiểu 2 ký tự"),
  category: z.string().min(1, "Chọn nhóm"),
  unit: z.string().min(1, "Chọn đơn vị"),
  price: z.coerce.number().min(0, "Giá không âm"),
  stock: z.coerce.number().min(0, "Tồn kho không âm").optional(),
  status: z.enum(["in_stock", "low", "out"]),
  description: z.string().optional(),
});

const statusBadge = (status: StockStatus) => {
  if (status === "in_stock") return <Badge className="bg-[#16a34a]/10 text-[#16a34a] border-0">Sẵn có</Badge>;
  if (status === "low") return <Badge className="bg-[#f59e0b]/10 text-[#f59e0b] border-0">Sắp hết</Badge>;
  return <Badge className="bg-red-50 text-red-600 border-0">Hết hàng</Badge>;
};

const iconByType: Record<ResourceType, JSX.Element> = {
  service: <Package className="h-4 w-4" />,
  medication: <PillIcon className="h-4 w-4" />,
};

const currency = (v: number) => v.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

const Services = () => {
  const [items, setItems] = useState<ResourceItem[]>(() => loadResources());
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<ResourceType | "all">("all");
  const [filterCategory, setFilterCategory] = useState<string | "all">("all");
  const [filterStatus, setFilterStatus] = useState<StockStatus | "all">("all");

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selected, setSelected] = useState<ResourceItem | null>(null);

  const printRef = useRef<HTMLDivElement | null>(null);

  const form = useForm<z.infer<typeof resourceSchema>>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      type: "service",
      name: "",
      code: "",
      category: "",
      unit: "",
      price: 0,
      stock: 0,
      status: "in_stock",
      description: "",
    },
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      const byQuery = !q || [it.name, it.code, it.category].some((s) => s.toLowerCase().includes(q));
      const byType = filterType === "all" || it.type === filterType;
      const byCat = filterCategory === "all" || it.category === filterCategory;
      const byStatus = filterStatus === "all" || it.status === filterStatus;
      return byQuery && byType && byCat && byStatus;
    });
  }, [items, query, filterType, filterCategory, filterStatus]);

  const resetFilters = () => {
    setQuery("");
    setFilterType("all");
    setFilterCategory("all");
    setFilterStatus("all");
  };

  const exportCSV = () => {
    const headers = ["ID", "Loại", "Tên", "Mã", "Nhóm", "Đơn vị", "Giá", "Tồn kho", "Trạng thái"];
    const rows = filtered.map((it) => [
      it.id,
      it.type === "service" ? "Dịch vụ" : "Thuốc",
      it.name,
      it.code,
      it.category,
      it.unit,
      String(it.price),
      it.type === "medication" ? String(it.stock ?? 0) : "",
      it.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `services_medications_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Đã xuất CSV (mở bằng Excel)");
  };

  const onCreate = (data: z.infer<typeof resourceSchema>) => {
    const idPrefix = data.type === "service" ? "SV" : "MD";
    setItems((prev) => {
      // Find the highest existing ID number for this type
      const existingIds = prev
        .filter((x) => x.type === data.type && x.id.startsWith(idPrefix))
        .map((x) => {
          const num = parseInt(x.id.replace(idPrefix, ""));
          return isNaN(num) ? 0 : num;
        });
      const maxNum = existingIds.length > 0 ? Math.max(...existingIds) : 0;
      const nextIndex = maxNum + 1;
      const newItem: ResourceItem = {
        id: `${idPrefix}${String(nextIndex).padStart(3, "0")}`,
        ...data,
      };
      const updated = [newItem, ...prev];
      saveResources(updated);
      return updated;
    });
    setOpenCreate(false);
    form.reset();
    toast.success("Đã thêm mục mới");
  };

  const onEdit = (data: z.infer<typeof resourceSchema>) => {
    if (!selected) return;
    setItems((prev) => {
      const updated = prev.map((x) => (x.id === selected.id ? { ...x, ...data } : x));
      saveResources(updated);
      return updated;
    });
    setOpenEdit(false);
    setSelected(null);
    toast.success("Đã cập nhật");
  };

  const onDelete = () => {
    if (!selected) return;
    setItems((prev) => {
      const updated = prev.filter((x) => x.id !== selected.id);
      saveResources(updated);
      return updated;
    });
    setOpenDelete(false);
    setSelected(null);
    toast.success("Đã xóa");
  };

  const openEditWith = (it: ResourceItem) => {
    setSelected(it);
    form.reset({
      type: it.type,
      name: it.name,
      code: it.code,
      category: it.category,
      unit: it.unit,
      price: it.price,
      stock: it.stock ?? 0,
      status: it.status,
      description: it.description || "",
    });
    setOpenEdit(true);
  };

  const RenderForm = ({ onSubmit }: { onSubmit: (v: z.infer<typeof resourceSchema>) => void }) => {
    const watchType = form.watch("type");
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="border-[#E5E7EB]"><SelectValue placeholder="Chọn loại" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="service">Dịch vụ</SelectItem>
                      <SelectItem value="medication">Thuốc</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nhóm *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="border-[#E5E7EB]"><SelectValue placeholder="Chọn nhóm" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoriesByType[watchType].map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={watchType === "service" ? "VD: Khám nội tổng quát" : "VD: Paracetamol 500mg"} className="border-[#E5E7EB]" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="VD: XNMAU, PARA500" className="border-[#E5E7EB]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Đơn vị *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="border-[#E5E7EB]"><SelectValue placeholder="Chọn đơn vị" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {unitsByType[watchType].map((u) => (
                        <SelectItem key={u} value={u}>{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá (VND) *</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" min={0} className="border-[#E5E7EB]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {watchType === "medication" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tồn kho</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min={0} className="border-[#E5E7EB]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="border-[#E5E7EB]"><SelectValue placeholder="Chọn trạng thái" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="in_stock">Sẵn có</SelectItem>
                        <SelectItem value="low">Sắp hết</SelectItem>
                        <SelectItem value="out">Hết hàng</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mô tả</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ghi chú thêm (không bắt buộc)" className="border-[#E5E7EB]" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button type="submit" className="bg-[#007BFF] hover:bg-[#0056B3]">Lưu</Button>
          </DialogFooter>
        </form>
      </Form>
    );
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#687280]" />
              <Input placeholder="Tìm theo tên, mã, nhóm..." className="pl-10 border-[#E5E7EB]" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-[#E5E7EB]" onClick={() => {
              const loaded = loadResources();
              setItems(loaded);
              toast.success("Đã làm mới dữ liệu");
            }}>
              <RefreshCw className="h-4 w-4 mr-2" />Làm mới
            </Button>
            <Button variant="outline" className="border-[#E5E7EB]" onClick={exportCSV}>
              <Download className="h-4 w-4 mr-2" />Xuất CSV
            </Button>
            <Button className="bg-[#007BFF] hover:bg-[#0056B3]" onClick={() => { form.reset({ type: "service", name: "", code: "", category: "", unit: "", price: 0, stock: 0, status: "in_stock", description: "" }); setOpenCreate(true); }}>
              <PlusCircle className="h-4 w-4 mr-2" />Thêm mục
            </Button>
          </div>
        </div>

        <Card className="border-[#E5E7EB]">
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
            <Select value={filterType} onValueChange={(v) => setFilterType(v as ResourceType | "all")}>
              <SelectTrigger className="border-[#E5E7EB]"><SelectValue placeholder="Loại" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                <SelectItem value="service">Dịch vụ</SelectItem>
                <SelectItem value="medication">Thuốc</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as string | "all")}> 
              <SelectTrigger className="border-[#E5E7EB]"><SelectValue placeholder="Nhóm" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả nhóm</SelectItem>
                {((filterType === "all") ? Array.from(new Set(initialData.map(i => i.category))) : categoriesByType[filterType]).map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as StockStatus | "all")}> 
              <SelectTrigger className="border-[#E5E7EB]"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="in_stock">Sẵn có</SelectItem>
                <SelectItem value="low">Sắp hết</SelectItem>
                <SelectItem value="out">Hết hàng</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-[#E5E7EB]" onClick={resetFilters}>Xóa lọc</Button>
          </CardContent>
        </Card>

        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle>Dịch vụ & Thuốc</CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={printRef} className="w-full overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Loại</th>
                    <th className="text-left py-3 px-2">Tên</th>
                    <th className="text-left py-3 px-2">Mã</th>
                    <th className="text-left py-3 px-2">Nhóm</th>
                    <th className="text-left py-3 px-2">Đơn vị</th>
                    <th className="text-left py-3 px-2">Giá</th>
                    <th className="text-left py-3 px-2">Tồn kho</th>
                    <th className="text-left py-3 px-2">Trạng thái</th>
                    <th className="text-left py-3 px-2">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((it) => (
                    <tr key={it.id} className="border-b hover:bg-[#F9FAFB]">
                      <td className="py-3 px-2">
                        <div className="inline-flex items-center gap-2 text-[#111827]">
                          {iconByType[it.type]}
                          <span>{it.type === "service" ? "Dịch vụ" : "Thuốc"}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="font-medium text-gray-900">{it.name}</div>
                        {it.description && <div className="text-xs text-[#687280]">{it.description}</div>}
                      </td>
                      <td className="py-3 px-2">{it.code}</td>
                      <td className="py-3 px-2">{it.category}</td>
                      <td className="py-3 px-2">{it.unit}</td>
                      <td className="py-3 px-2">{currency(it.price)}</td>
                      <td className="py-3 px-2">{it.type === "medication" ? (it.stock ?? 0) : "-"}</td>
                      <td className="py-3 px-2">{statusBadge(it.status)}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditWith(it)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-600" onClick={() => { setSelected(it); setOpenDelete(true); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thêm Dịch vụ / Thuốc</DialogTitle>
            <DialogDescription>Nhập thông tin cơ bản</DialogDescription>
          </DialogHeader>
          <RenderForm onSubmit={onCreate} />
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cập nhật</DialogTitle>
            <DialogDescription>{selected?.name}</DialogDescription>
          </DialogHeader>
          <RenderForm onSubmit={onEdit} />
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa mục</AlertDialogTitle>
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

export default Services;


