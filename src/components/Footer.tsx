import { Calendar, Mail, MapPin, Phone, Facebook, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer id="contact" className="bg-card border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
                <Calendar className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">ClinicCare</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Hệ thống quản lý phòng khám và đặt lịch khám hiện đại, 
              mang đến trải nghiệm chăm sóc sức khỏe tốt nhất cho bạn.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Giới thiệu
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-primary transition-colors">
                  Dịch vụ
                </a>
              </li>
              <li>
                <a href="#doctors" className="hover:text-primary transition-colors">
                  Đội ngũ bác sĩ
                </a>
              </li>
              <li>
                <a href="/news" className="hover:text-primary transition-colors">
                  Tin tức sức khỏe
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Liên hệ
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4">Dịch vụ</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Đặt lịch khám online</li>
              <li>Khám tổng quát</li>
              <li>Xét nghiệm</li>
              <li>Chẩn đoán hình ảnh</li>
              <li>Tư vấn sức khỏe</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                <span>123 Đường ABC, Quận 1, TP.HCM</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0 text-primary" />
                <span>1900 xxxx</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0 text-primary" />
                <span>contact@cliniccare.vn</span>
              </li>
            </ul>

            <div className="flex gap-2 mt-4">
              <Button size="icon" variant="outline" className="h-8 w-8">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline" className="h-8 w-8">
                <Youtube className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2025 ClinicCare. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">
              Điều khoản sử dụng
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Chính sách bảo mật
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
