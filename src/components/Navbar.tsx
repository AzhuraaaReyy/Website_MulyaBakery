import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu as MenuIcon,
  X,
  Croissant,
  MessageCircle,
  Heart,
  Award,
  MessageSquareQuote,
  ShoppingBag,
  MapPin,
  Image,
  ChevronRight,
} from "lucide-react";
import { BRAND } from "../config/contact";
import { generalOrderUrl } from "../lib/whatsapp";
import { kunciScroll } from "../lib/scrollLock";

const NAV_LINKS = [
  { label: "Tentang", href: "#tentang", icon: Heart },
  { label: "Menu", href: "#menu", icon: Croissant },
  { label: "Cara Pesan", href: "#cara-pesan", icon: ShoppingBag },
  { label: "Keunggulan", href: "#keunggulan", icon: Award },
  { label: "Testimoni", href: "#testimoni", icon: MessageSquareQuote },
  { label: "Gallery", href: "#gallery", icon: Image },
  { label: "Kontak", href: "#kontak", icon: MapPin },
];

const SECTION_IDS = NAV_LINKS.map((l) => l.href.slice(1));

function useActiveSection(): string {
  const [active, setActive] = useState("");
  useEffect(() => {
    const els = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return active;
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    return kunciScroll();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isSolid = scrolled || open;

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Background Layer Transisi Smooth dengan Framer Motion */}
      <motion.div
        initial={false}
        animate={{
          opacity: isSolid ? 1 : 0,
          y: isSolid ? 0 : -4,
        }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 -z-10 border-b border-[#FF69B4]/20 shadow-lg backdrop-blur-md bg-gradient-to-r from-[#FFD6E2]/95 via-[#FFF4F7]/98 to-[#FFD6E2]/95 pointer-events-none"
      />

      <nav className="container-wide relative z-50 flex items-center justify-between py-2 sm:py-3">
        {/* Logo Responsif */}
        <a
          href="#hero"
          className="group flex items-center transition-transform duration-300 active:scale-95 shrink-0"
          aria-label={`${BRAND.name} beranda`}
        >
          <div className="flex items-center justify-center rounded-2xl px-1 sm:px-2 py-1 transition-all duration-500">
            <img
              src="/images/Logo2.png"
              alt={BRAND.name}
              className="h-9 sm:h-11 md:h-13 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </a>

        {/* Desktop links (Presisi di Tengah Layar dengan Kontras Warna yang Aman) */}
        <ul className="hidden items-center gap-6 lg:gap-8 lg:flex absolute left-1/2 -translate-x-1/2">
          {NAV_LINKS.map((link) => {
            const isActive = active === link.href.slice(1);
            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  aria-current={isActive ? "true" : undefined}
                  className={`group relative py-1 font-text text-sm font-bold transition-colors duration-300 ${
                    isActive
                      ? isSolid
                        ? "text-[#FF4585]"
                        : "text-[#412415] font-extrabold drop-shadow-sm"
                      : isSolid
                        ? "text-[#3B1219] hover:text-[#FF4585]"
                        : "text-white hover:text-[#FFE4E9]"
                  }`}
                >
                  {link.label}
                  {/* Underline Indicator Gradasi yang Lebih Smooth */}
                  <motion.span
                    className={`absolute -bottom-0.5 left-0 h-0.5 rounded-full ${
                      isSolid
                        ? "bg-gradient-to-r from-[#FF69B4] to-[#FF4585]"
                        : "bg-gradient-to-r from-[#5C3520] to-[#E2D0B4]"
                    }`}
                    initial={false}
                    animate={{
                      width: isActive ? "100%" : "0%",
                    }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    aria-hidden
                  />
                </a>
              </li>
            );
          })}
        </ul>

        {/* Tombol Pesan Sekarang (Desktop CTA dengan Efek Micro-interaction) */}
        <a
          href={generalOrderUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className={`hidden items-center gap-2 rounded-full px-5 py-2.5 font-text text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 active:scale-95 lg:inline-flex ${
            isSolid
              ? "bg-gradient-to-r from-[#FF69B4] to-[#FF4585] text-white shadow-md hover:shadow-lg hover:brightness-105"
              : "bg-[#412415] text-[#F7F0E1] border border-[#E2D0B4]/40 shadow-sm hover:bg-[#5C3520] hover:shadow-md"
          }`}
        >
          <MessageCircle
            className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12"
            aria-hidden
          />
          Pesan Sekarang
        </a>

        {/* Mobile toggle button */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`rounded-full p-2 transition-all duration-300 lg:hidden active:scale-90 ${
            isSolid
              ? "text-[#3B1219] bg-[#FF69B4]/10 hover:bg-[#FF69B4]/20"
              : "text-white bg-black/10 hover:bg-white/20 sm:text-[#412415]"
          }`}
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
        >
          <motion.div
            animate={{ rotate: open ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {open ? (
              <X className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </motion.div>
        </button>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="overlay"
              aria-hidden="true"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-md lg:hidden"
            />

            <motion.div
              key="drawer"
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-50 overflow-hidden rounded-b-[2rem] border-b border-[#FF69B4]/30 bg-[#FFE4E9] shadow-2xl lg:hidden"
            >
              <motion.ul
                className="container-wide flex max-h-[calc(100dvh-4rem)] flex-col gap-1.5 overflow-y-auto py-5 sm:py-6 overscroll-contain"
                initial="hidden"
                animate="show"
                variants={{
                  show: {
                    transition: { staggerChildren: 0.06, delayChildren: 0.08 },
                  },
                }}
              >
                {NAV_LINKS.map((link) => {
                  const isActive = active === link.href.slice(1);
                  return (
                    <motion.li
                      key={link.href}
                      variants={{
                        hidden: { opacity: 0, x: -16 },
                        show: { opacity: 1, x: 0 },
                      }}
                    >
                      <a
                        href={link.href}
                        onClick={() => setOpen(false)}
                        aria-current={isActive ? "true" : undefined}
                        className={`group flex items-center gap-3.5 rounded-2xl px-4 py-3 font-text text-base font-bold transition-all duration-200 ${
                          isActive
                            ? "bg-white text-[#FF4585] shadow-sm border border-[#FF69B4]/30"
                            : "text-[#3B1219] hover:bg-white/70 active:scale-[0.99]"
                        }`}
                      >
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 ${
                            isActive
                              ? "bg-gradient-to-r from-[#FF69B4] to-[#FF4585] text-white shadow-sm"
                              : "bg-white text-[#FF69B4] border border-[#FF69B4]/20 group-hover:bg-[#FF69B4] group-hover:text-white"
                          }`}
                        >
                          <link.icon
                            className="h-4 w-4"
                            strokeWidth={2}
                            aria-hidden
                          />
                        </span>
                        {link.label}

                        {isActive ? (
                          <span
                            className="ml-auto h-2.5 w-2.5 animate-pulse rounded-full bg-[#FF4585]"
                            aria-hidden
                          />
                        ) : (
                          <ChevronRight
                            className="ml-auto h-4 w-4 text-[#FF69B4]/50 transition-transform duration-300 group-hover:translate-x-1"
                            aria-hidden
                          />
                        )}
                      </a>
                    </motion.li>
                  );
                })}

                <motion.li
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    show: { opacity: 1, y: 0 },
                  }}
                  className="mt-3 pt-2 border-t border-[#FF69B4]/20"
                >
                  <a
                    href={generalOrderUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FF69B4] to-[#FF4585] py-3.5 text-center font-text text-base font-bold text-white shadow-md transition-all duration-300 active:scale-[0.98] hover:brightness-105 hover:shadow-lg"
                  >
                    <MessageCircle className="h-5 w-5" aria-hidden />
                    Pesan Sekarang
                  </a>
                </motion.li>
              </motion.ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
