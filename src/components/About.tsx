import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Sprout, Sun, HeartHandshake } from "lucide-react";
import PlaceholderImage from "./PlaceholderImage";
import TornPaper from "./TornPaper";
import Decor from "./Decor";
import { BRAND } from "../config/contact";
import { useScrolly } from "../hooks/useScrolly";

const values = [
  {
    icon: Sprout,
    title: "Bahan Pilihan",
    desc: "Tepung berkualitas, butter asli, dan isian premium. Tanpa kompromi rasa.",
  },
  {
    icon: Sun,
    title: "Fresh Harian",
    desc: "Dipanggang setiap pagi dalam jumlah terbatas — selalu hangat saat sampai.",
  },
  {
    icon: HeartHandshake,
    title: "Tanpa Pengawet",
    desc: "Dibuat sepenuh hati seperti untuk keluarga sendiri, jujur dan alami.",
  },
];

export default function About() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  useScrolly(sectionRef);

  const years = new Date().getFullYear() - BRAND.established;

  return (
    <section
      id="tentang"
      ref={sectionRef}
      className="relative overflow-hidden bg-paper-100 pb-36 pt-24 lg:pb-44 lg:pt-32"
    >
      <div className="paper-grain pointer-events-none absolute inset-0 opacity-50" aria-hidden />

      {/* Aksen bahan cut-out */}
      <Decor
        src="/images/decor/roti.png"
        parallax={-0.2}
        rotate={22}
        className="-right-[100px] top-[350px] hidden w-28 lg:block lg:w-[280px] z-30"
      />
      <Decor
        src="/images/decor/roti.png"
        parallax={-0.2}
        rotate={22}
        className="-right-[40px] top-[270px] hidden w-28 lg:block lg:w-[200px] "
      />
      
     

      <div className="container-wide relative grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
        {/* ── Kiri: tumpukan foto bergaya tempelan kertas ─────────────── */}
        <div data-reveal data-reveal-x="-60" className="order-1">
          <div className="group relative mx-auto w-full max-w-[17rem] pb-12 pr-8 sm:max-w-sm sm:pb-16 sm:pr-12 lg:max-w-md">
            {/* Foto utama — bingkai kertas tebal, sedikit miring */}
            <div className="relative rotate-[-4deg] transition-transform duration-500 group-hover:rotate-[-2deg]">
              <div className="rounded-[1.75rem] bg-paper-50 p-3 shadow-cocoa-lg ring-1 ring-cocoa-700/10">
                <PlaceholderImage
                  alt="Suasana dapur Roti Bahagia saat proses membuat roti"
                  src="/images/dapur.jpg"
                  label="Dapur Kami"
                  seed="dapur"
                  rounded="rounded-[1.3rem]"
                  className="aspect-[4/5] w-full"
                />
              </div>
              {/* Selotip di ujung atas */}
              <span
                className="absolute -top-3 left-10 h-7 w-24 -rotate-6 rounded-[3px] bg-caramel/25 ring-1 ring-caramel/30"
                aria-hidden
              />
            </div>

            {/* Foto detail — menimpa sudut kanan bawah */}
            <div className="absolute bottom-0 right-0 w-[54%] rotate-[6deg] transition-transform duration-500 group-hover:-translate-y-1.5 group-hover:rotate-[4deg]">
              <div className="rounded-2xl bg-paper-50 p-2.5 shadow-cocoa-lg ring-1 ring-cocoa-700/10">
                <PlaceholderImage
                  alt="Roti hangat buatan Roti Bahagia"
                  src="/images/roti-coklat-keju.jpg"
                  label="Roti Kami"
                  seed="roti-detail"
                  rounded="rounded-xl"
                  className="aspect-square w-full"
                />
              </div>
            </div>

            {/* Badge jumlah tahun */}
            <motion.div
              className="absolute -left-3 -top-4 rounded-2xl bg-cocoa-800 px-5 py-3.5 text-paper-50 shadow-cocoa sm:-left-5 sm:px-6 sm:py-4"
              animate={reduce ? {} : { y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <p className="font-heading text-3xl leading-none sm:text-4xl">{years}+</p>
              <p className="mt-1 font-text text-xs text-paper-200/85 sm:text-sm">
                tahun menemani Anda
              </p>
            </motion.div>
          </div>
        </div>

        {/* ── Kanan: cerita ────────────────────────────────────────────── */}
        <div className="order-2 text-center lg:text-left">
          <span data-reveal className="eyebrow-script">
            Cerita kami
          </span>
          <h2 data-reveal className="title-1 mt-2">
            Berawal dari dapur kecil,{" "}
            <span className="text-caramel">dibuat dengan cinta</span>
          </h2>

          {/* Teks dipecah dua kolom — pola dari referensi */}
          <div
            data-reveal
            className="mx-auto mt-7 max-w-lg gap-x-10 gap-y-4 font-text text-cocoa-700/85 sm:columns-2 lg:mx-0 lg:max-w-none"
          >
            <p className="mb-4 leading-relaxed">
              {BRAND.name} lahir dari kebiasaan sederhana: membuatkan roti hangat untuk keluarga di
              akhir pekan. Aroma roti yang baru keluar dari oven ternyata mengundang tetangga, lalu
              teman, lalu satu kota kecil kami.
            </p>
            <p className="leading-relaxed">
              Sampai hari ini kami memegang prinsip yang sama — membuat setiap roti seperti untuk
              orang tersayang. Bukan pabrik, bukan mesin besar; hanya tangan-tangan sabar dan
              bahan-bahan terbaik.
            </p>
          </div>

          {/* Nilai/prinsip usaha */}
          <div data-stagger className="mt-10 grid gap-4 sm:grid-cols-3">
            {values.map((v) => (
              <div
                key={v.title}
                className="h-full rounded-[1.4rem] bg-paper-50 p-5 text-center shadow-lift ring-1 ring-cocoa-700/10 transition-transform duration-300 hover:-translate-y-1.5 sm:text-left"
              >
                <span className="mx-auto mb-3.5 flex h-12 w-12 items-center justify-center rounded-full bg-caramel/15 text-caramel ring-1 ring-caramel/25 sm:mx-0">
                  <v.icon className="h-6 w-6" strokeWidth={1.8} aria-hidden />
                </span>
                <h3 className="font-heading text-lg text-cocoa-800">{v.title}</h3>
                <p className="mt-1.5 font-text text-sm leading-relaxed text-cocoa-700/80">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sobekan ke section Menu (paper-50) */}
      <TornPaper fill="#FCF8F0" core="#FFFFFF" seed="about-tear" height={82} />
    </section>
    
  );
}
