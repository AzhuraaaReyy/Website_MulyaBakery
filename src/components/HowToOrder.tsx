import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ClipboardList,
  MessageCircle,
  CreditCard,
  PackageCheck,
  PlayCircle,
  Play,
  Film,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
} from "lucide-react";
import { generalOrderUrl } from "../lib/whatsapp";
import { useScrolly } from "../hooks/useScrolly";
import { gsap } from "../lib/gsap";
import { parseVideoTutorial } from "../lib/video";
import { kunciScroll } from "../lib/scrollLock";
import { useFeatureFlags } from "../context/FeatureFlagsContext";
import LockedCta from "./LockedCta";

const steps = [
  {
    icon: ClipboardList,
    title: "Pilih Roti Favorit",
    desc: "Jelajahi berbagai pilihan roti dan kue buatan Mulya Bakery, lalu pilih produk yang sesuai dengan selera Anda.",
    video: "",
  },
  {
    icon: MessageCircle,
    title: "Pesan Lewat WhatsApp",
    desc: "Tekan tombol WhatsApp untuk mengirim pesanan. Pesan akan terisi otomatis sehingga proses pemesanan menjadi lebih mudah dan cepat.",
    video: "",
  },
  {
    icon: CreditCard,
    title: "Konfirmasi Pesanan",
    desc: "Tim kami akan mengonfirmasi pesanan, jumlah, dan total pembayaran. Pembayaran dapat dilakukan melalui transfer bank, e-wallet, atau metode lain yang tersedia.",
    video: "",
  },
  {
    icon: PackageCheck,
    title: "Nikmati Roti Hangat",
    desc: "Pesanan dapat diambil langsung di Mulya Bakery atau diantar ke lokasi Anda. Nikmati roti yang lembut, segar, dan dibuat dengan penuh cinta.",
    video: "",
  },
];

/** Lingkaran ikon putih + ikon pink + nomor langkah */
function NodeLangkah({
  Icon,
  n,
}: {
  Icon: (typeof steps)[number]["icon"];
  n: number;
}) {
  return (
    <span className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white text-pink-500 shadow-md ring-4 ring-pink-100 transition-transform duration-300 group-hover:scale-105">
      <Icon className="h-7 w-7" strokeWidth={1.8} aria-hidden />
      <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-pink-500 font-heading text-sm text-white ring-2 ring-white">
        {n}
      </span>
    </span>
  );
}

/** Ajakan kecil "tonton caranya" di dalam kartu langkah */
function HintTonton() {
  return (
    <span className="mt-3 inline-flex items-center gap-1.5 font-text text-xs font-semibold tracking-wide text-pink-500">
      <PlayCircle className="h-4 w-4" aria-hidden /> Tonton Demonya
    </span>
  );
}

