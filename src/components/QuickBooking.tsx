import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Search, User } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import AuthDialog from "@/components/auth/AuthDialog";
import { toast } from "sonner";

const STAFF_STORAGE_KEY = "cliniccare:staff";

const loadDoctors = () => {
  try {
    const stored = localStorage.getItem(STAFF_STORAGE_KEY);
    if (stored) {
      const staff = JSON.parse(stored);
      return staff
        .filter((s: any) => s.role === "doctor" && s.status === "active")
        .map((s: any) => ({ id: s.id, name: s.fullName, specialty: s.specialty || "Nội tổng quát" }));
    }
  } catch {}
  return [];
};

const QuickBooking = () => {
  const navigate = useNavigate();
  const [allDoctors, setAllDoctors] = useState(() => loadDoctors());
  const [filteredDoctors, setFilteredDoctors] = useState<Array<{ id: string; name: string; specialty: string }>>([]);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");

  useEffect(() => {
    // Load doctors on mount
    const loaded = loadDoctors();
    setAllDoctors(loaded);
    
    const handleUpdate = () => {
      const loaded = loadDoctors();
      setAllDoctors(loaded);
    };
    window.addEventListener("staffUpdated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("staffUpdated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Filter doctors when specialty changes
  useEffect(() => {
    if (selectedSpecialty) {
      const filtered = allDoctors.filter(
        (doc) => doc.specialty === selectedSpecialty || doc.specialty === "Nội tổng quát"
      );
      setFilteredDoctors(filtered);
      // Reset doctor selection when specialty changes
      if (selectedDoctor) {
        const stillAvailable = filtered.some((doc) => doc.id === selectedDoctor);
        if (!stillAvailable) {
          setSelectedDoctor("");
        }
      }
    } else {
      setFilteredDoctors([]);
      setSelectedDoctor("");
    }
  }, [selectedSpecialty, allDoctors]);

  const handleSearchClick = () => {
    // Validate form
    if (!selectedSpecialty) {
      toast.error("Vui lòng chọn chuyên khoa");
      return;
    }

    if (!selectedDoctor) {
      toast.error("Vui lòng chọn bác sĩ");
      return;
    }

    if (!selectedDate) {
      toast.error("Vui lòng chọn ngày khám");
      return;
    }

    // Check if date is in the past
    const selected = new Date(selectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected < today) {
      toast.error("Vui lòng chọn ngày trong tương lai");
      return;
    }

    const user = getCurrentUser();
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    
    if (user.role !== "patient") {
      navigate("/login", { state: { returnPath: "/patient/book" } });
      return;
    }

    // Navigate to booking page with pre-selected values
    navigate("/patient/book", {
      state: {
        specialty: selectedSpecialty,
        doctorId: selectedDoctor,
        date: selectedDate,
      },
    });
  };

  return (
    <section id="quick-booking" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Đặt lịch khám nhanh
          </h2>
          <p className="text-muted-foreground text-lg">
            Chọn chuyên khoa và bác sĩ phù hợp với bạn
          </p>
        </div>

        <Card className="max-w-4xl mx-auto p-6 md:p-8 shadow-card">
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Chuyên khoa
              </label>
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn chuyên khoa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nội tổng quát">Khám tổng quát</SelectItem>
                  <SelectItem value="Tim mạch">Tim mạch</SelectItem>
                  <SelectItem value="Nhi">Nhi khoa</SelectItem>
                  <SelectItem value="Tai Mũi Họng">Tai Mũi Họng</SelectItem>
                  <SelectItem value="Da liễu">Da liễu</SelectItem>
                  <SelectItem value="Chấn thương chỉnh hình">Chấn thương chỉnh hình</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Bác sĩ
              </label>
              <Select 
                value={selectedDoctor} 
                onValueChange={setSelectedDoctor}
                disabled={!selectedSpecialty}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedSpecialty ? "Chọn bác sĩ" : "Chọn chuyên khoa trước"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredDoctors.length > 0 ? (
                    filteredDoctors.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id}>
                        {doc.name} - {doc.specialty}
                      </SelectItem>
                    ))
                  ) : selectedSpecialty ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Không có bác sĩ nào cho chuyên khoa này
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Vui lòng chọn chuyên khoa trước
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Ngày khám
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <Button className="w-full md:w-auto gap-2" size="lg" onClick={handleSearchClick}>
            <Search className="h-5 w-5" />
            Tìm bác sĩ phù hợp
          </Button>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            🔒 Thông tin của bạn được bảo mật tuyệt đối
          </p>
        </div>
      </div>
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </section>
  );
};

export default QuickBooking;
