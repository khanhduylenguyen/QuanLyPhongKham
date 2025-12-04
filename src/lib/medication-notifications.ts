/**
 * Browser Notifications for Medication Reminders
 * Thông báo nhắc nhở uống thuốc qua Browser Notifications API
 */

import { getSchedulesForDate, getUpcomingSchedules, type MedicationSchedule } from "./medication-schedule";

let notificationPermission: NotificationPermission = "default";
let checkInterval: number | null = null;
let isRunning = false;

/**
 * Yêu cầu quyền thông báo từ trình duyệt
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.warn("This browser does not support notifications");
    return false;
  }
  
  if (Notification.permission === "granted") {
    notificationPermission = "granted";
    return true;
  }
  
  if (Notification.permission === "denied") {
    notificationPermission = "denied";
    return false;
  }
  
  // Yêu cầu quyền
  const permission = await Notification.requestPermission();
  notificationPermission = permission;
  
  return permission === "granted";
}

/**
 * Kiểm tra quyền thông báo
 */
export function hasNotificationPermission(): boolean {
  return "Notification" in window && Notification.permission === "granted";
}

/**
 * Tạo thông báo nhắc nhở uống thuốc
 */
function createMedicationNotification(
  medicationName: string,
  dose: string,
  time: string
): void {
  if (!hasNotificationPermission()) {
    return;
  }
  
  const title = "⏰ Đến giờ uống thuốc";
  const body = `${medicationName} - ${dose} lúc ${time}`;
  
  const notification = new Notification(title, {
    body,
    icon: "/favicon.ico", // Có thể thay bằng icon thuốc
    badge: "/favicon.ico",
    tag: `medication-${medicationName}-${time}`, // Tránh duplicate
    requireInteraction: false,
  });
  
  // Đóng thông báo sau 5 giây
  setTimeout(() => {
    notification.close();
  }, 5000);
  
  // Click vào thông báo sẽ focus vào tab
  notification.onclick = () => {
    window.focus();
    notification.close();
  };
}

/**
 * Kiểm tra và gửi thông báo cho các lần uống thuốc sắp tới
 */
function checkAndNotify(patientId: string): void {
  if (!hasNotificationPermission()) {
    return;
  }
  
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
  const today = now.toISOString().split("T")[0];
  
  // Lấy lịch hôm nay
  const todaySchedules = getSchedulesForDate(patientId, today);
  
  todaySchedules.forEach(({ schedule, time, isTaken }) => {
    if (isTaken) {
      return; // Đã uống rồi, không cần nhắc
    }
    
    // Tính thời gian đến giờ uống (tính bằng phút)
    const [hour, minute] = time.split(":").map(Number);
    const scheduleTime = new Date(now);
    scheduleTime.setHours(hour, minute, 0, 0);
    
    const diffMinutes = Math.floor((scheduleTime.getTime() - now.getTime()) / (1000 * 60));
    
    // Nhắc nhở 5 phút trước và đúng giờ
    if (diffMinutes === 5 || diffMinutes === 0) {
      createMedicationNotification(schedule.medicationName, schedule.dose, time);
    }
  });
}

/**
 * Bắt đầu dịch vụ nhắc nhở (kiểm tra mỗi phút)
 */
export function startMedicationNotifications(patientId: string): void {
  if (isRunning) {
    return; // Đã chạy rồi
  }
  
  // Kiểm tra quyền trước
  if (!hasNotificationPermission()) {
    console.warn("Notification permission not granted");
    return;
  }
  
  isRunning = true;
  
  // Kiểm tra ngay lập tức
  checkAndNotify(patientId);
  
  // Kiểm tra mỗi phút
  checkInterval = window.setInterval(() => {
    checkAndNotify(patientId);
  }, 60000); // 60 giây = 1 phút
}

/**
 * Dừng dịch vụ nhắc nhở
 */
export function stopMedicationNotifications(): void {
  if (checkInterval !== null) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
  isRunning = false;
}

/**
 * Kiểm tra xem dịch vụ có đang chạy không
 */
export function isNotificationServiceRunning(): boolean {
  return isRunning;
}

