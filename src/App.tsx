import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import Dashboard from "./pages/dashboard/Dashboard";
import Appointments from "./pages/dashboard/Appointments";
import Doctors from "./pages/dashboard/Doctors";
import Patients from "./pages/dashboard/Patients";
import Services from "./pages/dashboard/Services";
import Clinics from "./pages/dashboard/Clinics";
import Reports from "./pages/dashboard/Reports";
import Settings from "./pages/dashboard/Settings";
import AdminNews from "./pages/dashboard/AdminNews";
import AdminComments from "./pages/dashboard/AdminComments";
import AdminNewsStats from "./pages/dashboard/AdminNewsStats";
import RequireRole from "@/components/auth/RequireRole";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorAppointments from "./pages/doctor/Appointments";
import DoctorRecords from "./pages/doctor/Records";
import DoctorPrescriptions from "./pages/doctor/Prescriptions";
import DoctorStats from "./pages/doctor/Stats";
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientBook from "./pages/patient/Book";
import PatientAppointments from "./pages/patient/Appointments";
import PatientRecords from "./pages/patient/Records";
import PatientPrescriptions from "./pages/patient/Prescriptions";
import PatientNotifications from "./pages/patient/Notifications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          {/* Dashboard Routes (Admin only) */}
          <Route path="/dashboard" element={<RequireRole roles={["admin"]}><Dashboard /></RequireRole>} />
          <Route path="/dashboard/appointments" element={<RequireRole roles={["admin"]}><Appointments /></RequireRole>} />
          <Route path="/dashboard/patients" element={<RequireRole roles={["admin"]}><Patients /></RequireRole>} />
          <Route path="/dashboard/doctors" element={<RequireRole roles={["admin"]}><Doctors /></RequireRole>} />
          <Route path="/dashboard/services" element={<RequireRole roles={["admin"]}><Services /></RequireRole>} />
          <Route path="/dashboard/clinics" element={<RequireRole roles={["admin"]}><Clinics /></RequireRole>} />
          <Route path="/dashboard/reports" element={<RequireRole roles={["admin"]}><Reports /></RequireRole>} />
          <Route path="/dashboard/settings" element={<RequireRole roles={["admin"]}><Settings /></RequireRole>} />
          <Route path="/dashboard/news" element={<RequireRole roles={["admin"]}><AdminNews /></RequireRole>} />
          <Route path="/dashboard/news/comments" element={<RequireRole roles={["admin"]}><AdminComments /></RequireRole>} />
          <Route path="/dashboard/news/stats" element={<RequireRole roles={["admin"]}><AdminNewsStats /></RequireRole>} />
          {/* Role specific dashboards */}
          <Route path="/doctor" element={<RequireRole roles={["doctor"]}><DoctorDashboard /></RequireRole>} />
          <Route path="/doctor/appointments" element={<RequireRole roles={["doctor"]}><DoctorAppointments /></RequireRole>} />
          <Route path="/doctor/records" element={<RequireRole roles={["doctor"]}><DoctorRecords /></RequireRole>} />
          <Route path="/doctor/prescriptions" element={<RequireRole roles={["doctor"]}><DoctorPrescriptions /></RequireRole>} />
          <Route path="/doctor/stats" element={<RequireRole roles={["doctor"]}><DoctorStats /></RequireRole>} />
          <Route path="/patient" element={<RequireRole roles={["patient"]}><PatientDashboard /></RequireRole>} />
          <Route path="/patient/book" element={<RequireRole roles={["patient"]}><PatientBook /></RequireRole>} />
          <Route path="/patient/appointments" element={<RequireRole roles={["patient"]}><PatientAppointments /></RequireRole>} />
          <Route path="/patient/records" element={<RequireRole roles={["patient"]}><PatientRecords /></RequireRole>} />
          <Route path="/patient/prescriptions" element={<RequireRole roles={["patient"]}><PatientPrescriptions /></RequireRole>} />
          <Route path="/patient/notifications" element={<RequireRole roles={["patient"]}><PatientNotifications /></RequireRole>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
