import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu as MenuIcon, X, Croissant, MessageCircle } from 'lucide-react'
import { BRAND } from '../config/contact'
import { generalOrderUrl } from '../lib/whatsapp'

const NAV_LINKS = [
  { label: 'Tentang', href: '#tentang' },
  { label: 'Menu', href: '#menu' },
  { label: 'Keunggulan', href: '#keunggulan' },
  { label: 'Testimoni', href: '#testimoni' },
  { label: 'Cara Pesan', href: '#cara-pesan' },
  { label: 'Kontak', href: '#kontak' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-cream/85 shadow-warm backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <nav className="container-warm flex items-center justify-between py-4">
        <a href="#hero" className="flex items-center gap-2" aria-label={`${BRAND.name} beranda`}>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-terracotta text-cream">
            <Croissant className="h-5 w-5" aria-hidden />
          </span>
          <span className="font-display text-xl font-semibold text-brown-dark">{BRAND.name}</span>
        </a>

        {/* Desktop links */}
        <ul className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-semibold text-brown-deep/80 transition-colors hover:text-terracotta"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href={generalOrderUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-2 rounded-full bg-brown-medium px-5 py-2.5 text-sm font-semibold text-cream transition-all hover:-translate-y-0.5 hover:bg-brown-dark lg:inline-flex"
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          Pesan Sekarang
        </a>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-full p-2 text-brown-dark lg:hidden"
          aria-label={open ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden bg-cream/95 backdrop-blur-md lg:hidden"
          >
            <ul className="container-warm flex flex-col gap-1 py-4">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-3 py-3 text-base font-semibold text-brown-deep hover:bg-cream-dark"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="mt-2">
                <a
                  href={generalOrderUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full"
                >
                  <MessageCircle className="h-5 w-5" aria-hidden />
                  Pesan Sekarang
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
