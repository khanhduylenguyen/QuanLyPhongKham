/**
 * Medication Schedule Management
 * Quản lý lịch uống thuốc tự động từ đơn thuốc
 */

export interface MedicationSchedule {
  id: string;
  prescriptionId: string;
  patientId: string;
  medicationName: string;
  dose: string;
  quantity: string;
  instructions?: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  timesPerDay: number; // 1, 2, 3, hoặc 4 lần/ngày
  scheduledTimes: string[]; // Array of time strings like "08:00", "14:00", "20:00"
  takenHistory: { [date: string]: string[] }; // { "2024-01-15": ["08:00", "20:00"] }
  createdAt: string;
}

const SCHEDULES_STORAGE_KEY = "cliniccare:medication-schedules";

/**
 * Parse dose string để xác định số lần uống trong ngày
 * Ví dụ: "1 viên x 2 lần/ngày" -> 2 lần
 * "2 viên x 3 lần/ngày" -> 3 lần
 */
function parseTimesPerDay(dose: string): number {
  const doseLower = dose.toLowerCase();
  
  // Tìm pattern "x N lần/ngày" hoặc "N lần/ngày"
  const timesMatch = doseLower.match(/(\d+)\s*lần\s*\/?\s*ngày/);
  if (timesMatch) {
    const times = parseInt(timesMatch[1], 10);
    if (times >= 1 && times <= 4) {
      return times;
    }
  }
  
  // Tìm pattern "N lần"
  const simpleMatch = doseLower.match(/(\d+)\s*lần/);
  if (simpleMatch) {
    const times = parseInt(simpleMatch[1], 10);
    if (times >= 1 && times <= 4) {
      return times;
    }
  }
  
  // Mặc định 2 lần/ngày nếu không parse được
  return 2;
}

/**
 * Tính ngày kết thúc dựa trên số lượng thuốc và số lần uống/ngày
 */
function calculateEndDate(startDate: string, quantity: string, timesPerDay: number): string {
  try {
    // Parse quantity - có thể là "30 viên", "30", "1 hộp", etc.
    const quantityMatch = quantity.match(/(\d+)/);
    if (!quantityMatch) {
      // Nếu không parse được, mặc định 7 ngày
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);
      return endDate.toISOString().split("T")[0];
    }
    
    const totalDoses = parseInt(quantityMatch[1], 10);
    const days = Math.ceil(totalDoses / timesPerDay);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days - 1); // -1 vì ngày đầu đã tính
    
    return endDate.toISOString().split("T")[0];
  } catch (error) {
    // Nếu có lỗi, mặc định 7 ngày
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);
    return endDate.toISOString().split("T")[0];
  }
}

/**
 * Tạo giờ uống mặc định dựa trên số lần/ngày
 */
function getDefaultScheduledTimes(timesPerDay: number): string[] {
  switch (timesPerDay) {
    case 1:
      return ["08:00"];
    case 2:
      return ["08:00", "20:00"];
    case 3:
      return ["08:00", "14:00", "20:00"];
    case 4:
      return ["08:00", "12:00", "18:00", "22:00"];
    default:
      return ["08:00", "20:00"];
  }
}

/**
 * Tạo lịch uống thuốc từ đơn thuốc
 */
