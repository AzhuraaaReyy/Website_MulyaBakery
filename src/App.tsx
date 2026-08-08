import { useEffect } from "react";
import { initGlobalAnimations } from "./lib/gsap"; // Sesuaikan path jika letaknya berbeda

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Menu from "./components/Menu";
import WhyUs from "./components/WhyUs";
import Testimonials from "./components/Testimonials";
import Gallery from "./components/Gallery";
import HowToOrder from "./components/HowToOrder";
import LocationContact from "./components/LocationContact";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import ScrollStoryBackground from "./components/ScrollStoryBackground";
import { CartProvider } from "./context/CartContext";
import CartButton from "./components/CartButton";
import CartModal from "./components/CartModal";

export default function App() {
  useEffect(() => {
    // 1. Jalankan inisialisasi animasi global saat komponen App dimount
    const cleanup = initGlobalAnimations();

    // 2. Bersihkan animasi saat komponen unmount untuk mencegah memory leak
    return () => {
      cleanup();
    };
  }, []);

  return (
    <CartProvider>
      {/* Latar animasi scroll-driven di belakang semua section */}
      <ScrollStoryBackground />

      <Navbar />
      <main className="relative">
        <Hero />
        <About />
        <Menu />
        <HowToOrder />
        <WhyUs />
        <Testimonials />
        <Gallery />
        <LocationContact />
        <FAQ />
      </main>
      <Footer />

      {/* Keranjang belanja → checkout via WhatsApp */}
      <CartButton />
      <CartModal />
    </CartProvider>
  );
}
