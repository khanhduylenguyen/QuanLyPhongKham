import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Nguyễn Văn A",
    role: "Bệnh nhân",
    content: "Tôi đặt lịch rất nhanh chóng, bác sĩ tư vấn tận tình và chuyên nghiệp. Hệ thống nhắc lịch rất tiện lợi!",
    rating: 5,
  },
  {
    name: "Trần Thị B",
    role: "Bệnh nhân",
    content: "Phòng khám hiện đại, sạch sẽ. Quy trình khám bệnh nhanh gọn, không phải chờ đợi lâu.",
    rating: 5,
  },
  {
    name: "Lê Văn C",
    role: "Bệnh nhân",
    content: "Dịch vụ tuyệt vời! Bác sĩ nhiệt tình, giải thích rõ ràng về tình trạng sức khỏe của tôi.",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Đánh giá từ bệnh nhân
          </h2>
          <p className="text-muted-foreground text-lg">
            Hơn 1000+ bệnh nhân đã tin tưởng và hài lòng với dịch vụ của chúng tôi
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-6">
                <Quote className="h-10 w-10 text-primary/20 mb-4" />
                
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                <p className="text-muted-foreground mb-6 italic">
                  "{testimonial.content}"
                </p>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-sm font-bold text-primary-foreground">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
