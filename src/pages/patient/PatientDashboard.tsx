import PatientLayout from "@/components/layout/PatientLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarPlus, ClipboardList, Pill, FileText, ArrowRight } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const history = [
  { month: "T1", visits: 1 },
  { month: "T2", visits: 2 },
  { month: "T3", visits: 1 },
  { month: "T4", visits: 3 },
  { month: "T5", visits: 1 },
  { month: "T6", visits: 2 },
];

const PatientDashboard = () => {
  return (
    <PatientLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bảng điều khiển Bệnh nhân</h1>
          <p className="text-sm text-[#687280] mt-1">Quản lý lịch hẹn, hồ sơ khám và toa thuốc</p>
        </div>
        <Button className="bg-[#007BFF] hover:bg-[#0056B3]"><CalendarPlus className="h-4 w-4 mr-2" />Đặt lịch khám mới</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-[#E5E7EB]"><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-[#687280]">Lịch hẹn sắp tới</p><p className="text-2xl font-bold text-gray-900">02</p></div><ClipboardList className="h-6 w-6 text-[#007BFF]" /></div></CardContent></Card>
        <Card className="border-[#E5E7EB]"><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-[#687280]">Hồ sơ bệnh án</p><p className="text-2xl font-bold text-gray-900">05</p></div><FileText className="h-6 w-6 text-[#16a34a]" /></div></CardContent></Card>
        <Card className="border-[#E5E7EB]"><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-[#687280]">Toa thuốc</p><p className="text-2xl font-bold text-gray-900">03</p></div><Pill className="h-6 w-6 text-[#f59e0b]" /></div></CardContent></Card>
      </div>

      <Card className="border-[#E5E7EB]">
        <CardHeader><CardTitle>Lịch sử lượt khám theo tháng</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#687280" />
              <YAxis stroke="#687280" />
              <Tooltip />
              <Area type="monotone" dataKey="visits" stroke="#007BFF" fill="#007BFF" fillOpacity={0.25} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </PatientLayout>
  );
};

export default PatientDashboard;


