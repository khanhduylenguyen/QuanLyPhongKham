import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Search,
  Star,
  Clock,
  DollarSign,
  TrendingUp,
  Filter,
  X,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { toast } from "sonner";

const STAFF_STORAGE_KEY = "cliniccare:staff";

interface ServiceItem {
  icon: any;
  name: string;
  specialty: string;
  description: string;
  fullDescription?: string;
  price?: number;
  duration?: string;
  rating?: number;
  reviewCount?: number;
  popular?: boolean;
  features?: string[];
}

const baseServices: ServiceItem[] = [
  {
    icon: Stethoscope,
    name: "Khám tổng quát",
    specialty: "Nội tổng quát",
    description: "Khám sức khỏe định kỳ và kiểm tra tổng quát",
    fullDescription: "Khám sức khỏe tổng quát toàn diện bao gồm kiểm tra các chỉ số cơ bản, tư vấn về lối sống và dinh dưỡng. Phù hợp cho mọi lứa tuổi.",
    price: 150000,
    duration: "30-45 phút",
    rating: 4.8,
    reviewCount: 324,
    popular: true,
    features: ["Kiểm tra huyết áp", "Đo nhịp tim", "Tư vấn sức khỏe", "Báo cáo chi tiết"],
  },
  {
    icon: Baby,
    name: "Nhi khoa",
    specialty: "Nhi",
    description: "Chăm sóc sức khỏe cho trẻ em từ sơ sinh đến 16 tuổi",
    fullDescription: "Dịch vụ chăm sóc sức khỏe chuyên biệt cho trẻ em với đội ngũ bác sĩ giàu kinh nghiệm. Bao gồm tiêm chủng, khám phát triển và điều trị các bệnh thường gặp ở trẻ.",
    price: 180000,
    duration: "30-40 phút",
    rating: 4.9,
    reviewCount: 456,
    popular: true,
    features: ["Tiêm chủng", "Khám phát triển", "Tư vấn dinh dưỡng trẻ em", "Theo dõi tăng trưởng"],
  },
  {
    icon: Heart,
    name: "Tim mạch",
    specialty: "Tim mạch",
    description: "Chẩn đoán và điều trị các bệnh về tim mạch",
    fullDescription: "Chuyên khoa tim mạch với các thiết bị hiện đại để chẩn đoán chính xác các bệnh về tim mạch. Điều trị và theo dõi các bệnh lý tim mạch phổ biến.",
    price: 250000,
    duration: "45-60 phút",
    rating: 4.7,
    reviewCount: 289,
    popular: false,
    features: ["Điện tâm đồ", "Siêu âm tim", "Tư vấn điều trị", "Theo dõi định kỳ"],
  },
  {
    icon: Ear,
    name: "Tai Mũi Họng",
    specialty: "Tai Mũi Họng",
    description: "Khám và điều trị các bệnh về tai, mũi, họng",
    fullDescription: "Khám và điều trị các bệnh lý về tai, mũi, họng với thiết bị nội soi hiện đại. Điều trị viêm xoang, viêm họng, viêm tai giữa và các bệnh liên quan.",
    price: 200000,
    duration: "25-35 phút",
    rating: 4.6,
    reviewCount: 198,
    popular: false,
    features: ["Nội soi tai mũi họng", "Điều trị viêm xoang", "Xử lý ráy tai", "Tư vấn phòng ngừa"],
  },
  {
    icon: Activity,
    name: "Chấn thương chỉnh hình",
    specialty: "Chấn thương chỉnh hình",
    description: "Điều trị chấn thương và các bệnh về xương khớp",
    fullDescription: "Chuyên điều trị các chấn thương về xương khớp, cột sống. Bao gồm vật lý trị liệu, phục hồi chức năng và tư vấn phòng ngừa chấn thương.",
    price: 300000,
    duration: "45-60 phút",
    rating: 4.8,
    reviewCount: 167,
    popular: false,
    features: ["Chụp X-quang", "Vật lý trị liệu", "Phục hồi chức năng", "Tư vấn phòng ngừa"],
  },
  {
    icon: Microscope,
    name: "Xét nghiệm",
    specialty: "Xét nghiệm",
    description: "Xét nghiệm máu, nước tiểu và các chỉ số sức khỏe",
    fullDescription: "Hệ thống xét nghiệm hiện đại với kết quả nhanh chóng và chính xác. Bao gồm xét nghiệm máu, nước tiểu, sinh hóa và các chỉ số sức khỏe quan trọng.",
    price: 250000,
    duration: "15-20 phút",
    rating: 4.9,
    reviewCount: 523,
    popular: true,
    features: ["Xét nghiệm máu", "Xét nghiệm nước tiểu", "Sinh hóa máu", "Kết quả nhanh"],
  },
  {
    icon: Pill,
    name: "Da liễu",
    specialty: "Da liễu",
    description: "Chăm sóc và điều trị các vấn đề về da",
    fullDescription: "Chuyên điều trị các bệnh về da như mụn, viêm da, dị ứng, nấm da. Tư vấn chăm sóc da và điều trị các vấn đề thẩm mỹ da.",
    price: 200000,
    duration: "30-40 phút",
    rating: 4.7,
    reviewCount: 234,
    popular: false,
    features: ["Khám da liễu", "Điều trị mụn", "Tư vấn chăm sóc da", "Điều trị dị ứng"],
  },
  {
    icon: Users,
    name: "Tư vấn dinh dưỡng",
    specialty: "Dinh dưỡng",
    description: "Tư vấn chế độ ăn uống khoa học",
    fullDescription: "Tư vấn dinh dưỡng chuyên sâu với chế độ ăn uống phù hợp cho từng đối tượng. Bao gồm giảm cân, tăng cân, dinh dưỡng cho bà bầu và trẻ em.",
    price: 150000,
    duration: "40-50 phút",
    rating: 4.8,
    reviewCount: 145,
    popular: false,
    features: ["Đánh giá dinh dưỡng", "Thực đơn cá nhân hóa", "Tư vấn giảm/tăng cân", "Theo dõi tiến độ"],
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

  const [searchQuery, setSearchQuery] = useState("");
  const [filterPopular, setFilterPopular] = useState<boolean | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceItem & { doctorCount: number } | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

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

  const filteredServices = useMemo(() => {
    return servicesWithCount.filter((service) => {
      const matchesSearch =
        !searchQuery ||
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.specialty.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPopular = filterPopular === null || service.popular === filterPopular;
      
      return matchesSearch && matchesPopular;
    });
  }, [servicesWithCount, searchQuery, filterPopular]);

  const handleServiceClick = (service: ServiceItem & { doctorCount: number }) => {
    setSelectedService(service);
    setIsDetailOpen(true);
  };

  const handleBookNow = (service: ServiceItem & { doctorCount: number }) => {
    const user = getCurrentUser();
    
    // If not logged in, redirect to login with return path
    if (!user) {
      toast.info("Vui lòng đăng nhập để đặt lịch khám");
      navigate("/login", { state: { returnPath: "/patient/book", specialty: service.specialty } });
      setIsDetailOpen(false);
      return;
    }
    
    // If logged in but not as patient, show message
    if (user.role !== "patient") {
      toast.warning("Chức năng này chỉ dành cho bệnh nhân");
      setIsDetailOpen(false);
      return;
    }
    
    // If logged in as patient, navigate to booking page with pre-selected specialty
    navigate("/patient/book", { state: { specialty: service.specialty, serviceName: service.name } });
    setIsDetailOpen(false);
  };

  const formatPrice = (price?: number) => {
    if (!price) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <section id="services" className="py-20 bg-gradient-to-b from-background via-secondary/10 to-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <Badge variant="outline" className="text-sm">
              Dịch vụ y tế
            </Badge>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Dịch vụ nổi bật
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Chúng tôi cung cấp đầy đủ các dịch vụ khám và chữa bệnh với đội ngũ bác sĩ chuyên môn cao, 
            trang thiết bị hiện đại và dịch vụ chăm sóc tận tâm
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm dịch vụ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button
            variant={filterPopular === true ? "default" : "outline"}
            onClick={() => setFilterPopular(filterPopular === true ? null : true)}
            className="h-12 gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            {filterPopular === true ? "Phổ biến" : "Tất cả"}
          </Button>
          {filterPopular !== null && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilterPopular(null)}
              className="h-12"
            >
              <X className="h-4 w-4 mr-2" />
              Xóa bộ lọc
            </Button>
          )}
        </div>

        {/* Services Grid */}
        {filteredServices.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {filteredServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card
                  key={index}
                  className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50 hover:-translate-y-2 bg-card/50 backdrop-blur-sm relative overflow-hidden"
                >
                  {/* Popular Badge */}
                  {service.popular && (
                    <div className="absolute top-3 right-3 z-10">
                      <Badge className="bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0 shadow-lg">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Phổ biến
                      </Badge>
                    </div>
                  )}

                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-primary/10 transition-all duration-300"></div>

                  <CardContent className="p-6 relative z-0">
                    <div className="flex items-start justify-between mb-4">
                      <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary group-hover:to-primary/80 group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-primary/20">
                        <Icon className="h-8 w-8 text-primary group-hover:text-primary-foreground transition-colors" />
                      </div>
                      {service.doctorCount > 0 && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-0 font-semibold">
                          {service.doctorCount} BS
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">
                      {service.name}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[2.5rem]">
                      {service.description}
                    </p>

                    {/* Rating and Price */}
                    <div className="flex items-center justify-between mb-4 pb-4 border-b">
                      {service.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold">{service.rating}</span>
                          {service.reviewCount && (
                            <span className="text-xs text-muted-foreground ml-1">
                              ({service.reviewCount})
                            </span>
                          )}
                        </div>
                      )}
                      {service.price && (
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary">{formatPrice(service.price)}</p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 group-hover:bg-primary/10 group-hover:text-primary transition-colors"
                        onClick={() => handleServiceClick(service)}
                      >
                        Chi tiết
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all"
                        onClick={() => handleBookNow(service)}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Đặt lịch
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">
              Không tìm thấy dịch vụ nào phù hợp
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setFilterPopular(null);
              }}
            >
              Xóa bộ lọc
            </Button>
          </div>
        )}

        {/* View All Button */}
        <div className="text-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              const booking = document.querySelector("#quick-booking");
              if (booking) {
                booking.scrollIntoView({ behavior: "smooth" });
              } else {
                const user = getCurrentUser();
                if (user?.role === "patient") {
                  navigate("/patient/book");
                } else {
                  navigate("/login");
                }
              }
            }}
            className="gap-2 h-12 px-8"
          >
            Xem tất cả dịch vụ
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Service Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedService && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5">
                    {(() => {
                      const Icon = selectedService.icon;
                      return <Icon className="h-8 w-8 text-primary" />;
                    })()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <DialogTitle className="text-2xl">{selectedService.name}</DialogTitle>
                      {selectedService.popular && (
                        <Badge className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Phổ biến
                        </Badge>
                      )}
                    </div>
                    <DialogDescription className="text-base">
                      {selectedService.specialty}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Description */}
                <div>
                  <h4 className="font-semibold mb-2">Mô tả dịch vụ</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedService.fullDescription || selectedService.description}
                  </p>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {selectedService.price && (
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">Giá dịch vụ</span>
                      </div>
                      <p className="text-xl font-bold text-primary">
                        {formatPrice(selectedService.price)}
                      </p>
                    </div>
                  )}
                  {selectedService.duration && (
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">Thời gian</span>
                      </div>
                      <p className="text-xl font-bold text-primary">
                        {selectedService.duration}
                      </p>
                    </div>
                  )}
                  {selectedService.rating && (
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="h-4 w-4 text-primary fill-primary" />
                        <span className="text-sm text-muted-foreground">Đánh giá</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xl font-bold text-primary">
                          {selectedService.rating}
                        </p>
                        {selectedService.reviewCount && (
                          <span className="text-sm text-muted-foreground">
                            ({selectedService.reviewCount} đánh giá)
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {selectedService.doctorCount > 0 && (
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">Bác sĩ</span>
                      </div>
                      <p className="text-xl font-bold text-primary">
                        {selectedService.doctorCount} bác sĩ
                      </p>
                    </div>
                  )}
                </div>

                {/* Features */}
                {selectedService.features && selectedService.features.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Bao gồm</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedService.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsDetailOpen(false)}
                  >
                    Đóng
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    onClick={() => handleBookNow(selectedService)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Đặt lịch ngay
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Services;
