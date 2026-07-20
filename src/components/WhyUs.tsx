import { useRef } from "react";
import { Croissant, Leaf, Wallet, Truck } from "lucide-react";
import TornPaper from "./TornPaper";
import Decor from "./Decor";
import { useScrolly } from "../hooks/useScrolly";

const reasons = [
  {
    icon: Croissant,
    title: "Fresh Baked Daily",
    desc: "Dipanggang setiap pagi, bukan stok kemarin. Selalu hangat dan wangi.",
  },
  {
    icon: Leaf,
    title: "Bahan Berkualitas",
    desc: "Butter asli, tepung pilihan, tanpa pengawet dan pewarna buatan.",
  },
  {
    icon: Wallet,
    title: "Harga Terjangkau",
    desc: "Roti enak tak harus mahal. Harga ramah untuk teman ngeteh harian.",
  },
  {
    icon: Truck,
    title: "Pengiriman Cepat",
    desc: "Pesan pagi, sampai masih hangat. Antar cepat ke area sekitar.",
  },
];

// Rotasi kecil per kartu → kesan "ditempel tangan", tapi tetap rapi.
const TILT = ["-0.9deg", "0.7deg", "-0.6deg", "1deg"];

export default function WhyUs() {
  const sectionRef = useRef<HTMLElement>(null);
  useScrolly(sectionRef);

  return (
    <section
      id="keunggulan"
      ref={sectionRef}
      className="relative overflow-hidden bg-paper-200 pb-36 pt-36 lg:pb-44 lg:pt-44"
    >
      {/* Kertas sobek di kedua tepi — section ini jadi "lembar" tersendiri */}
      <TornPaper
        position="top"
        fill="#FCF8F0"
        core="#FFFFFF"
        seed="why-top"
        height={76}
      />
      <TornPaper
        position="bottom"
        fill="#F7F0E1"
        core="#FCF8F0"
        seed="why-bottom"
        height={80}
      />

      <div
        className="paper-grain pointer-events-none absolute inset-0 opacity-60"
        aria-hidden
      />

      {/* Aksen bahan cut-out */}
      <Decor
        src="/images/decor/roti4.png"
        parallax={-0.18}
        rotate={26}
        className="right-[140px] bottom-[110px] hidden w-24 lg:block lg:w-[130px] z-30"
      />
      <Decor
        src="/images/decor/roti.png"
        parallax={-0.18}
        rotate={26}
        className="right-[140px] bottom-[150px] hidden w-24 lg:block lg:w-[80px] z-20"
      />

      <Decor
        src="/images/decor/selai2.png"
        parallax={-0.18}
        rotate={26}
        className="right-[100px] bottom-[120px] hidden w-24 lg:block lg:w-[160px] z-10"
      />

      <Decor
        src="/images/decor/roti3.png"
        parallax={-0.18}
        rotate={26}
        className="left-[130px] top-[380px] hidden w-20 lg:block lg:w-[90px] z-20"
      />
      <Decor
        src="/images/decor/roti3.png"
        parallax={-0.18}
        rotate={26}
        className="left-[150px] top-[350px] hidden w-20 lg:block lg:w-[130px] z-20"
      />

      {/* Decor bagian tengah*/}
      <Decor
        src="/images/decor/roti5.png"
        parallax={0.22}
        rotate={-18}
        className="top-[100px] right-[100px] hidden w-20 lg:block lg:w-[130px] -z-0"
      />
      <Decor
        src="/images/decor/roti3.png"
        parallax={0.22}
        rotate={-18}
        className="top-[30px] right-[220px] hidden w-20 lg:block lg:w-[180px] -z-0"
      />
      <Decor
        src="/images/decor/roti3.png"
        parallax={0.22}
        rotate={-18}
        className="top-[100px] right-[220px] hidden w-20 lg:block lg:w-[180px] -z-0"
      />
      <Decor
        src="/images/decor/selai2.png"
        parallax={0.22}
        rotate={-18}
        className="top-[10px] right-[70px] hidden w-20 lg:block lg:w-[320px] -z-0"
      />
      <Decor
        src="/images/decor/brownis.png"
        parallax={0.22}
        rotate={-18}
        className="top-[70px] right-[150px] hidden w-20 lg:block lg:w-[200px] z-30"
      />

      <div className="container-wide relative">
        <div className="mx-auto max-w-2xl text-center">
          <span data-reveal className="eyebrow-script">
            Kenapa pilih kami
          </span>
          <h2 data-reveal className="title-1 mt-2">
            Alasan pelanggan kembali lagi &amp; lagi
          </h2>
        </div>

        <div
          data-stagger
          className="mt-16 grid gap-7 sm:grid-cols-2 lg:grid-cols-4"
        >
          {/* Pembungkus luar = anak langsung [data-stagger]; GSAP menghapus
              transform-nya setelah reveal, jadi kemiringan diletakkan di DALAM. */}
          {reasons.map((r, i) => (
            <div key={r.title} className="h-full">
              <div
                style={{ rotate: TILT[i % TILT.length] }}
                className="group relative h-full rounded-[1.75rem] bg-paper-50 px-7 pb-8 pt-11 text-center shadow-lift ring-1 ring-cocoa-700/10 transition-transform duration-300 hover:-translate-y-2 hover:rotate-0"
              >
                {/* Selotip kertas di ujung atas kartu */}
                <span
                  className="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 -rotate-3 rounded-[3px] bg-caramel/25 ring-1 ring-caramel/30"
                  aria-hidden
                />

                <span className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-caramel/15 text-caramel ring-1 ring-caramel/25 transition-colors duration-300 group-hover:bg-cocoa-800 group-hover:text-paper-50 group-hover:ring-cocoa-800">
                  <r.icon className="h-9 w-9" strokeWidth={1.8} aria-hidden />
                </span>

                <h3 className="font-heading text-xl text-cocoa-800">
                  {r.title}
                </h3>
                <p className="mt-2.5 font-text text-sm leading-relaxed text-cocoa-700/80">
                  {r.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
