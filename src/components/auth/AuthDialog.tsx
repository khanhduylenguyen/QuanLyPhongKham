import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

const AuthDialog = ({ 
  open, 
  onOpenChange,
  title = "Yêu cầu đăng nhập",
  description = "Vui lòng đăng nhập để sử dụng tính năng này. Nếu chưa có tài khoản, bạn có thể đăng ký miễn phí."
}: AuthDialogProps) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    onOpenChange(false);
    navigate("/login");
  };

  const handleRegister = () => {
    onOpenChange(false);
    navigate("/register");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleRegister}
            className="w-full sm:w-auto gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Đăng ký tài khoản
          </Button>
          <Button
            onClick={handleLogin}
            className="w-full sm:w-auto gap-2"
          >
            <LogIn className="h-4 w-4" />
            Đăng nhập
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;

