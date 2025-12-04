import { useEffect, useState } from "react";
import PatientLayout from "@/components/layout/PatientLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Clock,
  CheckCircle2,
  Bell,
  BellOff,
  Calendar,
  Pill,
  TrendingUp,
  AlertCircle,
  X,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import {
  loadActiveSchedules,
  getSchedulesForDate,
  getUpcomingSchedules,
  markMedicationTaken,
  calculateComplianceRate,
  type MedicationSchedule,
} from "@/lib/medication-schedule";
import {
  requestNotificationPermission,
  hasNotificationPermission,
  startMedicationNotifications,
  stopMedicationNotifications,
  isNotificationServiceRunning,
} from "@/lib/medication-notifications";
import { toast } from "sonner";

const MedicationSchedule = () => {
  const currentUser = getCurrentUser();
  const [schedules, setSchedules] = useState<MedicationSchedule[]>([]);
  const [todaySchedules, setTodaySchedules] = useState<
    Array<{ schedule: MedicationSchedule; time: string; isTaken: boolean }>
  >([]);
  const [upcomingSchedules, setUpcomingSchedules] = useState<
    Array<{ schedule: MedicationSchedule; date: string; time: string; isTaken: boolean }>
  >([]);
  const [stats, setStats] = useState({ total: 0, taken: 0, rate: 0, active: 0 });
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<MedicationSchedule | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Load dữ liệu
  const loadData = () => {
    if (!currentUser?.id) return;

    const active = loadActiveSchedules(currentUser.id);
    setSchedules(active);

    const today = new Date().toISOString().split("T")[0];
    const todayData = getSchedulesForDate(currentUser.id, today);
    setTodaySchedules(todayData);

    const upcoming = getUpcomingSchedules(currentUser.id, 20);
    setUpcomingSchedules(upcoming);

    const compliance = calculateComplianceRate(currentUser.id);
    setStats({
      total: compliance.total,
      taken: compliance.taken,
      rate: compliance.rate,
      active: active.length,
    });
  };

  // Kiểm tra notification permission
  useEffect(() => {
    if (currentUser?.id) {
      loadData();
      setNotificationEnabled(hasNotificationPermission() && isNotificationServiceRunning());
    }
  }, [currentUser]);

  // Bật/tắt notifications
  const handleToggleNotifications = async () => {
    if (!currentUser?.id) return;

    if (notificationEnabled) {
      stopMedicationNotifications();
      setNotificationEnabled(false);
      toast.success("Đã tắt thông báo nhắc nhở");
    } else {
      const granted = await requestNotificationPermission();
      if (granted) {
        startMedicationNotifications(currentUser.id);
        setNotificationEnabled(true);
        toast.success("Đã bật thông báo nhắc nhở");
      } else {
        toast.error("Cần cấp quyền thông báo để nhận nhắc nhở");
      }
    }
  };

  // Đánh dấu đã uống thuốc
  const handleMarkTaken = (scheduleId: string, time: string) => {
    if (!currentUser?.id) return;

    const today = new Date().toISOString().split("T")[0];
    const success = markMedicationTaken(scheduleId, today, time);

    if (success) {
      toast.success("Đã đánh dấu uống thuốc");
      loadData(); // Reload data
    } else {
      toast.error("Có lỗi xảy ra");
    }
  };

  // Format thời gian
  const formatTime = (time: string) => {
    return time;
  };

  // Format ngày
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dateStr === today.toISOString().split("T")[0]) {
      return "Hôm nay";
    }
    if (dateStr === tomorrow.toISOString().split("T")[0]) {
      return "Ngày mai";
    }

    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  // Tính thời gian còn lại đến giờ uống
  const getTimeUntil = (date: string, time: string) => {
    const now = new Date();
    const [hour, minute] = time.split(":").map(Number);
    const scheduleTime = new Date(date);
    scheduleTime.setHours(hour, minute, 0, 0);

    if (scheduleTime < now) {
      return "Đã qua";
    }

    const diffMs = scheduleTime.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `Còn ${diffHours} giờ ${diffMinutes} phút`;
    }
    return `Còn ${diffMinutes} phút`;
  };

  if (!currentUser) {
    return (
      <PatientLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Vui lòng đăng nhập</p>
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lịch uống thuốc</h1>
            <p className="text-sm text-[#687280] mt-1">
              Quản lý và theo dõi lịch uống thuốc của bạn
            </p>
          </div>
          <Button
            onClick={handleToggleNotifications}
            variant={notificationEnabled ? "default" : "outline"}
            className={notificationEnabled ? "bg-[#007BFF] hover:bg-[#0056B3]" : ""}
          >
            {notificationEnabled ? (
              <>
                <Bell className="h-4 w-4 mr-2" />
                Đã bật thông báo
              </>
            ) : (
              <>
                <BellOff className="h-4 w-4 mr-2" />
                Bật thông báo
              </>
            )}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-[#E5E7EB]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#687280]">Tổng đơn thuốc</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.active}</p>
                </div>
                <Pill className="h-8 w-8 text-[#007BFF]" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E5E7EB]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#687280]">Đã uống hôm nay</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.taken}/{stats.total}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-[#16a34a]" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E5E7EB]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#687280]">Tỷ lệ tuân thủ</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.rate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-[#f59e0b]" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E5E7EB]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#687280]">Sắp đến giờ</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {upcomingSchedules.filter((s) => !s.isTaken).length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-[#ef4444]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="today" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="today">Hôm nay</TabsTrigger>
            <TabsTrigger value="upcoming">Sắp đến giờ</TabsTrigger>
            <TabsTrigger value="all">Tất cả</TabsTrigger>
          </TabsList>

          {/* Tab: Hôm nay */}
          <TabsContent value="today" className="space-y-4">
            {todaySchedules.length === 0 ? (
              <Card className="border-[#E5E7EB]">
                <CardContent className="p-12 text-center">
                  <Calendar className="h-12 w-12 text-[#687280] mx-auto mb-4" />
                  <p className="text-gray-500">Không có lịch uống thuốc hôm nay</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {todaySchedules.map(({ schedule, time, isTaken }, index) => (
                  <Card
                    key={`${schedule.id}-${time}-${index}`}
                    className={`border-[#E5E7EB] ${isTaken ? "opacity-75" : ""}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#007BFF]/10">
                              <Pill className="h-5 w-5 text-[#007BFF]" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {schedule.medicationName}
                              </h3>
                              <p className="text-sm text-[#687280]">
                                {schedule.dose} • {time}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {isTaken ? (
                            <Badge className="bg-[#16a34a] text-white">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Đã uống
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleMarkTaken(schedule.id, time)}
                              className="bg-[#007BFF] hover:bg-[#0056B3]"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Đánh dấu đã uống
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab: Sắp đến giờ */}
          <TabsContent value="upcoming" className="space-y-4">
            {upcomingSchedules.filter((s) => !s.isTaken).length === 0 ? (
              <Card className="border-[#E5E7EB]">
                <CardContent className="p-12 text-center">
                  <Clock className="h-12 w-12 text-[#687280] mx-auto mb-4" />
                  <p className="text-gray-500">Không có lịch uống thuốc sắp tới</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {upcomingSchedules
                  .filter((s) => !s.isTaken)
                  .slice(0, 10)
                  .map(({ schedule, date, time }, index) => (
                    <Card
                      key={`${schedule.id}-${date}-${time}-${index}`}
                      className="border-[#E5E7EB]"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f59e0b]/10">
                                <Clock className="h-5 w-5 text-[#f59e0b]" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {schedule.medicationName}
                                </h3>
                                <p className="text-sm text-[#687280]">
                                  {formatDate(date)} • {time}
                                </p>
                                <p className="text-xs text-[#687280] mt-1">
                                  {getTimeUntil(date, time)}
                                </p>
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedSchedule(schedule);
                              setDetailDialogOpen(true);
                            }}
                          >
                            Chi tiết
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>

          {/* Tab: Tất cả */}
          <TabsContent value="all" className="space-y-4">
            {schedules.length === 0 ? (
              <Card className="border-[#E5E7EB]">
                <CardContent className="p-12 text-center">
                  <Pill className="h-12 w-12 text-[#687280] mx-auto mb-4" />
                  <p className="text-gray-500">Chưa có lịch uống thuốc nào</p>
                  <p className="text-sm text-[#687280] mt-2">
                    Lịch uống thuốc sẽ được tạo tự động khi bác sĩ kê đơn
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {schedules.map((schedule) => {
                  const totalDoses = Object.values(schedule.takenHistory).reduce(
                    (sum, times) => sum + times.length,
                    0
                  );
                  const expectedDoses = (() => {
                    const start = new Date(schedule.startDate);
                    const end = new Date(schedule.endDate);
                    let count = 0;
                    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                      count += schedule.scheduledTimes.length;
                    }
                    return count;
                  })();
                  const compliance = expectedDoses > 0 ? Math.round((totalDoses / expectedDoses) * 100) : 0;

                  return (
                    <Card key={schedule.id} className="border-[#E5E7EB]">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#007BFF]/10">
                                <Pill className="h-5 w-5 text-[#007BFF]" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {schedule.medicationName}
                                </h3>
                                <p className="text-sm text-[#687280]">{schedule.dose}</p>
                                <p className="text-xs text-[#687280] mt-1">
                                  {schedule.startDate} - {schedule.endDate}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    {schedule.timesPerDay} lần/ngày
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${
                                      compliance >= 80
                                        ? "border-[#16a34a] text-[#16a34a]"
                                        : compliance >= 50
                                        ? "border-[#f59e0b] text-[#f59e0b]"
                                        : "border-[#ef4444] text-[#ef4444]"
                                    }`}
                                  >
                                    Tuân thủ: {compliance}%
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedSchedule(schedule);
                              setDetailDialogOpen(true);
                            }}
                          >
                            Chi tiết
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-[#007BFF]" />
              Chi tiết lịch uống thuốc
            </DialogTitle>
            <DialogDescription>
              Lịch sử uống thuốc và thông tin chi tiết
            </DialogDescription>
          </DialogHeader>

          {selectedSchedule && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  {selectedSchedule.medicationName}
                </h4>
                <div className="space-y-1 text-sm text-[#687280]">
                  <p>
                    <span className="font-medium">Liều dùng:</span> {selectedSchedule.dose}
                  </p>
                  <p>
                    <span className="font-medium">Số lượng:</span> {selectedSchedule.quantity}
                  </p>
                  <p>
                    <span className="font-medium">Thời gian:</span>{" "}
                    {selectedSchedule.startDate} - {selectedSchedule.endDate}
                  </p>
                  <p>
                    <span className="font-medium">Giờ uống:</span>{" "}
                    {selectedSchedule.scheduledTimes.join(", ")}
                  </p>
                  {selectedSchedule.instructions && (
                    <p>
                      <span className="font-medium">Hướng dẫn:</span>{" "}
                      {selectedSchedule.instructions}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Lịch sử uống thuốc</h4>
                {Object.keys(selectedSchedule.takenHistory).length === 0 ? (
                  <p className="text-sm text-[#687280]">Chưa có lịch sử</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {Object.entries(selectedSchedule.takenHistory)
                      .sort((a, b) => b[0].localeCompare(a[0]))
                      .map(([date, times]) => (
                        <div
                          key={date}
                          className="flex items-center justify-between p-2 bg-[#F9FAFB] rounded"
                        >
                          <span className="text-sm font-medium">{formatDate(date)}</span>
                          <div className="flex items-center gap-2">
                            {times.map((time) => (
                              <Badge key={time} className="bg-[#16a34a] text-white">
                                {time}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PatientLayout>
  );
};

export default MedicationSchedule;

