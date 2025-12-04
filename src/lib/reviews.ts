// Review service - Quản lý đánh giá bác sĩ

export interface Review {
  id: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  appointmentId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: string;
  updatedAt?: string;
  helpful?: number; // Số lượt "hữu ích"
  verified?: boolean; // Đã xác minh (đã khám thật)
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  recentReviews: Review[];
}

export interface CreateReviewRequest {
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  appointmentId: string;
  rating: number;
  comment?: string;
}

const REVIEWS_STORAGE_KEY = "cliniccare:reviews";

// Load reviews from localStorage
export const loadReviews = (): Review[] => {
  try {
    const stored = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {}
  return [];
};

// Save reviews to localStorage
export const saveReviews = (reviews: Review[]) => {
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
  } catch {}
};

// Create a new review
export const createReview = (request: CreateReviewRequest): Review => {
  const reviews = loadReviews();
  
  // Check if patient already reviewed this appointment
  const existingReview = reviews.find(
    (r) => r.appointmentId === request.appointmentId
  );
  
  if (existingReview) {
    throw new Error("Bạn đã đánh giá lịch hẹn này rồi");
  }

  const review: Review = {
    id: `REV${String(reviews.length + 1).padStart(6, "0")}`,
    doctorId: request.doctorId,
    doctorName: request.doctorName,
    patientId: request.patientId,
    patientName: request.patientName,
    appointmentId: request.appointmentId,
    rating: request.rating,
    comment: request.comment,
    createdAt: new Date().toISOString(),
    verified: true, // Assume verified if created from completed appointment
    helpful: 0,
  };

  const updatedReviews = [...reviews, review];
  saveReviews(updatedReviews);
  
  return review;
};

// Get reviews for a specific doctor
export const getDoctorReviews = (doctorId: string): Review[] => {
  const reviews = loadReviews();
  return reviews
    .filter((r) => r.doctorId === doctorId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// Get review stats for a doctor
export const getDoctorReviewStats = (doctorId: string): ReviewStats => {
  const reviews = getDoctorReviews(doctorId);
  
  if (reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      recentReviews: [],
    };
  }

  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = totalRating / reviews.length;

  const ratingDistribution = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  };

  const recentReviews = reviews.slice(0, 10);

  return {
    averageRating,
    totalReviews: reviews.length,
    ratingDistribution,
    recentReviews,
  };
};

// Get average rating for a doctor (quick access)
export const getDoctorRating = (doctorId: string): number => {
  const stats = getDoctorReviewStats(doctorId);
  return stats.averageRating;
};

// Check if patient has reviewed an appointment
export const hasReviewedAppointment = (appointmentId: string): boolean => {
  const reviews = loadReviews();
  return reviews.some((r) => r.appointmentId === appointmentId);
};

// Get review for an appointment
export const getReviewByAppointment = (appointmentId: string): Review | null => {
  const reviews = loadReviews();
  return reviews.find((r) => r.appointmentId === appointmentId) || null;
};

// Update review helpful count
export const markReviewHelpful = (reviewId: string): void => {
  const reviews = loadReviews();
  const review = reviews.find((r) => r.id === reviewId);
  if (review) {
    review.helpful = (review.helpful || 0) + 1;
    saveReviews(reviews);
  }
};

// Delete a review (admin only)
export const deleteReview = (reviewId: string): void => {
  const reviews = loadReviews();
  const updatedReviews = reviews.filter((r) => r.id !== reviewId);
  saveReviews(updatedReviews);
};

// Get all reviews (for admin)
export const getAllReviews = (): Review[] => {
  return loadReviews().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};


