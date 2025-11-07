import Header from "@/components/Header";
import Hero from "@/components/Hero";
import QuickBooking from "@/components/QuickBooking";
import FeaturedDoctors from "@/components/FeaturedDoctors";
import Services from "@/components/Services";
import Testimonials from "@/components/Testimonials";
import Stats from "@/components/Stats";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <QuickBooking />
        <FeaturedDoctors />
        <Services />
        <Testimonials />
        <Stats />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
