import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { createReview, type CreateReviewRequest } from "@/lib/reviews";
import { toast } from "sonner";

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctorId: string;
  doctorName: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  onSuccess?: () => void;
}

const ReviewDialog = ({
  open,
  onOpenChange,
  doctorId,
  doctorName,
  appointmentId,
  patientId,
  patientName,
  onSuccess,
}: ReviewDialogProps) => {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Vui lòng chọn số sao đánh giá");
      return;
    }

    setIsSubmitting(true);

    try {
      const request: CreateReviewRequest = {
        doctorId,
        doctorName,
        patientId,
        patientName,
        appointmentId,
        rating,
        comment: comment.trim() || undefined,
      };

      createReview(request);
      
      toast.success("Cảm ơn bạn đã đánh giá!");
      
      // Reset form
      setRating(0);
      setComment("");
      setHoveredRating(0);
      
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi gửi đánh giá");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0);
      setComment("");
      setHoveredRating(0);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Đánh giá bác sĩ</DialogTitle>
          <DialogDescription>
            Chia sẻ trải nghiệm của bạn với bác sĩ {doctorName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Rating Stars */}
          <div className="space-y-2">
            <Label>Đánh giá *</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= (hoveredRating || rating);
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                    disabled={isSubmitting}
                  >
                    <Star
                      className={`h-10 w-10 transition-colors ${
                        isFilled
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                );
              })}
              {rating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating === 5 && "Tuyệt vời"}
                  {rating === 4 && "Rất tốt"}
                  {rating === 3 && "Tốt"}
                  {rating === 2 && "Bình thường"}
                  {rating === 1 && "Cần cải thiện"}
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Nhận xét (tùy chọn)</Label>
            <Textarea
              id="comment"
              placeholder="Chia sẻ chi tiết về trải nghiệm của bạn..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={500}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length}/500
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className="bg-[#007BFF] hover:bg-[#0056B3]"
          >
            {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDialog;


