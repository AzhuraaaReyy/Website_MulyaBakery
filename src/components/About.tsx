import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import PlaceholderImage from "./PlaceholderImage";

import { BRAND } from "../config/contact";
import { useScrolly } from "../hooks/useScrolly";

const benefitsLeft = [
  {
    title: "Resep Keluarga",
    desc: "Dibuat dengan resep pilihan yang diwariskan penuh cinta dari keluarga kami.",
  },
  {
    title: "Selalu Fresh",
    desc: "Roti dibuat dan dipanggang secara berkala agar tetap lembut dan nikmat.",
  },
  {
    title: "Bahan Berkualitas",
    desc: "Menggunakan bahan pilihan untuk menghasilkan rasa yang lebih istimewa.",
  },
];

const benefitsRight = [
  {
    title: "Rasa Rumahan",
    desc: "Kelezatan roti dengan cita rasa hangat seperti buatan rumah sendiri.",
  },
  {
    title: "Harga Bersahabat",
    desc: "Nikmati roti lezat berkualitas dengan harga yang tetap terjangkau.",
  },
  {
    title: "Dibuat Sepenuh Hati",
    desc: "Setiap roti dibuat dengan perhatian untuk menghadirkan pengalaman terbaik.",
  },
];

function BenefitCard({
  title,
  desc,
  align = "left",
}: {
  title: string;
  desc: string;
  align?: "left" | "right";
}) {
  return (
    <div
      className={`rounded-2xl bg-paper-200/70 p-5 ring-1 ring-cocoa-700/5 transition-shadow hover:shadow-lift ${
        align === "right" ? "lg:text-right" : ""
      }`}
    >
      <h3 className="font-heading text-lg text-cocoa-800">{title}</h3>
      <p className="mt-1.5 text-justify font-text text-xs leading-relaxed text-cocoa-700/75 sm:text-sm">
        {desc}
      </p>
    </div>
  );
}

