import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Sparkles,
  ArrowUpRight,
  ShoppingBag,
  MessageCircle,
} from "lucide-react";
import PlaceholderImage from "./PlaceholderImage";
import { useScrolly } from "../hooks/useScrolly";

// Item galeri (foto produk & proses)
const items = [
  {
    id: "g1",
    label: "Adonan Segar",
    subtitle: "Dibuat Segar Setiap Pagi",
    image: "/images/herosection1.png",
    tape: true,
    desc: "Proses pengadonan dengan bahan-bahan pilihan terbaik yang disiapkan segar setiap pagi untuk menjamin kelembutan tekstur.",
  },
  {
    id: "g2",
    label: "Roti Panggang",
    subtitle: "Aroma Keemasan Sempurna",
    image: "/images/herosection2.png",
    tape: false,
    desc: "Hasil pemanggangan sempurna dengan warna keemasan dan kulit luar renyah yang menggugah selera.",
  },
  {
    id: "g3",
    label: "Isian Coklat",
    subtitle: "Lumeran Premium Melimpah",
    image: "/images/herosection3.png",
    tape: true,
    desc: "Lumeran coklat premium yang melimpah dan memberikan kelezatan mendalam di setiap gigitan.",
  },
  {
    id: "g4",
    label: "Croissant",
    subtitle: "Tekstur Berlapis Renyah",
    image: "/images/about_us.jpg",
    tape: false,
    desc: "Tekstur berlapis khas Perancis yang renyah di luar dan sangat lembut gurih di bagian dalam.",
  },
  {
    id: "g5",
    label: "Oven Hangat",
    subtitle: "Suhu & Pemanggangan Presisi",
    image: "/images/about_us2.jpg",
    tape: false,
    desc: "Aroma khas roti panggang hangat menyelimuti seluruh area dapur kami sepanjang hari.",
  },
  {
    id: "g6",
    label: "Siap Diantar",
    subtitle: "Kemasan Rapi & Higienis",
    image: "/images/about_us3.jpg",
    tape: true,
    desc: "Kemasan rapi dan higienis yang siap membawa kehangatan roti langsung ke tangan Anda.",
  },
];

