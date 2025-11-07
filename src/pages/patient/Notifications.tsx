import { useEffect, useState, useRef } from "react";
import PatientLayout from "@/components/layout/PatientLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  Calendar,
  FileText,
  Pill,
  AlertCircle,
  CheckCircle2,
  X,
  Trash2,
  Filter,
  CheckCheck,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { toast } from "sonner";

const NOTIFICATIONS_STORAGE_KEY = "cliniccare:notifications";

export type NotificationType =
  | "appointment"
  | "appointment_reminder"
  | "ehr"
  | "prescription"
  | "system";

export interface Notification {
  id: string;
  patientId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
  relatedId?: string; // ID của appointment, prescription, etc.
}

// Load notifications from localStorage
const loadNotifications = (patientId: string): Notification[] => {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (stored) {
      const allNotifications: Notification[] = JSON.parse(stored);
      return allNotifications
        .filter((n) => n.patientId === patientId)
        .sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA; // Newest first
        });
    }
  } catch {}
  return [];
};

// Save notifications to localStorage
const saveNotifications = (notifications: Notification[]) => {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  } catch {}
};

// Get notification icon
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "appointment":
    case "appointment_reminder":
      return Calendar;
    case "ehr":
      return FileText;
    case "prescription":
      return Pill;
    case "system":
      return AlertCircle;
  }
};

// Get notification color
const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case "appointment":
    case "appointment_reminder":
      return "text-blue-600 bg-blue-50 border-blue-200";
    case "ehr":
      return "text-green-600 bg-green-50 border-green-200";
    case "prescription":
      return "text-purple-600 bg-purple-50 border-purple-200";
    case "system":
      return "text-amber-600 bg-amber-50 border-amber-200";
  }
};

// Get notification type label
const getNotificationTypeLabel = (type: NotificationType) => {
  switch (type) {
    case "appointment":
      return "Lịch hẹn";
    case "appointment_reminder":
      return "Nhắc lịch";
    case "ehr":
      return "Hồ sơ";
    case "prescription":
      return "Toa thuốc";
    case "system":
      return "Hệ thống";
  }
};

