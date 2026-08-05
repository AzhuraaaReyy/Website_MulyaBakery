import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  MessageCircle,
  ArrowRight,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { BRAND } from "../config/contact";
import { generalOrderUrl } from "../lib/whatsapp";
import { useScrolly } from "../hooks/useScrolly";

interface HeroSlide {
  id: string;
  eyebrow: string;
  titleTop: string;
  titleBottom: string;
  subtitle: string;
  bgImage: string;
}

const SLIDES: HeroSlide[] = [
  {
    id: "s1",
    eyebrow: `Bakery keluarga · sejak ${BRAND.established}`,
    titleTop: "Roti Rumahan,",
    titleBottom: "Rasa Penuh Kenangan",
    subtitle: `Dibuat dengan penuh perhatian oleh keluarga ${BRAND.name}, menghadirkan roti lembut dengan cita rasa rumahan yang cocok menemani setiap momen bersama keluarga.`,
    bgImage: "/images/herosection1.png",
  },
  {
    id: "s2",
    eyebrow: "Dibuat dari dapur keluarga kami",
    titleTop: "Dari Keluarga",
    titleBottom: "Untuk Keluarga",
    subtitle:
      "Setiap roti dibuat dengan proses yang penuh ketelitian menggunakan resep dan pengalaman keluarga untuk menghadirkan rasa yang selalu dirindukan.",
    bgImage: "/images/herosection3.png",
  },
  {
    id: "s3",
    eyebrow: "Teman di setiap momen",
    titleTop: "Roti Lezat",
    titleBottom: "Untuk Cerita Bersama",
    subtitle:
      "Mulya Bakery menghadirkan pilihan roti yang cocok dinikmati kapan saja, mulai dari teman sarapan, bekal keluarga, hingga hidangan untuk momen spesial.",
    bgImage: "/images/herosection2.png",
  },
];

const HERO_INTERVAL_MS = 7000;