export default function Gallery() {
  const sectionRef = useRef<HTMLElement>(null);
  useScrolly(sectionRef);

  const [activeIndex, setActiveIndex] = useState(0);

  const total = items.length;

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Navigasi Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") prevSlide();
      if (e.key === "ArrowRight" || e.key === "ArrowDown") nextSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  const currentItem = items[activeIndex];

  // Kalkulasi offset busur melengkung (Desktop)
  const getDiff = (index: number) => {
    let diff = index - activeIndex;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  };

  return (
    <section
      id="gallery"
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-cocoa-800 text-paper-50 flex flex-col pt-8 sm:pt-16 lg:pt-20 pb-8 sm:pb-16 lg:pb-20 select-none min-h-max"
    >
      {/* BACKGROUND DINAMIS MOBILE (< 1024px) */}
      <div className="absolute inset-x-0 top-0 h-[65%] lg:hidden z-0 overflow-hidden pointer-events-none isolate">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 h-full w-full"
          >
            <PlaceholderImage
              alt={currentItem.label}
              src={currentItem.image}
              label={currentItem.label}
              seed={currentItem.id}
              rounded="rounded-none"
              className="h-full w-full object-cover object-center"
            />
          </motion.div>
        </AnimatePresence>

        {/* Overlay Black Tint untuk Keterbacaan Teks Header */}
        <div className="absolute inset-0 bg-black/30 z-[1]" />

        {/* Gradien Fade ke Warna cocoa-800 dengan Efek Blur di Bagian Bawah Gambar */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent via-cocoa-800/60 to-cocoa-800 backdrop-blur-md z-[2]" />
      </div>

      {/* BACKGROUND DINAMIS DESKTOP (>= 1024px): Fullscreen Background */}
      <div className="hidden lg:block absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 h-full w-full"
          >
            <PlaceholderImage
              alt={currentItem.label}
              src={currentItem.image}
              label={currentItem.label}
              seed={currentItem.id}
              rounded="rounded-none"
              className="h-full w-full object-cover object-center"
            />
          </motion.div>
        </AnimatePresence>

        {/* 1. Base Overlay: Gelap merata di seluruh permukaan gambar */}
        <div className="absolute inset-0 bg-black/50 z-[1]" />

        {/* 2. Gradien Vertikal: Membuat sisi ATAS dan BAWAH gelap pekat */}
        <div className="absolute inset-0 bg-gradient-to-b from-cocoa-950/90 via-black/40 to-cocoa-950/95 z-[2]" />

        {/* 3. Gradien Horizontal: Menggelapkan sisi KIRI (teks) dan KANAN (slider) */}
        <div className="absolute inset-0 bg-gradient-to-r from-cocoa-950/80 via-transparent to-cocoa-950/80 z-[3]" />
      </div>

      {/* ========================================== */}
      {/* 1. TAMPILAN MOBILE (HP / SCREEN < 1024px)  */}
      {/* ========================================== */}
      <div className="block lg:hidden w-[92%] sm:w-[95%] max-w-[440px] mx-auto relative z-20 flex flex-col gap-4 pt-2 pb-6 my-auto">
        {/* Header Mobile Section */}
        <div className="flex flex-col items-center text-center pt-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#eb7b88]/20 px-3.5 py-1 text-[11px] font-bold text-[#f2a8b0] uppercase tracking-wider border border-[#f2a8b0]/30 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Kisah Suasana & Rasa</span>
          </div>
          <h2 className="mt-2 font-heading text-3xl font-extrabold text-white drop-shadow-md tracking-wide">
            Galeri Mulya <br />
            <span className="text-[#f2a8b0]">Bakery</span>
          </h2>
          <p className="mt-1.5 font-text text-xs text-paper-200/90 leading-relaxed max-w-xs drop-shadow">
            Intip kehangatan momen & proses pembuatan produk terbaik di dapur
            kami.
          </p>
        </div>

        {/* Main Glassmorphic Card */}
        <div className="bg-[#211210]/85 backdrop-blur-xl rounded-[2rem] border border-white/15 p-5 shadow-2xl flex flex-col gap-4 mt-28 sm:mt-36 relative z-30">
          {/* Subtitle Badge & Item Counter */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eb7b88]/20 px-3 py-1 text-[10px] font-semibold text-[#f2a8b0] border border-[#f2a8b0]/30 backdrop-blur-md">
              <BookOpen className="h-3 w-3" />
              <span>{currentItem.subtitle}</span>
            </span>
            <span className="font-mono text-xs font-bold text-white/90">
              {String(activeIndex + 1).padStart(2, "0")} /{" "}
              {String(total).padStart(2, "0")}
            </span>
          </div>

          {/* Active Item Details & Glowing Thumbnail */}
          <div className="flex items-start justify-between gap-3 min-h-[90px]">
            <div className="flex-1 space-y-1">
              <h3 className="font-heading text-2xl text-white leading-tight">
                {currentItem.label}
              </h3>
              <p className="font-text text-xs text-paper-200/80 leading-relaxed line-clamp-3">
                {currentItem.desc}
              </p>
            </div>

            {/* Thumbnail Melingkar */}
            <div className="relative shrink-0 mt-1">
              <div className="h-16 w-16 rounded-full border-2 border-[#eb7b88] p-0.5 ring-4 ring-[#eb7b88]/30 shadow-lg overflow-hidden">
                <PlaceholderImage
                  alt={currentItem.label}
                  src={currentItem.image}
                  label={currentItem.label}
                  seed={currentItem.id}
                  rounded="rounded-full"
                  className="h-full w-full object-cover rounded-full"
                />
              </div>
              <div className="absolute -top-1 -right-1 bg-[#eb7b88] text-white p-1 rounded-full shadow-md">
                <ArrowUpRight className="h-3 w-3" />
              </div>
            </div>
          </div>

          {/* List Item yang BISA DI-SCROLL */}
          <div className="relative flex gap-2 pt-3 border-t border-white/10 items-center">
            <div className="flex-1 max-h-[112px] overflow-y-auto pr-2 space-y-1 divide-y divide-white/10 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {items.map((item, index) => {
                const isSelected = index === activeIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveIndex(index)}
                    className={`flex items-center justify-between py-2 cursor-pointer transition-all ${
                      isSelected ? "opacity-100" : "opacity-60 hover:opacity-90"
                    }`}
                  >
                    <div className="pr-2">
                      <h4
                        className={`text-xs font-heading ${isSelected ? "text-white " : "text-paper-100"}`}
                      >
                        {item.label}
                      </h4>
                      <p className="text-[10px] font-text text-paper-300/80 line-clamp-1">
                        {item.subtitle}
                      </p>
                    </div>
                    <div className="h-9 w-9 rounded-full overflow-hidden shrink-0 border border-white/20">
                      <PlaceholderImage
                        alt={item.label}
                        src={item.image}
                        label={item.label}
                        seed={item.id}
                        rounded="rounded-full"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Vertical Scroll Indicator Dots */}
            <div className="flex flex-col items-center justify-center gap-1.5 shrink-0 pl-1">
              {items.map((_, i) => (
                <div
                  key={i}
                  className={`transition-all duration-300 rounded-full ${
                    i === activeIndex
                      ? "h-5 w-1.5 bg-[#eb7b88]"
                      : "h-1.5 w-1.5 bg-white/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Floating Banner Footer Mobile (Pesan via WA) */}
        <div className="bg-[#fcf8f5] rounded-[2rem] p-3.5 text-cocoa-950 flex items-center justify-between gap-3 shadow-2xl border border-white/30 mt-1 relative z-30">
          <div className="h-10 w-10 rounded-full bg-[#fce8ea] text-[#eb7b88] flex items-center justify-center shrink-0">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-heading text-xs font-bold text-cocoa-950">
              Pesan Roti Favoritmu Sekarang!
            </h4>
            <p className="font-text text-[10px] text-cocoa-800/80 leading-tight">
              Kirim pesan via WhatsApp dan nikmati roti hangat dari Mulya
              Bakery.
            </p>
          </div>
          <a
            href="https://wa.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 w-10 rounded-full bg-[#eb7b88] text-white flex items-center justify-center shrink-0 shadow-md active:scale-95 transition-transform"
            aria-label="Pesan via WhatsApp"
          >
            <MessageCircle className="h-5 w-5 fill-current" />
          </a>
        </div>
      </div>

      {/* ========================================== */}
      {/* 2. TAMPILAN DESKTOP (SCREEN >= 1024px)     */}
      {/* ========================================== */}
      <div className="hidden lg:block container mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full max-w-7xl">
        {/* Header Utama Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center text-center max-w-2xl mx-auto mb-6 sm:mb-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full bg-caramel/20 px-4 py-1.5 text-xs font-bold text-caramel uppercase tracking-wider border border-caramel/30 backdrop-blur-md shadow-md"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            <span>Kisah Suasana & Rasa</span>
          </motion.div>

          <h2 className="mt-3 font-heading text-2xl font-extrabold tracking-tight text-paper-50 sm:text-4xl lg:text-5xl drop-shadow-md">
            Galeri Mulya Bakery
          </h2>

          <p className="mt-2 font-text text-xs sm:text-base text-paper-200/90 leading-relaxed max-w-lg drop-shadow">
            Intip kehangatan momen & proses pembuatan produk terbaik di dapur
            kami.
          </p>
        </motion.div>

        {/* Grid Konten Showcase & Orbit Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-12 items-center">
          {/* Sisi Kiri: Information Showcase */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="lg:col-span-6 flex flex-col justify-start items-center lg:items-start text-center lg:text-left space-y-3 px-2"
          >
            <div className="flex items-center justify-center lg:justify-start gap-2.5 h-7">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-caramel/25 px-3 py-0.5 text-[11px] sm:text-xs font-bold text-caramel border border-caramel/40 backdrop-blur-md shadow-sm">
                <BookOpen className="h-3.5 w-3.5" aria-hidden />
                <span>{currentItem.subtitle}</span>
              </span>
              <span className="font-mono text-[11px] sm:text-xs font-bold text-paper-200/90 bg-cocoa-900/80 px-2.5 py-0.5 rounded-full border border-white/10 backdrop-blur-md">
                {String(activeIndex + 1).padStart(2, "0")} /{" "}
                {String(total).padStart(2, "0")}
              </span>
            </div>

            <div className="w-full max-w-xl mx-auto lg:mx-0 min-h-[110px] sm:min-h-[130px] lg:min-h-[160px] flex flex-col justify-start">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentItem.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="space-y-2"
                >
                  <h3 className="font-heading text-xl sm:text-3xl lg:text-5xl font-extrabold text-paper-50 leading-tight drop-shadow-xl min-h-[1.2em] flex items-center justify-center lg:justify-start">
                    {currentItem.label}
                  </h3>
                  <p className="font-text text-xs sm:text-sm lg:text-base text-paper-200/90 leading-relaxed drop-shadow-md max-w-lg mx-auto lg:mx-0">
                    {currentItem.desc}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Sisi Kanan: Orbital Slider Desktop */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="lg:col-span-6 relative flex flex-col items-center lg:items-end justify-center min-h-[130px] sm:min-h-[160px] lg:min-h-[380px]"
          >
            <motion.div
              onPanEnd={(_, info) => {
                const threshold = 20;
                if (info.offset.y < -threshold) nextSlide();
                else if (info.offset.y > threshold) prevSlide();
              }}
              className="relative w-full h-[120px] sm:h-[150px] lg:h-[350px] flex items-center justify-center lg:justify-end cursor-grab active:cursor-grabbing touch-pan-y"
            >
              {items.map((item, index) => {
                const diff = getDiff(index);
                const isActive = index === activeIndex;

                const translateYDesktop = diff * 70;
                const translateXDesktop = -Math.pow(Math.abs(diff), 1.6) * 30;

                return (
                  <motion.div
                    key={item.id}
                    onClick={() => setActiveIndex(index)}
                    animate={{
                      x: translateXDesktop,
                      y: translateYDesktop,
                      opacity:
                        Math.abs(diff) > 2 ? 0 : 1 - Math.abs(diff) * 0.22,
                      scale: isActive ? 1.12 : 0.88,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 280,
                      damping: 24,
                    }}
                    whileHover={{ scale: isActive ? 1.18 : 0.98 }}
                    whileTap={{ scale: 0.92 }}
                    style={{
                      zIndex: 30 - Math.abs(diff),
                      pointerEvents: Math.abs(diff) > 2 ? "none" : "auto",
                    }}
                    className="absolute cursor-pointer flex items-center gap-3 group lg:right-16 select-none"
                  >
                    <div
                      className={`hidden lg:flex flex-col items-end text-right transition-opacity duration-300 pointer-events-none ${
                        isActive
                          ? "opacity-100"
                          : "opacity-60 group-hover:opacity-100"
                      }`}
                    >
                      <span
                        className={`font-heading font-extrabold drop-shadow-md ${
                          isActive
                            ? "text-base text-paper-50"
                            : "text-xs text-paper-200/80"
                        }`}
                      >
                        {item.label}
                      </span>
                      <span className="font-text text-[10px] text-paper-300/70 drop-shadow">
                        {item.subtitle}
                      </span>
                    </div>

                    <div className="relative flex items-center justify-center shrink-0">
                      {isActive && (
                        <motion.div
                          layoutId="activeGlow"
                          className="absolute -inset-2 rounded-full bg-caramel/30 blur-sm"
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 25,
                          }}
                        />
                      )}

                      <div
                        className={`relative transition-all duration-300 rounded-full flex items-center justify-center overflow-hidden ${
                          isActive
                            ? "h-14 w-14 sm:h-18 sm:w-18 lg:h-22 lg:w-22 border-3 lg:border-4 border-caramel shadow-2xl ring-4 ring-caramel/40"
                            : "h-9 w-9 sm:h-11 sm:w-11 border-2 border-white/40 opacity-70 group-hover:opacity-100 shadow-md"
                        }`}
                      >
                        <PlaceholderImage
                          alt={item.label}
                          src={item.image}
                          label={item.label}
                          seed={item.id}
                          rounded="rounded-full"
                          className="h-full w-full object-cover rounded-full"
                        />

                        {!isActive && (
                          <div className="absolute inset-0 rounded-full bg-cocoa-950/30 group-hover:bg-transparent transition-colors" />
                        )}
                      </div>

                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 bg-caramel text-cocoa-950 rounded-full p-1 shadow-lg"
                        >
                          <Sparkles className="h-3 w-3" />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Indikator Titik Vertikal Desktop */}
            <div className="hidden lg:flex flex-col gap-2 absolute -right-2 top-1/2 -translate-y-1/2 z-30">
              {items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  aria-label={`Pilih item ${i + 1}`}
                  className={`rounded-full transition-all duration-300 ${
                    i === activeIndex
                      ? "h-7 w-2 bg-caramel shadow-lg"
                      : "h-2 w-2 bg-white/30 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
