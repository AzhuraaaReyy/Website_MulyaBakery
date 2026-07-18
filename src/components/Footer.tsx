import { useRef } from 'react'
import { Croissant, MessageCircle, Instagram, Phone, Mail, MapPin } from 'lucide-react'
import { BRAND, CONTACT, LOCATION } from '../config/contact'
import { generalOrderUrl } from '../lib/whatsapp'
import { useScrolly } from '../hooks/useScrolly'

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null)
  useScrolly(footerRef)
  const year = new Date().getFullYear()

  return (
    <footer ref={footerRef} className="relative overflow-hidden bg-cocoa-800 text-paper-200/85">
      {/* CTA terakhir — kartu caramel hangat di atas latar espresso */}
      <div data-reveal className="container-wide relative -mb-2 pt-20">
        <div
          className="rounded-[2rem] px-8 py-14 text-center shadow-cocoa-lg"
          style={{
            background:
              'radial-gradient(120% 140% at 20% 0%, #F6E7C6 0%, #EDCB92 48%, #DFAA63 100%)',
          }}
        >
          <span className="eyebrow-script">Sampai jumpa di dapur kami</span>
          <h2 className="mt-2 font-heading text-3xl text-cocoa-800 sm:text-4xl">
            Yuk, cicipi roti hangat kami hari ini!
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-text leading-relaxed text-cocoa-700/85">
            Follow Instagram untuk update menu harian, atau langsung chat WhatsApp untuk memesan.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={generalOrderUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cocoa w-full sm:w-auto"
            >
              <MessageCircle className="h-5 w-5" aria-hidden /> Pesan via WhatsApp
            </a>
            <a
              href={CONTACT.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cocoa-outline w-full sm:w-auto"
            >
              <Instagram className="h-5 w-5" aria-hidden /> Follow Instagram
            </a>
          </div>
        </div>
      </div>

      <div data-stagger className="container-wide relative grid gap-10 py-20 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-caramel text-cocoa-900">
              <Croissant className="h-5 w-5" aria-hidden />
            </span>
            <span className="font-heading text-xl text-paper-50">{BRAND.name}</span>
          </div>
          <p className="mt-5 max-w-sm font-text text-sm leading-relaxed text-paper-200/70">
            {BRAND.tagline} Terima kasih sudah mempercayakan momen hangatmu pada kami sejak{' '}
            {BRAND.established}.
          </p>
        </div>

        {/* Kontak */}
        <div>
          <h3 className="font-heading text-lg text-paper-50">Kontak</h3>
          <ul className="mt-4 space-y-3 font-text text-sm">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-caramel" aria-hidden />
              <span>
                {LOCATION.addressLine}, {LOCATION.city}
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-caramel" aria-hidden />
              <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`} className="hover:text-paper-50">
                {CONTACT.whatsappDisplay}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-caramel" aria-hidden />
              <a href={`mailto:${CONTACT.email}`} className="hover:text-paper-50">
                {CONTACT.email}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Instagram className="h-4 w-4 shrink-0 text-caramel" aria-hidden />
              <a
                href={CONTACT.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-paper-50"
              >
                @{CONTACT.instagram}
              </a>
            </li>
          </ul>
        </div>

        {/* Jam buka */}
        <div>
          <h3 className="font-heading text-lg text-paper-50">Jam Buka</h3>
          <ul className="mt-4 space-y-2.5 font-text text-sm">
            {LOCATION.hours.map((h) => (
              <li key={h.day} className="flex flex-col">
                <span className="text-paper-200/60">{h.day}</span>
                <span className="font-extrabold text-paper-200/90">{h.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="relative border-t border-paper-200/10 py-6">
        <div className="container-wide flex flex-col items-center justify-between gap-2 text-center font-text text-xs text-paper-200/60 sm:flex-row sm:text-left">
          <p>
            © {year} {BRAND.name}. Dibuat dengan cinta &amp; sedikit taburan tepung. 🍞
          </p>
          <p>Roti rumahan · Fresh setiap hari · Tanpa pengawet</p>
        </div>
      </div>
    </footer>
  )
}
