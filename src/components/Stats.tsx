import { Users, Calendar, Award, Heart } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "20+",
    label: "Bác sĩ chuyên khoa",
    description: "Đội ngũ bác sĩ giàu kinh nghiệm",
  },
  {
    icon: Heart,
    value: "1000+",
    label: "Bệnh nhân hài lòng",
    description: "Đánh giá 5 sao từ bệnh nhân",
  },
  {
    icon: Award,
    value: "10+",
    label: "Chuyên khoa đa dạng",
    description: "Đáp ứng mọi nhu cầu khám chữa bệnh",
  },
  {
    icon: Calendar,
    value: "500+",
    label: "Lịch khám/tháng",
    description: "Phục vụ hàng trăm bệnh nhân",
  },
];

const Stats = () => {
  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/10 mb-4">
                  <Icon className="h-8 w-8" />
                </div>
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-xl font-semibold mb-1">{stat.label}</div>
                <div className="text-sm opacity-90">{stat.description}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Stats;
