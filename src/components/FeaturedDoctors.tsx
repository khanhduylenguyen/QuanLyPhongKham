import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Star, Calendar, User, Award, Clock } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import AuthDialog from "@/components/auth/AuthDialog";
import { getDoctorRating, getDoctorReviewStats } from "@/lib/reviews";

const STAFF_STORAGE_KEY = "cliniccare:staff";

const fallbackDoctors = [
  {
    name: "BS. Nguyễn Văn An",
    specialty: "Tim mạch",
    experience: "15 năm kinh nghiệm",
    rating: 4.9,
    reviews: 120,
    available: true,
  },
  {
    name: "BS. Trần Thị Bình",
    specialty: "Nhi khoa",
    experience: "12 năm kinh nghiệm",
    rating: 4.8,
    reviews: 98,
    available: true,
  },
  {
    name: "BS. Lê Hoàng Cường",
    specialty: "Tai Mũi Họng",
    experience: "10 năm kinh nghiệm",
    rating: 4.9,
    reviews: 85,
    available: false,
  },
  {
    name: "BS. Phạm Thu Dung",
    specialty: "Da liễu",
    experience: "8 năm kinh nghiệm",
    rating: 4.7,
    reviews: 76,
    available: true,
  },
];

const loadDoctors = () => {
  try {
    const stored = localStorage.getItem(STAFF_STORAGE_KEY);
    if (stored) {
      const staff = JSON.parse(stored);
      return staff
        .filter((s: any) => s.role === "doctor" && s.status === "active")
        .slice(0, 4)
        .map((s: any) => {
          const realRating = getDoctorRating(s.id);
          const stats = getDoctorReviewStats(s.id);
          return {
            id: s.id,
            name: s.fullName,
            specialty: s.specialty || "Nội tổng quát",
            experience: s.experienceYears ? `${s.experienceYears} năm kinh nghiệm` : "Nhiều năm kinh nghiệm",
            rating: realRating > 0 ? realRating : (s.rating || 4.5),
            reviews: stats.totalReviews || Math.floor(Math.random() * 100) + 20,
            available: s.status === "active",
          };
        });
    }
  } catch {}
  return [];
};

interface Doctor {
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  reviews: number;
  available: boolean;
  id?: string;
}

const FeaturedDoctors = () => {
  const navigate = useNavigate();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [doctors, setDoctors] = useState(() => {
    const loaded = loadDoctors();
    return loaded.length > 0 ? loaded : fallbackDoctors;
  });

  useEffect(() => {
    // Load doctors on mount
    const loaded = loadDoctors();
    setDoctors(loaded.length > 0 ? loaded : fallbackDoctors);
    
    const handleUpdate = () => {
      const loaded = loadDoctors();
      setDoctors(loaded.length > 0 ? loaded : fallbackDoctors);
    };
    window.addEventListener("staffUpdated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("staffUpdated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const handleCardClick = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsDetailOpen(true);
  };

  const handleBookingClick = (e: React.MouseEvent, doctorName: string, specialty: string) => {
    e.stopPropagation(); // Prevent card click event
    const user = getCurrentUser();
    if (!user) {
      setShowAuthDialog(true);
      setIsDetailOpen(false);
      return;
    }
    
    if (user.role !== "patient") {
      navigate("/login", { state: { returnPath: "/patient/book", specialty } });
      setIsDetailOpen(false);
      return;
    }

    // Navigate to booking page
    navigate("/patient/book", { state: { specialty, doctorName } });
    setIsDetailOpen(false);
  };

  return (
    <section id="doctors" className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Bác sĩ tiêu biểu
          </h2>
          <p className="text-muted-foreground text-lg">
            Đội ngũ bác sĩ giàu kinh nghiệm, tận tâm với bệnh nhân
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {doctors.map((doctor, index) => (
            <Card 
              key={index} 
              className="overflow-hidden hover:shadow-hover transition-all duration-300 cursor-pointer"
              onClick={() => handleCardClick(doctor)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Avatar Placeholder */}
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-3xl font-bold text-primary-foreground">
                    {doctor.name.split(" ").pop()?.charAt(0)}
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-1">{doctor.name}</h3>
                    <Badge variant="secondary" className="mb-2">
                      {doctor.specialty}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {doctor.experience}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{doctor.rating}</span>
                    <span className="text-sm text-muted-foreground">
                      ({doctor.reviews} đánh giá)
                    </span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="bg-secondary/50 p-4">
                <Button
                  className="w-full gap-2"
                  variant={doctor.available ? "default" : "outline"}
                  disabled={!doctor.available}
                  onClick={(e) => doctor.available && handleBookingClick(e, doctor.name, doctor.specialty)}
                >
                  <Calendar className="h-4 w-4" />
                  {doctor.available ? "Đặt lịch ngay" : "Hết lịch"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8 space-x-4">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => {
              navigate("/patient/doctors/search");
            }}
          >
            Tìm kiếm nâng cao
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => {
              const user = getCurrentUser();
              if (!user) {
                setShowAuthDialog(true);
              } else {
                // Scroll to quick booking section
                const bookingSection = document.querySelector("#quick-booking");
                if (bookingSection) {
                  bookingSection.scrollIntoView({ behavior: "smooth" });
                }
              }
            }}
          >
            Đặt lịch nhanh
          </Button>
        </div>
      </div>
      
      {/* Doctor Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          {selectedDoctor && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-4xl font-bold text-primary-foreground">
                    {selectedDoctor.name.split(" ").pop()?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-2xl mb-2">{selectedDoctor.name}</DialogTitle>
                    <Badge variant="secondary" className="mb-2">
                      {selectedDoctor.specialty}
                    </Badge>
                    <DialogDescription className="text-base mt-2">
                      {selectedDoctor.experience}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    <div>
                      <p className="font-semibold text-lg">{selectedDoctor.rating}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedDoctor.reviews} đánh giá
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <Award className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold text-lg">Chuyên khoa</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedDoctor.specialty}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Thông tin bác sĩ
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedDoctor.name} là bác sĩ chuyên khoa {selectedDoctor.specialty} với {selectedDoctor.experience.toLowerCase()}. 
                    Bác sĩ đã nhận được {selectedDoctor.reviews} đánh giá tích cực từ bệnh nhân với điểm trung bình {selectedDoctor.rating}/5.0.
                  </p>
                </div>

                <div className="flex items-center gap-2 p-4 border rounded-lg">
                  <Clock className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-semibold">Trạng thái</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedDoctor.available ? "Đang nhận bệnh nhân" : "Hiện không nhận bệnh nhân mới"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsDetailOpen(false)}
                >
                  Đóng
                </Button>
                <Button
                  className="flex-1 gap-2"
                  disabled={!selectedDoctor.available}
                  onClick={(e) => handleBookingClick(e, selectedDoctor.name, selectedDoctor.specialty)}
                >
                  <Calendar className="h-4 w-4" />
                  Đặt lịch ngay
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </section>
  );
};

export default FeaturedDoctors;
