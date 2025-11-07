import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { seedDemoUsers } from "@/lib/auth";

// Seed initial staff data if not exists
const seedStaffData = () => {
  try {
    const STAFF_STORAGE_KEY = "cliniccare:staff";
    const stored = localStorage.getItem(STAFF_STORAGE_KEY);
    if (!stored) {
      const initialStaff = [
        {
          id: "S001",
          fullName: "BS. Nguyễn Thị Lan",
          role: "doctor",
          specialty: "Nội tổng quát",
          todayAppointments: 12,
          email: "lan.nguyen@cliniccare.vn",
          phone: "0901234567",
          gender: "female",
          status: "active",
          rating: 4.8,
          degree: "ThS. Nội tổng quát",
          experienceYears: 8,
        },
        {
          id: "S002",
          fullName: "Trần Minh",
          role: "receptionist",
          todayAppointments: 0,
          email: "minh.tran@cliniccare.vn",
          phone: "0907654321",
          status: "active",
        },
        {
          id: "S003",
          fullName: "BS. Phạm Hùng",
          role: "doctor",
          specialty: "Tim mạch",
          todayAppointments: 6,
          email: "hung.pham@cliniccare.vn",
          phone: "0912345678",
          status: "leave",
          rating: 4.6,
          degree: "BSCKI. Tim mạch",
          experienceYears: 10,
        },
      ];
      localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(initialStaff));
    }
  } catch {
    // Ignore errors
  }
};

// Seed sample EHR records for patient
const seedEHRData = () => {
  try {
    const PATIENT_ID = "U_PATIENT";
    const key = `cliniccare:ehr:${PATIENT_ID}`;
    const stored = localStorage.getItem(key);
    if (!stored) {
      const sampleRecords = [
        {
          id: crypto.randomUUID(),
          patientId: PATIENT_ID,
          visitDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
          doctor: "BS. Nguyễn Thị Lan",
          diagnosis: "Viêm họng cấp",
          conclusion: "Theo dõi thêm 3 ngày, uống thuốc đúng liều",
          vitals: {
            bpSys: 120,
            bpDia: 78,
            hr: 78,
            weight: 62,
            height: 1.65,
            bmi: 22.8,
          },
          labs: [
            { name: "CRP", result: 4.2, unit: "mg/L", ref: "0-5", status: "bt" },
            { name: "WBC", result: 9.8, unit: "10^9/L", ref: "4-11", status: "bt" },
          ],
          images: [],
        },
        {
          id: crypto.randomUUID(),
          patientId: PATIENT_ID,
          visitDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
          doctor: "BS. Nguyễn Thị Lan",
          diagnosis: "Khám tổng quát",
          conclusion: "Sức khỏe ổn, hẹn tái khám sau 6 tháng",
          vitals: {
            bpSys: 118,
            bpDia: 76,
            hr: 75,
            weight: 61.5,
            height: 1.65,
            bmi: 22.6,
          },
          labs: [
            { name: "Glucose", result: 5.1, unit: "mmol/L", ref: "3.9-6.1", status: "bt" },
            { name: "Cholesterol", result: 4.8, unit: "mmol/L", ref: "<5.2", status: "bt" },
          ],
          images: [],
        },
      ];
      localStorage.setItem(key, JSON.stringify(sampleRecords));
    }
  } catch {
    // Ignore errors
  }
};

// Seed sample prescriptions for patient
const seedPrescriptionData = () => {
  try {
    const PATIENT_ID = "U_PATIENT";
    const PRESCRIPTIONS_KEY = "cliniccare:prescriptions";
    const stored = localStorage.getItem(PRESCRIPTIONS_KEY);
    
    // Check if prescriptions already exist for this patient
    if (stored) {
      const existing = JSON.parse(stored);
      const hasPatientPrescriptions = existing.some((p: any) => p.patientId === PATIENT_ID);
      if (hasPatientPrescriptions) return;
    }
    
    const samplePrescriptions = [
      {
        id: crypto.randomUUID(),
        patientId: PATIENT_ID,
        patientName: "Nguyễn Văn A",
        doctorId: "S001",
        doctorName: "BS. Nguyễn Thị Lan",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        diagnosis: "Viêm họng cấp",
        drugs: [
          {
            name: "Paracetamol 500mg",
            dose: "1 viên x 3 lần/ngày",
            quantity: "Hộp 20 viên",
            instructions: "Uống sau ăn",
          },
          {
            name: "Vitamin C",
            dose: "1 viên/ngày",
            quantity: "Hộp 30 viên",
            instructions: "Uống vào buổi sáng",
          },
        ],
        notes: "Uống đủ liều, nghỉ ngơi nhiều, uống nhiều nước",
        status: "active",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: crypto.randomUUID(),
        patientId: PATIENT_ID,
        patientName: "Nguyễn Văn A",
        doctorId: "S001",
        doctorName: "BS. Nguyễn Thị Lan",
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        diagnosis: "Khám tổng quát",
        drugs: [
          {
            name: "Omega-3",
            dose: "1 viên/ngày",
            quantity: "Hộp 60 viên",
            instructions: "Uống sau bữa ăn",
          },
        ],
        notes: "Bổ sung dinh dưỡng",
        status: "completed",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    
    const existing = stored ? JSON.parse(stored) : [];
    localStorage.setItem(PRESCRIPTIONS_KEY, JSON.stringify([...existing, ...samplePrescriptions]));
  } catch {
    // Ignore errors
  }
};

// Seed sample notifications for patient
const seedNotificationData = () => {
  try {
    const PATIENT_ID = "U_PATIENT";
    const NOTIFICATIONS_KEY = "cliniccare:notifications";
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    
    // Check if notifications already exist for this patient
    if (stored) {
      const existing = JSON.parse(stored);
      const hasPatientNotifications = existing.some((n: any) => n.patientId === PATIENT_ID);
      if (hasPatientNotifications) return;
    }
    
    const sampleNotifications = [
      {
        id: crypto.randomUUID(),
        patientId: PATIENT_ID,
        type: "appointment",
        title: "Lịch hẹn đã được xác nhận",
        message: "Lịch hẹn với BS. Nguyễn Thị Lan vào 7 ngày trước đã được xác nhận.",
        link: "/patient/appointments",
        read: false,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: crypto.randomUUID(),
        patientId: PATIENT_ID,
        type: "ehr",
        title: "Hồ sơ bệnh án mới",
        message: "Hồ sơ khám viêm họng cấp đã được cập nhật. Vui lòng xem chi tiết.",
        link: "/patient/records",
        read: false,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: crypto.randomUUID(),
        patientId: PATIENT_ID,
        type: "prescription",
        title: "Toa thuốc mới",
        message: "Bác sĩ đã kê toa thuốc mới cho bạn. Vui lòng kiểm tra và tuân thủ liều dùng.",
        link: "/patient/prescriptions",
        read: false,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: crypto.randomUUID(),
        patientId: PATIENT_ID,
        type: "system",
        title: "Chào mừng đến với ClinicCare",
        message: "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Chúc bạn sức khỏe tốt!",
        read: true,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    
    const existing = stored ? JSON.parse(stored) : [];
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([...existing, ...sampleNotifications]));
  } catch {
    // Ignore errors
  }
};

seedDemoUsers();
seedStaffData();
seedEHRData();
seedPrescriptionData();
seedNotificationData();
createRoot(document.getElementById("root")!).render(<App />);
