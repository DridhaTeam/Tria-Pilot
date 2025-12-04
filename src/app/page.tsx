import Hero from "@/components/Hero";
import NewsGrid from "@/components/NewsGrid";
import ProductSwitcher from "@/components/ProductSwitcher";
import ValuesScroll from "@/components/ValuesScroll";
import Locations from "@/components/Locations";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-cream selection:bg-peach/30">
      <Hero />
      <NewsGrid />
      <ProductSwitcher />
      <ValuesScroll />
      <Locations />
      <Footer />
    </main>
  );
}
