import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star, TrendingUp } from "lucide-react";
import { getDoctorReviewStats, type ReviewStats } from "@/lib/reviews";
import { useMemo } from "react";

interface ReviewStatsProps {
  doctorId: string;
  showChart?: boolean;
}

const ReviewStats = ({ doctorId, showChart = true }: ReviewStatsProps) => {
  const stats: ReviewStats = useMemo(
    () => getDoctorReviewStats(doctorId),
    [doctorId]
  );

  if (stats.totalReviews === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Thống kê đánh giá
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Star className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>Chưa có đánh giá nào</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const percentage = (count: number) =>
    stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Thống kê đánh giá
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Rating */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="flex items-center gap-1 mb-2">
              <Star className="h-8 w-8 text-yellow-400 fill-yellow-400" />
              <span className="text-3xl font-bold">
                {stats.averageRating.toFixed(1)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {stats.totalReviews} đánh giá
            </p>
          </div>
          {showChart && (
            <div className="flex-1 space-y-2">
              {/* Rating Distribution */}
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution];
                const percent = percentage(count);
                return (
                  <div key={rating} className="flex items-center gap-2">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm font-medium">{rating}</span>
                      <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                    </div>
                    <Progress value={percent} className="flex-1 h-2" />
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-xs text-muted-foreground">Đánh giá tích cực</p>
              <p className="text-sm font-semibold">
                {percentage(stats.ratingDistribution[5] + stats.ratingDistribution[4]).toFixed(0)}%
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-400" />
            <div>
              <p className="text-xs text-muted-foreground">5 sao</p>
              <p className="text-sm font-semibold">
                {stats.ratingDistribution[5]}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewStats;


