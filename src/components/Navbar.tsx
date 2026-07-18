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
        scrolled ? 'bg-paper-100/90 shadow-cocoa backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <nav className="container-wide flex items-center justify-between py-4">
        <a href="#hero" className="flex items-center gap-2.5" aria-label={`${BRAND.name} beranda`}>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cocoa-800 text-paper-50">
            <Croissant className="h-5 w-5" aria-hidden />
          </span>
          <span className="font-heading text-xl text-cocoa-800">{BRAND.name}</span>
        </a>

        {/* Desktop links */}
        <ul className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="font-text text-sm font-bold text-cocoa-700/85 transition-colors hover:text-caramel"
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
          className="hidden items-center gap-2 rounded-full bg-cocoa-800 px-5 py-2.5 font-text text-sm font-bold text-paper-50 transition-all hover:-translate-y-0.5 hover:bg-cocoa-900 lg:inline-flex"
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          Pesan Sekarang
        </a>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-full p-2 text-cocoa-800 lg:hidden"
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
            className="overflow-hidden bg-paper-100/95 backdrop-blur-md lg:hidden"
          >
            <ul className="container-wide flex flex-col gap-1 py-4">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-3 py-3 font-text text-base font-bold text-cocoa-800 hover:bg-paper-200"
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
                  className="btn-cocoa w-full"
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
