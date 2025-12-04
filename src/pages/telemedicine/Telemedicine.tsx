import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TelemedicineRoom } from "@/components/telemedicine/TelemedicineRoom";
import DoctorLayout from "@/components/layout/DoctorLayout";
import PatientLayout from "@/components/layout/PatientLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentUser } from "@/lib/auth";
import { Video, Calendar, Clock, User, ArrowLeft, AlertCircle, Zap, CheckCircle2, XCircle, Circle } from "lucide-react";
import { toast } from "sonner";

const APPOINTMENTS_STORAGE_KEY = "cliniccare:appointments";
const STAFF_STORAGE_KEY = "cliniccare:staff";
const CONSULTATION_REQUESTS_KEY = "cliniccare:consultation-requests";
const ONLINE_DOCTORS_KEY = "cliniccare:online-doctors";

type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed";

interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  notes?: string;
  status: AppointmentStatus;
  createdAt: string;
}

// Load appointments from localStorage
const loadAppointments = (): Appointment[] => {
  try {
    const stored = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {}
  return [];
};

// Get status badge
const getStatusBadge = (status: AppointmentStatus) => {
  switch (status) {
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Đang chờ</Badge>;
    case "confirmed":
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Đã xác nhận</Badge>;
    case "completed":
      return <Badge className="bg-green-100 text-green-800 border-green-200">Hoàn thành</Badge>;
    case "cancelled":
      return <Badge className="bg-red-100 text-red-800 border-red-200">Đã hủy</Badge>;
  }
};

// Consultation Request Types
type ConsultationRequestStatus = "pending" | "accepted" | "rejected" | "completed" | "cancelled";

interface ConsultationRequest {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  patientEmail?: string;
  doctorId: string;
  doctorName: string;
  specialty?: string;
  message?: string;
  status: ConsultationRequestStatus;
  createdAt: string;
  acceptedAt?: string;
  roomId?: string; // roomId khi được chấp nhận
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  isOnline: boolean;
}

// Load consultation requests
const loadConsultationRequests = (): ConsultationRequest[] => {
  try {
    const stored = localStorage.getItem(CONSULTATION_REQUESTS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {}
  return [];
};

// Save consultation requests
const saveConsultationRequests = (requests: ConsultationRequest[]) => {
  try {
    localStorage.setItem(CONSULTATION_REQUESTS_KEY, JSON.stringify(requests));
    window.dispatchEvent(new CustomEvent("consultationRequestsUpdated"));
  } catch {}
};

// Load online doctors
const loadOnlineDoctors = (): string[] => {
  try {
    const stored = localStorage.getItem(ONLINE_DOCTORS_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      // Clean up old entries (older than 5 minutes)
      const now = Date.now();
      const valid = data.filter((entry: { doctorId: string; timestamp: number }) => {
        return now - entry.timestamp < 5 * 60 * 1000; // 5 minutes
      });
      if (valid.length !== data.length) {
        localStorage.setItem(ONLINE_DOCTORS_KEY, JSON.stringify(valid));
      }
      return valid.map((entry: { doctorId: string }) => entry.doctorId);
    }
  } catch {}
  return [];
};

// Mark doctor as online
const markDoctorOnline = (doctorId: string) => {
  try {
    const stored = localStorage.getItem(ONLINE_DOCTORS_KEY);
    const data = stored ? JSON.parse(stored) : [];
    const now = Date.now();
    // Remove old entry for this doctor
    const filtered = data.filter((entry: { doctorId: string }) => entry.doctorId !== doctorId);
    // Add new entry
    filtered.push({ doctorId, timestamp: now });
    localStorage.setItem(ONLINE_DOCTORS_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent("onlineDoctorsUpdated"));
  } catch {}
};

// Load doctors from staff
const loadDoctors = (): Doctor[] => {
  try {
    const stored = localStorage.getItem(STAFF_STORAGE_KEY);
    if (stored) {
      const staff = JSON.parse(stored);
      const onlineIds = loadOnlineDoctors();
      return staff
        .filter((s: any) => s.role === "doctor" && s.status === "active")
        .map((s: any) => ({
          id: s.id,
          name: s.fullName,
          specialty: s.specialty || "Nội tổng quát",
          isOnline: onlineIds.includes(s.id),
        }));
    }
  } catch {}
  return [];
};

const TelemedicinePage = () => {
  const user = getCurrentUser();
  const { appointmentId } = useParams<{ appointmentId?: string }>();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<"appointments" | "instant">("appointments");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [consultationRequests, setConsultationRequests] = useState<ConsultationRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ConsultationRequest | null>(null);

  const role = user?.role;

  // Mark doctor as online when component mounts (if doctor)
  useEffect(() => {
    if (role === "doctor" && user?.id) {
      markDoctorOnline(user.id);
      // Keep updating online status every 2 minutes
      const interval = setInterval(() => {
        markDoctorOnline(user.id);
      }, 2 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [role, user?.id]);

  // Load doctors and online status
  useEffect(() => {
    const loadData = () => {
      const loaded = loadDoctors();
      setDoctors(loaded);
    };
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("onlineDoctorsUpdated", handleUpdate);
    window.addEventListener("staffUpdated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("onlineDoctorsUpdated", handleUpdate);
      window.removeEventListener("staffUpdated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Load consultation requests
  useEffect(() => {
    const loadData = () => {
      const allRequests = loadConsultationRequests();
      if (role === "doctor") {
        // Bác sĩ: xem requests gửi cho mình
        const filtered = allRequests.filter(
          (req) => (req.doctorId === user?.id || req.doctorName === user?.name) && req.status !== "cancelled"
        );
        setConsultationRequests(filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } else if (role === "patient") {
        // Bệnh nhân: xem requests của mình
        const filtered = allRequests.filter(
          (req) =>
            (req.patientId === user?.id || req.patientName === user?.name) &&
            (req.status === "pending" || req.status === "accepted")
        );
        setConsultationRequests(filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
    };
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("consultationRequestsUpdated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("consultationRequestsUpdated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [role, user?.id, user?.name]);

  // Load appointments based on role
  useEffect(() => {
    if (!user) {
      setAppointments([]);
      return;
    }

    const allAppointments = loadAppointments();
    let filtered: Appointment[] = [];

    if (role === "doctor") {
      // Bác sĩ: lấy tất cả appointments của mình (confirmed, pending)
      filtered = allAppointments.filter(
        (apt) =>
          (apt.doctorId === user.id || apt.doctorName === user.name) &&
          (apt.status === "confirmed" || apt.status === "pending")
      );
    } else if (role === "patient") {
      // Bệnh nhân: lấy appointments của mình (confirmed)
      filtered = allAppointments.filter((apt) => {
        const nameMatch = apt.patientName === user.name;
        const emailMatch = user.email && apt.patientEmail === user.email;
        let phoneMatch = false;
        try {
          const users = JSON.parse(localStorage.getItem("cliniccare:users") || "[]");
          const userData = users.find((u: any) => u.id === user.id);
          if (userData?.phone && apt.patientPhone) {
            phoneMatch = apt.patientPhone === userData.phone;
          }
        } catch {}
        return (nameMatch || emailMatch || phoneMatch) && apt.status === "confirmed";
      });
    }

    // Sort by date (upcoming first)
    const sorted = filtered.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`).getTime();
      const dateB = new Date(`${b.date}T${b.time}`).getTime();
      return dateA - dateB;
    });

    setAppointments(sorted);
  }, [user, role]);

  // Check access when appointmentId changes
  useEffect(() => {
    if (!appointmentId || !user) {
      setHasAccess(null);
      setSelectedAppointment(null);
      return;
    }

    const allAppointments = loadAppointments();
    const appointment = allAppointments.find((apt) => apt.id === appointmentId);

    if (!appointment) {
      setHasAccess(false);
      setSelectedAppointment(null);
      return;
    }

    setSelectedAppointment(appointment);

    // Check access based on role
    if (role === "doctor") {
      const hasDoctorAccess =
        appointment.doctorId === user.id || appointment.doctorName === user.name;
      setHasAccess(hasDoctorAccess && (appointment.status === "confirmed" || appointment.status === "pending"));
    } else if (role === "patient") {
      const nameMatch = appointment.patientName === user.name;
      const emailMatch = user.email && appointment.patientEmail === user.email;
      let phoneMatch = false;
      try {
        const users = JSON.parse(localStorage.getItem("cliniccare:users") || "[]");
        const userData = users.find((u: any) => u.id === user.id);
        if (userData?.phone && appointment.patientPhone) {
          phoneMatch = appointment.patientPhone === userData.phone;
        }
      } catch {}
      setHasAccess(
        (nameMatch || emailMatch || phoneMatch) && appointment.status === "confirmed"
      );
    } else {
      setHasAccess(false);
    }
  }, [appointmentId, user, role]);

  const handleSelectAppointment = (apt: Appointment) => {
    navigate(`/telemedicine/${apt.id}`);
  };

  const handleBackToList = () => {
    navigate("/telemedicine");
  };

  // Instant consultation handlers
  const handleRequestConsultation = (doctor: Doctor) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập");
      return;
    }

    const allRequests = loadConsultationRequests();
    // Check if there's already a pending request
    const existingRequest = allRequests.find(
      (req) =>
        req.patientId === user.id &&
        req.doctorId === doctor.id &&
        (req.status === "pending" || req.status === "accepted")
    );

    if (existingRequest) {
      if (existingRequest.status === "accepted" && existingRequest.roomId) {
        // Navigate to room if already accepted
        navigate(`/telemedicine/instant/${existingRequest.id}`);
      } else {
        toast.info("Bạn đã gửi yêu cầu tư vấn cho bác sĩ này. Vui lòng đợi phản hồi.");
      }
      return;
    }

    // Get patient info
    let patientPhone = "";
    try {
      const users = JSON.parse(localStorage.getItem("cliniccare:users") || "[]");
      const userData = users.find((u: any) => u.id === user.id);
      patientPhone = userData?.phone || "";
    } catch {}

    // Create new request
    const newRequest: ConsultationRequest = {
      id: `REQ-${Date.now()}`,
      patientId: user.id,
      patientName: user.name,
      patientPhone: patientPhone || undefined,
      patientEmail: user.email,
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    const updated = [...allRequests, newRequest];
    saveConsultationRequests(updated);
    toast.success("Đã gửi yêu cầu tư vấn. Vui lòng đợi bác sĩ chấp nhận.");
  };

  const handleAcceptRequest = (request: ConsultationRequest) => {
    if (!user) return;

    const allRequests = loadConsultationRequests();
    const roomId = `instant-${request.id}`;
    const updated = allRequests.map((req) =>
      req.id === request.id
        ? {
            ...req,
            status: "accepted" as ConsultationRequestStatus,
            acceptedAt: new Date().toISOString(),
            roomId,
          }
        : req
    );
    saveConsultationRequests(updated);
    toast.success("Đã chấp nhận yêu cầu tư vấn");
    // Navigate to room
    navigate(`/telemedicine/instant-${request.id}`);
  };

  const handleRejectRequest = (request: ConsultationRequest) => {
    const allRequests = loadConsultationRequests();
    const updated = allRequests.map((req) =>
      req.id === request.id ? { ...req, status: "rejected" as ConsultationRequestStatus } : req
    );
    saveConsultationRequests(updated);
    toast.info("Đã từ chối yêu cầu tư vấn");
  };

  const handleJoinInstantRoom = (request: ConsultationRequest) => {
    if (request.status === "accepted" && request.roomId) {
      navigate(`/telemedicine/instant-${request.id}`);
    } else {
      toast.error("Yêu cầu chưa được chấp nhận");
    }
  };

  // Check if this is an instant consultation room
  const isInstantRoom = appointmentId?.startsWith("instant-");
  const instantRequestId = isInstantRoom ? appointmentId.replace("instant-", "") : null;

  // Handle instant consultation room access
  useEffect(() => {
    if (instantRequestId && user) {
      const allRequests = loadConsultationRequests();
      const request = allRequests.find((req) => req.id === instantRequestId);
      setSelectedRequest(request || null);

      if (!request) {
        setHasAccess(false);
        return;
      }

      // Check access
      if (role === "doctor") {
        const hasAccess = (request.doctorId === user.id || request.doctorName === user.name) && request.status === "accepted";
        setHasAccess(hasAccess);
      } else if (role === "patient") {
        const hasAccess = (request.patientId === user.id || request.patientName === user.name) && request.status === "accepted";
        setHasAccess(hasAccess);
      } else {
        setHasAccess(false);
      }
    }
  }, [instantRequestId, user, role]);

  // If instant room is provided, show the room
  if (instantRequestId) {
    if (hasAccess === false) {
      const content = (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleBackToList}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại danh sách
            </Button>
          </div>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <h3 className="font-semibold">Không có quyền truy cập</h3>
                  <p className="text-sm mt-1">
                    Bạn không có quyền truy cập phòng tư vấn này hoặc yêu cầu chưa được chấp nhận.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );

      if (role === "doctor") {
        return <DoctorLayout>{content}</DoctorLayout>;
      }
      if (role === "patient") {
        return <PatientLayout>{content}</PatientLayout>;
      }
      return <div className="p-6">{content}</div>;
    }

    if (hasAccess === null || !selectedRequest) {
      const content = (
        <div className="space-y-4">
          <div className="text-center py-12">
            <p className="text-[#687280]">Đang kiểm tra quyền truy cập...</p>
          </div>
        </div>
      );

      if (role === "doctor") {
        return <DoctorLayout>{content}</DoctorLayout>;
      }
      if (role === "patient") {
        return <PatientLayout>{content}</PatientLayout>;
      }
      return <div className="p-6">{content}</div>;
    }

    // Show instant consultation room
    const roomId = selectedRequest.roomId || `instant-${selectedRequest.id}`;
    const otherPersonName = role === "doctor" ? selectedRequest.patientName : selectedRequest.doctorName;

    const content = (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tư vấn Nhanh</h1>
            <div className="mt-2 flex items-center gap-3 text-sm text-[#687280]">
              <span>
                {role === "doctor" ? "Bệnh nhân" : "Bác sĩ"}: <strong>{otherPersonName}</strong>
              </span>
              <span>•</span>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <Zap className="h-3 w-3 mr-1" />
                Tư vấn nhanh
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleBackToList}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Button>
        </div>
        <TelemedicineRoom roomId={roomId} />
      </div>
    );

    if (role === "doctor") {
      return <DoctorLayout>{content}</DoctorLayout>;
    }
    if (role === "patient") {
      return <PatientLayout>{content}</PatientLayout>;
    }
    return <div className="p-6">{content}</div>;
  }

  // If appointmentId is provided, show the room (with access check)
  if (appointmentId && !isInstantRoom) {
    if (hasAccess === false) {
      const content = (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleBackToList}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại danh sách
            </Button>
          </div>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <h3 className="font-semibold">Không có quyền truy cập</h3>
                  <p className="text-sm mt-1">
                    Bạn không có quyền truy cập phòng tư vấn này. Vui lòng chọn một lịch hẹn hợp lệ.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );

      if (role === "doctor") {
        return <DoctorLayout>{content}</DoctorLayout>;
      }
      if (role === "patient") {
        return <PatientLayout>{content}</PatientLayout>;
      }
      return <div className="p-6">{content}</div>;
    }

    if (hasAccess === null) {
      const content = (
        <div className="space-y-4">
          <div className="text-center py-12">
            <p className="text-[#687280]">Đang kiểm tra quyền truy cập...</p>
          </div>
        </div>
      );

      if (role === "doctor") {
        return <DoctorLayout>{content}</DoctorLayout>;
      }
      if (role === "patient") {
        return <PatientLayout>{content}</PatientLayout>;
      }
      return <div className="p-6">{content}</div>;
    }

    // Show room with appointment info
    const roomId = `appointment-${appointmentId}`;
    const otherPersonName =
      role === "doctor" ? selectedAppointment?.patientName : selectedAppointment?.doctorName;

    const content = (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tư vấn Trực tuyến</h1>
            {selectedAppointment && (
              <div className="mt-2 flex items-center gap-3 text-sm text-[#687280]">
                <span>
                  {role === "doctor" ? "Bệnh nhân" : "Bác sĩ"}: <strong>{otherPersonName}</strong>
                </span>
                <span>•</span>
                <span>
                  {new Date(selectedAppointment.date).toLocaleDateString("vi-VN")} lúc{" "}
                  {selectedAppointment.time}
                </span>
                {getStatusBadge(selectedAppointment.status)}
              </div>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={handleBackToList}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Button>
        </div>
        <TelemedicineRoom roomId={roomId} />
      </div>
    );

    if (role === "doctor") {
      return <DoctorLayout>{content}</DoctorLayout>;
    }
    if (role === "patient") {
      return <PatientLayout>{content}</PatientLayout>;
    }
    return <div className="p-6">{content}</div>;
  }

  // Show appointment list with tabs
  const renderAppointmentsTab = () => (
    <div className="space-y-6">
      {appointments.length === 0 ? (
        <Card className="border-[#E5E7EB]">
          <CardContent className="p-12 text-center">
            <Video className="h-12 w-12 text-[#687280] mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              {role === "doctor"
                ? "Chưa có lịch hẹn nào để tư vấn"
                : "Chưa có lịch hẹn đã xác nhận nào"}
            </p>
            <p className="text-sm text-[#687280]">
              {role === "doctor"
                ? "Các lịch hẹn đã xác nhận hoặc đang chờ sẽ xuất hiện ở đây"
                : "Vui lòng đợi bác sĩ xác nhận lịch hẹn của bạn"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle>
              {role === "doctor" ? "Lịch hẹn có thể tư vấn" : "Lịch hẹn của tôi"} ({appointments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {appointments.map((apt) => {
                const aptDate = new Date(`${apt.date}T${apt.time}`);
                const isToday = (() => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const aptDateOnly = new Date(apt.date);
                  aptDateOnly.setHours(0, 0, 0, 0);
                  return aptDateOnly.getTime() === today.getTime();
                })();

                return (
                  <div
                    key={apt.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      isToday ? "border-blue-200 bg-blue-50" : "border-[#E5E7EB]"
                    } hover:bg-gray-50 transition-colors`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {role === "doctor" ? apt.patientName : apt.doctorName}
                        </h3>
                        {getStatusBadge(apt.status)}
                        {isToday && (
                          <Badge className="bg-blue-100 text-blue-800">Hôm nay</Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-[#687280]">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(apt.date).toLocaleDateString("vi-VN")} lúc {apt.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>
                            {role === "doctor" ? `Bệnh nhân: ${apt.patientName}` : `BS. ${apt.doctorName}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>#{apt.id}</span>
                        </div>
                      </div>
                      {apt.notes && (
                        <p className="text-sm text-[#687280] mt-2">{apt.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        className="bg-[#007BFF] hover:bg-[#0056B3]"
                        onClick={() => handleSelectAppointment(apt)}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Bắt đầu tư vấn
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Render instant consultation tab for patients
  const renderInstantTabForPatient = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Chọn bác sĩ để tư vấn nhanh</h2>
        <p className="text-sm text-[#687280]">
          Chọn bác sĩ đang online để gửi yêu cầu tư vấn ngay. Bác sĩ sẽ phản hồi trong vài phút.
        </p>
      </div>

      {doctors.length === 0 ? (
        <Card className="border-[#E5E7EB]">
          <CardContent className="p-12 text-center">
            <User className="h-12 w-12 text-[#687280] mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium text-gray-900 mb-2">Chưa có bác sĩ nào</p>
            <p className="text-sm text-[#687280]">Vui lòng quay lại sau</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doctor) => (
            <Card key={doctor.id} className="border-[#E5E7EB] hover:border-blue-300 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                    <p className="text-sm text-[#687280] mt-1">{doctor.specialty}</p>
                  </div>
                  {doctor.isOnline ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <Circle className="h-2 w-2 mr-1 fill-green-600" />
                      Online
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-600 border-gray-200">
                      <Circle className="h-2 w-2 mr-1 fill-gray-400" />
                      Offline
                    </Badge>
                  )}
                </div>
                <Button
                  size="sm"
                  className="w-full bg-[#16a34a] hover:bg-[#15803d]"
                  onClick={() => handleRequestConsultation(doctor)}
                  disabled={!doctor.isOnline}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {doctor.isOnline ? "Gửi yêu cầu tư vấn" : "Bác sĩ đang offline"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Show patient's consultation requests */}
      {consultationRequests.length > 0 && (
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle>Yêu cầu tư vấn của tôi ({consultationRequests.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {consultationRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-[#E5E7EB] hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{req.doctorName}</h3>
                      {req.status === "pending" && (
                        <Badge className="bg-yellow-100 text-yellow-800">Đang chờ</Badge>
                      )}
                      {req.status === "accepted" && (
                        <Badge className="bg-green-100 text-green-800">Đã chấp nhận</Badge>
                      )}
                      {req.status === "rejected" && (
                        <Badge className="bg-red-100 text-red-800">Đã từ chối</Badge>
                      )}
                    </div>
                    <p className="text-sm text-[#687280]">
                      {new Date(req.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                  {req.status === "accepted" && req.roomId && (
                    <Button
                      size="sm"
                      className="bg-[#16a34a] hover:bg-[#15803d]"
                      onClick={() => handleJoinInstantRoom(req)}
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Vào phòng tư vấn
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Render instant consultation tab for doctors
  const renderInstantTabForDoctor = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Yêu cầu tư vấn nhanh</h2>
        <p className="text-sm text-[#687280]">
          Xem và chấp nhận các yêu cầu tư vấn nhanh từ bệnh nhân. Bạn đang ở trạng thái online.
        </p>
      </div>

      {consultationRequests.length === 0 ? (
        <Card className="border-[#E5E7EB]">
          <CardContent className="p-12 text-center">
            <Zap className="h-12 w-12 text-[#687280] mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium text-gray-900 mb-2">Chưa có yêu cầu tư vấn nào</p>
            <p className="text-sm text-[#687280]">
              Các yêu cầu tư vấn nhanh từ bệnh nhân sẽ xuất hiện ở đây
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle>Yêu cầu tư vấn ({consultationRequests.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {consultationRequests.map((req) => (
                <div
                  key={req.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    req.status === "pending"
                      ? "border-yellow-200 bg-yellow-50"
                      : "border-[#E5E7EB]"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{req.patientName}</h3>
                      {req.status === "pending" && (
                        <Badge className="bg-yellow-100 text-yellow-800">Đang chờ</Badge>
                      )}
                      {req.status === "accepted" && (
                        <Badge className="bg-green-100 text-green-800">Đã chấp nhận</Badge>
                      )}
                      {req.status === "rejected" && (
                        <Badge className="bg-red-100 text-red-800">Đã từ chối</Badge>
                      )}
                    </div>
                    <div className="text-sm text-[#687280] space-y-1">
                      <p>{new Date(req.createdAt).toLocaleString("vi-VN")}</p>
                      {req.message && <p>Lời nhắn: {req.message}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {req.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          className="bg-[#16a34a] hover:bg-[#15803d]"
                          onClick={() => handleAcceptRequest(req)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Chấp nhận
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectRequest(req)}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Từ chối
                        </Button>
                      </>
                    )}
                    {req.status === "accepted" && req.roomId && (
                      <Button
                        size="sm"
                        className="bg-[#007BFF] hover:bg-[#0056B3]"
                        onClick={() => handleJoinInstantRoom(req)}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Vào phòng
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const content = (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tư vấn Trực tuyến</h1>
        <p className="text-sm text-[#687280] mt-1">
          {role === "doctor"
            ? "Chọn lịch hẹn hoặc tư vấn nhanh với bệnh nhân"
            : "Chọn lịch hẹn đã xác nhận hoặc tư vấn nhanh với bác sĩ"}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "appointments" | "instant")}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="appointments">
            <Calendar className="h-4 w-4 mr-2" />
            Lịch hẹn
          </TabsTrigger>
          <TabsTrigger value="instant">
            <Zap className="h-4 w-4 mr-2" />
            Tư vấn nhanh
          </TabsTrigger>
        </TabsList>
        <TabsContent value="appointments" className="mt-6">
          {renderAppointmentsTab()}
        </TabsContent>
        <TabsContent value="instant" className="mt-6">
          {role === "doctor" ? renderInstantTabForDoctor() : renderInstantTabForPatient()}
        </TabsContent>
      </Tabs>
    </div>
  );

  if (role === "doctor") {
    return <DoctorLayout>{content}</DoctorLayout>;
  }

  if (role === "patient") {
    return <PatientLayout>{content}</PatientLayout>;
  }

  // Fallback: không có role hợp lệ
  return <div className="p-6">{content}</div>;
};

export default TelemedicinePage;
