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
    <footer ref={footerRef} className="bg-brown-deep text-cream/80">
      {/* CTA terakhir */}
      <div data-reveal className="container-warm -mb-2 pt-16">
        <div className="rounded-[2rem] bg-gradient-to-br from-terracotta to-brown-medium px-8 py-12 text-center shadow-warm-lg">
          <h2 className="font-display text-3xl text-cream sm:text-4xl">
            Yuk, cicipi roti hangat kami hari ini!
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-cream/90">
            Follow Instagram untuk update menu harian, atau langsung chat WhatsApp untuk memesan.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={generalOrderUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-cream px-7 py-3.5 font-semibold text-brown-dark transition-transform hover:-translate-y-0.5 sm:w-auto"
            >
              <MessageCircle className="h-5 w-5" aria-hidden /> Pesan via WhatsApp
            </a>
            <a
              href={CONTACT.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-cream/70 px-7 py-3.5 font-semibold text-cream transition-colors hover:bg-cream/10 sm:w-auto"
            >
              <Instagram className="h-5 w-5" aria-hidden /> Follow Instagram
            </a>
          </div>
        </div>
      </div>

      <div data-stagger className="container-warm grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-terracotta text-cream">
              <Croissant className="h-5 w-5" aria-hidden />
            </span>
            <span className="font-display text-xl font-semibold text-cream">{BRAND.name}</span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-cream/70">
            {BRAND.tagline} Terima kasih sudah mempercayakan momen hangatmu pada kami sejak{' '}
            {BRAND.established}.
          </p>
        </div>

        {/* Kontak */}
        <div>
          <h3 className="font-display text-lg text-cream">Kontak</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" aria-hidden />
              <span>{LOCATION.addressLine}, {LOCATION.city}</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-terracotta" aria-hidden />
              <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`} className="hover:text-cream">
                {CONTACT.whatsappDisplay}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-terracotta" aria-hidden />
              <a href={`mailto:${CONTACT.email}`} className="hover:text-cream">
                {CONTACT.email}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Instagram className="h-4 w-4 shrink-0 text-terracotta" aria-hidden />
              <a href={CONTACT.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-cream">
                @{CONTACT.instagram}
              </a>
            </li>
          </ul>
        </div>

        {/* Jam buka */}
        <div>
          <h3 className="font-display text-lg text-cream">Jam Buka</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {LOCATION.hours.map((h) => (
              <li key={h.day} className="flex flex-col">
                <span className="text-cream/60">{h.day}</span>
                <span className="font-semibold text-cream/90">{h.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10 py-6">
        <div className="container-warm flex flex-col items-center justify-between gap-2 text-center text-xs text-cream/60 sm:flex-row sm:text-left">
          <p>
            © {year} {BRAND.name}. Dibuat dengan cinta &amp; sedikit taburan tepung. 🍞
          </p>
          <p>Roti rumahan · Fresh setiap hari · Tanpa pengawet</p>
        </div>
      </div>
    </footer>
  )
}
