import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  EyeOff,
  Trash2,
  Search,
  Eye,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAllComments,
  deleteComment,
  updateCommentStatus,
  getArticleById,
  type NewsComment,
} from "@/lib/newsAdmin";
import { formatDistanceToNow } from "date-fns";

const AdminComments = () => {
  const [comments, setComments] = useState<NewsComment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = () => {
    const allComments = getAllComments();
    // Sort by date, newest first
    allComments.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setComments(allComments);
  };

  const filteredComments = comments.filter((comment) => {
    const matchesSearch =
      comment.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || comment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = (id: string) => {
    updateCommentStatus(id, "approved");
    loadComments();
    toast.success("Đã duyệt bình luận");
  };

  const handleHide = (id: string) => {
    updateCommentStatus(id, "hidden");
    loadComments();
    toast.success("Đã ẩn bình luận");
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) {
      deleteComment(id);
      loadComments();
      toast.success("Đã xóa bình luận");
    }
  };

  const getStatusBadge = (status: NewsComment["status"]) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="default" className="bg-green-500">
            Đã duyệt
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-500">
            Chờ duyệt
          </Badge>
        );
      case "hidden":
        return (
          <Badge variant="outline" className="bg-gray-500">
            Đã ẩn
          </Badge>
        );
      default:
        return null;
    }
  };

  const getArticleTitle = (articleId: number) => {
    const article = getArticleById(articleId);
    return article?.title || `Bài viết #${articleId}`;
  };

  const stats = {
    total: comments.length,
    pending: comments.filter((c) => c.status === "pending").length,
    approved: comments.filter((c) => c.status === "approved").length,
    hidden: comments.filter((c) => c.status === "hidden").length,
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Bình luận</h1>
          <p className="text-[#687280] mt-1">
            Duyệt, ẩn hoặc xóa bình luận từ người dùng
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-[#E5E7EB]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#687280]">Tổng bình luận</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-[#007BFF]" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-[#E5E7EB]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#687280]">Chờ duyệt</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-[#E5E7EB]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#687280]">Đã duyệt</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-[#E5E7EB]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#687280]">Đã ẩn</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.hidden}</p>
                </div>
                <EyeOff className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-[#E5E7EB]">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#687280]" />
                  <Input
                    placeholder="Tìm kiếm theo tác giả, email hoặc nội dung..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="pending">Chờ duyệt</SelectItem>
                  <SelectItem value="approved">Đã duyệt</SelectItem>
                  <SelectItem value="hidden">Đã ẩn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Comments Table */}
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle>Danh sách bình luận ({filteredComments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bài viết</TableHead>
                    <TableHead>Tác giả</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Nội dung</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-[#687280]">
                        Không có bình luận nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredComments.map((comment) => (
                      <TableRow key={comment.id}>
                        <TableCell className="max-w-xs">
                          <div className="truncate font-medium">
                            {getArticleTitle(comment.articleId)}
                          </div>
                        </TableCell>
                        <TableCell>{comment.author}</TableCell>
                        <TableCell className="text-sm text-[#687280]">
                          {comment.email}
                        </TableCell>
                        <TableCell className="max-w-md">
                          <div className="line-clamp-2 text-sm">{comment.content}</div>
                        </TableCell>
                        <TableCell>{getStatusBadge(comment.status)}</TableCell>
                        <TableCell className="text-sm text-[#687280]">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {comment.status === "pending" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleApprove(comment.id)}
                                title="Duyệt"
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                            {comment.status !== "hidden" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleHide(comment.id)}
                                title="Ẩn"
                              >
                                <EyeOff className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(comment.id)}
                              title="Xóa"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminComments;

