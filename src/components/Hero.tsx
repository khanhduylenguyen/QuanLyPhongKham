import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Star, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-doctor.jpg";
import { getCurrentUser } from "@/lib/auth";
import AuthDialog from "@/components/auth/AuthDialog";

const Hero = () => {
  const navigate = useNavigate();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const handleBookingClick = () => {
    const user = getCurrentUser();
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    if (user.role === "patient") {
      navigate("/patient/book");
    } else {
      navigate("/login", { state: { returnPath: "/patient/book" } });
    }
  };

  const handleViewDoctorsClick = () => {
    const user = getCurrentUser();
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    // Scroll to featured doctors section
    const doctorsSection = document.querySelector("#doctors");
    if (doctorsSection) {
      doctorsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-background to-primary/5">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Star className="h-4 w-4 fill-current" />
              <span>Phòng khám uy tín hàng đầu</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Đặt lịch khám{" "}
              <span className="text-primary">nhanh chóng</span>,
              <br />
              theo dõi sức khỏe{" "}
              <span className="text-primary">dễ dàng</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl">
              ClinicCare giúp bạn đặt lịch khám với bác sĩ chuyên khoa, 
              lưu trữ hồ sơ sức khỏe điện tử và nhận nhắc nhở tái khám tự động.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="gap-2 text-base shadow-hover" onClick={handleBookingClick}>
                <Calendar className="h-5 w-5" />
                Đặt lịch ngay
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="gap-2 text-base" onClick={handleViewDoctorsClick}>
                <Users className="h-5 w-5" />
                Xem danh sách bác sĩ
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t">
              <div>
                <div className="text-3xl font-bold text-primary">20+</div>
                <div className="text-sm text-muted-foreground">Bác sĩ</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">1000+</div>
                <div className="text-sm text-muted-foreground">Bệnh nhân</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">10+</div>
                <div className="text-sm text-muted-foreground">Chuyên khoa</div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={heroImage}
                alt="Bác sĩ tư vấn bệnh nhân"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
            </div>
            
            {/* Floating Card */}
            <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-xl shadow-card border hidden lg:block">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">Đặt lịch dễ dàng</div>
                  <div className="text-sm text-muted-foreground">Chỉ trong 30 giây</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </section>
  );
};

export default Hero;
