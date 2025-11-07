import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  Clock, 
  User, 
  Search, 
  ArrowRight, 
  Heart,
  Share2,
  BookOpen,
  TrendingUp,
  Stethoscope,
  Pill,
  Activity,
  Eye
} from "lucide-react";
import { mockArticles, type NewsArticle } from "@/data/newsArticles";
import { getAllArticles } from "@/lib/newsAdmin";
import { toast } from "sonner";

const categories = [
  { id: "all", name: "Tất cả", icon: BookOpen },
  { id: "health", name: "Sức khỏe", icon: Heart },
  { id: "treatment", name: "Điều trị", icon: Stethoscope },
  { id: "medicine", name: "Thuốc", icon: Pill },
  { id: "prevention", name: "Phòng bệnh", icon: Activity },
  { id: "trending", name: "Xu hướng", icon: TrendingUp },
];

const News = () => {
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [likedArticles, setLikedArticles] = useState<number[]>([]);
  const [articles, setArticles] = useState<NewsArticle[]>([]);

  // Function to load articles
  const loadArticles = () => {
    const adminArticles = getAllArticles();
    // Filter published articles (status === "published" or status is undefined/null, but not "draft")
    const publishedArticles = adminArticles.filter(
      a => a.status !== "draft" && (!a.status || a.status === "published")
    );
    
    if (publishedArticles.length > 0) {
      setArticles(publishedArticles);
    } else {
      // Fallback to mock articles if no admin articles
      setArticles(mockArticles);
    }
  };

  useEffect(() => {
    const liked = JSON.parse(localStorage.getItem("likedArticles") || "[]");
    setLikedArticles(liked);
  }, []);

  // Load articles on mount and when location changes (user navigates to this page)
  useEffect(() => {
    loadArticles();
  }, [location]);

  // Reload articles when window gains focus (user switches back to tab)
  useEffect(() => {
    const handleFocus = () => {
      loadArticles();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  // Listen for storage changes (when articles are added/updated in another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "cliniccare:news:articles") {
        loadArticles();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Also listen for custom event (for same-tab updates)
  useEffect(() => {
    const handleArticleUpdate = () => {
      loadArticles();
    };
    window.addEventListener("articleUpdated", handleArticleUpdate);
    return () => window.removeEventListener("articleUpdated", handleArticleUpdate);
  }, []);

  const handleLike = (articleId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const liked = JSON.parse(localStorage.getItem("likedArticles") || "[]");
    if (liked.includes(articleId)) {
      const newLiked = liked.filter((id: number) => id !== articleId);
      localStorage.setItem("likedArticles", JSON.stringify(newLiked));
      setLikedArticles(newLiked);
      toast.success("Đã bỏ thích bài viết");
    } else {
      liked.push(articleId);
      localStorage.setItem("likedArticles", JSON.stringify(liked));
      setLikedArticles([...liked]);
      toast.success("Đã thích bài viết");
    }
  };

  const handleShare = (article: NewsArticle, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const url = `${window.location.origin}/news/${article.id}`;
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: url,
      }).catch(() => {
        navigator.clipboard.writeText(url);
        toast.success("Đã sao chép liên kết!");
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Đã sao chép liên kết!");
    }
  };

  const filteredArticles = articles.filter((article) => {
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    const matchesSearch = 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredArticle = articles.find((article) => article.featured);
  const regularArticles = filteredArticles.filter((article) => !article.featured);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId)?.name || categoryId;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 pt-28 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-1.5 text-sm font-medium border border-primary/20">
              <BookOpen className="h-4 w-4 mr-2" />
              Tin tức sức khỏe
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Cập nhật tin tức{" "}
              <span className="text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                sức khỏe mới nhất
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Khám phá những thông tin y tế, lời khuyên sức khỏe và xu hướng mới nhất 
              từ các chuyên gia hàng đầu
            </p>
            
            {/* Search Bar */}
            <div className="pt-6">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm bài viết..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-14 h-14 text-base shadow-lg border-2 focus:border-primary/50 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="sticky top-16 z-40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 border-b shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide scroll-smooth">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              return (
                <Button
                  key={category.id}
                  variant={isActive ? "default" : "outline"}
                  size="default"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 whitespace-nowrap px-5 py-2.5 rounded-full transition-all duration-200 ${
                    isActive 
                      ? "shadow-md scale-105" 
                      : "hover:bg-muted hover:scale-105"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "" : "opacity-70"}`} />
                  <span className="font-medium">{category.name}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="space-y-12">
          {/* Featured Article */}
          {featuredArticle && selectedCategory === "all" && !searchQuery && (
            <div className="relative">
              <Card className="overflow-hidden border-2 border-primary/30 hover:border-primary/50 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-card to-card/50">
                <div className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden group">
                  <img
                    src={featuredArticle.image}
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  <Badge className="absolute top-6 left-6 bg-primary text-primary-foreground shadow-lg px-4 py-2 text-sm font-semibold">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Nổi bật
                  </Badge>
                  <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12 text-white">
                    <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                        {getCategoryName(featuredArticle.category)}
                      </Badge>
                      <span className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                        <Calendar className="h-4 w-4" />
                        {formatDate(featuredArticle.date)}
                      </span>
                      <span className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                        <Clock className="h-4 w-4" />
                        {featuredArticle.readTime}
                      </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight drop-shadow-lg">
                      {featuredArticle.title}
                    </h2>
                    <p className="text-lg md:text-xl text-white/90 mb-6 max-w-3xl leading-relaxed">
                      {featuredArticle.excerpt}
                    </p>
                    <div className="flex flex-wrap items-center gap-6">
                      <div className="flex items-center gap-3 text-white/80">
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          <span className="font-medium">{featuredArticle.author}</span>
                        </div>
                        <span className="mx-2">•</span>
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            {featuredArticle.views.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-2">
                            <Heart className="h-4 w-4" />
                            {featuredArticle.likes}
                          </span>
                        </div>
                      </div>
                      <Button size="lg" className="rounded-full px-6 shadow-lg" asChild>
                        <Link to={`/news/${featuredArticle.id}`}>
                          Đọc thêm
                          <ArrowRight className="h-5 w-5 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Articles Grid */}
          <div>
            {regularArticles.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                    <Search className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">Không tìm thấy bài viết</h3>
                  <p className="text-muted-foreground">
                    Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {regularArticles.map((article) => (
                  <Card
                    key={article.id}
                    className="group overflow-hidden hover:shadow-xl transition-all duration-300 border hover:border-primary/30 bg-card h-full flex flex-col"
                  >
                    <div className="relative h-56 overflow-hidden bg-muted">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <Badge className="absolute top-4 left-4 bg-background/95 text-foreground backdrop-blur-sm shadow-md border border-border/50">
                        {getCategoryName(article.category)}
                      </Badge>
                      <div className="absolute bottom-4 right-4 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className={`h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white ${
                            likedArticles.includes(article.id) ? "bg-red-500/90 hover:bg-red-500" : ""
                          }`}
                          onClick={(e) => handleLike(article.id, e)}
                        >
                          <Heart className={`h-4 w-4 ${likedArticles.includes(article.id) ? "fill-white text-white" : "text-red-500"}`} />
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className="h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white"
                          onClick={(e) => handleShare(article, e)}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardHeader className="flex-1 flex flex-col">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(article.date)}
                        </span>
                        <span className="mx-1">•</span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {article.readTime}
                        </span>
                      </div>
                      <CardTitle className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors mb-3 leading-tight">
                        <Link to={`/news/${article.id}`} className="hover:underline">
                          {article.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="line-clamp-3 text-sm leading-relaxed flex-1">
                        {article.excerpt}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span className="truncate max-w-[120px] font-medium">{article.author}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            {article.views.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3.5 w-3.5" />
                            {article.likes}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors"
                        asChild
                      >
                        <Link to={`/news/${article.id}`}>
                          Đọc thêm
                          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default News;

