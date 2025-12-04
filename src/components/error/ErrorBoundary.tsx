import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

function ErrorFallback({ error, onReset }: { error: Error | null; onReset: () => void }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-2xl w-full border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-xl">Đã xảy ra lỗi</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Ứng dụng gặp sự cố không mong muốn
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-medium text-foreground mb-2">Chi tiết lỗi:</p>
              <p className="text-sm text-muted-foreground font-mono break-all">
                {error.message || "Lỗi không xác định"}
              </p>
              {(import.meta.env.DEV || import.meta.env.MODE === "development") && error.stack && (
                <details className="mt-3">
                  <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                    Stack trace
                  </summary>
                  <pre className="mt-2 text-xs text-muted-foreground overflow-auto max-h-48 p-2 bg-background rounded border">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={onReset} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Thử lại
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="flex-1"
            >
              <Home className="h-4 w-4 mr-2" />
              Về trang chủ
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Nếu vấn đề vẫn tiếp tục, vui lòng liên hệ hỗ trợ hoặc làm mới trang
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default ErrorBoundary;