export default function HowToOrder() {
  const sectionRef = useRef<HTMLElement>(null);
  const [aktif, setAktif] = useState<number | null>(null);
  const { isOn } = useFeatureFlags();

  useScrolly(sectionRef, () => {
    if (!window.matchMedia("(min-width: 1024px)").matches) return;
    gsap.set("[data-timeline]", { scaleX: 0, transformOrigin: "left center" });
    gsap.to("[data-timeline]", {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        trigger: "[data-timeline-track]",
        start: "top 75%",
        end: "bottom 75%",
        scrub: true,
      },
    });
  });

  useEffect(() => {
    if (aktif === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAktif(null);
    };
    window.addEventListener("keydown", onKey);
    const lepas = kunciScroll();
    return () => {
      window.removeEventListener("keydown", onKey);
      lepas();
    };
  }, [aktif]);

  return (
    <section
      id="cara-pesan"
      ref={sectionRef}
      className="section-3-container relative w-full overflow-hidden bg-paper-100 py-12 sm:py-16 lg:py-20"
    >
      {/* Dynamic Font Styling 'Itim' */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Itim&display=swap');
        .section-3-container p,
        .font-section3-p {
          font-family: 'Itim', cursive, sans-serif !important;
        }
      `}</style>

      <div
        className="paper-grain pointer-events-none absolute inset-0 opacity-50"
        aria-hidden
      />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        {/* Header Section */}
        <div className="mx-auto max-w-2xl text-center">
          {/* Badge Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full bg-caramel/20 px-3.5 py-1 text-xs font-semibold text-cocoa-800 sm:text-sm">
            <span className="h-2 w-2 rounded-full bg-caramel"></span>
            <span className="eyebrow-script !m-0">Cara Pemesanan</span>
          </div>

          <h2
            data-reveal
            className="title-1 mt-2 text-2xl  tracking-tight text-cocoa-900 sm:text-3xl lg:text-4xl"
          >
            Pesan Roti Favoritmu <br/> 
            dengan Mudah
          </h2>

          <p
            data-reveal
            className="font-section3-p mt-3 text-center text-base leading-relaxed text-cocoa-700/85 sm:text-lg lg:text-xl"
          >
            Hanya beberapa langkah sederhana, roti segar dari Mulya Bakery siap
            menemani hari spesialmu.
          </p>
        </div>

        {/* ── Timeline HORIZONTAL (desktop) ──────────────────────────────── */}
        <div
          data-timeline-track
          className="relative mt-12 sm:mt-16 hidden lg:block"
        >
          {/* Garis timeline Pink */}
          <div
            data-timeline
            className="absolute left-[12.5%] right-[12.5%] top-8 h-[3px] rounded-full bg-pink-400"
            aria-hidden
          />
          <ol data-stagger className="grid grid-cols-4 gap-6 xl:gap-8">
            {steps.map((step, i) => (
              <li key={step.title} className="flex h-full">
                <button
                  type="button"
                  onClick={() => setAktif(i)}
                  aria-label={`Tonton demo: ${step.title}`}
                  className="group relative flex w-full flex-col items-center text-center focus-visible:outline-none"
                >
                  <NodeLangkah Icon={step.icon} n={i + 1} />
                  <div className="relative mt-6 flex flex-1 w-full flex-col justify-between overflow-hidden rounded-2xl bg-white/95 p-6 shadow-sm shadow-pink-300/20 ring-1 ring-pink-200/60 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-md group-hover:shadow-pink-300/30 group-focus-visible:ring-2 group-focus-visible:ring-pink-400">
                    {/* Bar Aksen Pink */}
                    <span
                      aria-hidden
                      className="absolute inset-x-6 top-0 h-1 origin-left scale-x-0 rounded-full bg-pink-400 transition-transform duration-300 group-hover:scale-x-100"
                    />
                    <div>
                      <h3 className="font-heading text-lg text-cocoa-800">
                        {step.title}
                      </h3>
                      <p className="font-section3-p mt-2 text-sm font-normal leading-relaxed text-cocoa-700/80 text-justify">
                        {step.desc}
                      </p>
                    </div>
                    <div className="mt-4 flex justify-center">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-pink-50 px-3.5 py-1.5 font-text text-xs font-semibold text-pink-600 transition-all duration-300 group-hover:gap-2 group-hover:bg-pink-500 group-hover:text-white">
                        <Play className="h-3 w-3 fill-current" aria-hidden />
                        Tonton Demo
                      </span>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ol>
        </div>

        {/* ── Timeline VERTIKAL (HP/tablet) ──────────────────────────────── */}
        <ol
          data-stagger
          className="relative mt-10 flex flex-col gap-5 lg:hidden"
        >
          {/* Garis timeline Pink Vertikal */}
          <span
            className="absolute bottom-8 left-8 top-8 w-[3px] -translate-x-1/2 rounded-full bg-pink-400"
            aria-hidden
          />
          {steps.map((step, i) => (
            <li key={step.title} className="relative">
              <button
                type="button"
                onClick={() => setAktif(i)}
                aria-label={`Tonton demo: ${step.title}`}
                className="group flex w-full items-start gap-4 text-left focus-visible:outline-none"
              >
                <NodeLangkah Icon={step.icon} n={i + 1} />
                <div className="relative flex-1 overflow-hidden rounded-2xl bg-white/95 px-5 py-4 shadow-sm shadow-pink-300/20 ring-1 ring-pink-200/60 transition-transform duration-200 group-active:scale-[0.99] group-focus-visible:ring-2 group-focus-visible:ring-pink-400">
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-1 origin-top scale-y-0 rounded-full bg-pink-400 transition-transform duration-300 group-hover:scale-y-100"
                  />
                  <h3 className="font-heading text-lg text-cocoa-800">
                    {step.title}
                  </h3>
                  <p className="font-section3-p mt-1.5 text-sm font-normal leading-relaxed text-cocoa-700/80 text-justify">
                    {step.desc}
                  </p>
                  <HintTonton />
                </div>
              </button>
            </li>
          ))}
        </ol>

        {/* ── Tombol CTA Mulai Pesan Sekarang ────────────────────── */}
        <div data-reveal className="mt-10 text-center sm:mt-12 lg:mt-14">
          {isOn("pesan_wa") ? (
            <a
              href={generalOrderUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="font-section3-p inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-cocoa-800 shadow-sm transition-all duration-300 hover:bg-pink-500 hover:text-white hover:shadow-md active:scale-95"
            >
              <MessageCircle className="h-5 w-5" aria-hidden />
              Mulai Pesan Sekarang
            </a>
          ) : (
            <LockedCta feature="pesan_wa" />
          )}
        </div>
      </div>

      {/* ── Modal Product Tour ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {aktif !== null && (
          <ModalTutorial
            indeks={aktif}
            onTutup={() => setAktif(null)}
            onPindah={setAktif}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

/* ── Modal Product Tour ──────────────────────────────────────────────────────── */
function ModalTutorial({
  indeks,
  onTutup,
  onPindah,
}: {
  indeks: number;
  onTutup: () => void;
  onPindah: (i: number) => void;
}) {
  const step = steps[indeks];
  const media = parseVideoTutorial(step.video);
  const total = steps.length;
  const pertama = indeks === 0;
  const terakhir = indeks === total - 1;

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Overlay */}
      <button
        type="button"
        aria-label="Tutup demo"
        onClick={onTutup}
        className="absolute inset-0 bg-cocoa-900/55 backdrop-blur-sm"
      />

      {/* Panel modal */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`Demonstrasi langkah ${indeks + 1}: ${step.title}`}
        initial={{ y: 40, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className="relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-3xl bg-paper-50 shadow-2xl sm:max-w-2xl sm:rounded-[2rem]"
      >
        {/* Header + progress dots */}
        <div className="relative border-b border-cocoa-700/10 bg-gradient-to-r from-paper-100 via-paper-50 to-paper-100 px-5 pb-3.5 pt-4 sm:px-7 sm:pb-4 sm:pt-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-pink-500 px-3 py-1 font-text text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
                <Sparkles className="h-3 w-3" aria-hidden />
                Demo {indeks + 1} / {total}
              </span>
              <h2 className="truncate font-heading text-xl text-cocoa-800 sm:text-2xl">
                {step.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onTutup}
              aria-label="Tutup"
              className="shrink-0 rounded-full p-2 text-cocoa-700/70 transition-colors hover:bg-paper-200 hover:text-cocoa-900"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress dots */}
          <div
            className="mt-3 flex items-center gap-2"
            role="tablist"
            aria-label="Navigasi langkah demo"
          >
            {steps.map((s, i) => (
              <button
                key={s.title}
                type="button"
                role="tab"
                aria-selected={i === indeks}
                aria-label={`Ke langkah ${i + 1}: ${s.title}`}
                aria-current={i === indeks ? "step" : undefined}
                onClick={() => onPindah(i)}
                title={s.title}
                className={`group flex items-center gap-0 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 ${
                  i === indeks ? "w-16" : "w-7 hover:w-10"
                }`}
              >
                <span
                  className={`h-2 w-full rounded-full transition-all duration-300 ${
                    i === indeks
                      ? "bg-pink-500"
                      : "bg-cocoa-700/20 group-hover:bg-cocoa-700/45"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Video Zone */}
        <div className="relative mx-5 mt-4 aspect-video overflow-hidden rounded-2xl bg-cocoa-900 shadow-inner sm:mx-7 sm:rounded-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={indeks}
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="h-full w-full"
            >
              {media.type === "youtube" ? (
                <iframe
                  src={media.embedUrl}
                  title={`Tutorial ${step.title}`}
                  className="h-full w-full"
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              ) : media.type === "file" ? (
                <video
                  src={media.src}
                  className="h-full w-full"
                  controls
                  autoPlay
                  playsInline
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-cocoa-800 to-cocoa-900 px-6 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-pink-400 ring-1 ring-white/20">
                    <Film className="h-7 w-7" aria-hidden />
                  </span>
                  <p className="font-heading text-lg text-paper-50">
                    Video demo segera hadir
                  </p>
                  <p className="max-w-xs font-text text-xs font-normal text-paper-200/80">
                    Kami sedang menyiapkan video singkat untuk langkah ini.
                  </p>
                </div>
              )}

              {/* Label langkah melayang */}
              <div
                className="absolute bottom-3 left-3 flex items-center gap-2"
                aria-hidden
              >
                <span className="flex h-7 items-center gap-1.5 rounded-full bg-white/90 px-3 font-text text-xs font-semibold text-cocoa-800 shadow backdrop-blur-sm">
                  <Play className="h-3 w-3 fill-cocoa-800" />
                  Langkah {indeks + 1} · {step.title}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Deskripsi */}
        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-7 sm:py-5">
          <AnimatePresence mode="wait">
            <motion.p
              key={indeks}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="font-section3-p text-sm font-normal leading-relaxed text-cocoa-700/85 sm:text-base text-justify"
            >
              <span className="mr-2 font-heading text-base text-pink-500">
                {indeks + 1}.
              </span>
              {step.desc}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Navigasi Prev/Next */}
        <div className="border-t border-cocoa-700/10 bg-paper-100 px-5 py-3.5 sm:px-7">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onPindah(indeks - 1)}
              disabled={pertama}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-text text-xs sm:text-sm font-semibold transition-all focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 ${
                pertama
                  ? "bg-paper-200 text-cocoa-700/50"
                  : "bg-white text-cocoa-800 ring-1 ring-cocoa-700/15 hover:bg-cocoa-800 hover:text-white"
              }`}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              <span>Sebelumnya</span>
            </button>

            <span className="font-text text-xs font-semibold text-cocoa-700/60">
              {indeks + 1} / {total}
            </span>

            {terakhir ? (
              <button
                type="button"
                onClick={onTutup}
                className="inline-flex items-center gap-1.5 rounded-full bg-pink-500 px-4 py-2 font-text text-xs sm:text-sm font-semibold text-white shadow-sm transition-all hover:bg-pink-600"
              >
                Selesai
                <Check className="h-4 w-4" aria-hidden />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onPindah(indeks + 1)}
                className="inline-flex items-center gap-1.5 rounded-full bg-pink-500 px-4 py-2 font-text text-xs sm:text-sm font-semibold text-white shadow-sm transition-all hover:bg-pink-600"
              >
                Berikutnya
                <ChevronRight className="h-4 w-4" aria-hidden />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
