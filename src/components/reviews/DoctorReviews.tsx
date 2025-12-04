import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, ThumbsUp, MessageSquare } from "lucide-react";
import { getDoctorReviews, markReviewHelpful, type Review } from "@/lib/reviews";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale/vi";

interface DoctorReviewsProps {
  doctorId: string;
  maxReviews?: number;
  showHeader?: boolean;
}

const DoctorReviews = ({
  doctorId,
  maxReviews,
  showHeader = true,
}: DoctorReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>(() =>
    getDoctorReviews(doctorId)
  );
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(
    new Set()
  );

  const displayedReviews = maxReviews
    ? reviews.slice(0, maxReviews)
    : reviews;

  const handleMarkHelpful = (reviewId: string) => {
    markReviewHelpful(reviewId);
    // Refresh reviews to show updated helpful count
    setReviews(getDoctorReviews(doctorId));
  };

  const toggleExpand = (reviewId: string) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedReviews(newExpanded);
  };

  if (reviews.length === 0) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Đánh giá
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>Chưa có đánh giá nào</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Đánh giá ({reviews.length})
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-4">
          {displayedReviews.map((review) => {
            const isExpanded = expandedReviews.has(review.id);
            const commentLength = review.comment?.length || 0;
            const shouldTruncate = commentLength > 150;

            return (
              <div
                key={review.id}
                className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {review.patientName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{review.patientName}</p>
                        {review.verified && (
                          <Badge variant="secondary" className="text-xs">
                            Đã xác minh
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {(() => {
                          try {
                            return formatDistanceToNow(new Date(review.createdAt), {
                              addSuffix: true,
                              locale: vi,
                            });
                          } catch {
                            return formatDistanceToNow(new Date(review.createdAt), {
                              addSuffix: true,
                            });
                          }
                        })()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Comment */}
                {review.comment && (
                  <div className="text-sm text-muted-foreground">
                    {shouldTruncate && !isExpanded ? (
                      <>
                        <p>{review.comment.substring(0, 150)}...</p>
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs"
                          onClick={() => toggleExpand(review.id)}
                        >
                          Xem thêm
                        </Button>
                      </>
                    ) : (
                      <>
                        <p>{review.comment}</p>
                        {shouldTruncate && (
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs"
                            onClick={() => toggleExpand(review.id)}
                          >
                            Thu gọn
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4 pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => handleMarkHelpful(review.id)}
                  >
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    Hữu ích ({review.helpful || 0})
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default DoctorReviews;

