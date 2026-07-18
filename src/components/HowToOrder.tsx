import { useRef } from "react";
import {
  ClipboardList,
  MessageCircle,
  CreditCard,
  PackageCheck,
} from "lucide-react";
import { generalOrderUrl } from "../lib/whatsapp";
import { useScrolly } from "../hooks/useScrolly";
import { gsap } from "../lib/gsap";
import TornPaper from "./TornPaper";
import Decor from "./Decor";

const steps = [
  {
    icon: ClipboardList,
    title: "Pilih Menu",
    desc: "Lihat menu & produk unggulan, tentukan roti favoritmu.",
  },
  {
    icon: MessageCircle,
    title: "Hubungi via WhatsApp",
    desc: "Klik tombol pesan — chat sudah terisi otomatis, tinggal kirim.",
  },
  {
    icon: CreditCard,
    title: "Konfirmasi & Bayar",
    desc: "Kami konfirmasi ketersediaan & total. Bayar transfer/e-wallet/COD.",
  },
  {
    icon: PackageCheck,
    title: "Ambil / Diantar",
    desc: "Roti hangat siap diambil di toko atau kami antar ke rumahmu.",
  },
];

export default function HowToOrder() {
  const sectionRef = useRef<HTMLElement>(null);

  // Scrollytelling khusus: garis timeline "menggambar" mengikuti scroll.
  useScrolly(sectionRef, () => {
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

  return (
    <section
      id="cara-pesan"
      ref={sectionRef}
      className="relative overflow-hidden bg-paper-100 pb-40 pt-24 lg:pb-48 lg:pt-32"
    >
      <div className="paper-grain pointer-events-none absolute inset-0 opacity-50" aria-hidden />

      {/* Aksen bahan cut-out */}
      <Decor src="/images/decor/gandum.png" parallax={-0.22} rotate={-18}
        className="-right-12 top-20 hidden w-28 lg:block lg:w-36" />
      <Decor src="/images/decor/bunga.png" parallax={0.24} rotate={20}
        className="-left-8 bottom-44 hidden w-20 lg:block lg:w-28" />

      <div className="container-wide relative">
        <div className="mx-auto max-w-2xl text-center">
          <span data-reveal className="eyebrow-script">
            Cara pemesanan
          </span>
          <h2 data-reveal className="title-1 mt-2">
            Pesan roti semudah kirim pesan
          </h2>
          <p data-reveal className="mt-5 font-text text-lg leading-relaxed text-cocoa-700/85">
            Empat langkah santai, tanpa ribet aplikasi.
          </p>
        </div>

        <div data-timeline-track className="relative mt-16">
          {/* Garis penghubung timeline (desktop) — di-scrub saat scroll */}
          <div
            data-timeline
            className="absolute left-0 right-0 top-9 hidden h-[3px] rounded-full bg-gradient-to-r from-caramel/30 via-caramel to-caramel/30 lg:block"
            aria-hidden
          />
          <ol data-stagger className="grid gap-9 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <li key={step.title} className="relative text-center">
                <div className="relative mx-auto mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-cocoa-800 text-paper-50 shadow-cocoa ring-[5px] ring-paper-100">
                  <step.icon className="h-7 w-7" strokeWidth={1.8} aria-hidden />
                  <span className="absolute -right-1.5 -top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-caramel font-heading text-sm text-cocoa-900 ring-[3px] ring-paper-100">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-heading text-lg text-cocoa-800">
                  {step.title}
                </h3>
                <p className="mx-auto mt-2 max-w-[230px] font-text text-sm leading-relaxed text-cocoa-700/80">
                  {step.desc}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <div data-reveal className="mt-16 text-center">
          <a
            href={generalOrderUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-cocoa"
          >
            <MessageCircle className="h-5 w-5" aria-hidden />
            Mulai Pesan Sekarang
          </a>
        </div>
      </div>

      {/* Sobekan ke Kontak (paper-200) */}
      <TornPaper fill="#EFE3CD" core="#FCF8F0" seed="cara-tear" height={82} />
    </section>
  );
}
