import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  FileText,
  Eye,
  Heart,
  MessageSquare,
  TrendingUp,
  Users,
} from "lucide-react";
import { getNewsStats } from "@/lib/newsAdmin";

const COLORS = ["#007BFF", "#4CAF50", "#FF9800", "#9C27B0", "#F44336"];

const AdminNewsStats = () => {
  const [stats, setStats] = useState(getNewsStats());

  useEffect(() => {
    // Reload stats
    setStats(getNewsStats());
  }, []);

  const categoryData = Object.entries(stats.articlesByCategory).map(([name, value]) => ({
    name: name === "health" ? "Sức khỏe" :
          name === "treatment" ? "Điều trị" :
          name === "medicine" ? "Thuốc" :
          name === "prevention" ? "Phòng bệnh" :
          name === "trending" ? "Xu hướng" : name,
    value,
  }));

  const topArticlesData = stats.topArticles.map((article) => ({
    name: article.title.length > 20 
      ? article.title.substring(0, 20) + "..." 
      : article.title,
    views: article.views,
    likes: article.likes,
  }));

  const commentsData = [
    { name: "Đã duyệt", value: stats.approvedComments, color: "#4CAF50" },
    { name: "Chờ duyệt", value: stats.pendingComments, color: "#FF9800" },
    { name: "Đã ẩn", value: stats.hiddenComments, color: "#9C27B0" },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thống kê Tin tức</h1>
          <p className="text-[#687280] mt-1">
            Tổng quan về hiệu suất và tương tác của trang tin tức
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-[#E5E7EB]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-[#007BFF] p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <TrendingUp className="h-5 w-5 text-[#4CAF50]" />
              </div>
              <div>
                <p className="text-sm text-[#687280] mb-1">Tổng số bài viết</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalArticles}
                </p>
                <p className="text-xs text-[#687280] mt-1">
                  {stats.publishedArticles} đã xuất bản, {stats.draftArticles} bản nháp
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E5E7EB]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-[#4CAF50] p-3 rounded-lg">
                  <Eye className="h-6 w-6 text-white" />
                </div>
                <TrendingUp className="h-5 w-5 text-[#4CAF50]" />
              </div>
              <div>
                <p className="text-sm text-[#687280] mb-1">Tổng lượt xem</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalViews.toLocaleString()}
                </p>
                <p className="text-xs text-[#687280] mt-1">
                  Trung bình: {Math.round(stats.totalViews / Math.max(stats.totalArticles, 1))} lượt/bài
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E5E7EB]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-[#FF9800] p-3 rounded-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <TrendingUp className="h-5 w-5 text-[#4CAF50]" />
              </div>
              <div>
                <p className="text-sm text-[#687280] mb-1">Tổng lượt thích</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalLikes.toLocaleString()}
                </p>
                <p className="text-xs text-[#687280] mt-1">
                  Tỷ lệ: {stats.totalViews > 0 
                    ? ((stats.totalLikes / stats.totalViews) * 100).toFixed(1) 
                    : 0}%
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E5E7EB]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-[#9C27B0] p-3 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <TrendingUp className="h-5 w-5 text-[#4CAF50]" />
              </div>
              <div>
                <p className="text-sm text-[#687280] mb-1">Tổng bình luận</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalComments}
                </p>
                <p className="text-xs text-[#687280] mt-1">
                  {stats.approvedComments} đã duyệt, {stats.pendingComments} chờ duyệt
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Articles by Category */}
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Bài viết theo danh mục
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Comments Status */}
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Trạng thái bình luận
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={commentsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) =>
                      `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {commentsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Articles Chart */}
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Top 5 bài viết phổ biến nhất
            </CardTitle>
            <CardDescription>
              Sắp xếp theo lượt xem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={topArticlesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name" 
                  stroke="#687280"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis stroke="#687280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="views" fill="#007BFF" radius={[8, 8, 0, 0]} name="Lượt xem" />
                <Bar dataKey="likes" fill="#4CAF50" radius={[8, 8, 0, 0]} name="Lượt thích" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Articles List */}
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Chi tiết top bài viết
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topArticles.map((article, index) => (
                <div
                  key={article.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#007BFF] text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{article.title}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-[#687280]">
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {article.views.toLocaleString()} lượt xem
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {article.likes.toLocaleString()} lượt thích
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminNewsStats;

