import { useEffect, useMemo, useRef, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts";
import { 
  Download, 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  FileText,
  RefreshCw,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from "lucide-react";
import { toast } from "sonner";

// Mock data for reports
const appointmentStats = [
  { month: "T1", appointments: 120, revenue: 18000000, newPatients: 45, returningPatients: 75 },
  { month: "T2", appointments: 135, revenue: 20250000, newPatients: 52, returningPatients: 83 },
  { month: "T3", appointments: 148, revenue: 22200000, newPatients: 58, returningPatients: 90 },
  { month: "T4", appointments: 162, revenue: 24300000, newPatients: 64, returningPatients: 98 },
  { month: "T5", appointments: 175, revenue: 26250000, newPatients: 70, returningPatients: 105 },
  { month: "T6", appointments: 189, revenue: 28350000, newPatients: 76, returningPatients: 113 },
];

const departmentStats = [
  { name: "Nội tổng quát", value: 45, color: "#007BFF" },
  { name: "Tim mạch", value: 25, color: "#34d399" },
  { name: "Nhi", value: 20, color: "#f59e0b" },
  { name: "Sản phụ khoa", value: 10, color: "#ef4444" },
];

const dailyAppointments = [
  { day: "T2", appointments: 25, completed: 23, cancelled: 2 },
  { day: "T3", appointments: 28, completed: 26, cancelled: 2 },
  { day: "T4", appointments: 32, completed: 30, cancelled: 2 },
  { day: "T5", appointments: 30, completed: 28, cancelled: 2 },
  { day: "T6", appointments: 35, completed: 33, cancelled: 2 },
  { day: "T7", appointments: 22, completed: 20, cancelled: 2 },
  { day: "CN", appointments: 15, completed: 14, cancelled: 1 },
];

const revenueByService = [
  { service: "Khám tổng quát", revenue: 15000000, count: 100 },
  { service: "Xét nghiệm", revenue: 8000000, count: 50 },
  { service: "Chẩn đoán hình ảnh", revenue: 12000000, count: 30 },
  { service: "Thủ thuật", revenue: 20000000, count: 20 },
];

const topDoctors = [
  { name: "BS. Nguyễn Thị Lan", appointments: 45, revenue: 6750000, rating: 4.8 },
  { name: "BS. Phạm Hùng", appointments: 38, revenue: 5700000, rating: 4.6 },
  { name: "BS. Lê Minh", appointments: 32, revenue: 4800000, rating: 4.7 },
  { name: "BS. Trần Hương", appointments: 28, revenue: 4200000, rating: 4.5 },
];

// Medications usage (top 10)
const medsTop10 = [
  { name: "Paracetamol", count: 380, group: "Giảm đau", color: "#f59e0b" },
  { name: "Amoxicillin", count: 320, group: "Kháng sinh", color: "#ef4444" },
  { name: "Vitamin C", count: 290, group: "Vitamin", color: "#22c55e" },
  { name: "Ibuprofen", count: 240, group: "Giảm đau", color: "#f59e0b" },
  { name: "Cefixime", count: 210, group: "Kháng sinh", color: "#ef4444" },
  { name: "Zinc", count: 190, group: "Vitamin", color: "#22c55e" },
  { name: "Omeprazole", count: 175, group: "Dạ dày", color: "#3b82f6" },
  { name: "Cetirizine", count: 160, group: "Dị ứng", color: "#06b6d4" },
  { name: "Metformin", count: 150, group: "Tiểu đường", color: "#8b5cf6" },
  { name: "Losartan", count: 140, group: "Huyết áp", color: "#10b981" },
];

// Services top 5 revenue
const servicesTop5 = [
  { name: "Khám tổng quát", revenue: 15000000, count: 100, color: "#3b82f6" },
  { name: "Xét nghiệm máu", revenue: 12000000, count: 80, color: "#22c55e" },
  { name: "Siêu âm", revenue: 9500000, count: 60, color: "#f59e0b" },
  { name: "X-quang", revenue: 8000000, count: 45, color: "#ef4444" },
  { name: "Nội soi", revenue: 7000000, count: 30, color: "#8b5cf6" },
];

// Staff performance
const staffPerformance = [
  { name: "BS. Lan", patientsPerDay: 15 },
  { name: "BS. Hùng", patientsPerDay: 13 },
  { name: "BS. Minh", patientsPerDay: 12 },
  { name: "BS. Hương", patientsPerDay: 11 },
  { name: "BS. Tuấn", patientsPerDay: 10 },
];

// Appointment vs Arrived vs Cancelled per week
const apptNoShowWeekly = [
  { week: "W1", booked: 120, arrived: 110, cancelled: 10 },
  { week: "W2", booked: 135, arrived: 124, cancelled: 11 },
  { week: "W3", booked: 150, arrived: 139, cancelled: 11 },
  { week: "W4", booked: 160, arrived: 147, cancelled: 13 },
];

const Reports = () => {
  const [dateRange, setDateRange] = useState("6months");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedClinic, setSelectedClinic] = useState("all");
  const [selectedDoctor, setSelectedDoctor] = useState("all");
  const [reportType, setReportType] = useState("all"); // all | finance | operations | meds | services
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [revenueView, setRevenueView] = useState<"service" | "medication">("service");
  const printRef = useRef<HTMLDivElement | null>(null);

  const filteredData = useMemo(() => {
    // Filter data based on selected filters
    return appointmentStats;
  }, [dateRange, selectedDepartment]);

  const totalRevenue = useMemo(() => {
    return filteredData.reduce((sum, item) => sum + item.revenue, 0);
  }, [filteredData]);

  const totalAppointments = useMemo(() => {
    return filteredData.reduce((sum, item) => sum + item.appointments, 0);
  }, [filteredData]);

  const averageRevenue = useMemo(() => {
    return totalRevenue / filteredData.length;
  }, [totalRevenue, filteredData.length]);

  const exportPDF = () => {
    const printContents = printRef.current?.innerHTML || "";
    const w = window.open("", "_blank", "width=1024,height=768");
    if (!w) return;
    w.document.open();
    w.document.write(`<!doctype html><html><head><title>Báo cáo thống kê - ClinicCare</title>
      <style>
        body{font-family: Inter,system-ui,sans-serif; padding:24px; background:#fff}
        .header{text-align:center; margin-bottom:32px; border-bottom:2px solid #e5e7eb; padding-bottom:16px}
        .stats-grid{display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:32px}
        .stat-card{background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; padding:16px; text-align:center}
        .stat-value{font-size:24px; font-weight:bold; color:#111827; margin-bottom:4px}
        .stat-label{font-size:14px; color:#6b7280}
        .chart-section{margin-bottom:32px}
        .chart-title{font-size:18px; font-weight:600; margin-bottom:16px; color:#111827}
        table{width:100%; border-collapse:collapse; margin-top:16px}
        th,td{border:1px solid #e5e7eb; padding:8px; text-align:left; font-size:12px}
        th{background:#f9fafb; font-weight:600}
        .text-right{text-align:right}
        .text-center{text-align:center}
        .badge{display:inline-block; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:500}
        .badge-success{background:#dcfce7; color:#166534}
        .badge-warning{background:#fef3c7; color:#92400e}
        .badge-danger{background:#fee2e2; color:#991b1b}
      </style>
    </head><body>
      <div class="header">
        <h1>Báo cáo thống kê - ClinicCare</h1>
        <p>Kỳ báo cáo: ${new Date().toLocaleDateString('vi-VN')}</p>
      </div>
      <div>${printContents}</div>
    </body></html>`);
    w.document.close();
    w.focus();
    w.print();
  };

  // Auto refresh mock (5 minutes -> here 10 seconds for demo)
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => {
      toast.success("Đã cập nhật dữ liệu (tự động)");
    }, 10000);
    return () => clearInterval(id);
  }, [autoRefresh]);

  const exportCSV = () => {
    const headers = ["Tháng", "Số cuộc hẹn", "Doanh thu", "Bệnh nhân mới", "Bệnh nhân tái khám"];
    const rows = filteredData.map(item => [
      item.month,
      item.appointments,
      item.revenue.toLocaleString('vi-VN'),
      item.newPatients,
      item.returningPatients
    ]);
    const csv = [headers, ...rows].map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ).join("\n");
    
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bao_cao_thong_ke_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Đã xuất CSV");
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = "blue" }: {
    title: string;
    value: string | number;
    icon: any;
    trend?: "up" | "down";
    trendValue?: string;
    color?: string;
  }) => (
    <Card className="border-[#E5E7EB]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#687280]">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && trendValue && (
              <div className={`flex items-center gap-1 text-sm mt-1 ${
                trend === "up" ? "text-[#16a34a]" : "text-red-600"
              }`}>
                {trend === "up" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {trendValue}
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg ${
            color === "blue" ? "bg-[#007BFF]/10" :
            color === "green" ? "bg-[#16a34a]/10" :
            color === "orange" ? "bg-[#f59e0b]/10" :
            "bg-[#9C27B0]/10"
          }`}>
            <Icon className={`h-6 w-6 ${
              color === "blue" ? "text-[#007BFF]" :
              color === "green" ? "text-[#16a34a]" :
              color === "orange" ? "text-[#f59e0b]" :
              "text-[#9C27B0]"
            }`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Báo cáo & Thống kê</h1>
            <p className="text-[#687280] mt-1">Phân tích hiệu suất và doanh thu phòng khám</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-[#E5E7EB]" onClick={exportCSV}>
              <Download className="h-4 w-4 mr-2" />Xuất CSV
            </Button>
            <Button variant="outline" className="border-[#E5E7EB]" onClick={exportPDF}>
              <FileText className="h-4 w-4 mr-2" />Xuất PDF
            </Button>
            <Button className="bg-[#007BFF] hover:bg-[#0056B3]">
              <RefreshCw className="h-4 w-4 mr-2" />Làm mới
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-[#E5E7EB]">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-3 items-center">
              <div className="flex items-center gap-2 lg:col-span-6">
                <Filter className="h-4 w-4 text-[#687280]" />
                <span className="text-sm font-medium">Bộ lọc:</span>
              </div>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="border-[#E5E7EB]">
                  <SelectValue placeholder="Chọn kỳ báo cáo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hôm nay</SelectItem>
                  <SelectItem value="thisWeek">Tuần này</SelectItem>
                  <SelectItem value="thisMonth">Tháng này</SelectItem>
                  <SelectItem value="thisQuarter">Quý này</SelectItem>
                  <SelectItem value="1month">1 tháng qua</SelectItem>
                  <SelectItem value="3months">3 tháng qua</SelectItem>
                  <SelectItem value="6months">6 tháng qua</SelectItem>
                  <SelectItem value="1year">1 năm qua</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedClinic} onValueChange={setSelectedClinic}>
                <SelectTrigger className="border-[#E5E7EB]">
                  <SelectValue placeholder="Chọn phòng khám/chi nhánh" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả cơ sở</SelectItem>
                  <SelectItem value="center">Trung tâm</SelectItem>
                  <SelectItem value="binhthanh">Bình Thạnh</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger className="border-[#E5E7EB]">
                  <SelectValue placeholder="Chọn bác sĩ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả bác sĩ</SelectItem>
                  <SelectItem value="lan">BS. Lan</SelectItem>
                  <SelectItem value="hung">BS. Hùng</SelectItem>
                  <SelectItem value="minh">BS. Minh</SelectItem>
                </SelectContent>
              </Select>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="border-[#E5E7EB]">
                  <SelectValue placeholder="Loại báo cáo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tổng hợp</SelectItem>
                  <SelectItem value="finance">Tài chính</SelectItem>
                  <SelectItem value="operations">Hoạt động</SelectItem>
                  <SelectItem value="meds">Thuốc</SelectItem>
                  <SelectItem value="services">Dịch vụ</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
                <span className="text-sm">Tự động làm mới (5 phút)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div ref={printRef}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Tổng doanh thu"
              value={totalRevenue.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
              icon={DollarSign}
              trend="up"
              trendValue="+12.5%"
              color="green"
            />
            <StatCard
              title="Tổng cuộc hẹn"
              value={totalAppointments.toLocaleString()}
              icon={Calendar}
              trend="up"
              trendValue="+8.2%"
              color="blue"
            />
            <StatCard
              title="Doanh thu TB/tháng"
              value={averageRevenue.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
              icon={TrendingUp}
              trend="up"
              trendValue="+5.1%"
              color="orange"
            />
            <StatCard
              title="Bệnh nhân mới"
              value={filteredData.reduce((sum, item) => sum + item.newPatients, 0).toLocaleString()}
              icon={Users}
              trend="up"
              trendValue="+15.3%"
              color="purple"
            />
          </div>

          {/* Charts Section */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="revenue">Doanh thu</TabsTrigger>
              <TabsTrigger value="appointments">Lịch hẹn</TabsTrigger>
              <TabsTrigger value="doctors">Bác sĩ</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-[#E5E7EB]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Lịch hẹn theo tháng
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={filteredData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="month" stroke="#687280" />
                        <YAxis stroke="#687280" />
                        <Tooltip />
                        <Bar dataKey="appointments" fill="#007BFF" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-[#E5E7EB]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5" />
                      Phân bố theo khoa
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={departmentStats}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {departmentStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-[#E5E7EB]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Lịch hẹn theo ngày trong tuần
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={dailyAppointments}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="day" stroke="#687280" />
                      <YAxis stroke="#687280" />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="appointments" 
                        stackId="1" 
                        stroke="#007BFF" 
                        fill="#007BFF" 
                        fillOpacity={0.3}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="completed" 
                        stackId="2" 
                        stroke="#16a34a" 
                        fill="#16a34a" 
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="revenue" className="space-y-6">
              <Card className="border-[#E5E7EB]">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Doanh thu theo thời gian</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#687280]">Nguồn</span>
                      <Select value={revenueView} onValueChange={(v) => setRevenueView(v as any)}>
                        <SelectTrigger className="w-40 h-8 border-[#E5E7EB]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="service">Dịch vụ</SelectItem>
                          <SelectItem value="medication">Thuốc</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={filteredData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="month" stroke="#687280" />
                      <YAxis stroke="#687280" />
                      <Tooltip formatter={(value) => [value.toLocaleString('vi-VN') + ' VND', revenueView === 'service' ? 'Dịch vụ' : 'Thuốc']} />
                      <Line type="monotone" dataKey="revenue" stroke="#007BFF" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-[#E5E7EB]">
                  <CardHeader>
                    <CardTitle>Top dịch vụ theo doanh thu</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={servicesTop5}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="name" stroke="#687280" />
                        <YAxis stroke="#687280" />
                        <Tooltip formatter={(v) => [Number(v).toLocaleString('vi-VN') + ' VND', 'Doanh thu']} />
                        <Bar dataKey="revenue" radius={[4,4,0,0]}>
                          {servicesTop5.map((e, i) => (
                            <Cell key={i} fill={e.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-[#E5E7EB]">
                  <CardHeader>
                    <CardTitle>Top thuốc sử dụng</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={medsTop10} layout="vertical" margin={{ left: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis type="number" stroke="#687280" />
                        <YAxis type="category" dataKey="name" stroke="#687280" width={120} />
                        <Tooltip formatter={(v, n, p) => [v, `Số đơn - ${p?.payload?.group}`]} />
                        <Bar dataKey="count">
                          {medsTop10.map((e, i) => (
                            <Cell key={i} fill={e.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="appointments" className="space-y-6">
              <Card className="border-[#E5E7EB]">
                <CardHeader>
                  <CardTitle>Thống kê lịch hẹn</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#007BFF]">{totalAppointments}</div>
                      <div className="text-sm text-[#687280]">Tổng cuộc hẹn</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#16a34a]">
                        {Math.round(totalAppointments * 0.95)}
                      </div>
                      <div className="text-sm text-[#687280]">Đã hoàn thành</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">
                        {Math.round(totalAppointments * 0.05)}
                      </div>
                      <div className="text-sm text-[#687280]">Đã hủy</div>
                    </div>
                  </div>
                  
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dailyAppointments}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="day" stroke="#687280" />
                      <YAxis stroke="#687280" />
                      <Tooltip />
                      <Bar dataKey="appointments" fill="#007BFF" name="Tổng cuộc hẹn" />
                      <Bar dataKey="completed" fill="#16a34a" name="Hoàn thành" />
                      <Bar dataKey="cancelled" fill="#ef4444" name="Hủy" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="doctors" className="space-y-6">
              <Card className="border-[#E5E7EB]">
                <CardHeader>
                  <CardTitle>Top bác sĩ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topDoctors.map((doctor, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-[#E5E7EB] rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-[#007BFF]/10 rounded-full flex items-center justify-center">
                            <span className="text-[#007BFF] font-semibold">{index + 1}</span>
                          </div>
                          <div>
                            <div className="font-medium">{doctor.name}</div>
                            <div className="text-sm text-[#687280]">{doctor.appointments} cuộc hẹn</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{doctor.revenue.toLocaleString('vi-VN')} VND</div>
                          <div className="text-sm text-[#687280] flex items-center gap-1">
                            ⭐ {doctor.rating}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#E5E7EB]">
                <CardHeader>
                  <CardTitle>Hiệu suất bác sĩ (bệnh nhân/ngày)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={staffPerformance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="name" stroke="#687280" />
                      <YAxis stroke="#687280" />
                      <Tooltip />
                      <Bar dataKey="patientsPerDay" fill="#34d399" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-[#E5E7EB]">
                <CardHeader>
                  <CardTitle>Lịch hẹn & tỉ lệ vắng mặt (theo tuần)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={apptNoShowWeekly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="week" stroke="#687280" />
                      <YAxis stroke="#687280" />
                      <Tooltip />
                      <Bar dataKey="booked" stackId="s" name="Đặt lịch" fill="#3b82f6" />
                      <Bar dataKey="arrived" stackId="s" name="Đến khám" fill="#22c55e" />
                      <Bar dataKey="cancelled" stackId="s" name="Hủy" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
