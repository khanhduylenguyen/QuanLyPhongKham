import DoctorLayout from "@/components/layout/DoctorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Records = () => (
  <DoctorLayout>
    <Card className="border-[#E5E7EB]">
      <CardHeader><CardTitle>Hồ sơ bệnh nhân </CardTitle></CardHeader>
      <CardContent>
        <div className="text-sm text-[#687280]">Danh sách bệnh án, tìm kiếm, lọc theo bệnh nhân/bác sĩ, mở chi tiết để cập nhật chẩn đoán và toa thuốc.</div>
      </CardContent>
    </Card>
  </DoctorLayout>
);

export default Records;


