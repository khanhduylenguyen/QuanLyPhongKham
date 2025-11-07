import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-6">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo and Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#007BFF]">
              <Calendar className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">ClinicCare</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Quên mật khẩu</h1>
          <p className="text-[#687280]">
            Nhập email của bạn để nhận link đặt lại mật khẩu
          </p>
        </div>

        {/* Success Message */}
        {isSubmitted ? (
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#4CAF50]/10">
                <CheckCircle2 className="h-8 w-8 text-[#4CAF50]" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Đã gửi email thành công!
            </h2>
            <p className="text-[#687280]">
              Chúng tôi đã gửi link đặt lại mật khẩu đến email của bạn. Vui
              lòng kiểm tra hộp thư (có thể có trong thư mục spam).
            </p>
            <div className="pt-4 space-y-3">
              <Link to="/login">
                <Button className="w-full h-12 bg-[#007BFF] hover:bg-[#0056B3] text-white">
                  Quay lại đăng nhập
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => setIsSubmitted(false)}
                className="w-full h-12 border-[#E5E7EB] hover:bg-gray-50"
              >
                Gửi lại email
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-8 space-y-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-900">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#687280]" />
                          <Input
                            {...field}
                            type="email"
                            placeholder="email@example.com"
                            className="pl-10 h-12 border-[#E5E7EB] bg-white"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-[#007BFF] hover:bg-[#0056B3] text-white text-base font-medium"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang gửi...
                    </span>
                  ) : (
                    "Gửi link đặt lại mật khẩu"
                  )}
                </Button>
              </form>
            </Form>

            <div className="pt-4 border-t border-[#E5E7EB]">
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-sm text-[#007BFF] hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại đăng nhập
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