const Notifications = () => {
  const user = getCurrentUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filterType, setFilterType] = useState<NotificationType | "all">("all");
  const [filterRead, setFilterRead] = useState<"all" | "read" | "unread">("all");
  const isLoadingRef = useRef(false);

  // Load notifications
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const loadData = () => {
      if (isLoadingRef.current) return;
      isLoadingRef.current = true;

      try {
        const patientNotifications = loadNotifications(user.id);
        setNotifications(patientNotifications);
      } catch (error) {
        console.error("Error loading notifications:", error);
        setNotifications([]);
      } finally {
        isLoadingRef.current = false;
      }
    };

    loadData();

    // Listen for updates
    const handleNotificationUpdate = () => {
      if (!isLoadingRef.current) {
        loadData();
      }
    };

    window.addEventListener("notificationsUpdated", handleNotificationUpdate);

    return () => {
      window.removeEventListener("notificationsUpdated", handleNotificationUpdate);
    };
  }, [user?.id]);

  // Filter notifications
  const filteredNotifications = notifications.filter((n) => {
    const typeMatch = filterType === "all" || n.type === filterType;
    const readMatch =
      filterRead === "all" ||
      (filterRead === "read" && n.read) ||
      (filterRead === "unread" && !n.read);
    return typeMatch && readMatch;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Mark as read
  const markAsRead = (notificationId: string) => {
    const allNotifications = loadNotifications(user?.id || "");
    const updated = allNotifications.map((n) =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    
    // Update global storage
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (stored) {
        const global: Notification[] = JSON.parse(stored);
        const globalUpdated = global.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        );
        saveNotifications(globalUpdated);
      }
    } catch {}

    setNotifications(updated);
    window.dispatchEvent(new CustomEvent("notificationsUpdated"));
  };

  // Mark all as read
  const markAllAsRead = () => {
    if (!user) return;

    const allNotifications = loadNotifications(user.id);
    const updated = allNotifications.map((n) => ({ ...n, read: true }));

    // Update global storage
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (stored) {
        const global: Notification[] = JSON.parse(stored);
        const globalUpdated = global.map((n) =>
          n.patientId === user.id ? { ...n, read: true } : n
        );
        saveNotifications(globalUpdated);
      }
    } catch {}

    setNotifications(updated);
    window.dispatchEvent(new CustomEvent("notificationsUpdated"));
    toast.success("Đã đánh dấu tất cả là đã đọc");
  };

  // Delete notification
  const deleteNotification = (notificationId: string) => {
    const allNotifications = loadNotifications(user?.id || "");
    const updated = allNotifications.filter((n) => n.id !== notificationId);

    // Update global storage
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (stored) {
        const global: Notification[] = JSON.parse(stored);
        const globalUpdated = global.filter((n) => n.id !== notificationId);
        saveNotifications(globalUpdated);
      }
    } catch {}

    setNotifications(updated);
    window.dispatchEvent(new CustomEvent("notificationsUpdated"));
    toast.success("Đã xóa thông báo");
  };

  // Delete all
  const deleteAll = () => {
    if (!confirm("Bạn có chắc chắn muốn xóa tất cả thông báo?")) return;
    if (!user) return;

    // Update global storage
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (stored) {
        const global: Notification[] = JSON.parse(stored);
        const globalUpdated = global.filter((n) => n.patientId !== user.id);
        saveNotifications(globalUpdated);
      }
    } catch {}

    setNotifications([]);
    window.dispatchEvent(new CustomEvent("notificationsUpdated"));
    toast.success("Đã xóa tất cả thông báo");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <PatientLayout>
      <div className="space-y-6">
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-[#007BFF]" />
                  Thông báo
                  {unreadCount > 0 && (
                    <Badge className="bg-red-500 text-white ml-2">
                      {unreadCount} mới
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="mt-2">
                  Nhắc lịch khám, thông báo hệ thống và tin nhắn nội bộ.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={markAllAsRead}
                    className="flex items-center gap-2"
                  >
                    <CheckCheck className="h-4 w-4" />
                    Đánh dấu tất cả đã đọc
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={deleteAll}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Xóa tất cả
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="mb-6 flex items-center gap-4 flex-wrap">
              <Filter className="h-4 w-4 text-[#687280]" />
              <Select
                value={filterType}
                onValueChange={(value) => setFilterType(value as any)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Loại thông báo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  <SelectItem value="appointment">Lịch hẹn</SelectItem>
                  <SelectItem value="appointment_reminder">Nhắc lịch</SelectItem>
                  <SelectItem value="ehr">Hồ sơ</SelectItem>
                  <SelectItem value="prescription">Toa thuốc</SelectItem>
                  <SelectItem value="system">Hệ thống</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filterRead}
                onValueChange={(value) => setFilterRead(value as any)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="unread">Chưa đọc</SelectItem>
                  <SelectItem value="read">Đã đọc</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-[#687280]">
                Hiển thị: <span className="font-medium text-gray-900">{filteredNotifications.length}</span> / {notifications.length} thông báo
              </div>
            </div>

            {/* Notifications List */}
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-16 w-16 text-[#687280] mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {notifications.length === 0
                    ? "Chưa có thông báo nào"
                    : "Không có thông báo phù hợp"}
                </p>
                <p className="text-sm text-[#687280]">
                  {notifications.length === 0
                    ? "Các thông báo về lịch hẹn, hồ sơ và toa thuốc sẽ xuất hiện tại đây."
                    : "Thử thay đổi bộ lọc để xem thêm thông báo."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  const colorClass = getNotificationColor(notification.type);

                  return (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border transition-all ${
                        notification.read
                          ? "bg-white border-[#E5E7EB] opacity-75"
                          : "bg-blue-50/50 border-blue-200 shadow-sm"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 ${colorClass}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${colorClass}`}
                                >
                                  {getNotificationTypeLabel(notification.type)}
                                </Badge>
                                {!notification.read && (
                                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                                )}
                              </div>
                              <h4
                                className={`font-semibold mb-1 ${
                                  notification.read ? "text-gray-700" : "text-gray-900"
                                }`}
                              >
                                {notification.title}
                              </h4>
                              <p
                                className={`text-sm ${
                                  notification.read ? "text-[#687280]" : "text-gray-700"
                                }`}
                              >
                                {notification.message}
                              </p>
                              <p className="text-xs text-[#687280] mt-2">
                                {formatDate(notification.createdAt)}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="h-8 w-8 p-0"
                                  title="Đánh dấu đã đọc"
                                >
                                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNotification(notification.id)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                title="Xóa thông báo"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          {notification.link && (
                            <Button
                              variant="link"
                              size="sm"
                              className="mt-2 p-0 h-auto text-[#007BFF]"
                              onClick={() => {
                                markAsRead(notification.id);
                                window.location.href = notification.link || "#";
                              }}
                            >
                              Xem chi tiết →
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PatientLayout>
  );
};

export default Notifications;
