import { useRef } from 'react'
import { MapPin, Clock, Phone, Instagram, MessageCircle } from 'lucide-react'
import { CONTACT, LOCATION } from '../config/contact'
import { generalOrderUrl } from '../lib/whatsapp'
import { useScrolly } from '../hooks/useScrolly'

export default function LocationContact() {
  const sectionRef = useRef<HTMLElement>(null)
  useScrolly(sectionRef)

  return (
    <section id="kontak" ref={sectionRef} className="bg-cream-dark/70 py-20 lg:py-28">
      <div className="container-warm">
        <div className="mx-auto max-w-2xl text-center">
          <span data-reveal className="eyebrow mb-4">
            Lokasi &amp; Kontak
          </span>
          <h2 data-reveal className="text-display-md">
            Mampir atau hubungi kami
          </h2>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {/* Peta Google Maps interaktif (bisa zoom in/out, geser, satelit) */}
          <div
            data-reveal
            data-reveal-x="-60"
            className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-warm-lg ring-1 ring-brown-medium/10"
          >
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
              className="absolute bottom-4 left-4 z-10 inline-flex items-center gap-1.5 rounded-xl bg-cream/95 px-4 py-2 text-sm font-semibold text-brown-dark shadow-warm backdrop-blur-sm transition-transform hover:-translate-y-0.5"
            >
              <MapPin className="h-4 w-4 text-terracotta" aria-hidden />
              Buka di Google Maps →
            </a>
          </div>

          {/* Detail kontak */}
          <div className="flex flex-col gap-5">
            <div data-reveal className="rounded-3xl bg-cream p-6 shadow-warm">
              <div className="flex gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-terracotta/15 text-terracotta">
                  <MapPin className="h-6 w-6" aria-hidden />
                </span>
                <div>
                  <h3 className="font-display text-lg text-brown-dark">Alamat</h3>
                  <p className="mt-1 text-brown-deep/80">{LOCATION.addressLine}</p>
                  <p className="text-brown-deep/80">{LOCATION.city}</p>
                </div>
              </div>
            </div>

            <div data-reveal className="rounded-3xl bg-cream p-6 shadow-warm">
              <div className="flex gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-terracotta/15 text-terracotta">
                  <Clock className="h-6 w-6" aria-hidden />
                </span>
                <div className="flex-1">
                  <h3 className="font-display text-lg text-brown-dark">Jam Operasional</h3>
                  <ul className="mt-2 space-y-1">
                    {LOCATION.hours.map((h) => (
                      <li key={h.day} className="flex justify-between gap-4 text-sm text-brown-deep/80">
                        <span>{h.day}</span>
                        <span className="font-semibold">{h.time}</span>
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
                className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3.5 text-sm font-semibold text-white shadow transition-transform hover:-translate-y-0.5"
              >
                <MessageCircle className="h-5 w-5" aria-hidden /> WhatsApp
              </a>
              <a
                href={CONTACT.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-[#E1306C] to-[#F77737] px-4 py-3.5 text-sm font-semibold text-white shadow transition-transform hover:-translate-y-0.5"
              >
                <Instagram className="h-5 w-5" aria-hidden /> Instagram
              </a>
              <a
                href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}
                className="flex items-center justify-center gap-2 rounded-2xl bg-brown-medium px-4 py-3.5 text-sm font-semibold text-cream shadow transition-transform hover:-translate-y-0.5"
              >
                <Phone className="h-5 w-5" aria-hidden /> Telepon
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
