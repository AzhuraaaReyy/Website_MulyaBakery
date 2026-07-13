import { useRef } from 'react'
import { motion } from 'framer-motion'
import PlaceholderImage from './PlaceholderImage'
import { useScrolly } from '../hooks/useScrolly'

// Item galeri (foto produk & proses).
// Taruh foto di public/images/ dengan nama sesuai `image`; bila belum ada,
// otomatis fallback ke placeholder gradient.
const items = [
  { id: 'g1', label: 'Adonan Segar', image: '/images/galeri-adonan.jpg', span: 'sm:col-span-2 sm:row-span-2' },
  { id: 'g2', label: 'Roti Panggang', image: '/images/galeri-roti-panggang.jpg' },
  { id: 'g3', label: 'Isian Coklat', image: '/images/galeri-isian-coklat.jpg' },
  { id: 'g4', label: 'Croissant', image: '/images/galeri-croissant.jpg' },
  { id: 'g5', label: 'Oven Hangat', image: '/images/galeri-oven.jpg' },
  { id: 'g6', label: 'Siap Diantar', image: '/images/galeri-siap-diantar.jpg', span: 'sm:col-span-2' },
]

export default function Gallery() {
  const sectionRef = useRef<HTMLElement>(null)
  useScrolly(sectionRef)

  return (
    <section id="galeri" ref={sectionRef} className="relative overflow-hidden bg-cream-dark/70 py-20 lg:py-28">
      {/* Dekorasi parallax latar */}
      <div data-parallax="0.25" className="dot-grid pointer-events-none absolute right-8 top-10 hidden h-32 w-32 opacity-60 lg:block" aria-hidden />
      <div data-parallax="-0.18" className="pointer-events-none absolute -left-10 bottom-10 hidden h-56 w-56 rounded-full bg-terracotta/10 blur-3xl lg:block" aria-hidden />

      <div className="container-warm relative">
        <div className="mx-auto max-w-2xl text-center">
          <span data-reveal className="eyebrow mb-4">
            Galeri
          </span>
          <h2 data-reveal className="text-display-md">
            Intip momen di dapur kami
          </h2>
        </div>

        <div
          data-stagger
          className="mt-12 grid auto-rows-[160px] grid-cols-2 gap-4 sm:auto-rows-[180px] sm:grid-cols-4"
        >
          {items.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className={`group relative overflow-hidden rounded-2xl shadow-warm ${item.span ?? ''}`}
            >
              <PlaceholderImage
                alt={item.label}
                src={item.image}
                label={item.label}
                seed={item.id}
                rounded="rounded-2xl"
                className="h-full w-full"
              />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-brown-deep/60 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="font-display text-lg font-semibold text-cream">{item.label}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