export default function About() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  useScrolly(sectionRef);

  const years = new Date().getFullYear() - BRAND.established;

  return (
    <section id="tentang" ref={sectionRef} className="relative overflow-hidden">
      {/* Import Google Font Caveat (Latin/Handwritten) khusus untuk p Section 1 */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&display=swap');
        .font-latin-custom {
          font-family: 'Caveat', cursive, sans-serif;
        }
      `}</style>

      {/* ══ SECTION 1 · "About Hero Collage" ══════════════════════════════════════ */}
      <div className="relative flex min-h-screen w-full items-center bg-paper-100 py-12 sm:py-16 lg:py-20">
        <div
          className="paper-grain pointer-events-none absolute inset-0 opacity-50"
          aria-hidden
        />

        <div className="container-wide relative my-auto w-full">
          {/* Parent Grid */}
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10">
            {/* Kiri: Teks Cerita & CTA */}
            {/* Menggunakan `contents` di mobile agar anak di dalamnya langsung menjadi grid item */}
            <div data-reveal className="contents lg:block lg:col-span-6">
              {/* 1. Badge & H1 (Order 1 di HP) */}
              <div className="order-1 lg:order-none">
                <div className="inline-flex items-center gap-2 rounded-full bg-caramel/20 px-3.5 py-1 text-xs font-semibold text-cocoa-800 sm:text-sm">
                  <span className="h-2 w-2 rounded-full bg-caramel"></span>
                  <span className="eyebrow-script !m-0 !text-cocoa-800">
                    Tentang {BRAND.name}
                  </span>
                </div>

                <h1 className="title-1 mt-3 text-2xl font-bold tracking-tight text-cocoa-900 sm:text-3xl lg:text-4xl lg:leading-snug">
                  Dibuat dengan{" "}
                  <span className="text-caramel">Cinta dari Dapur Rumah</span>,
                  Hadir untuk Menemani Setiap Momen Anda
                </h1>
              </div>

              {/* 3. Paragraf Deskripsi (Order 3 di HP) */}
              <p className="order-3 font-latin-custom mt-4 text-justify text-lg leading-relaxed text-cocoa-800 sm:text-xl lg:order-none lg:text-2xl">
                {BRAND.name} adalah UMKM roti rumahan yang dibangun oleh sebuah
                keluarga dengan semangat menghadirkan roti berkualitas untuk
                semua. Setiap adonan dibuat menggunakan bahan pilihan, diproses
                dengan penuh ketelitian, dan dipanggang setiap hari agar
                pelanggan selalu menikmati roti yang lembut, segar, dan penuh
                cita rasa. Dari dapur sederhana di rumah, kami percaya bahwa
                setiap gigitan mampu menghadirkan kehangatan dan kebahagiaan
                bagi keluarga Anda.
              </p>
            </div>

            {/* Kanan: Grid Kolase Foto Asimetris (Order 2 di HP) */}
            <div className="order-2 relative lg:col-span-6 lg:order-none">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* Kolom Foto Kiri */}
                <div
                  data-reveal
                  data-reveal-x="-30"
                  className="relative self-center"
                >
                  <div className="overflow-hidden rounded-[2rem] rounded-tr-[0.5rem] shadow-cocoa-lg sm:rounded-[2.5rem]">
                    <PlaceholderImage
                      alt="Suasana Dapur"
                      src="/images/about_us.jpg"
                      label="Dapur Kami"
                      seed="dapur"
                      className="aspect-[3/4] w-full object-cover"
                    />
                  </div>

                  {/* Stamp Badge Logo */}
                  <div className="absolute -bottom-4 -right-4 z-20 h-20 w-20 rotate-12 sm:-bottom-5 sm:-right-5 sm:h-24 sm:w-24">
                    <img
                      src="/images/Logo3.png"
                      alt="Fresh Baked Badge"
                      className="h-full w-full object-contain drop-shadow-xl"
                    />
                  </div>
                </div>

                {/* Kolom Foto Kanan */}
                <div
                  data-reveal
                  data-reveal-x="30"
                  className="flex flex-col gap-3 sm:gap-4"
                >
                  <div className="overflow-hidden rounded-[2rem] rounded-bl-[0.5rem] shadow-cocoa-lg sm:rounded-[2.5rem]">
                    <PlaceholderImage
                      alt="Proses Pembuatan Roti"
                      src="/images/about_us2.jpg"
                      label="Pembuatan Roti"
                      seed="baking-process"
                      className="aspect-video w-full object-cover"
                    />
                  </div>

                  <div className="overflow-hidden rounded-[2rem] rounded-tl-[0.5rem] shadow-cocoa-lg sm:rounded-[2.5rem]">
                    <PlaceholderImage
                      alt="Sajian Roti"
                      src="/images/about_us3.jpg"
                      label="Sajian Fresh"
                      seed="bakery-product"
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Sparkle Ornament */}
              <div className="absolute -bottom-6 -right-6 -z-0 hidden text-caramel sm:block">
                <Sparkles className="h-10 w-10 fill-caramel/20 sm:h-12 sm:w-12" />
              </div>

              {/* Counter Badge */}
              <motion.div
                className="absolute -top-3 -left-3 z-10 rounded-xl bg-caramel px-3.5 py-2 text-cocoa-900 shadow-lg sm:-top-4 sm:-left-4 sm:rounded-2xl sm:px-5 sm:py-3"
                animate={reduce ? {} : { y: [0, -6, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <p className="font-heading text-lg font-bold leading-none sm:text-2xl">
                  {years}+ Tahun
                </p>
                <p className="font-text text-[10px] font-medium text-cocoa-800 sm:text-[11px]">
                  Pengalaman Rasa
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ SECTION 2 · "Freshly Baked" ══════════════════════════════════════════ */}
      <div className="relative flex min-h-fit lg:min-h-screen w-full items-center bg-paper-200 py-12 sm:py-16 lg:py-20 overflow-hidden">
        {/* Import Google Font Patrick Hand */}
        <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap');
    .font-section2-text {
      font-family: 'Patrick Hand', cursive, sans-serif;
    }
  `}</style>

        <div
          className="paper-grain pointer-events-none absolute inset-0 opacity-40"
          aria-hidden
        />

        <div className="container-wide relative my-auto w-full px-4 sm:px-6 lg:px-8">
          {/* Grid Container Utama */}
          <div className="flex flex-col gap-8 sm:gap-10 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12">
            {/* 
        ========================================================================
        KONTAINER TEKS (H2 + PARAGRAF)
        Di Mobile: Menggunakan 'contents' agar H2 & P terpisah sebagai elemen Flex universal.
        Di Desktop: Menjadi 'lg:flex lg:flex-col' tunggal di kolom kanan (GAP HILANG!).
        ========================================================================
      */}
            <div className="contents lg:flex lg:flex-col lg:justify-center lg:col-start-2 lg:order-2">
              {/* 1. BADGE & H2 (Urutan 1 di Mobile & Tablet) */}
              <div
                data-reveal
                className="order-1 text-left sm:text-center lg:order-none lg:text-left"
              >
                <div className="inline-flex items-center gap-2 rounded-full bg-caramel/20 px-3.5 py-1 text-xs font-semibold text-cocoa-800 sm:text-sm">
                  <span className="h-2 w-2 rounded-full bg-caramel"></span>
                  <span className="eyebrow-script !m-0 !text-cocoa-800">
                    Dari dapur keluarga kami
                  </span>
                </div>

                <h2 className="title-1 mt-2.5 text-2xl font-bold tracking-tight text-cocoa-900 sm:text-3xl lg:text-4xl lg:leading-snug">
                  <span className="block">Roti Hangat</span>
                  <span className="block text-caramel">Dengan Cita Rasa</span>
                  <span className="block">Rumahan</span>
                </h2>
              </div>

              {/* 3. PARAGRAF DESKRIPSI (Urutan 3 di Mobile [Di bawah foto], Menempel Rapat di Desktop) */}
              <div
                data-reveal
                data-reveal-x="60"
                className="order-3 mt-0 lg:order-none lg:mt-5 text-left sm:text-center lg:text-left"
              >
                <p className="font-section2-text text-justify text-base leading-relaxed text-cocoa-800 sm:text-lg lg:text-xl">
                  Berawal dari dapur kecil keluarga, Mulya Bakery menghadirkan
                  roti dengan proses pembuatan yang penuh perhatian. Setiap
                  adonan dibuat dengan resep pilihan dan dipanggang secara
                  berkala agar menghasilkan rasa yang lembut, aroma yang
                  menggoda, serta kualitas terbaik untuk keluarga Anda.
                </p>

                <p className="font-section2-text mt-3 text-justify text-base leading-relaxed text-cocoa-800 sm:text-lg lg:text-xl">
                  Kami percaya bahwa roti bukan hanya sekadar makanan, tetapi
                  juga menjadi bagian dari momen hangat bersama orang-orang
                  tercinta. Nikmati kelezatan roti rumahan yang dibuat dengan
                  sepenuh hati.
                </p>
              </div>
            </div>

            {/* 
        ========================================================================
        2. KOLASE FOTO (Urutan 2 di Mobile [Di Bawah H2], Kolom Kiri di Desktop)
        ========================================================================
      */}
            <motion.div
              data-reveal
              data-reveal-x="-60"
              className="order-2 relative mx-auto flex w-full max-w-[300px] justify-center sm:max-w-md lg:order-1 lg:col-start-1 lg:max-w-none"
              animate={reduce ? {} : { y: [0, -6, 0] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div className="relative grid aspect-[4/4.8] w-full max-h-[340px] grid-cols-12 grid-rows-12 gap-1 p-1 sm:max-h-[440px] sm:gap-2 sm:p-1.5 lg:max-h-[500px]">
                {/* A. Kotak Gradient Vertikal Atas-Kiri */}
                <div className="col-span-4 row-span-6 z-10 flex flex-col justify-between rounded-md bg-gradient-to-br from-pink-100 via-pink-300 to-pink-500 p-2 text-paper-100 shadow-md sm:p-3.5">
                  <p className="font-section2-text hidden text-[11px] leading-tight text-pink-900/90 sm:block sm:text-xs">
                    Resep warisan keluarga dengan kehangatan autentik setiap
                    hari.
                  </p>
                  <div className="mt-auto">
                    <span
                      className="block font-heading text-base font-bold tracking-widest text-white sm:text-xl lg:text-2xl"
                      style={{ WebkitTextStroke: "1px #be185d" }}
                    >
                      2021
                    </span>
                    <span className="block text-[7px] uppercase tracking-wider text-white/90 sm:text-[9px]">
                      Mulya Bakery
                    </span>
                  </div>
                </div>

                {/* B. Foto Utama Atas-Kanan */}
                <div className="relative col-span-8 row-span-7 col-start-5 z-20">
                  <div className="absolute -top-1 -right-1 inset-0 -z-10 rounded-md bg-white shadow-cocoa-md sm:-top-1.5 sm:-right-1.5" />
                  <div className="h-full w-full overflow-hidden rounded-md bg-white p-1 shadow-cocoa-lg">
                    <PlaceholderImage
                      alt="Roti hangat Mulya Bakery"
                      src="/images/rotipanggang.png"
                      label="Roti Utama"
                      seed="freshly-baked-main"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                {/* C. Foto Horizontal Tengah-Kiri */}
                <div className="relative col-span-4 row-span-3 row-start-7 col-start-1 z-20">
                  <div className="absolute -left-1 -bottom-1 inset-0 -z-10 rounded-md bg-white shadow-sm sm:-left-1.5 sm:-bottom-1.5" />
                  <div className="h-full w-full overflow-hidden rounded-md bg-white p-1 shadow-md">
                    <PlaceholderImage
                      alt="Proses Pembuatan Roti"
                      src="/images/about_us2.jpg"
                      label="Proses Baking"
                      seed="baking-detail"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                {/* D. Foto Bawah-Kiri */}
                <div className="relative col-span-3 row-span-3 row-start-10 col-start-1 z-30">
                  <div className="absolute -left-1 -bottom-1 inset-0 -z-10 rounded-md bg-white shadow-sm" />
                  <div className="h-full w-full overflow-hidden rounded-md bg-white p-1 shadow-md">
                    <PlaceholderImage
                      alt="Sajian Roti Fresh"
                      src="/images/about_us3.jpg"
                      label="Sajian Roti"
                      seed="fresh-bread"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                {/* E. Foto Bawah-Tengah */}
                <div className="relative col-span-4 row-span-5 row-start-8 col-start-5 z-20">
                  <div className="h-full w-full overflow-hidden rounded-md bg-white p-1 shadow-md">
                    <PlaceholderImage
                      alt="Dapur Mulya Bakery"
                      src="/images/about_us.jpg"
                      label="Dapur Kami"
                      seed="kitchen-vibe"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                {/* F. Badge Vertikal "2021" */}
                <div className="col-span-2 row-span-3 row-start-10 col-start-4 z-40 flex items-center justify-center rounded-md bg-gradient-to-br from-rose-100 via-pink-200 to-rose-400 shadow-md">
                  <span
                    className="font-heading text-[9px] font-bold tracking-widest text-white [writing-mode:vertical-lr] sm:text-xs"
                    style={{ WebkitTextStroke: "1px #be185d" }}
                  >
                    2021
                  </span>
                </div>

                {/* G. Tipografi Script Pojok Kanan Bawah */}
                <div className="pointer-events-none col-span-4 row-span-4 row-start-9 col-start-9 z-40 flex flex-col justify-end p-0.5 text-right sm:p-1">
                  <span className="eyebrow-script text-base text-cocoa-900 drop-shadow-sm sm:text-xl lg:text-2xl">
                    Cita Rasa
                  </span>
                  <span className="font-heading text-[9px] font-bold uppercase tracking-widest text-cocoa-800 sm:text-xs">
                    Rumahan
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ══ SECTION 3 · "Benefits Of Breads" ══════════════════════════════════════ */}
      <div className="section-3-container relative flex min-h-fit lg:min-h-screen w-full items-center bg-paper-50 py-12 sm:py-16 lg:py-20 overflow-hidden">
        {/* Import Google Font 'Itim' - Hanya Berlaku Khusus Paragraf & Deskripsi di Section 3 */}
        <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Itim&display=swap');
    .section-3-container p,
    .font-section3-p {
      font-family: 'Itim', cursive, sans-serif;
    }
  `}</style>

        <div
          className="paper-grain pointer-events-none absolute inset-0 opacity-40"
          aria-hidden
        />

        <div className="container-wide relative my-auto w-full px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mx-auto max-w-2xl text-center">
            {/* Badge Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full bg-caramel/20 px-3.5 py-1 text-xs font-semibold text-cocoa-800 sm:text-sm">
              <span className="h-2 w-2 rounded-full bg-caramel"></span>
              <span className="eyebrow-script !m-0">Manfaat</span>
            </div>

            <h2
              data-reveal
              className="title-1 mt-2 text-2xl font-bold tracking-tight text-cocoa-900 sm:text-3xl lg:text-4xl"
            >
              Kenapa Roti Kami Istimewa
            </h2>

            <p
              data-reveal
              className="font-section3-p mt-3 text-center text-base sm:text-lg lg:text-xl leading-relaxed text-cocoa-700/85"
            >
              Bukan sekadar enak — tiap gigitan punya alasan untuk kembali lagi.
            </p>
          </div>

          {/* Layout Utama Grid 3 Kolom di Desktop */}
          <div className="mt-8 grid items-center gap-8 sm:mt-12 lg:grid-cols-[1fr_auto_1fr] lg:gap-6 xl:gap-10">
            {/* ── 1. KOLOM KIRI (BENEFITS LEFT) ── */}
            <div data-stagger className="flex flex-col gap-6 sm:gap-8 lg:gap-6">
              {benefitsLeft.map((b, index) => (
                <div
                  key={b.title || index}
                  className="relative flex flex-col items-center lg:flex-row"
                >
                  {/* Card Kiri */}
                  <div className="w-full text-left sm:text-center lg:text-right">
                    <BenefitCard {...b} align="right" />
                  </div>

                  {/* Panah Mobile Kiri/Atas -> Menunjuk ke Bawah (Menuju Gambar Tengah) */}
                  <div className="mt-3 block text-cocoa-800 lg:hidden opacity-75">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-6 w-6 stroke-cocoa-800 fill-none stroke-[2.5] stroke-linecap-round stroke-linejoin-round animate-bounce"
                    >
                      <path d="M12 5v14M5 12l7 7 7-7" />
                    </svg>
                  </div>

                  {/* Panah Desktop Kiri ke Gambar Tengah */}
                  <div className="pointer-events-none absolute -right-12 top-1/2 hidden -translate-y-1/2 z-20 w-12 text-cocoa-900 lg:block">
                    <svg
                      viewBox="0 0 60 40"
                      className="h-10 w-12 stroke-cocoa-900 fill-none stroke-[2.5] stroke-linecap-round stroke-linejoin-round"
                    >
                      <defs>
                        <marker
                          id={`arrow-head-left-${index}`}
                          viewBox="0 0 10 10"
                          refX="7"
                          refY="5"
                          markerWidth="7"
                          markerHeight="7"
                          orient="auto"
                        >
                          <path
                            d="M 0 1.5 L 8 5 L 0 8.5 Z"
                            fill="currentColor"
                            stroke="none"
                          />
                        </marker>
                      </defs>

                      {index === 0 && (
                        <path
                          d="M 4 8 Q 38 8 52 28"
                          markerEnd={`url(#arrow-head-left-${index})`}
                        />
                      )}
                      {index === 1 && (
                        <path
                          d="M 4 20 L 52 20"
                          markerEnd={`url(#arrow-head-left-${index})`}
                        />
                      )}
                      {index === 2 && (
                        <path
                          d="M 4 32 Q 38 32 52 12"
                          markerEnd={`url(#arrow-head-left-${index})`}
                        />
                      )}
                    </svg>
                  </div>
                </div>
              ))}
            </div>

            {/* ── 2. GAMBAR TENGAH ── */}
            <div
              data-reveal
              className="relative mx-auto my-6 flex h-48 w-48 items-center justify-center sm:h-60 sm:w-60 lg:my-0 lg:h-64 lg:w-64 xl:h-72 xl:w-72"
            >
              <div
                className="absolute inset-0 rounded-full bg-caramel/20 blur-2xl"
                aria-hidden
              />
              <PlaceholderImage
                alt="Roti spesial Roti Bahagia"
                src="/images/rotipanggang.png"
                label="Roti Kami"
                seed="benefit-center"
                rounded="rounded-full"
                className="relative h-full w-full object-cover shadow-cocoa-lg transition-transform duration-300 hover:scale-105"
              />
            </div>

            {/* ── 3. KOLOM KANAN (BENEFITS RIGHT) ── */}
            <div data-stagger className="flex flex-col gap-6 sm:gap-8 lg:gap-6">
              {benefitsRight.map((b, index) => (
                <div
                  key={b.title || index}
                  className="relative flex flex-col items-center lg:flex-row"
                >
                  {/* Panah Mobile Kanan/Bawah -> Menunjuk ke Atas (Menuju Gambar Tengah) */}
                  <div className="mb-3 block text-cocoa-800 lg:hidden opacity-75">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-6 w-6 stroke-cocoa-800 fill-none stroke-[2.5] stroke-linecap-round stroke-linejoin-round animate-bounce"
                    >
                      <path d="M12 19V5M5 12l7-7 7 7" />
                    </svg>
                  </div>

                  {/* Panah Desktop Kanan ke Gambar Tengah */}
                  <div className="pointer-events-none absolute -left-12 top-1/2 hidden -translate-y-1/2 z-20 w-12 text-cocoa-900 lg:block">
                    <svg
                      viewBox="0 0 60 40"
                      className="h-10 w-12 stroke-cocoa-900 fill-none stroke-[2.5] stroke-linecap-round stroke-linejoin-round"
                    >
                      <defs>
                        <marker
                          id={`arrow-head-right-${index}`}
                          viewBox="0 0 10 10"
                          refX="7"
                          refY="5"
                          markerWidth="7"
                          markerHeight="7"
                          orient="auto"
                        >
                          <path
                            d="M 0 1.5 L 8 5 L 0 8.5 Z"
                            fill="currentColor"
                            stroke="none"
                          />
                        </marker>
                      </defs>

                      {index === 0 && (
                        <path
                          d="M 56 8 Q 22 8 8 28"
                          markerEnd={`url(#arrow-head-right-${index})`}
                        />
                      )}
                      {index === 1 && (
                        <path
                          d="M 56 20 L 8 20"
                          markerEnd={`url(#arrow-head-right-${index})`}
                        />
                      )}
                      {index === 2 && (
                        <path
                          d="M 56 32 Q 22 32 8 12"
                          markerEnd={`url(#arrow-head-right-${index})`}
                        />
                      )}
                    </svg>
                  </div>

                  {/* Card Kanan */}
                  <div className="w-full text-left sm:text-center lg:text-left">
                    <BenefitCard {...b} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
