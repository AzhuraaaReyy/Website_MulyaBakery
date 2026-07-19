import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import PlaceholderImage from "./PlaceholderImage";
import TornPaper from "./TornPaper";
import Decor from "./Decor";
import { testimonials } from "../data/testimonials";
import { useScrolly } from "../hooks/useScrolly";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`Rating ${rating} dari 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? "fill-caramel text-caramel" : "text-cocoa-500/25"
          }`}
          aria-hidden
        />
      ))}
    </div>
  );
}

// Posisi avatar kecil di sekitar avatar utama (cluster ala referensi).
const CLUSTER_POS = [
  { top: "4%", left: "14%", size: "h-14 w-14" },
  { top: "10%", left: "72%", size: "h-16 w-16" },
  { top: "62%", left: "4%", size: "h-12 w-12" },
  { top: "70%", left: "68%", size: "h-16 w-16" },
];

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  useScrolly(sectionRef);

  const [index, setIndex] = useState(0);
  const count = testimonials.length;
  const go = (dir: number) => setIndex((i) => (i + dir + count) % count);
  const t = testimonials[index];
  const others = testimonials.filter((_, i) => i !== index);

  return (
    <section
      id="testimoni"
      ref={sectionRef}
      className="relative overflow-hidden bg-paper-100 pb-40 pt-24 lg:pb-48 lg:pt-32"
    >
      <div className="paper-grain pointer-events-none absolute inset-0 opacity-50" aria-hidden />

      {/* Aksen bahan cut-out */}
      <Decor src="/images/decor/roti5.png" parallax={0.2} rotate={-24}
        className="-left-10 top-20 hidden w-24 lg:block lg:w-32" />
      <Decor src="/images/decor/roti4.png" parallax={-0.22} rotate={14}
        className="-right-6 bottom-48 hidden w-20 lg:block lg:w-28" />

      <div className="container-wide relative">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
          {/* ── Kiri: cluster avatar ──────────────────────────────────── */}
          <div data-reveal data-reveal-x="-60" className="order-2 lg:order-1">
            <div className="relative mx-auto h-[380px] w-full max-w-md">
              {/* Avatar kecil (pelanggan lain) — bisa diklik untuk berpindah */}
              {others.map((o, i) => {
                const pos = CLUSTER_POS[i % CLUSTER_POS.length];
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() =>
                      setIndex(testimonials.findIndex((x) => x.id === o.id))
                    }
                    aria-label={`Lihat testimoni ${o.name}`}
                    className={`absolute ${pos.size} overflow-hidden rounded-full shadow-lift ring-4 ring-paper-50 transition-transform hover:scale-110`}
                    style={{ top: pos.top, left: pos.left }}
                  >
                    <PlaceholderImage
                      alt={`Foto ${o.name}`}
                      src={o.avatar}
                      seed={o.id}
                      rounded="rounded-full"
                      className="h-full w-full"
                    />
                  </button>
                );
              })}

              {/* Avatar utama — bingkai kertas tebal */}
              <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rotate-[-3deg] rounded-[2rem] bg-paper-50 p-3 shadow-cocoa-lg ring-1 ring-cocoa-700/10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, scale: 0.88 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.88 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="h-full w-full overflow-hidden rounded-[1.5rem]"
                  >
                    <PlaceholderImage
                      alt={`Foto ${t.name}`}
                      src={t.avatar}
                      seed={t.id}
                      rounded="rounded-[1.5rem]"
                      className="h-full w-full"
                    />
                  </motion.div>
                </AnimatePresence>
                {/* Selotip */}
                <span
                  className="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 -rotate-6 rounded-[3px] bg-caramel/25 ring-1 ring-caramel/30"
                  aria-hidden
                />
              </div>
            </div>
          </div>

          {/* ── Kanan: kutipan sebagai catatan kertas ─────────────────── */}
          <div className="order-1 lg:order-2">
            <span data-reveal className="eyebrow-script">
              Testimoni
            </span>
            <h2 data-reveal className="title-1 mt-2">
              Kata mereka yang sudah mencoba
            </h2>

            <div
              data-reveal
              className="relative mt-8 rotate-[0.6deg] rounded-[1.6rem] bg-paper-50 p-7 shadow-lift ring-1 ring-cocoa-700/10 sm:p-8"
            >
              <Quote
                className="absolute -left-1 -top-3 h-12 w-12 text-caramel/25"
                aria-hidden
              />
              <div className="relative min-h-[200px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, x: 26 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -26 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <Stars rating={t.rating} />
                    <p className="mt-4 font-heading text-xl leading-snug text-cocoa-800 sm:text-2xl">
                      “{t.quote}”
                    </p>
                    <div className="mt-5">
                      <p className="font-text font-extrabold text-cocoa-800">
                        {t.name}
                      </p>
                      <p className="font-text text-sm text-cocoa-700/70">
                        {t.role}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Kontrol carousel */}
            <div data-reveal className="mt-7 flex items-center justify-between">
              <div className="flex gap-2" role="tablist" aria-label="Pilih testimoni">
                {testimonials.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Testimoni ${i + 1}`}
                    aria-selected={i === index}
                    role="tab"
                    className={`h-2.5 rounded-full transition-all ${
                      i === index
                        ? "w-8 bg-cocoa-800"
                        : "w-2.5 bg-cocoa-500/30 hover:bg-cocoa-500/50"
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Testimoni sebelumnya"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-paper-50 text-cocoa-800 shadow-lift ring-1 ring-cocoa-700/10 transition-colors hover:bg-cocoa-800 hover:text-paper-50"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Testimoni berikutnya"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-paper-50 text-cocoa-800 shadow-lift ring-1 ring-cocoa-700/10 transition-colors hover:bg-cocoa-800 hover:text-paper-50"
                >
                  <ChevronRight className="h-5 w-5" aria-hidden />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sobekan ke Galeri (paper-200) */}
      <TornPaper fill="#EFE3CD" core="#FCF8F0" seed="testi-tear" height={82} />
    </section>
  );
}
