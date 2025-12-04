import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import QuickBooking from "@/components/QuickBooking";
import FeaturedDoctors from "@/components/FeaturedDoctors";
import Services from "@/components/Services";
import Testimonials from "@/components/Testimonials";
import Stats from "@/components/Stats";
import Footer from "@/components/Footer";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    // Handle scroll to section when navigating from other pages
    const scrollTo = (location.state as any)?.scrollTo;
    if (scrollTo) {
      // Wait for page to render
      setTimeout(() => {
        const element = document.querySelector(`#${scrollTo}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, [location]);

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
