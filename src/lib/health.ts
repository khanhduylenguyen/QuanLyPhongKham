/**
 * Health Metrics Service
 * Quản lý các chỉ số sức khỏe: BMI, huyết áp, cân nặng, chiều cao
 */

export interface HealthMetric {
  id: string;
  patientId: string;
  date: string; // ISO format
  weight?: number; // kg
  height?: number; // m
  bmi?: number; // calculated from weight/height
  bloodPressureSystolic?: number; // mmHg
  bloodPressureDiastolic?: number; // mmHg
  heartRate?: number; // bpm
  bloodSugar?: number; // mg/dL (optional)
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "cliniccare:health-metrics";

/**
 * Calculate BMI from weight and height
 */
export function calculateBMI(weight: number, height: number): number {
  if (height <= 0) return 0;
  return Number((weight / (height * height)).toFixed(1));
}

/**
 * Get BMI category
 */
export function getBMICategory(bmi: number): {
  category: string;
  color: string;
  description: string;
} {
  if (bmi < 18.5) {
    return {
      category: "Thiếu cân",
      color: "#3b82f6",
      description: "BMI dưới 18.5",
    };
  } else if (bmi < 23) {
    return {
      category: "Bình thường",
      color: "#10b981",
      description: "BMI từ 18.5 đến 22.9",
    };
  } else if (bmi < 25) {
    return {
      category: "Thừa cân",
      color: "#f59e0b",
      description: "BMI từ 23 đến 24.9",
    };
  } else if (bmi < 30) {
    return {
      category: "Béo phì độ I",
      color: "#ef4444",
      description: "BMI từ 25 đến 29.9",
    };
  } else {
    return {
      category: "Béo phì độ II",
      color: "#dc2626",
      description: "BMI từ 30 trở lên",
    };
  }
}

/**
 * Get blood pressure category
 */
export function getBloodPressureCategory(
  systolic: number,
  diastolic: number
): {
  category: string;
  color: string;
  description: string;
} {
  if (systolic < 120 && diastolic < 80) {
    return {
      category: "Bình thường",
      color: "#10b981",
      description: "Huyết áp tối ưu",
    };
  } else if (systolic < 130 && diastolic < 85) {
    return {
      category: "Bình thường",
      color: "#10b981",
      description: "Huyết áp bình thường",
    };
  } else if (systolic < 140 && diastolic < 90) {
    return {
      category: "Tiền tăng huyết áp",
      color: "#f59e0b",
      description: "Cần theo dõi",
    };
  } else if (systolic < 160 || diastolic < 100) {
    return {
      category: "Tăng huyết áp độ 1",
      color: "#ef4444",
      description: "Cần điều trị",
    };
  } else if (systolic < 180 || diastolic < 110) {
    return {
      category: "Tăng huyết áp độ 2",
      color: "#dc2626",
      description: "Cần điều trị ngay",
    };
  } else {
    return {
      category: "Tăng huyết áp độ 3",
      color: "#991b1b",
      description: "Cần cấp cứu",
    };
  }
}

/**
 * Get all health metrics for a patient
 */
export function getHealthMetrics(patientId: string): HealthMetric[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const allMetrics: HealthMetric[] = JSON.parse(data);
    return allMetrics
      .filter((m) => m.patientId === patientId)
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA; // Newest first
      });
  } catch (error) {
    console.error("Error loading health metrics:", error);
    return [];
  }
}

/**
 * Get health metric by ID
 */
export function getHealthMetricById(id: string): HealthMetric | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;

    const allMetrics: HealthMetric[] = JSON.parse(data);
    return allMetrics.find((m) => m.id === id) || null;
  } catch (error) {
    console.error("Error loading health metric:", error);
    return null;
  }
}

/**
 * Save new health metric
 */
export function saveHealthMetric(
  metric: Omit<HealthMetric, "id" | "createdAt" | "updatedAt">
): HealthMetric {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const allMetrics: HealthMetric[] = data ? JSON.parse(data) : [];

    // Calculate BMI if weight and height are provided
    let bmi = metric.bmi;
    if (metric.weight && metric.height && !bmi) {
      bmi = calculateBMI(metric.weight, metric.height);
    }

    const newMetric: HealthMetric = {
      ...metric,
      bmi,
      id: `health_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    allMetrics.push(newMetric);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allMetrics));

    // Dispatch event
    window.dispatchEvent(new CustomEvent("healthMetricsUpdated"));

    return newMetric;
  } catch (error) {
    console.error("Error saving health metric:", error);
    throw error;
  }
}

/**
 * Update health metric
 */
export function updateHealthMetric(
  id: string,
  updates: Partial<HealthMetric>
): HealthMetric | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;

    const allMetrics: HealthMetric[] = JSON.parse(data);
    const index = allMetrics.findIndex((m) => m.id === id);

    if (index === -1) return null;

    // Recalculate BMI if weight or height changed
    let bmi = updates.bmi;
    if (
      (updates.weight !== undefined || updates.height !== undefined) &&
      !bmi
    ) {
      const current = allMetrics[index];
      const weight = updates.weight ?? current.weight ?? 0;
      const height = updates.height ?? current.height ?? 0;
      if (weight > 0 && height > 0) {
        bmi = calculateBMI(weight, height);
      }
    }

    allMetrics[index] = {
      ...allMetrics[index],
      ...updates,
      bmi,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(allMetrics));

    // Dispatch event
    window.dispatchEvent(new CustomEvent("healthMetricsUpdated"));

    return allMetrics[index];
  } catch (error) {
    console.error("Error updating health metric:", error);
    throw error;
  }
}

/**
 * Delete health metric
 */
export function deleteHealthMetric(id: string): boolean {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return false;

    const allMetrics: HealthMetric[] = JSON.parse(data);
    const filtered = allMetrics.filter((m) => m.id !== id);

    if (filtered.length === allMetrics.length) return false; // Not found

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

    // Dispatch event
    window.dispatchEvent(new CustomEvent("healthMetricsUpdated"));

    return true;
  } catch (error) {
    console.error("Error deleting health metric:", error);
    return false;
  }
}

/**
 * Get latest health metric
 */
export function getLatestHealthMetric(patientId: string): HealthMetric | null {
  const metrics = getHealthMetrics(patientId);
  return metrics.length > 0 ? metrics[0] : null;
}

/**
 * Get health metrics for chart (sorted by date, oldest first)
 */
export function getHealthMetricsForChart(patientId: string): HealthMetric[] {
  const metrics = getHealthMetrics(patientId);
  return [...metrics].reverse(); // Oldest first for chart
}

