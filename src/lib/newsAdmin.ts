import { NewsArticle, NewsComment, mockArticles } from "@/data/newsArticles";

const ARTICLES_KEY = "cliniccare:news:articles";
const COMMENTS_KEY = "cliniccare:news:comments";

// Articles Management
export function getAllArticles(): NewsArticle[] {
  try {
    const stored = localStorage.getItem(ARTICLES_KEY);
    if (stored) {
      const articles = JSON.parse(stored);
      if (articles.length > 0) {
        return articles;
      }
    }
    // Return empty array if no stored articles
    // Articles will be initialized in AdminNews component
    return [];
  } catch {
    return [];
  }
}

export function getArticleById(id: number): NewsArticle | null {
  const articles = getAllArticles();
  return articles.find((a) => a.id === id) || null;
}

export function saveArticle(article: NewsArticle): void {
  const articles = getAllArticles();
  const index = articles.findIndex((a) => a.id === article.id);
  
  const updatedArticle = {
    ...article,
    updatedAt: new Date().toISOString(),
  };

  if (index >= 0) {
    articles[index] = updatedArticle;
  } else {
    articles.push({
      ...updatedArticle,
      createdAt: new Date().toISOString(),
      status: updatedArticle.status || "published",
    });
  }
  
  localStorage.setItem(ARTICLES_KEY, JSON.stringify(articles));
  
  // Dispatch custom event to notify other components
  window.dispatchEvent(new CustomEvent("articleUpdated"));
}

export function deleteArticle(id: number): void {
  const articles = getAllArticles();
  const filtered = articles.filter((a) => a.id !== id);
  localStorage.setItem(ARTICLES_KEY, JSON.stringify(filtered));
  
  // Also delete related comments
  const comments = getAllComments();
  const filteredComments = comments.filter((c) => c.articleId !== id);
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(filteredComments));
  
  // Dispatch custom event to notify other components
  window.dispatchEvent(new CustomEvent("articleUpdated"));
}

export function getNextArticleId(): number {
  const articles = getAllArticles();
  if (articles.length === 0) return 1;
  return Math.max(...articles.map((a) => a.id)) + 1;
}

// Comments Management
export function getAllComments(): NewsComment[] {
  try {
    const stored = localStorage.getItem(COMMENTS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch {
    return [];
  }
}

export function getCommentsByArticleId(articleId: number): NewsComment[] {
  const comments = getAllComments();
  return comments.filter((c) => c.articleId === articleId);
}

export function saveComment(comment: NewsComment): void {
  const comments = getAllComments();
  const index = comments.findIndex((c) => c.id === comment.id);
  
  if (index >= 0) {
    comments[index] = comment;
  } else {
    comments.push(comment);
  }
  
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
}

export function deleteComment(id: string): void {
  const comments = getAllComments();
  const filtered = comments.filter((c) => c.id !== id);
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(filtered));
}

export function getNextCommentId(): string {
  return `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function updateCommentStatus(id: string, status: NewsComment["status"]): void {
  const comments = getAllComments();
  const index = comments.findIndex((c) => c.id === id);
  if (index >= 0) {
    comments[index].status = status;
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
  }
}

// Statistics
export interface NewsStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  pendingComments: number;
  approvedComments: number;
  hiddenComments: number;
  articlesByCategory: Record<string, number>;
  topArticles: Array<{ id: number; title: string; views: number; likes: number }>;
}

export function getNewsStats(): NewsStats {
  const articles = getAllArticles();
  const comments = getAllComments();
  
  const stats: NewsStats = {
    totalArticles: articles.length,
    publishedArticles: articles.filter((a) => a.status === "published" || !a.status).length,
    draftArticles: articles.filter((a) => a.status === "draft").length,
    totalViews: articles.reduce((sum, a) => sum + (a.views || 0), 0),
    totalLikes: articles.reduce((sum, a) => sum + (a.likes || 0), 0),
    totalComments: comments.length,
    pendingComments: comments.filter((c) => c.status === "pending").length,
    approvedComments: comments.filter((c) => c.status === "approved").length,
    hiddenComments: comments.filter((c) => c.status === "hidden").length,
    articlesByCategory: {},
    topArticles: [],
  };

  // Count by category
  articles.forEach((article) => {
    const cat = article.category || "other";
    stats.articlesByCategory[cat] = (stats.articlesByCategory[cat] || 0) + 1;
  });

  // Top articles by views
  stats.topArticles = articles
    .map((a) => ({ id: a.id, title: a.title, views: a.views || 0, likes: a.likes || 0 }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  return stats;
}

