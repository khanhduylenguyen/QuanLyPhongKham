import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Calendar,
  UserPlus,
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle,
} from "lucide-react";
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
} from "recharts";
import DashboardLayout from "@/components/layout/DashboardLayout";

// KPI Cards Data
const kpiData = [
  {
    title: "Số bác sĩ đang làm việc",
    value: "12",
    subtitle: "bác sĩ hôm nay",
    icon: Users,
    color: "bg-[#007BFF]",
    change: "+2",
    trend: "up",
  },
  {
    title: "Lịch khám hôm nay",
    value: "58",
    subtitle: "cuộc hẹn",
    icon: Calendar,
    color: "bg-[#4CAF50]",
    change: "+8",
    trend: "up",
  },
  {
    title: "Bệnh nhân mới",
    value: "+25",
    subtitle: "bệnh nhân trong tuần",
    icon: UserPlus,
    color: "bg-[#FF9800]",
    change: "+5",
    trend: "up",
  },
  {
    title: "Doanh thu tuần",
    value: "₫75,000,000",
    subtitle: "tổng doanh thu",
    icon: DollarSign,
    color: "bg-[#9C27B0]",
    change: "+12%",
    trend: "up",
  },
];

// Appointment Chart Data
const appointmentData = [
  { name: "T2", value: 45 },
  { name: "T3", value: 52 },
  { name: "T4", value: 48 },
  { name: "T5", value: 58 },
  { name: "T6", value: 62 },
  { name: "T7", value: 55 },
  { name: "CN", value: 38 },
];

// Patient Type Chart Data
const patientTypeData = [
  { name: "Bệnh nhân mới", value: 35, color: "#4CAF50" },
  { name: "Tái khám", value: 65, color: "#007BFF" },
];

// Recent Appointments
const recentAppointments = [
  {
    id: "A023",
    patient: "Nguyễn Văn A",
    doctor: "BS. Lan",
    time: "09:00",
    status: "confirmed",
    statusLabel: "Đã xác nhận",
  },
  {
    id: "A024",
    patient: "Trần Thị B",
    doctor: "BS. Minh",
    time: "10:30",
    status: "pending",
    statusLabel: "Đang chờ",
  },
  {
    id: "A025",
    patient: "Lê Văn C",
    doctor: "BS. Hùng",
    time: "14:00",
    status: "confirmed",
    statusLabel: "Đã xác nhận",
  },
  {
    id: "A026",
    patient: "Phạm Thị D",
    doctor: "BS. Lan",
    time: "15:30",
    status: "cancelled",
    statusLabel: "Đã hủy",
  },
];

// Recent Activities
const recentActivities = [
  {
    type: "appointment",
    message: "Bệnh nhân Nguyễn Văn A vừa đặt lịch khám với BS. Lan lúc 9h sáng mai.",
    time: "5 phút trước",
    icon: Calendar,
  },
  {
    type: "confirmation",
    message: "Lễ tân Minh đã xác nhận cuộc hẹn ID #A023.",
    time: "15 phút trước",
    icon: Clock,
  },
  {
    type: "alert",
    message: "Cập nhật lịch bảo trì hệ thống 22:00 – 23:00 ngày 31/10.",
    time: "1 giờ trước",
    icon: AlertCircle,
  },
];

const Dashboard = () => {
  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-[#687280] mt-1">
            Tổng quan hệ thống và thống kê nhanh
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiData.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <Card
                key={index}
                className="border-[#E5E7EB] hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  // Navigate to detail page
                  console.log(`Navigate to ${kpi.title} detail`);
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${kpi.color} p-3 rounded-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    {kpi.trend === "up" && (
                      <div className="flex items-center gap-1 text-[#4CAF50] text-sm">
                        <TrendingUp className="h-4 w-4" />
                        {kpi.change}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-[#687280] mb-1">{kpi.title}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {kpi.value}
                    </p>
                    <p className="text-xs text-[#687280] mt-1">
                      {kpi.subtitle}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts & Appointments Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Appointment Chart */}
          <Card className="lg:col-span-2 border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Lịch khám theo tuần
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={appointmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#687280" />
                  <YAxis stroke="#687280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #E5E7EB",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="value" fill="#007BFF" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Patient Type Chart */}
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Tỷ lệ bệnh nhân
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={patientTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {patientTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Appointments & Activities Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Appointments */}
          <Card className="lg:col-span-2 border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Lịch hẹn hôm nay
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          appointment.status === "confirmed"
                            ? "bg-[#4CAF50]"
                            : appointment.status === "pending"
                            ? "bg-[#FF9800]"
                            : "bg-red-500"
                        }`}
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {appointment.patient}
                        </p>
                        <p className="text-sm text-[#687280]">
                          {appointment.doctor} • {appointment.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          appointment.status === "confirmed"
                            ? "bg-[#4CAF50]/10 text-[#4CAF50]"
                            : appointment.status === "pending"
                            ? "bg-[#FF9800]/10 text-[#FF9800]"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {appointment.statusLabel}
                      </span>
                      <span className="text-xs text-[#687280]">
                        #{appointment.id}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Hoạt động gần đây
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div
                      key={index}
                      className="flex gap-3 p-3 rounded-lg border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-[#007BFF]/10 flex items-center justify-center">
                          <Icon className="h-4 w-4 text-[#007BFF]" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-[#687280] mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

