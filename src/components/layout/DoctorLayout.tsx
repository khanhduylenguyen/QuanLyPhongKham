import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Stethoscope, FileText, Activity, Pill, LayoutDashboard, Menu, X, Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { logout } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = { children: React.ReactNode };

const menu = [
  { title: "Tổng quan", icon: LayoutDashboard, href: "/doctor" },
  { title: "Lịch khám", icon: Calendar, href: "/doctor/appointments" },
  { title: "Hồ sơ", icon: FileText, href: "/doctor/records" },
  { title: "Kê toa", icon: Pill, href: "/doctor/prescriptions" },
  { title: "Thống kê", icon: Activity, href: "/doctor/stats" },
];

const DoctorLayout = ({ children }: Props) => {
  const [open, setOpen] = useState(true);
  const [mobile, setMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      <aside className={`${open ? "w-64" : "w-20"} bg-white border-r border-[#E5E7EB] fixed lg:static h-screen z-50 transition-all duration-300`}>
        <div className="flex items-center justify-between p-4 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#007BFF]"><Stethoscope className="h-6 w-6 text-white" /></div>
            {open && <span className="text-xl font-bold text-gray-900">Doctor</span>}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 hidden lg:flex" onClick={()=>setOpen(!open)}>
            <Calendar className={`h-4 w-4 opacity-0`} />
          </Button>
        </div>
        <nav className="p-4">
          <ul className="space-y-1">
            {menu.map((m)=>{
              const Icon = m.icon;
              const active = location.pathname === m.href;
              return (
                <li key={m.href}>
                  <Link to={m.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${active ? "bg-[#007BFF] text-white" : "text-[#687280] hover:bg-[#F3F4F6] hover:text-[#007BFF]"}`}>
                    <Icon className="h-5 w-5" />
                    {open && <span className="text-sm font-medium">{m.title}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
      <div className="flex-1 flex flex-col lg:ml-0 overflow-hidden">
        <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-40">
          <div className="flex items-center justify-between p-4 gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={()=>setMobile(!mobile)}>
              {mobile ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#687280]" />
                <Input placeholder="Tìm lịch hẹn, bệnh nhân..." className="pl-10 border-[#E5E7EB] bg-[#F9FAFB]" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon"><Bell className="h-5 w-5 text-[#687280]" /></Button>
              <Avatar className="h-8 w-8"><AvatarImage src="" /><AvatarFallback className="bg-[#007BFF] text-white text-xs">DR</AvatarFallback></Avatar>
              <Button variant="outline" className="border-[#E5E7EB]" onClick={()=>{ logout(); navigate("/login"); }}>Đăng xuất</Button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default DoctorLayout;


