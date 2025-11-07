export type UserRole = "admin" | "doctor" | "receptionist" | "patient";

export type AuthUser = {
  id: string;
  name: string;
  role: UserRole;
  email?: string;
};

const AUTH_KEY = "cliniccare:auth";
const USERS_KEY = "cliniccare:users";

export function getCurrentUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: AuthUser): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function hasRole(allowed: UserRole | UserRole[]): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  const roles = Array.isArray(allowed) ? allowed : [allowed];
  return roles.includes(user.role);
}

export type DemoUser = AuthUser & { password: string; phone?: string };

export const DEMO_USERS: DemoUser[] = [
  { id: "U_ADMIN", name: "Admin User", role: "admin", email: "admin@cliniccare.vn", password: "123456" },
  { id: "U_DOCTOR", name: "BS. Nguyễn Thị Lan", role: "doctor", email: "doctor@cliniccare.vn", password: "123456" },
  { id: "U_PATIENT", name: "Nguyễn Văn A", role: "patient", email: "patient@cliniccare.vn", password: "123456", phone: "0901234567" },
];

export function seedDemoUsers(): void {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) localStorage.setItem(USERS_KEY, JSON.stringify(DEMO_USERS));
  } catch {
    localStorage.setItem(USERS_KEY, JSON.stringify(DEMO_USERS));
  }
}

export function authenticate(identifier: string, password: string): AuthUser | null {
  try {
    const list: DemoUser[] = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    // Tìm user theo email, phone hoặc username
    const found = list.find((u) => {
      const matchesIdentifier = u.email === identifier || u.phone === identifier || (u as any).username === identifier;
      return matchesIdentifier && u.password === password;
    });
    if (!found) return null;
    const { password: _pw, ...user } = found;
    return user as AuthUser;
  } catch {
    return null;
  }
}

/**
 * Đăng ký user mới với role patient
 * @param fullName - Họ tên đầy đủ
 * @param email - Email
 * @param phone - Số điện thoại
 * @param username - Tên đăng nhập
 * @param password - Mật khẩu
 * @returns AuthUser nếu thành công, null nếu thất bại (email/phone/username đã tồn tại)
 */
export function registerUser(
  fullName: string,
  email: string,
  phone: string,
  username: string,
  password: string
): AuthUser | null {
  try {
    const list: DemoUser[] = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    
    // Kiểm tra email, phone, hoặc username đã tồn tại chưa
    const existing = list.find(
      (u) => u.email === email || u.phone === phone || (u as any).username === username
    );
    
    if (existing) {
      return null; // User đã tồn tại
    }
    
    // Tạo user mới với role patient
    const newUser: DemoUser = {
      id: `U_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Tạo ID duy nhất
      name: fullName,
      role: "patient",
      email: email,
      phone: phone,
      password: password,
      username: username, // Thêm username vào user object
    };
    
    // Lưu vào danh sách users
    list.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(list));
    
    // Tự động tạo Patient record trong admin dashboard
    // Admin có thể chỉnh sửa thông tin chi tiết sau (gender, age, doctor, etc.)
    try {
      const PATIENTS_STORAGE_KEY = "cliniccare:patients";
      const existingPatients = JSON.parse(localStorage.getItem(PATIENTS_STORAGE_KEY) || "[]");
      
      // Kiểm tra xem patient đã tồn tại chưa (theo phone hoặc email)
      const existingPatient = existingPatients.find(
        (p: any) => p.phone === phone || (p.email === email)
      );
      
      if (!existingPatient) {
        // Tạo Patient ID dựa trên ID lớn nhất hiện có để tránh trùng lặp
        let maxId = 0;
        existingPatients.forEach((p: any) => {
          const match = p.id?.match(/^P(\d+)$/);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxId) maxId = num;
          }
        });
        const patientId = `P${String(maxId + 1).padStart(3, "0")}`;
        
        const newPatient = {
          id: patientId,
          fullName: fullName,
          gender: "male" as "male" | "female", // Mặc định, admin có thể chỉnh sửa
          age: 0, // Mặc định, admin có thể chỉnh sửa
          phone: phone,
          doctor: "Chưa phân công", // Admin sẽ phân công sau
          lastVisit: new Date().toISOString().slice(0, 10), // Ngày đăng ký
          status: "pending" as "pending" | "treating" | "completed", // Chờ admin xác nhận
          email: email, // Thêm email để dễ quản lý
          userId: newUser.id, // Link với user account
        };
        
        existingPatients.push(newPatient);
        localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(existingPatients));
        
        // Dispatch event để notify Patients component nếu đang mở
        window.dispatchEvent(new CustomEvent("patientRegistered", { detail: newPatient }));
      }
    } catch (error) {
      console.error("Error creating patient record:", error);
      // Không throw error, vì user đã được tạo thành công
    }
    
    // Trả về user không có password
    const { password: _pw, ...user } = newUser;
    return user as AuthUser;
  } catch (error) {
    console.error("Error registering user:", error);
    return null;
  }
}

/**
 * Admin tạo tài khoản cho bác sĩ/nhân viên
 * @param fullName - Họ tên đầy đủ
 * @param email - Email
 * @param phone - Số điện thoại
 * @param username - Tên đăng nhập
 * @param password - Mật khẩu
 * @param role - Vai trò: "doctor" hoặc "receptionist"
 * @returns AuthUser nếu thành công, null nếu thất bại (email/phone/username đã tồn tại)
 */
export function createStaffAccount(
  fullName: string,
  email: string,
  phone: string,
  username: string,
  password: string,
  role: "doctor" | "receptionist"
): AuthUser | null {
  try {
    const list: DemoUser[] = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    
    // Kiểm tra email, phone, hoặc username đã tồn tại chưa
    const existing = list.find(
      (u) => u.email === email || u.phone === phone || (u as any).username === username
    );
    
    if (existing) {
      return null; // User đã tồn tại
    }
    
    // Tạo user mới với role doctor hoặc receptionist
    const newUser: DemoUser = {
      id: `U_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Tạo ID duy nhất
      name: fullName,
      role: role,
      email: email,
      phone: phone,
      password: password,
      username: username,
    };
    
    // Lưu vào danh sách users
    list.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(list));
    
    // Trả về user không có password
    const { password: _pw, ...user } = newUser;
    return user as AuthUser;
  } catch (error) {
    console.error("Error creating staff account:", error);
    return null;
  }
}


