/**
 * Service quản lý kết quả xét nghiệm
 * Lưu trữ PDF/ảnh và metadata của kết quả xét nghiệm
 */

export interface LabResult {
  id: string;
  patientId: string;
  testName: string; // Tên xét nghiệm (ví dụ: "Xét nghiệm máu", "Xét nghiệm nước tiểu")
  testDate: string; // Ngày xét nghiệm (ISO format)
  facility?: string; // Cơ sở xét nghiệm
  doctor?: string; // Bác sĩ chỉ định
  files: LabFile[]; // Danh sách file PDF/ảnh
  notes?: string; // Ghi chú
  createdAt: string; // Ngày tạo record
  updatedAt: string; // Ngày cập nhật
}

export interface LabFile {
  id: string;
  name: string;
  type: "pdf" | "image"; // Loại file
  url: string; // Base64 data URL hoặc blob URL
  size: number; // Kích thước file (bytes)
  uploadedAt: string; // Ngày upload
}

const STORAGE_KEY = "cliniccare:lab-results";

/**
 * Lấy tất cả kết quả xét nghiệm của bệnh nhân
 */
export function getLabResults(patientId: string): LabResult[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const allResults: LabResult[] = JSON.parse(data);
    return allResults.filter((r) => r.patientId === patientId);
  } catch (error) {
    console.error("Error loading lab results:", error);
    return [];
  }
}

/**
 * Lấy kết quả xét nghiệm theo ID
 */
export function getLabResultById(id: string): LabResult | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    
    const allResults: LabResult[] = JSON.parse(data);
    return allResults.find((r) => r.id === id) || null;
  } catch (error) {
    console.error("Error loading lab result:", error);
    return null;
  }
}

/**
 * Lưu kết quả xét nghiệm mới
 */
export function saveLabResult(result: Omit<LabResult, "id" | "createdAt" | "updatedAt">): LabResult {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const allResults: LabResult[] = data ? JSON.parse(data) : [];
    
    const newResult: LabResult = {
      ...result,
      id: `lab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    allResults.push(newResult);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allResults));
    
    // Dispatch event để các component khác có thể cập nhật
    window.dispatchEvent(new CustomEvent("labResultsUpdated"));
    
    return newResult;
  } catch (error) {
    console.error("Error saving lab result:", error);
    throw error;
  }
}

/**
 * Cập nhật kết quả xét nghiệm
 */
export function updateLabResult(id: string, updates: Partial<LabResult>): LabResult | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    
    const allResults: LabResult[] = JSON.parse(data);
    const index = allResults.findIndex((r) => r.id === id);
    
    if (index === -1) return null;
    
    allResults[index] = {
      ...allResults[index],
      ...updates,
      id, // Đảm bảo không thay đổi ID
      updatedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allResults));
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent("labResultsUpdated"));
    
    return allResults[index];
  } catch (error) {
    console.error("Error updating lab result:", error);
    throw error;
  }
}

/**
 * Xóa kết quả xét nghiệm
 */
export function deleteLabResult(id: string): boolean {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return false;
    
    const allResults: LabResult[] = JSON.parse(data);
    const filtered = allResults.filter((r) => r.id !== id);
    
    if (filtered.length === allResults.length) return false; // Không tìm thấy
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent("labResultsUpdated"));
    
    return true;
  } catch (error) {
    console.error("Error deleting lab result:", error);
    return false;
  }
}

/**
 * Chuyển đổi File thành base64 data URL
 */
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Validate file upload
 */
export function validateLabFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];
  
  if (file.size > maxSize) {
    return { valid: false, error: "File quá lớn. Kích thước tối đa là 10MB." };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Chỉ chấp nhận file PDF hoặc ảnh (JPG, PNG, WEBP)." };
  }
  
  return { valid: true };
}

/**
 * Lấy danh sách tên xét nghiệm duy nhất (để autocomplete)
 */
export function getUniqueTestNames(patientId: string): string[] {
  const results = getLabResults(patientId);
  const names = new Set<string>();
  
  results.forEach((r) => {
    if (r.testName) names.add(r.testName);
  });
  
  return Array.from(names).sort();
}

/**
 * So sánh kết quả xét nghiệm theo tên xét nghiệm
 * Trả về danh sách các kết quả cùng tên xét nghiệm, sắp xếp theo thời gian
 */
export function getTestHistory(patientId: string, testName: string): LabResult[] {
  const results = getLabResults(patientId);
  return results
    .filter((r) => r.testName === testName)
    .sort((a, b) => {
      const dateA = new Date(a.testDate).getTime();
      const dateB = new Date(b.testDate).getTime();
      return dateA - dateB; // Cũ nhất trước
    });
}