export function createSchedulesFromPrescription(
  prescriptionId: string,
  patientId: string,
  drugs: Array<{ name: string; dose: string; quantity?: string; instructions?: string }>,
  startDate: string
): MedicationSchedule[] {
  const schedules: MedicationSchedule[] = [];
  const existingSchedules = loadAllSchedules();
  
  drugs.forEach((drug) => {
    const timesPerDay = parseTimesPerDay(drug.dose);
    const scheduledTimes = getDefaultScheduledTimes(timesPerDay);
    const endDate = calculateEndDate(startDate, drug.quantity || "30", timesPerDay);
    
    const schedule: MedicationSchedule = {
      id: `MED_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      prescriptionId,
      patientId,
      medicationName: drug.name,
      dose: drug.dose,
      quantity: drug.quantity || "30",
      instructions: drug.instructions,
      startDate,
      endDate,
      timesPerDay,
      scheduledTimes,
      takenHistory: {},
      createdAt: new Date().toISOString(),
    };
    
    schedules.push(schedule);
  });
  
  // Lưu vào localStorage
  const allSchedules = [...existingSchedules, ...schedules];
  localStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify(allSchedules));
  
  return schedules;
}

/**
 * Load tất cả lịch uống thuốc
 */
export function loadAllSchedules(): MedicationSchedule[] {
  try {
    const data = localStorage.getItem(SCHEDULES_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading medication schedules:", error);
    return [];
  }
}

/**
 * Load lịch uống thuốc của một bệnh nhân
 */
export function loadPatientSchedules(patientId: string): MedicationSchedule[] {
  const allSchedules = loadAllSchedules();
  return allSchedules.filter((s) => s.patientId === patientId);
}

/**
 * Load lịch uống thuốc còn hiệu lực (chưa hết hạn)
 */
export function loadActiveSchedules(patientId: string): MedicationSchedule[] {
  const schedules = loadPatientSchedules(patientId);
  const today = new Date().toISOString().split("T")[0];
  
  return schedules.filter((s) => {
    return s.startDate <= today && s.endDate >= today;
  });
}

/**
 * Đánh dấu đã uống thuốc
 */
export function markMedicationTaken(
  scheduleId: string,
  date: string,
  time: string
): boolean {
  try {
    const allSchedules = loadAllSchedules();
    const schedule = allSchedules.find((s) => s.id === scheduleId);
    
    if (!schedule) {
      return false;
    }
    
    if (!schedule.takenHistory[date]) {
      schedule.takenHistory[date] = [];
    }
    
    // Kiểm tra xem đã đánh dấu chưa
    if (!schedule.takenHistory[date].includes(time)) {
      schedule.takenHistory[date].push(time);
    }
    
    // Lưu lại
    localStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify(allSchedules));
    
    return true;
  } catch (error) {
    console.error("Error marking medication as taken:", error);
    return false;
  }
}

/**
 * Lấy lịch uống thuốc trong một ngày cụ thể
 */
export function getSchedulesForDate(
  patientId: string,
  date: string
): Array<{ schedule: MedicationSchedule; time: string; isTaken: boolean }> {
  const activeSchedules = loadActiveSchedules(patientId);
  const result: Array<{ schedule: MedicationSchedule; time: string; isTaken: boolean }> = [];
  
  activeSchedules.forEach((schedule) => {
    if (date >= schedule.startDate && date <= schedule.endDate) {
      schedule.scheduledTimes.forEach((time) => {
        const isTaken = schedule.takenHistory[date]?.includes(time) || false;
        result.push({ schedule, time, isTaken });
      });
    }
  });
  
  // Sắp xếp theo giờ
  result.sort((a, b) => a.time.localeCompare(b.time));
  
  return result;
}

/**
 * Lấy lịch uống thuốc sắp tới (trong vòng 7 ngày)
 */
export function getUpcomingSchedules(
  patientId: string,
  limit: number = 10
): Array<{ schedule: MedicationSchedule; date: string; time: string; isTaken: boolean }> {
  const activeSchedules = loadActiveSchedules(patientId);
  const result: Array<{ schedule: MedicationSchedule; date: string; time: string; isTaken: boolean }> = [];
  const today = new Date();
  
  // Lấy lịch trong 7 ngày tới
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    
    activeSchedules.forEach((schedule) => {
      if (dateStr >= schedule.startDate && dateStr <= schedule.endDate) {
        schedule.scheduledTimes.forEach((time) => {
          const isTaken = schedule.takenHistory[dateStr]?.includes(time) || false;
          result.push({ schedule, date: dateStr, time, isTaken });
        });
      }
    });
  }
  
  // Sắp xếp theo ngày và giờ
  result.sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    return a.time.localeCompare(b.time);
  });
  
  // Lọc bỏ các lịch đã qua (trừ hôm nay)
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
  const todayStr = today.toISOString().split("T")[0];
  
  const filtered = result.filter((item) => {
    if (item.date > todayStr) return true;
    if (item.date === todayStr) {
      return item.time >= currentTime || !item.isTaken;
    }
    return false;
  });
  
  return filtered.slice(0, limit);
}

/**
 * Tính tỷ lệ tuân thủ điều trị
 */
export function calculateComplianceRate(patientId: string): {
  total: number;
  taken: number;
  rate: number;
} {
  const activeSchedules = loadActiveSchedules(patientId);
  let total = 0;
  let taken = 0;
  
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  
  activeSchedules.forEach((schedule) => {
    // Tính từ ngày bắt đầu đến hôm nay
    const start = new Date(schedule.startDate);
    const end = new Date(todayStr > schedule.endDate ? schedule.endDate : todayStr);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      schedule.scheduledTimes.forEach((time) => {
        total++;
        if (schedule.takenHistory[dateStr]?.includes(time)) {
          taken++;
        }
      });
    }
  });
  
  const rate = total > 0 ? Math.round((taken / total) * 100) : 0;
  
  return { total, taken, rate };
}

