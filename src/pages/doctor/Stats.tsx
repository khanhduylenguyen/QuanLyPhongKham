import DoctorLayout from "@/components/layout/DoctorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const personal = [
  { month: "T1", cases: 42 },
  { month: "T2", cases: 48 },
  { month: "T3", cases: 50 },
  { month: "T4", cases: 55 },
  { month: "T5", cases: 58 },
  { month: "T6", cases: 62 },
];

const Stats = () => (
  <DoctorLayout>
    <Card className="border-[#E5E7EB]">
      <CardHeader><CardTitle>Thống kê cá nhân</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={personal}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="month" stroke="#687280" />
            <YAxis stroke="#687280" />
            <Tooltip />
            <Line dataKey="cases" type="monotone" stroke="#007BFF" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  </DoctorLayout>
);

export default Stats;


