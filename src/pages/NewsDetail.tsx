import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  Clock, 
  User, 
  Heart,
  Share2,
  Eye,
  ArrowLeft,
  Facebook,
  Twitter,
  Copy,
  Check,
  BookOpen,
  Stethoscope,
  Pill,
  Activity,
  TrendingUp,
} from "lucide-react";
import { mockArticles, type NewsArticle } from "@/data/newsArticles";
import { getArticleById, getAllArticles } from "@/lib/newsAdmin";
import { toast } from "sonner";

const categories = [
  { id: "all", name: "Tất cả", icon: BookOpen },
  { id: "health", name: "Sức khỏe", icon: Heart },
  { id: "treatment", name: "Điều trị", icon: Stethoscope },
  { id: "medicine", name: "Thuốc", icon: Pill },
  { id: "prevention", name: "Phòng bệnh", icon: Activity },
  { id: "trending", name: "Xu hướng", icon: TrendingUp },
];

const NewsDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const articleId = parseInt(id || "0");
    // Try to get from admin storage first, fallback to mock
    let foundArticle = getArticleById(articleId);
    if (!foundArticle) {
      foundArticle = mockArticles.find(a => a.id === articleId) || null;
    }
    
    if (!foundArticle) {
      navigate("/news");
      return;
    }

    setArticle(foundArticle);
    setLikesCount(foundArticle.likes);
    setViewsCount(foundArticle.views);

    // Load liked state from localStorage
    const likedArticles = JSON.parse(localStorage.getItem("likedArticles") || "[]");
    setIsLiked(likedArticles.includes(articleId));

    // Track view
    const viewedArticles = JSON.parse(localStorage.getItem("viewedArticles") || "[]");
    if (!viewedArticles.includes(articleId)) {
      viewedArticles.push(articleId);
      localStorage.setItem("viewedArticles", JSON.stringify(viewedArticles));
      setViewsCount(prev => prev + 1);
    }
  }, [id, navigate]);

  const handleLike = () => {
    if (!article) return;

    const likedArticles = JSON.parse(localStorage.getItem("likedArticles") || "[]");
    const articleId = article.id;

    if (isLiked) {
      const newLiked = likedArticles.filter((id: number) => id !== articleId);
      localStorage.setItem("likedArticles", JSON.stringify(newLiked));
      setIsLiked(false);
      setLikesCount(prev => Math.max(0, prev - 1));
      toast.success("Đã bỏ thích bài viết");
    } else {
      likedArticles.push(articleId);
      localStorage.setItem("likedArticles", JSON.stringify(likedArticles));
      setIsLiked(true);
      setLikesCount(prev => prev + 1);
      toast.success("Đã thích bài viết");
    }
  };

  const handleShare = (platform: string) => {
    if (!article) return;

    const url = window.location.href;
    const text = `${article.title} - ${article.excerpt}`;

    switch (platform) {
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
        break;
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank");
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Đã sao chép liên kết!");
        setTimeout(() => setCopied(false), 2000);
        break;
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId)?.name || categoryId;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRelatedArticles = (currentArticle: NewsArticle): NewsArticle[] => {
    return mockArticles
      .filter(a => a.id !== currentArticle.id && a.category === currentArticle.category)
      .slice(0, 3);
  };

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
        <Footer />
      </div>
    );
  }

  const relatedArticles = getRelatedArticles(article);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header />
      
      {/* Back Button */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Button variant="ghost" onClick={() => navigate("/news")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại tin tức
        </Button>
      </div>

      {/* Article Header */}
      <article className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Category & Date */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {getCategoryName(article.category)}
            </Badge>
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {formatDate(article.date)}
            </span>
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {article.readTime}
            </span>
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              {viewsCount.toLocaleString()} lượt xem
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            {article.title}
          </h1>

          {/* Author & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{article.author}</p>
                <p className="text-sm text-muted-foreground">Bác sĩ chuyên khoa</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant={isLiked ? "default" : "outline"}
                size="lg"
                onClick={handleLike}
                className="gap-2"
              >
                <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                {likesCount}
              </Button>
              <div className="relative">
                <Button variant="outline" size="lg" onClick={() => handleShare("copy")} className="gap-2">
                  {copied ? (
                    <>
                      <Check className="h-5 w-5" />
                      Đã sao chép
                    </>
                  ) : (
                    <>
                      <Copy className="h-5 w-5" />
                      Chia sẻ
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden mb-8">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div 
            className="prose prose-lg max-w-none dark:prose-invert mb-12"
            dangerouslySetInnerHTML={{ __html: article.content }}
            style={{
              fontSize: "1.125rem",
              lineHeight: "1.75rem",
            }}
          />

          {/* Share Section */}
          <div className="border-t border-b py-8 mb-12">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Chia sẻ bài viết này</h3>
                <p className="text-sm text-muted-foreground">
                  Giúp người khác tìm thấy thông tin hữu ích
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleShare("facebook")}
                  className="gap-2"
                >
                  <Facebook className="h-5 w-5" />
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleShare("twitter")}
                  className="gap-2"
                >
                  <Twitter className="h-5 w-5" />
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleShare("copy")}
                  className="gap-2"
                >
                  {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <section className="mt-16">
              <h2 className="text-2xl font-bold mb-6">Bài viết liên quan</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedArticles.map((relatedArticle) => (
                  <Card
                    key={relatedArticle.id}
                    className="group overflow-hidden hover:shadow-lg transition-all duration-300 border hover:border-primary/30"
                  >
                    <Link to={`/news/${relatedArticle.id}`}>
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={relatedArticle.image}
                          alt={relatedArticle.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <Badge className="absolute top-3 left-3 bg-background/90 text-foreground">
                          {getCategoryName(relatedArticle.category)}
                        </Badge>
                      </div>
                      <CardHeader>
                        <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                          {relatedArticle.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {relatedArticle.excerpt}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(relatedArticle.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {relatedArticle.readTime}
                          </span>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default NewsDetail;

