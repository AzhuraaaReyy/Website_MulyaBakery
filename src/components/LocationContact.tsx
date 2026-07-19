import { useRef } from "react";
import { MapPin, Clock, Phone, Instagram, MessageCircle } from "lucide-react";
import { CONTACT, LOCATION } from "../config/contact";
import { generalOrderUrl } from "../lib/whatsapp";
import TornPaper from "./TornPaper";
import Decor from "./Decor";
import { useScrolly } from "../hooks/useScrolly";

export default function LocationContact() {
  const sectionRef = useRef<HTMLElement>(null);
  useScrolly(sectionRef);

  return (
    <section
      id="kontak"
      ref={sectionRef}
      className="relative overflow-hidden bg-paper-200 pb-40 pt-24 lg:pb-48 lg:pt-32"
    >
      <div className="paper-grain pointer-events-none absolute inset-0 opacity-60" aria-hidden />

      {/* Aksen bahan cut-out */}
      <Decor src="/images/decor/roti6.png" parallax={0.2} rotate={18}
        className="-left-10 bottom-40 hidden w-28 lg:block lg:w-36" />
      <Decor src="/images/decor/roti6.png" parallax={-0.2} rotate={-22}
        className="-right-8 top-24 hidden w-30 lg:block lg:w-[200px]" />

      <div className="container-wide relative">
        <div className="mx-auto max-w-2xl text-center">
          <span data-reveal className="eyebrow-script">
            Lokasi &amp; kontak
          </span>
          <h2 data-reveal className="title-1 mt-2">
            Mampir atau hubungi kami
          </h2>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {/* Peta Google Maps interaktif — dibingkai kertas */}
          <div
            data-reveal
            data-reveal-x="-60"
            className="rounded-[1.8rem] bg-paper-50 p-3 shadow-cocoa-lg ring-1 ring-cocoa-700/10"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.3rem]">
              <iframe
                title={`Peta lokasi ${LOCATION.mapsQuery}`}
                src={
                  LOCATION.mapEmbedSrc ||
                  `https://www.google.com/maps?q=${encodeURIComponent(LOCATION.mapsQuery)}&z=16&hl=id&output=embed`
                }
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
              {/* Tombol buka di Google Maps (tidak menghalangi interaksi peta) */}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(LOCATION.mapsQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 left-4 z-10 inline-flex items-center gap-1.5 rounded-xl bg-paper-50/95 px-4 py-2 font-text text-sm font-bold text-cocoa-800 shadow-lift backdrop-blur-sm transition-transform hover:-translate-y-0.5"
              >
                <MapPin className="h-4 w-4 text-caramel" aria-hidden />
                Buka di Google Maps →
              </a>
            </div>
          </div>

          {/* Detail kontak */}
          <div className="flex flex-col gap-5">
            <div
              data-reveal
              className="rounded-[1.6rem] bg-paper-50 p-6 shadow-lift ring-1 ring-cocoa-700/10"
            >
              <div className="flex gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-caramel/15 text-caramel ring-1 ring-caramel/25">
                  <MapPin className="h-6 w-6" strokeWidth={1.8} aria-hidden />
                </span>
                <div>
                  <h3 className="font-heading text-lg text-cocoa-800">Alamat</h3>
                  <p className="mt-1 font-text text-cocoa-700/85">
                    {LOCATION.addressLine}
                  </p>
                  <p className="font-text text-cocoa-700/85">{LOCATION.city}</p>
                </div>
              </div>
            </div>

            <div
              data-reveal
              className="rounded-[1.6rem] bg-paper-50 p-6 shadow-lift ring-1 ring-cocoa-700/10"
            >
              <div className="flex gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-caramel/15 text-caramel ring-1 ring-caramel/25">
                  <Clock className="h-6 w-6" strokeWidth={1.8} aria-hidden />
                </span>
                <div className="flex-1">
                  <h3 className="font-heading text-lg text-cocoa-800">
                    Jam Operasional
                  </h3>
                  <ul className="mt-2.5 space-y-1.5">
                    {LOCATION.hours.map((h) => (
                      <li
                        key={h.day}
                        className="flex justify-between gap-4 font-text text-sm text-cocoa-700/85"
                      >
                        <span>{h.day}</span>
                        <span className="font-extrabold text-cocoa-800">
                          {h.time}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div data-reveal className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <a
                href={generalOrderUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3.5 font-text text-sm font-bold text-white shadow-lift transition-transform hover:-translate-y-0.5"
              >
                <MessageCircle className="h-5 w-5" aria-hidden /> WhatsApp
              </a>
              <a
                href={CONTACT.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-[#E1306C] to-[#F77737] px-4 py-3.5 font-text text-sm font-bold text-white shadow-lift transition-transform hover:-translate-y-0.5"
              >
                <Instagram className="h-5 w-5" aria-hidden /> Instagram
              </a>
              <a
                href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}
                className="flex items-center justify-center gap-2 rounded-2xl bg-cocoa-800 px-4 py-3.5 font-text text-sm font-bold text-paper-50 shadow-lift transition-transform hover:-translate-y-0.5"
              >
                <Phone className="h-5 w-5" aria-hidden /> Telepon
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Sobekan ke FAQ (paper-100) */}
      <TornPaper fill="#F7F0E1" core="#FCF8F0" seed="kontak-tear" height={80} />
    </section>
  );
}
