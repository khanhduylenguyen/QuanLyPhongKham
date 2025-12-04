import { useEffect, useState, useCallback } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Activity,
  Heart,
  Scale,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { getCurrentUser, AUTH_EVENT } from "@/lib/auth";
import {
  getHealthMetrics,
  getLatestHealthMetric,
  getHealthMetricsForChart,
  saveHealthMetric,
  updateHealthMetric,
  deleteHealthMetric,
  calculateBMI,
  getBMICategory,
  getBloodPressureCategory,
  type HealthMetric,
} from "@/lib/health";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { HealthMetricsSkeleton } from "@/components/loading/SkeletonLoaders";

const HealthDashboard = () => {
  const [currentUser, setCurrentUser] = useState<ReturnType<typeof getCurrentUser>>(getCurrentUser());
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [latestMetric, setLatestMetric] = useState<HealthMetric | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMetric, setEditingMetric] = useState<HealthMetric | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    weight: "",
    height: "",
    bloodPressureSystolic: "",
    bloodPressureDiastolic: "",
    heartRate: "",
    bloodSugar: "",
    notes: "",
  });

  // Load metrics
  const loadMetrics = useCallback(() => {
    const userId = currentUser?.id;
    if (!userId) return;

    const allMetrics = getHealthMetrics(userId);
    setMetrics(allMetrics);
    setLatestMetric(getLatestHealthMetric(userId));
  }, [currentUser?.id]);

  // Listen for auth changes
  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(getCurrentUser());
    };
    window.addEventListener(AUTH_EVENT, handleAuthChange);
    return () => {
      window.removeEventListener(AUTH_EVENT, handleAuthChange);
    };
  }, []);

  useEffect(() => {
    const userId = currentUser?.id;
    
    if (userId) {
      setIsLoading(true);
      // Simulate loading delay for better UX
      const timer = setTimeout(() => {
        loadMetrics();
        setIsLoading(false);
      }, 300);

      // Listen for updates
      const handleUpdate = () => {
        loadMetrics();
      };
      window.addEventListener("healthMetricsUpdated", handleUpdate);

      return () => {
        clearTimeout(timer);
        window.removeEventListener("healthMetricsUpdated", handleUpdate);
      };
    } else {
      setIsLoading(false);
      return undefined;
    }
  }, [currentUser?.id, loadMetrics]);

  // Prepare chart data
  const getBMIChartData = () => {
    const chartMetrics = getHealthMetricsForChart(currentUser?.id || "");
    return chartMetrics
      .filter((m) => m.bmi)
      .map((m) => {
        const date = new Date(m.date);
        return {
          date: date.toLocaleDateString("vi-VN", { day: "2-digit", month: "short" }),
          bmi: m.bmi,
          weight: m.weight,
        };
      });
  };

  const getBloodPressureChartData = () => {
    const chartMetrics = getHealthMetricsForChart(currentUser?.id || "");
    return chartMetrics
      .filter((m) => m.bloodPressureSystolic && m.bloodPressureDiastolic)
      .map((m) => {
        const date = new Date(m.date);
        return {
          date: date.toLocaleDateString("vi-VN", { day: "2-digit", month: "short" }),
          systolic: m.bloodPressureSystolic,
          diastolic: m.bloodPressureDiastolic,
        };
      });
  };

  // Handle form submit
  const handleSubmit = async () => {
    if (!currentUser?.id) return;

    if (!formData.weight && !formData.bloodPressureSystolic) {
      toast.error("Vui lòng nhập ít nhất một chỉ số");
      return;
    }

    setIsSubmitting(true);

    try {
      const metricData: Omit<HealthMetric, "id" | "createdAt" | "updatedAt"> = {
        patientId: currentUser.id,
        date: formData.date,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
        bloodPressureSystolic: formData.bloodPressureSystolic
          ? parseInt(formData.bloodPressureSystolic)
          : undefined,
        bloodPressureDiastolic: formData.bloodPressureDiastolic
          ? parseInt(formData.bloodPressureDiastolic)
          : undefined,
        heartRate: formData.heartRate ? parseInt(formData.heartRate) : undefined,
        bloodSugar: formData.bloodSugar ? parseFloat(formData.bloodSugar) : undefined,
        notes: formData.notes.trim() || undefined,
      };

      if (editingMetric) {
        updateHealthMetric(editingMetric.id, metricData);
        toast.success("Đã cập nhật chỉ số sức khỏe");
      } else {
        saveHealthMetric(metricData);
        toast.success("Đã lưu chỉ số sức khỏe");
      }

      // Reset form
      setFormData({
        date: new Date().toISOString().split("T")[0],
        weight: "",
        height: "",
        bloodPressureSystolic: "",
        bloodPressureDiastolic: "",
        heartRate: "",
        bloodSugar: "",
        notes: "",
      });
      setEditingMetric(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving health metric:", error);
      toast.error("Có lỗi xảy ra khi lưu chỉ số");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (metric: HealthMetric) => {
    setEditingMetric(metric);
    setFormData({
      date: metric.date.split("T")[0],
      weight: metric.weight?.toString() || "",
      height: metric.height?.toString() || "",
      bloodPressureSystolic: metric.bloodPressureSystolic?.toString() || "",
      bloodPressureDiastolic: metric.bloodPressureDiastolic?.toString() || "",
      heartRate: metric.heartRate?.toString() || "",
      bloodSugar: metric.bloodSugar?.toString() || "",
      notes: metric.notes || "",
    });
    setIsDialogOpen(true);
  };

  // Handle delete
  const handleDelete = (id: string) => {
    if (deleteHealthMetric(id)) {
      toast.success("Đã xóa chỉ số sức khỏe");
    } else {
      toast.error("Không thể xóa chỉ số");
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const bmiChartData = getBMIChartData();
  const bpChartData = getBloodPressureChartData();

  if (isLoading) {
    return (
      <PatientLayout>
        <HealthMetricsSkeleton />
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Health Dashboard Cá nhân</h1>
            <p className="text-[#687280] mt-1">
              Theo dõi và quản lý các chỉ số sức khỏe của bạn - BMI, huyết áp, nhịp tim
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingMetric(null);
              setFormData({
                date: new Date().toISOString().split("T")[0],
                weight: "",
                height: "",
                bloodPressureSystolic: "",
                bloodPressureDiastolic: "",
                heartRate: "",
                bloodSugar: "",
                notes: "",
              });
              setIsDialogOpen(true);
            }}
            className="bg-[#007BFF] hover:bg-[#0056B3]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm chỉ số
          </Button>
        </div>

        {/* Latest Metrics Cards */}
        {latestMetric && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {latestMetric.bmi && (
              <Card className="border-[#E5E7EB]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-[#687280]">BMI</p>
                    <Scale className="h-5 w-5 text-[#007BFF]" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{latestMetric.bmi}</p>
                  {(() => {
                    const category = getBMICategory(latestMetric.bmi!);
                    return (
                      <Badge
                        variant="outline"
                        className="mt-2"
                        style={{ borderColor: category.color, color: category.color }}
                      >
                        {category.category}
                      </Badge>
                    );
                  })()}
                </CardContent>
              </Card>
            )}

            {latestMetric.bloodPressureSystolic && latestMetric.bloodPressureDiastolic && (
              <Card className="border-[#E5E7EB]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-[#687280]">Huyết áp</p>
                    <Heart className="h-5 w-5 text-red-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {latestMetric.bloodPressureSystolic}/{latestMetric.bloodPressureDiastolic}
                  </p>
                  <p className="text-xs text-[#687280] mt-1">mmHg</p>
                  {(() => {
                    const category = getBloodPressureCategory(
                      latestMetric.bloodPressureSystolic!,
                      latestMetric.bloodPressureDiastolic!
                    );
                    return (
                      <Badge
                        variant="outline"
                        className="mt-2"
                        style={{ borderColor: category.color, color: category.color }}
                      >
                        {category.category}
                      </Badge>
                    );
                  })()}
                </CardContent>
              </Card>
            )}

            {latestMetric.weight && (
              <Card className="border-[#E5E7EB]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-[#687280]">Cân nặng</p>
                    <Activity className="h-5 w-5 text-[#16a34a]" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{latestMetric.weight} kg</p>
                  {latestMetric.height && (
                    <p className="text-xs text-[#687280] mt-1">
                      Chiều cao: {latestMetric.height} m
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {latestMetric.heartRate && (
              <Card className="border-[#E5E7EB]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-[#687280]">Nhịp tim</p>
                    <Activity className="h-5 w-5 text-[#f59e0b]" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{latestMetric.heartRate} bpm</p>
                  <p className="text-xs text-[#687280] mt-1">Nhịp/phút</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* BMI Chart */}
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#007BFF]" />
                Biểu đồ BMI
              </CardTitle>
              <CardDescription>Theo dõi chỉ số BMI theo thời gian</CardDescription>
            </CardHeader>
            <CardContent>
              {bmiChartData.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={bmiChartData}>
                      <defs>
                        <linearGradient id="colorBMI" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#007BFF" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#007BFF" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="date" stroke="#687280" style={{ fontSize: "12px" }} />
                      <YAxis stroke="#687280" style={{ fontSize: "12px" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #E5E7EB",
                          borderRadius: "8px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="bmi"
                        stroke="#007BFF"
                        fillOpacity={1}
                        fill="url(#colorBMI)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-[#687280]">
                  <div className="text-center">
                    <Scale className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Chưa có dữ liệu BMI</p>
                    <p className="text-sm mt-1">Thêm chỉ số cân nặng và chiều cao để xem biểu đồ</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Blood Pressure Chart */}
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-600" />
                Biểu đồ Huyết áp
              </CardTitle>
              <CardDescription>Theo dõi huyết áp tâm thu và tâm trương</CardDescription>
            </CardHeader>
            <CardContent>
              {bpChartData.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={bpChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="date" stroke="#687280" style={{ fontSize: "12px" }} />
                      <YAxis stroke="#687280" style={{ fontSize: "12px" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #E5E7EB",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="systolic"
                        stroke="#ef4444"
                        strokeWidth={2}
                        name="Tâm thu"
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="diastolic"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Tâm trương"
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-[#687280]">
                  <div className="text-center">
                    <Heart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Chưa có dữ liệu huyết áp</p>
                    <p className="text-sm mt-1">Thêm chỉ số huyết áp để xem biểu đồ</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* History List */}
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle>Lịch sử chỉ số</CardTitle>
            <CardDescription>Danh sách các chỉ số sức khỏe đã ghi nhận</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-16 w-16 text-[#687280] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Chưa có dữ liệu sức khỏe
                </h3>
                <p className="text-[#687280] mb-4">
                  Bắt đầu theo dõi sức khỏe bằng cách thêm chỉ số đầu tiên
                </p>
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-[#007BFF] hover:bg-[#0056B3]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm chỉ số
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {metrics.map((metric) => (
                  <Card key={metric.id} className="border-[#E5E7EB] hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-semibold text-gray-900">{formatDate(metric.date)}</p>
                            {metric.bmi && (
                              <Badge variant="outline" className="text-xs">
                                BMI: {metric.bmi}
                              </Badge>
                            )}
                            {metric.bloodPressureSystolic && metric.bloodPressureDiastolic && (
                              <Badge variant="outline" className="text-xs">
                                HA: {metric.bloodPressureSystolic}/{metric.bloodPressureDiastolic}
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            {metric.weight && (
                              <div>
                                <p className="text-[#687280]">Cân nặng</p>
                                <p className="font-medium text-gray-900">{metric.weight} kg</p>
                              </div>
                            )}
                            {metric.height && (
                              <div>
                                <p className="text-[#687280]">Chiều cao</p>
                                <p className="font-medium text-gray-900">{metric.height} m</p>
                              </div>
                            )}
                            {metric.heartRate && (
                              <div>
                                <p className="text-[#687280]">Nhịp tim</p>
                                <p className="font-medium text-gray-900">{metric.heartRate} bpm</p>
                              </div>
                            )}
                            {metric.bloodSugar && (
                              <div>
                                <p className="text-[#687280]">Đường huyết</p>
                                <p className="font-medium text-gray-900">{metric.bloodSugar} mg/dL</p>
                              </div>
                            )}
                          </div>
                          {metric.notes && (
                            <p className="text-sm text-[#687280] mt-2">{metric.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(metric)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(metric.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMetric ? "Chỉnh sửa chỉ số" : "Thêm chỉ số sức khỏe"}
              </DialogTitle>
              <DialogDescription>
                Nhập các chỉ số sức khỏe của bạn. BMI sẽ được tính tự động nếu có cân nặng và chiều
                cao.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="date">Ngày *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weight">Cân nặng (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="Ví dụ: 65.5"
                  />
                </div>
                <div>
                  <Label htmlFor="height">Chiều cao (m)</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.01"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    placeholder="Ví dụ: 1.70"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bloodPressureSystolic">Huyết áp tâm thu (mmHg)</Label>
                  <Input
                    id="bloodPressureSystolic"
                    type="number"
                    value={formData.bloodPressureSystolic}
                    onChange={(e) =>
                      setFormData({ ...formData, bloodPressureSystolic: e.target.value })
                    }
                    placeholder="Ví dụ: 120"
                  />
                </div>
                <div>
                  <Label htmlFor="bloodPressureDiastolic">Huyết áp tâm trương (mmHg)</Label>
                  <Input
                    id="bloodPressureDiastolic"
                    type="number"
                    value={formData.bloodPressureDiastolic}
                    onChange={(e) =>
                      setFormData({ ...formData, bloodPressureDiastolic: e.target.value })
                    }
                    placeholder="Ví dụ: 80"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="heartRate">Nhịp tim (bpm)</Label>
                  <Input
                    id="heartRate"
                    type="number"
                    value={formData.heartRate}
                    onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
                    placeholder="Ví dụ: 72"
                  />
                </div>
                <div>
                  <Label htmlFor="bloodSugar">Đường huyết (mg/dL)</Label>
                  <Input
                    id="bloodSugar"
                    type="number"
                    step="0.1"
                    value={formData.bloodSugar}
                    onChange={(e) => setFormData({ ...formData, bloodSugar: e.target.value })}
                    placeholder="Ví dụ: 95"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Ghi chú</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ghi chú thêm về chỉ số sức khỏe..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Hủy
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-[#007BFF] hover:bg-[#0056B3]"
              >
                {isSubmitting ? "Đang lưu..." : editingMetric ? "Cập nhật" : "Lưu"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PatientLayout>
  );
};

export default HealthDashboard;

