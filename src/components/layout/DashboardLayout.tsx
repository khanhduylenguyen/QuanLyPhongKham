import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Home,
  Calendar,
  Users,
  User,
  Pill,
  Building,
  BarChart3,
  Settings,
  Menu,
  X,
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  UserCircle,
  Lock,
  ChevronLeft,
  Calendar as CalendarIcon,
  LayoutDashboard,
  Newspaper,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { logout, getCurrentUser } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role?: "admin" | "doctor" | "receptionist" | "patient";
}

const menuItems = [
  {
    title: "Trang chủ",
    icon: LayoutDashboard,
    href: "/dashboard",
    roles: ["admin", "doctor", "receptionist"],
  },
  {
    title: "Quản lý lịch khám",
    icon: Calendar,
    href: "/dashboard/appointments",
    roles: ["admin", "doctor", "receptionist"],
  },
  {
    title: "Bác sĩ & nhân viên",
    icon: Users,
    href: "/dashboard/doctors",
    roles: ["admin"],
  },
  {
    title: "Bệnh nhân",
    icon: User,
    href: "/dashboard/patients",
    roles: ["admin", "doctor", "receptionist"],
  },
  {
    title: "Dịch vụ & thuốc",
    icon: Pill,
    href: "/dashboard/services",
    roles: ["admin"],
  },
  {
    title: "Phòng khám",
    icon: Building,
    href: "/dashboard/clinics",
    roles: ["admin"],
  },
  {
    title: "Báo cáo & thống kê",
    icon: BarChart3,
    href: "/dashboard/reports",
    roles: ["admin", "doctor", "receptionist"],
  },
  {
    title: "Cài đặt hệ thống",
    icon: Settings,
    href: "/dashboard/settings",
    roles: ["admin"],
  },
  {
    title: "Quản lý tin tức",
    icon: Newspaper,
    href: "/dashboard/news",
    roles: ["admin"],
  },
];

const DashboardLayout = ({ children, role = "admin" }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | undefined>(undefined);
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const loadUserAvatar = () => {
    if (!currentUser) {
      setUserAvatar(undefined);
      return;
    }

    try {
      // Load from users storage
      const USERS_KEY = "cliniccare:users";
      const usersData = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
      const foundUser = usersData.find((u: any) => u.id === currentUser.id || u.email === currentUser.email);
      if (foundUser?.avatar) {
        setUserAvatar(foundUser.avatar);
        return;
      }
    } catch (error) {
      console.error("Error loading avatar:", error);
    }
    setUserAvatar(undefined);
  };

  useEffect(() => {
    loadUserAvatar();
    // Listen for avatar updates
    const handleAvatarUpdate = () => loadUserAvatar();
    window.addEventListener("cliniccare:avatar:updated", handleAvatarUpdate);
    return () => window.removeEventListener("cliniccare:avatar:updated", handleAvatarUpdate);
  }, [currentUser]);

  const userRoleLabels = {
    admin: "Quản trị viên",
    doctor: "Bác sĩ",
    receptionist: "Lễ tân",
    patient: "Bệnh nhân",
  };

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(role)
  );

  const handleLogout = () => {
    try { logout(); } catch {}
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } bg-white border-r border-[#E5E7EB] fixed lg:static h-screen z-50 transition-all duration-300`}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Toggle */}
          <div className="flex items-center justify-between p-4 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#007BFF]">
                <CalendarIcon className="h-6 w-6 text-white" />
              </div>
              {isSidebarOpen && (
                <span className="text-xl font-bold text-gray-900">
                  ClinicCare
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hidden lg:flex"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <ChevronLeft
                className={`h-4 w-4 transition-transform ${
                  !isSidebarOpen ? "rotate-180" : ""
                }`}
              />
            </Button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="" />
                <AvatarFallback className="bg-[#007BFF] text-white">
                  AD
                </AvatarFallback>
              </Avatar>
              {isSidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    Admin User
                  </p>
                  <Badge
                    variant="secondary"
                    className="text-xs bg-[#007BFF]/10 text-[#007BFF] border-0"
                  >
                    {userRoleLabels[role]}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        isActive
                          ? "bg-[#007BFF] text-white"
                          : "text-[#687280] hover:bg-[#F3F4F6] hover:text-[#007BFF]"
                      }`}
                      title={!isSidebarOpen ? item.title : undefined}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      {isSidebarOpen && (
                        <span className="text-sm font-medium">{item.title}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-40">
          <div className="flex items-center justify-between p-4 gap-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>

            {/* Search */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#687280]" />
                <Input
                  type="search"
                  placeholder="Tìm kiếm bệnh nhân, bác sĩ, lịch hẹn..."
                  className="pl-10 border-[#E5E7EB] bg-[#F9FAFB]"
                />
              </div>
            </div>

            {/* Back to Home */}
            <Button
              asChild
              variant="outline"
              className="hidden md:inline-flex items-center gap-2 border-[#007BFF] text-[#007BFF] hover:bg-[#007BFF]/10"
            >
              <Link to="/">
                <Home className="h-4 w-4" />
                Về trang chủ
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="md:hidden text-[#007BFF]"
            >
              <Link to="/">
                <Home className="h-5 w-5" />
              </Link>
            </Button>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-[#687280]" />
                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Thông báo</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="p-2 space-y-2 max-h-64 overflow-y-auto">
                    <div className="p-2 rounded-lg bg-blue-50">
                      <p className="text-sm font-medium text-gray-900">
                        Lịch hẹn sắp tới
                      </p>
                      <p className="text-xs text-[#687280]">
                        Bệnh nhân Nguyễn Văn A - 9:00 sáng mai
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-green-50">
                      <p className="text-sm font-medium text-gray-900">
                        Bệnh nhân mới
                      </p>
                      <p className="text-xs text-[#687280]">
                        Vừa đặt lịch khám với BS. Lan
                      </p>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userAvatar} />
                      <AvatarFallback className="bg-[#007BFF] text-white text-xs">
                        {currentUser?.name?.charAt(0).toUpperCase() || "AD"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block text-sm font-medium text-gray-900">
                      {currentUser?.name || "Admin User"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/profile" className="flex items-center gap-2">
                      <UserCircle className="h-4 w-4" />
                      Hồ sơ
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/change-password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Đổi mật khẩu
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

