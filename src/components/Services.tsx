import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Stethoscope,
  Baby,
  Heart,
  Ear,
  Activity,
  Microscope,
  Pill,
  Users,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { toast } from "sonner";

const STAFF_STORAGE_KEY = "cliniccare:staff";

interface ServiceItem {
  icon: any;
  name: string;
  specialty: string;
  description: string;
}

const baseServices: ServiceItem[] = [
  {
    icon: Stethoscope,
    name: "Khám tổng quát",
    specialty: "Nội tổng quát",
    description: "Khám sức khỏe định kỳ và kiểm tra tổng quát",
  },
  {
    icon: Baby,
    name: "Nhi khoa",
    specialty: "Nhi",
    description: "Chăm sóc sức khỏe cho trẻ em từ sơ sinh đến 16 tuổi",
  },
  {
    icon: Heart,
    name: "Tim mạch",
    specialty: "Tim mạch",
    description: "Chẩn đoán và điều trị các bệnh về tim mạch",
  },
  {
    icon: Ear,
    name: "Tai Mũi Họng",
    specialty: "Tai Mũi Họng",
    description: "Khám và điều trị các bệnh về tai, mũi, họng",
  },
  {
    icon: Activity,
    name: "Chấn thương chỉnh hình",
    specialty: "Chấn thương chỉnh hình",
    description: "Điều trị chấn thương và các bệnh về xương khớp",
  },
  {
    icon: Microscope,
    name: "Xét nghiệm",
    specialty: "Xét nghiệm",
    description: "Xét nghiệm máu, nước tiểu và các chỉ số sức khỏe",
  },
  {
    icon: Pill,
    name: "Da liễu",
    specialty: "Da liễu",
    description: "Chăm sóc và điều trị các vấn đề về da",
  },
  {
    icon: Users,
    name: "Tư vấn dinh dưỡng",
    specialty: "Dinh dưỡng",
    description: "Tư vấn chế độ ăn uống khoa học",
  },
];

const loadDoctorsBySpecialty = (specialty: string) => {
  try {
    const stored = localStorage.getItem(STAFF_STORAGE_KEY);
    if (stored) {
      const staff = JSON.parse(stored);
      return staff.filter(
        (s: any) =>
          s.role === "doctor" &&
          s.status === "active" &&
          (s.specialty === specialty || s.specialty?.includes(specialty))
      ).length;
    }
  } catch {}
  return 0;
};

const Services = () => {
  const [servicesWithCount, setServicesWithCount] = useState(() =>
    baseServices.map((service) => ({
      ...service,
      doctorCount: loadDoctorsBySpecialty(service.specialty),
    }))
  );

  useEffect(() => {
    const handleUpdate = () => {
      setServicesWithCount(
        baseServices.map((service) => ({
          ...service,
          doctorCount: loadDoctorsBySpecialty(service.specialty),
        }))
      );
    };

    window.addEventListener("staffUpdated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    handleUpdate();

    return () => {
      window.removeEventListener("staffUpdated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const navigate = useNavigate();

  const handleServiceClick = (service: ServiceItem) => {
    const user = getCurrentUser();
    
    // If not logged in, redirect to login with return path
    if (!user) {
      toast.info("Vui lòng đăng nhập để đặt lịch khám");
      navigate("/login", { state: { returnPath: "/patient/book", specialty: service.specialty } });
      return;
    }
    
    // If logged in but not as patient, show message
    if (user.role !== "patient") {
      toast.warning("Chức năng này chỉ dành cho bệnh nhân");
      return;
    }
    
    // If logged in as patient, navigate to booking page with pre-selected specialty
    navigate("/patient/book", { state: { specialty: service.specialty, serviceName: service.name } });
  };

  return (
    <section id="services" className="py-16 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Dịch vụ nổi bật
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Chúng tôi cung cấp đầy đủ các dịch vụ khám và chữa bệnh với đội ngũ bác sĩ chuyên môn cao
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {servicesWithCount.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50 hover:-translate-y-1 bg-card"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                      <Icon className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    {service.doctorCount > 0 && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                        {service.doctorCount} BS
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    {service.name}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {service.description}
                  </p>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full group-hover:bg-primary/10 group-hover:text-primary transition-colors"
                    onClick={() => handleServiceClick(service)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Đặt lịch ngay
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              const booking = document.querySelector("#quick-booking");
              if (booking) {
                booking.scrollIntoView({ behavior: "smooth" });
              } else {
                window.location.href = "/login";
              }
            }}
            className="gap-2"
          >
            Xem tất cả dịch vụ
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Services;