function TypewriterText({
  text,
  speed = 28,
  delay = 0,
  className = "",
}: {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
}) {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setCount(0);
    setDone(false);

    let timeoutId: ReturnType<typeof setTimeout>;
    let intervalId: ReturnType<typeof setInterval>;

    timeoutId = setTimeout(() => {
      let i = 0;
      intervalId = setInterval(() => {
        i++;
        setCount(i);
        if (i >= text.length) {
          clearInterval(intervalId);
          setDone(true);
        }
      }, speed);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [text, speed, delay]);

  return (
    <span className={`inline ${className}`}>
      {/* Teks yang sedang diketik */}
      <span>{text.slice(0, count)}</span>

      {/* Kursor Typewriter */}
      <span
        aria-hidden
        className={`ml-0.5 inline-block h-[0.85em] w-[2px] translate-y-[0.05em] bg-amber-300/80 align-middle transition-opacity duration-300 ${
          done ? "opacity-0" : "animate-pulse opacity-90"
        }`}
      />

      {/* Ghost text (invisible) untuk mengunci tinggi/ruang agar tidak melompat/naik-turun */}
      <span className="invisible select-none" aria-hidden="true">
        {text.slice(count)}
      </span>
    </span>
  );
}

export default function Hero() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  useScrolly(sectionRef);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = SLIDES.length;
  const slide = SLIDES[index];

  const go = (dir: number) => setIndex((i) => (i + dir + n) % n);

  /* ── Auto slide ── */
  const sisaWaktu = useRef(HERO_INTERVAL_MS);
  const waktuMulai = useRef(0);
  const indexTerakhir = useRef(index);

  useEffect(() => {
    if (indexTerakhir.current !== index) {
      indexTerakhir.current = index;
      sisaWaktu.current = HERO_INTERVAL_MS;
    }

    if (reduce || paused || n <= 1) return;

    waktuMulai.current = Date.now();
    const t = window.setTimeout(() => {
      sisaWaktu.current = HERO_INTERVAL_MS;
      setIndex((i) => (i + 1) % n);
    }, sisaWaktu.current);

    return () => {
      window.clearTimeout(t);
      const terpakai = Date.now() - waktuMulai.current;
      sisaWaktu.current = Math.max(400, sisaWaktu.current - terpakai);
    };
  }, [index, paused, reduce, n]);

  // Touch Swipe
  const touchX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    touchX.current = null;
  };

  return (
    <section
      ref={sectionRef}
      id="hero"
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setPaused(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") setPaused(false);
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="font-body relative flex min-h-[100dvh] w-full items-center justify-start overflow-hidden"
    >
      {/* ── Background Image ── */}
      <AnimatePresence mode="sync">
        <motion.div
          key={slide.id + "-bg"}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 h-full w-full"
        >
          <img
            src={slide.bgImage}
            alt=""
            aria-hidden
            className="h-full w-full object-cover object-center"
          />
        </motion.div>
      </AnimatePresence>

      {/* ── Overlays ── */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#140b04]/100 via-[#140b04]/50 via-40% to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#140b04]/60 via-transparent to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-l from-white/10 via-transparent to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#140b04]/85 via-[#140b04]/45 to-[#140b04]/10 sm:hidden"
        aria-hidden
      />
      <div
        className="paper-grain pointer-events-none absolute inset-0 opacity-[0.1] mix-blend-overlay"
        aria-hidden
      />

      {/* ── Konten Utama ── */}
      <div className="relative z-10 w-full px-6 pt-28 pb-16 sm:px-12 sm:pt-32 sm:pb-20 lg:px-20 lg:py-0">
        <div className="flex max-w-2xl flex-col items-start gap-5 sm:gap-7 text-left">
          {/* 1. Eyebrow */}
          <div className="grid">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id + "-eyebrow"}
                className="[grid-area:1/1] inline-flex items-center gap-2 rounded-full border border-amber-200/25 bg-black/30 px-3 py-0.5 sm:px-3.5 sm:py-1 backdrop-blur-sm"
                initial={{ opacity: 0, y: reduce ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduce ? 0 : -6 }}
                transition={{ duration: 0.35 }}
              >
                <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-amber-300" />
                <span className="font-body text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.15em] text-amber-100/90">
                  {slide.eyebrow}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 2. Judul Utama */}
          <div className="grid w-full min-h-[5.5rem] sm:min-h-[8.5rem]">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id + "-title"}
                className="[grid-area:1/1]"
                initial={{ opacity: 0, y: reduce ? 0 : 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduce ? 0 : -10 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.45)] sm:text-6xl lg:text-6xl">
                  <span className="block">
                    {reduce ? (
                      slide.titleTop
                    ) : (
                      <TypewriterText text={slide.titleTop} speed={26} />
                    )}
                  </span>
                  <span className="relative mt-1 block text-amber-200">
                    {reduce ? (
                      slide.titleBottom
                    ) : (
                      <TypewriterText
                        text={slide.titleBottom}
                        speed={26}
                        delay={slide.titleTop.length * 26 + 120}
                      />
                    )}
                    <svg
                      viewBox="0 0 300 14"
                      preserveAspectRatio="none"
                      className="mt-2 block h-2.5 w-[min(85%,15rem)] text-amber-300/70 sm:h-3 lg:w-[17rem]"
                      aria-hidden
                    >
                      <path
                        d="M3 9c48-5 96-7 145-6 44 1 88 3 149 8"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </h1>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 3. Subtitle (Diatur text-justify agar Rata Kanan-Kiri) */}
          <div className="grid min-h-[4.5rem] sm:min-h-[4rem] w-full max-w-lg">
            <AnimatePresence mode="wait">
              <motion.p
                key={slide.id + "-sub"}
                className="font-body [grid-area:1/1] text-justify text-sm font-normal leading-relaxed text-stone-100/90 [text-shadow:0_1px_12px_rgba(0,0,0,0.5)] sm:text-base lg:text-lg"
                initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduce ? 0 : -8 }}
                transition={{ duration: 0.4, delay: 0.08 }}
              >
                {slide.subtitle}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* 4. Rating */}
          <div className="grid">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id + "-rating"}
                className="[grid-area:1/1] flex items-center gap-3"
                initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduce ? 0 : -6 }}
                transition={{ duration: 0.4, delay: 0.14 }}
              >
                <div className="flex" aria-hidden>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-amber-300 text-amber-300"
                      strokeWidth={1.5}
                    />
                  ))}
                </div>
                <p className="font-body text-xs sm:text-sm text-stone-100/85 [text-shadow:0_1px_10px_rgba(0,0,0,0.5)]">
                  <span className="font-semibold text-white">4.9/5</span> dari
                  200+ pelanggan senang
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 5. Tombol CTA */}
          <div className="grid w-full sm:w-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id + "-cta"}
                className="[grid-area:1/1] mt-1 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center"
                initial={{ opacity: 0, y: reduce ? 0 : 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduce ? 0 : -8 }}
                transition={{ duration: 0.45, delay: 0.2 }}
              >
                <motion.a
                  whileHover={{ scale: reduce ? 1 : 1.02 }}
                  whileTap={{ scale: reduce ? 1 : 0.98 }}
                  href={generalOrderUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-cocoa font-body w-full justify-center sm:w-auto"
                >
                  <MessageCircle className="h-5 w-5" aria-hidden />
                  Pesan Sekarang
                </motion.a>
                <motion.a
                  whileHover={{ scale: reduce ? 1 : 1.02 }}
                  whileTap={{ scale: reduce ? 1 : 0.98 }}
                  href="#menu"
                  className="font-body group inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/5 sm:w-auto"
                >
                  Lihat Menu
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    aria-hidden
                  />
                </motion.a>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Indikator Slide */}
          {n > 1 && (
            <div
              className="mt-4 sm:mt-6 flex items-center gap-2.5"
              role="tablist"
              aria-label="Pilih slide"
            >
              {SLIDES.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Slide ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className="group relative h-[3px] w-9 overflow-hidden rounded-full bg-white/20"
                >
                  {i === index && !reduce && (
                    <motion.span
                      key={`${slide.id}-progress`}
                      className="absolute inset-y-0 left-0 rounded-full bg-amber-300"
                      initial={{ width: "0%" }}
                      animate={{ width: paused ? undefined : "100%" }}
                      transition={{
                        duration: HERO_INTERVAL_MS / 1000,
                        ease: "linear",
                      }}
                    />
                  )}
                  {i === index && reduce && (
                    <span className="absolute inset-y-0 left-0 w-full rounded-full bg-amber-300" />
                  )}
                  {i !== index && (
                    <span className="absolute inset-0 rounded-full bg-white/20 transition-colors group-hover:bg-white/35" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Navigasi Panah ── */}
      {n > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Slide sebelumnya"
            className="group absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/20 text-white/80 backdrop-blur-md transition-all duration-300 hover:border-white/30 hover:bg-black/40 hover:text-white sm:left-6 sm:h-11 sm:w-11"
          >
            <ChevronLeft
              className="h-5 w-5 transition-transform group-hover:-translate-x-0.5"
              aria-hidden
            />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Slide berikutnya"
            className="group absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/20 text-white/80 backdrop-blur-md transition-all duration-300 hover:border-white/30 hover:bg-black/40 hover:text-white sm:right-6 sm:h-11 sm:w-11"
          >
            <ChevronRight
              className="h-5 w-5 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </button>
        </>
      )}
    </section>
  );
}
