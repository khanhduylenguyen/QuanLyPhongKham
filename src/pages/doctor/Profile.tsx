import { useEffect, useState } from "react";
import DoctorLayout from "@/components/layout/DoctorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { UserCircle, Lock, Save, Camera, Mail, Phone, MapPin, Calendar, GraduationCap, Briefcase } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCurrentUser } from "@/lib/auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STAFF_STORAGE_KEY = "cliniccare:staff";
const USERS_KEY = "cliniccare:users";

interface Staff {
  id: string;
  avatar?: string;
  fullName: string;
  role: "doctor" | "receptionist" | "nurse" | "manager";
  specialty?: string;
  email: string;
  phone: string;
  gender?: "male" | "female" | "other";
  dob?: string;
  address?: string;
  degree?: string;
  experienceYears?: number;
  status: "active" | "leave" | "suspended";
}

interface User {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  username?: string;
  password?: string;
}

const specialties = [
  "Nội tổng quát",
  "Nhi",
  "Tai Mũi Họng",
  "Da liễu",
  "Tim mạch",
  "Sản phụ khoa",
];

const Profile = () => {
  const currentUser = getCurrentUser();
  const [staff, setStaff] = useState<Staff | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    specialty: "",
    gender: "male" as "male" | "female" | "other",
    dob: "",
    address: "",
    degree: "",
    experienceYears: 0,
  });

  // Avatar state
  const [avatar, setAvatar] = useState<string | undefined>(undefined);

  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      // Load staff data
      const staffData = JSON.parse(localStorage.getItem(STAFF_STORAGE_KEY) || "[]") as Staff[];
      const foundStaff = staffData.find(
        (s) => s.email === currentUser.email || s.id === currentUser.id || s.fullName === currentUser.name
      );

      // Load user account data
      const usersData = JSON.parse(localStorage.getItem(USERS_KEY) || "[]") as User[];
      const foundUser = usersData.find((u) => u.id === currentUser.id || u.email === currentUser.email);

      if (foundStaff) {
        setStaff(foundStaff);
        setAvatar(foundStaff.avatar);
        setFormData({
          fullName: foundStaff.fullName,
          email: foundStaff.email,
          phone: foundStaff.phone,
          specialty: foundStaff.specialty || "",
          gender: foundStaff.gender || "male",
          dob: foundStaff.dob || "",
          address: foundStaff.address || "",
          degree: foundStaff.degree || "",
          experienceYears: foundStaff.experienceYears || 0,
        });
      } else if (foundUser) {
        // If no staff record, use user data
        setUser(foundUser);
        setFormData({
          fullName: foundUser.name,
          email: foundUser.email || "",
          phone: foundUser.phone || "",
          specialty: "",
          gender: "male",
          dob: "",
          address: "",
          degree: "",
          experienceYears: 0,
        });
      } else {
        // Fallback to currentUser from auth if not found
        setFormData({
          fullName: currentUser.name,
          email: currentUser.email || "",
          phone: "",
          specialty: "",
          gender: "male",
          dob: "",
          address: "",
          degree: "",
          experienceYears: 0,
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 2MB");
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setAvatar(base64String);
      toast.success("Đã chọn ảnh đại diện");
    };
    reader.onerror = () => {
      toast.error("Có lỗi xảy ra khi đọc file");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    if (!currentUser) return;

    // Validation
    if (!formData.fullName.trim()) {
      toast.error("Vui lòng nhập họ và tên");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Vui lòng nhập email");
      return;
    }

    try {
      // Update staff data if exists
      // Use current avatar state if available, otherwise keep existing avatar
      const savedAvatar = avatar !== undefined ? avatar : staff?.avatar;
      if (staff) {
        const staffData = JSON.parse(localStorage.getItem(STAFF_STORAGE_KEY) || "[]") as Staff[];
        const updatedStaffData = staffData.map((s) =>
          s.id === staff.id
            ? {
                ...s,
                ...formData,
                avatar: savedAvatar,
                experienceYears: Number(formData.experienceYears) || 0,
              }
            : s
        );
        localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(updatedStaffData));
        const updatedStaff = {
          ...staff, 
          ...formData, 
          avatar: savedAvatar,
          experienceYears: Number(formData.experienceYears) || 0 
        };
        setStaff(updatedStaff);
        // Sync avatar state with saved staff avatar - always use the saved value
        setAvatar(updatedStaff.avatar);
      } else {
        // Create staff record if doesn't exist
        const staffData = JSON.parse(localStorage.getItem(STAFF_STORAGE_KEY) || "[]") as Staff[];
        let maxId = 0;
        staffData.forEach((s) => {
          const match = s.id?.match(/^S(\d+)$/);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxId) maxId = num;
          }
        });
        const staffId = `S${String(maxId + 1).padStart(3, "0")}`;
        
        const newStaff: Staff = {
          id: staffId,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          role: "doctor",
          specialty: formData.specialty,
          gender: formData.gender,
          dob: formData.dob,
          address: formData.address,
          degree: formData.degree,
          experienceYears: formData.experienceYears,
          status: "active",
          avatar: savedAvatar,
        };
        
        staffData.push(newStaff);
        localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(staffData));
        setStaff(newStaff);
        // Sync avatar state with saved staff avatar
        setAvatar(newStaff.avatar);
      }

      // Dispatch event to notify other components about avatar update
      window.dispatchEvent(new CustomEvent("cliniccare:avatar:updated"));

      // Update user account data
      const usersData = JSON.parse(localStorage.getItem(USERS_KEY) || "[]") as User[];
      const foundUserIndex = usersData.findIndex((u) => u.id === currentUser.id || u.email === currentUser.email);

      if (foundUserIndex !== -1) {
        // Update existing user
        usersData[foundUserIndex] = {
          ...usersData[foundUserIndex],
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
        };
      } else {
        // Create new user entry if not exists
        const newUser: User = {
          id: currentUser.id,
          name: formData.fullName,
          role: currentUser.role,
          email: formData.email,
          phone: formData.phone,
          password: user?.password || "",
        };
        usersData.push(newUser);
      }
      localStorage.setItem(USERS_KEY, JSON.stringify(usersData));

      // Reload user data
      const updatedUser = usersData.find((u) => u.id === currentUser.id || u.email === formData.email);
      if (updatedUser) {
        setUser(updatedUser);
      }

      // Update current user session
      if (currentUser) {
        const updatedCurrentUser = {
          ...currentUser,
          name: formData.fullName,
          email: formData.email,
        };
        localStorage.setItem("cliniccare:auth", JSON.stringify(updatedCurrentUser));
        window.dispatchEvent(new CustomEvent("cliniccare:auth:changed", { detail: updatedCurrentUser }));
      }

      toast.success("Đã cập nhật thông tin thành công");
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Có lỗi xảy ra khi cập nhật thông tin");
    }
  };

  const handleChangePassword = () => {
    if (!currentUser) return;

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Mật khẩu mới không khớp");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    try {
      const usersData = JSON.parse(localStorage.getItem(USERS_KEY) || "[]") as User[];
      const foundUserIndex = usersData.findIndex((u) => u.id === currentUser.id || u.email === currentUser.email);

      if (foundUserIndex !== -1) {
        const foundUser = usersData[foundUserIndex];
        // Verify current password
        if (foundUser.password && foundUser.password !== passwordData.currentPassword) {
          toast.error("Mật khẩu hiện tại không đúng");
          return;
        }

        // Update password
        usersData[foundUserIndex] = {
          ...usersData[foundUserIndex],
          password: passwordData.newPassword,
        };
      } else {
        // Create new user entry if not exists
        const newUser: User = {
          id: currentUser.id,
          name: currentUser.name,
          role: currentUser.role,
          email: currentUser.email,
          phone: user?.phone || "",
          password: passwordData.newPassword,
        };
        usersData.push(newUser);
      }
      localStorage.setItem(USERS_KEY, JSON.stringify(usersData));

      // Reload user data
      const updatedUser = usersData.find((u) => u.id === currentUser.id || u.email === currentUser.email);
      if (updatedUser) {
        setUser(updatedUser);
      }

      toast.success("Đã đổi mật khẩu thành công");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Có lỗi xảy ra khi đổi mật khẩu");
    }
  };

  if (loading) {
    return (
      <DoctorLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-[#687280]">Đang tải...</div>
        </div>
      </DoctorLayout>
    );
  }

  if (!currentUser) {
    return (
      <DoctorLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600">Không tìm thấy thông tin người dùng</div>
        </div>
      </DoctorLayout>
    );
  }

  const displayName = staff?.fullName || user?.name || currentUser.name;
  const displayEmail = staff?.email || user?.email || currentUser.email || "";
  const displayPhone = staff?.phone || user?.phone || "";

  return (
    <DoctorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Thông tin tài khoản</h1>
            <p className="text-[#687280] mt-1">Quản lý thông tin cá nhân và cài đặt tài khoản</p>
          </div>
          {!isEditing && (
            <Button
              className="bg-[#007BFF] hover:bg-[#0056B3]"
              onClick={() => setIsEditing(true)}
            >
              <Save className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </Button>
          )}
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
            <TabsTrigger value="security">Bảo mật</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Avatar Section */}
            <Card className="border-[#E5E7EB]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCircle className="h-5 w-5" />
                  Ảnh đại diện
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatar || staff?.avatar} />
                    <AvatarFallback className="bg-[#007BFF] text-white text-2xl">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                        id="avatar-upload"
                      />
                      <Button 
                        variant="outline" 
                        className="border-[#E5E7EB]"
                        onClick={() => document.getElementById("avatar-upload")?.click()}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Đổi ảnh
                      </Button>
                      <p className="text-xs text-[#687280] mt-2">
                        JPG, PNG hoặc GIF. Tối đa 2MB
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card className="border-[#E5E7EB]">
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Họ và tên *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      disabled={!isEditing}
                      className="border-[#E5E7EB]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#687280]" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={!isEditing}
                        className="border-[#E5E7EB] pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Số điện thoại *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#687280]" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!isEditing}
                        className="border-[#E5E7EB] pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="specialty">Chuyên khoa</Label>
                    <Select
                      value={formData.specialty}
                      onValueChange={(value) => setFormData({ ...formData, specialty: value })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="border-[#E5E7EB]">
                        <SelectValue placeholder="Chọn chuyên khoa" />
                      </SelectTrigger>
                      <SelectContent>
                        {specialties.map((spec) => (
                          <SelectItem key={spec} value={spec}>
                            {spec}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="gender">Giới tính</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) =>
                        setFormData({ ...formData, gender: value as "male" | "female" | "other" })
                      }
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="border-[#E5E7EB]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Nam</SelectItem>
                        <SelectItem value="female">Nữ</SelectItem>
                        <SelectItem value="other">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dob">Ngày sinh</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#687280]" />
                      <Input
                        id="dob"
                        type="date"
                        value={formData.dob}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        disabled={!isEditing}
                        className="border-[#E5E7EB] pl-10"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Địa chỉ</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-[#687280]" />
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        disabled={!isEditing}
                        className="border-[#E5E7EB] pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card className="border-[#E5E7EB]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Thông tin nghề nghiệp
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="degree">Học vị / Bằng cấp</Label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#687280]" />
                      <Input
                        id="degree"
                        value={formData.degree}
                        onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                        disabled={!isEditing}
                        placeholder="VD: Thạc sĩ, Tiến sĩ..."
                        className="border-[#E5E7EB] pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="experienceYears">Số năm kinh nghiệm</Label>
                    <Input
                      id="experienceYears"
                      type="number"
                      min="0"
                      value={formData.experienceYears}
                      onChange={(e) =>
                        setFormData({ ...formData, experienceYears: Number(e.target.value) || 0 })
                      }
                      disabled={!isEditing}
                      className="border-[#E5E7EB]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  className="border-[#E5E7EB]"
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form data and avatar
                    if (staff) {
                      setFormData({
                        fullName: staff.fullName,
                        email: staff.email,
                        phone: staff.phone,
                        specialty: staff.specialty || "",
                        gender: staff.gender || "male",
                        dob: staff.dob || "",
                        address: staff.address || "",
                        degree: staff.degree || "",
                        experienceYears: staff.experienceYears || 0,
                      });
                      setAvatar(staff.avatar);
                    }
                  }}
                >
                  Hủy
                </Button>
                <Button className="bg-[#007BFF] hover:bg-[#0056B3]" onClick={handleSaveProfile}>
                  <Save className="h-4 w-4 mr-2" />
                  Lưu thay đổi
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="border-[#E5E7EB]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Đổi mật khẩu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Mật khẩu hiện tại *</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    className="border-[#E5E7EB]"
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">Mật khẩu mới *</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    className="border-[#E5E7EB]"
                    placeholder="Tối thiểu 6 ký tự"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                    className="border-[#E5E7EB]"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>
                <div className="flex items-center justify-end">
                  <Button className="bg-[#007BFF] hover:bg-[#0056B3]" onClick={handleChangePassword}>
                    <Lock className="h-4 w-4 mr-2" />
                    Đổi mật khẩu
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DoctorLayout>
  );
};

export default Profile;

