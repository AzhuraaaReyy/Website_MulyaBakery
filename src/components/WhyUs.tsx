import { useRef } from "react";
import { Croissant, Leaf, Wallet, Truck } from "lucide-react";
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
      className="relative w-full overflow-hidden bg-paper-200 py-12 sm:py-16 lg:py-20"
    >
      <div
        className="paper-grain pointer-events-none absolute inset-0 opacity-60"
        aria-hidden
      />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Itim&display=swap');
        .font-itim {
          font-family: 'Itim', cursive, sans-serif;
        }
      `}</style>

      <div className="container-wide relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mx-auto max-w-2xl text-center">
          {/* Badge Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full bg-caramel/20 px-3.5 py-1 text-xs font-semibold text-cocoa-800 sm:text-sm">
            <span className="h-2 w-2 rounded-full bg-caramel"></span>
            <span className="eyebrow-script !m-0">Kenapa Pilih Kami</span>
          </div>

          <h2
            data-reveal
            className="title-1 mt-2 text-2xl  tracking-tight text-cocoa-900 sm:text-3xl lg:text-4xl"
          >
            Alasan Pelanggan <br />
            Selalu Kembali Lagi
          </h2>

          <p
            data-reveal
            className="font-section3-p mt-3 text-center text-base leading-relaxed text-cocoa-700/85 sm:text-lg lg:text-xl"
          >
            Dari bahan pilihan hingga rasa yang dibuat dengan penuh perhatian,
            setiap roti hadir dengan cita rasa rumahan yang membuat ingin
            mencoba lagi.
          </p>
        </div>

        <div
          data-stagger
          className="mt-10 sm:mt-12 lg:mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {/* Pembungkus luar = anak langsung [data-stagger]; GSAP menghapus
              transform-nya setelah reveal, jadi kemiringan diletakkan di DALAM. */}
          {reasons.map((r, i) => (
            <div key={r.title} className="h-full">
              <div
                style={{ rotate: TILT[i % TILT.length] }}
                className="group relative h-full rounded-[1.75rem] bg-paper-50 px-6 pb-8 pt-10 sm:px-7 text-center shadow-lift ring-1 ring-cocoa-700/10 transition-transform duration-300 hover:-translate-y-2 hover:rotate-0"
              >
                {/* Selotip kertas di ujung atas kartu */}
                <span
                  className="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 -rotate-3 rounded-[3px] bg-caramel/25 ring-1 ring-caramel/30"
                  aria-hidden
                />

                <span className="mx-auto mb-6 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-caramel/15 text-caramel ring-1 ring-caramel/25 transition-colors duration-300 group-hover:bg-cocoa-800 group-hover:text-paper-50 group-hover:ring-cocoa-800">
                  <r.icon
                    className="h-8 w-8 sm:h-9 sm:w-9"
                    strokeWidth={1.8}
                    aria-hidden
                  />
                </span>

                <h3 className="font-heading text-lg sm:text-xl text-cocoa-800">
                  {r.title}
                </h3>
                <p className="mt-2.5 font-text text-sm leading-relaxed text-cocoa-700/80 font-itim text-justify">
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
