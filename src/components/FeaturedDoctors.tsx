import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import AuthDialog from "@/components/auth/AuthDialog";

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
        .map((s: any) => ({
          name: s.fullName,
          specialty: s.specialty || "Nội tổng quát",
          experience: s.experienceYears ? `${s.experienceYears} năm kinh nghiệm` : "Nhiều năm kinh nghiệm",
          rating: s.rating || 4.5,
          reviews: Math.floor(Math.random() * 100) + 20,
          available: s.status === "active",
        }));
    }
  } catch {}
  return [];
};

const FeaturedDoctors = () => {
  const navigate = useNavigate();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
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

  const handleBookingClick = (doctorName: string, specialty: string) => {
    const user = getCurrentUser();
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    
    if (user.role !== "patient") {
      navigate("/login", { state: { returnPath: "/patient/book", specialty } });
      return;
    }

    // Navigate to booking page
    navigate("/patient/book", { state: { specialty, doctorName } });
  };

  return (
    <section id="featured-doctors" className="py-16 bg-secondary/30">
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
            <Card key={index} className="overflow-hidden hover:shadow-hover transition-all duration-300">
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
                  onClick={() => doctor.available && handleBookingClick(doctor.name, doctor.specialty)}
                >
                  <Calendar className="h-4 w-4" />
                  {doctor.available ? "Đặt lịch ngay" : "Hết lịch"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
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
            Xem tất cả bác sĩ
          </Button>
        </div>
      </div>
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </section>
  );
};

export default FeaturedDoctors;
