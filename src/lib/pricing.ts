// Pricing helper - Get price by specialty
// In production, this would come from a database or API

const specialtyPrices: Record<string, number> = {
  "Nội tổng quát": 150000,
  "Nhi": 180000,
  "Tim mạch": 250000,
  "Tai Mũi Họng": 200000,
  "Chấn thương chỉnh hình": 300000,
  "Xét nghiệm": 250000,
  "Da liễu": 200000,
  "Dinh dưỡng": 150000,
};

// Get price by specialty
export const getPriceBySpecialty = (specialty: string): number => {
  return specialtyPrices[specialty] || 200000; // Default price
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

