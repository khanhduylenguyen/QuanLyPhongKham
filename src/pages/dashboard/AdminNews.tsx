import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Image as ImageIcon,
  X,
  Save,
  FileText,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAllArticles,
  saveArticle,
  deleteArticle,
  getNextArticleId,
  type NewsArticle,
} from "@/lib/newsAdmin";
import { mockArticles } from "@/data/newsArticles";

const categories = [
  { value: "health", label: "Sức khỏe" },
  { value: "treatment", label: "Điều trị" },
  { value: "medicine", label: "Thuốc" },
  { value: "prevention", label: "Phòng bệnh" },
  { value: "trending", label: "Xu hướng" },
];

const AdminNews = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");

  const [formData, setFormData] = useState<Partial<NewsArticle>>({
    title: "",
    excerpt: "",
    content: "",
    author: "",
    category: "health",
    readTime: "5 phút",
    image: "",
    featured: false,
    tags: [],
    status: "published",
    views: 0,
    likes: 0,
  });

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = () => {
    const allArticles = getAllArticles();
    if (allArticles.length === 0) {
      // Initialize with mock data
      mockArticles.forEach((article) => {
        saveArticle({
          ...article,
          status: "published",
          tags: [],
          createdAt: article.date,
        });
      });
      setArticles(getAllArticles());
    } else {
      setArticles(allArticles);
    }
  };

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenDialog = (article?: NewsArticle) => {
    if (article) {
      setEditingArticle(article);
      setFormData({
        ...article,
        tags: article.tags || [],
      });
      setPreviewImage(article.image);
    } else {
      setEditingArticle(null);
      setFormData({
        title: "",
        excerpt: "",
        content: "",
        author: "",
        category: "health",
        readTime: "5 phút",
        image: "",
        featured: false,
        tags: [],
        status: "published",
        views: 0,
        likes: 0,
      });
      setPreviewImage("");
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingArticle(null);
    setPreviewImage("");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước ảnh không được vượt quá 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setPreviewImage(imageUrl);
        setFormData({ ...formData, image: imageUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && e.currentTarget.value.trim()) {
      e.preventDefault();
      const newTag = e.currentTarget.value.trim();
      if (!formData.tags?.includes(newTag)) {
        setFormData({
          ...formData,
          tags: [...(formData.tags || []), newTag],
        });
      }
      e.currentTarget.value = "";
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((tag) => tag !== tagToRemove) || [],
    });
  };

  const handleSave = () => {
    if (!formData.title || !formData.excerpt || !formData.content || !formData.author) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const articleToSave: NewsArticle = {
      id: editingArticle?.id || getNextArticleId(),
      title: formData.title!,
      excerpt: formData.excerpt!,
      content: formData.content!,
      author: formData.author!,
      category: formData.category || "health",
      date: editingArticle?.date || new Date().toISOString().split("T")[0],
      readTime: formData.readTime || "5 phút",
      image: formData.image || "",
      featured: formData.featured || false,
      tags: formData.tags || [],
      status: formData.status || "published",
      views: editingArticle?.views || 0,
      likes: editingArticle?.likes || 0,
      createdAt: editingArticle?.createdAt || new Date().toISOString(),
    };

    saveArticle(articleToSave);
    loadArticles();
    handleCloseDialog();
    toast.success(editingArticle ? "Cập nhật bài viết thành công" : "Tạo bài viết thành công");
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
      deleteArticle(id);
      loadArticles();
      toast.success("Xóa bài viết thành công");
    }
  };

  const getCategoryName = (category: string) => {
    return categories.find((c) => c.value === category)?.label || category;
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Tin tức</h1>
            <p className="text-[#687280] mt-1">
              Quản lý bài viết, phân loại và nội dung tin tức
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/dashboard/news/comments")}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Bình luận
            </Button>
            <Button variant="outline" onClick={() => navigate("/dashboard/news/stats")}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Thống kê
            </Button>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo bài viết mới
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-[#E5E7EB]">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#687280]" />
                  <Input
                    placeholder="Tìm kiếm bài viết..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Articles Table */}
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle>Danh sách bài viết ({filteredArticles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Tác giả</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Lượt xem</TableHead>
                    <TableHead>Lượt thích</TableHead>
                    <TableHead>Ngày đăng</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredArticles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-[#687280]">
                        Không có bài viết nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredArticles.map((article) => (
                      <TableRow key={article.id}>
                        <TableCell className="font-medium max-w-xs">
                          <div className="truncate">{article.title}</div>
                          {article.featured && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              Nổi bật
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{article.author}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getCategoryName(article.category)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              article.status === "published" ? "default" : "secondary"
                            }
                          >
                            {article.status === "published" ? "Đã xuất bản" : "Bản nháp"}
                          </Badge>
                        </TableCell>
                        <TableCell>{article.views || 0}</TableCell>
                        <TableCell>{article.likes || 0}</TableCell>
                        <TableCell>{article.date}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/news/${article.id}`)}
                              title="Xem"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(article)}
                              title="Sửa"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(article.id)}
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

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingArticle ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
              </DialogTitle>
              <DialogDescription>
                {editingArticle
                  ? "Cập nhật thông tin bài viết"
                  : "Điền thông tin để tạo bài viết mới"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Nhập tiêu đề bài viết"
                />
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <Label htmlFor="excerpt">Tóm tắt *</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Nhập tóm tắt bài viết"
                  rows={3}
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Nội dung *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Nhập nội dung bài viết (HTML được hỗ trợ)"
                  rows={10}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-[#687280]">
                  Hỗ trợ HTML: &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;, &lt;li&gt;, etc.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Author */}
                <div className="space-y-2">
                  <Label htmlFor="author">Tác giả *</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="VD: BS. Nguyễn Văn A"
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Danh mục *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Read Time */}
                <div className="space-y-2">
                  <Label htmlFor="readTime">Thời gian đọc</Label>
                  <Input
                    id="readTime"
                    value={formData.readTime}
                    onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                    placeholder="VD: 5 phút"
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Trạng thái</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "published" | "draft") =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Đã xuất bản</SelectItem>
                      <SelectItem value="draft">Bản nháp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="image">Ảnh đại diện</Label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-[#687280] mt-1">
                      Hoặc nhập URL ảnh
                    </p>
                    <Input
                      value={formData.image}
                      onChange={(e) => {
                        setFormData({ ...formData, image: e.target.value });
                        setPreviewImage(e.target.value);
                      }}
                      placeholder="https://..."
                      className="mt-2"
                    />
                  </div>
                  {previewImage && (
                    <div className="w-32 h-32 border rounded-lg overflow-hidden">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (Nhấn Enter để thêm)</Label>
                <Input
                  id="tags"
                  placeholder="Nhập tag và nhấn Enter"
                  onKeyDown={handleTagInput}
                />
                {formData.tags && formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Featured */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="featured" className="cursor-pointer">
                  Đánh dấu bài viết nổi bật
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                Hủy
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                {editingArticle ? "Cập nhật" : "Tạo mới"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminNews;

