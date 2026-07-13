import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react'
import PlaceholderImage from './PlaceholderImage'
import { testimonials } from '../data/testimonials'
import { useScrolly } from '../hooks/useScrolly'

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`Rating ${rating} dari 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? 'fill-terracotta text-terracotta' : 'text-brown-medium/25'}`}
          aria-hidden
        />
      ))}
    </div>
  )
}

// Posisi avatar kecil di sekitar avatar utama (cluster ala referensi).
const CLUSTER_POS = [
  { top: '4%', left: '14%', size: 'h-14 w-14' },
  { top: '10%', left: '72%', size: 'h-16 w-16' },
  { top: '62%', left: '4%', size: 'h-12 w-12' },
  { top: '70%', left: '68%', size: 'h-16 w-16' },
]

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null)
  useScrolly(sectionRef)

  const [index, setIndex] = useState(0)
  const count = testimonials.length
  const go = (dir: number) => setIndex((i) => (i + dir + count) % count)
  const t = testimonials[index]
  const others = testimonials.filter((_, i) => i !== index)

  return (
    <section id="testimoni" ref={sectionRef} className="bg-transparent py-20 lg:py-28">
      <div className="container-warm">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Kiri: cluster avatar + avatar utama (blob) */}
          <div data-reveal data-reveal-x="-60" className="order-2 lg:order-1">
            <div className="relative mx-auto h-[360px] w-full max-w-md">
              {/* Avatar kecil (pelanggan lain) tersebar */}
              {others.map((o, i) => {
                const pos = CLUSTER_POS[i % CLUSTER_POS.length]
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setIndex(testimonials.findIndex((x) => x.id === o.id))}
                    aria-label={`Lihat testimoni ${o.name}`}
                    className={`absolute ${pos.size} overflow-hidden rounded-full shadow-warm ring-4 ring-cream transition-transform hover:scale-110`}
                    style={{ top: pos.top, left: pos.left }}
                  >
                    <PlaceholderImage alt={`Foto ${o.name}`} src={o.avatar} seed={o.id} rounded="rounded-full" className="h-full w-full" />
                  </button>
                )
              })}

              {/* Avatar utama dalam bentuk blob organik */}
              <div className="blob-shape-2 absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 bg-cream-dark p-2 shadow-warm-lg">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="blob-shape-2 h-full w-full overflow-hidden"
                  >
                    <PlaceholderImage alt={`Foto ${t.name}`} src={t.avatar} seed={t.id} rounded="blob-shape-2" className="h-full w-full" />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Kanan: kutipan + kontrol */}
          <div className="order-1 lg:order-2">
            <span data-reveal className="eyebrow mb-4">
              Testimoni
            </span>
            <h2 data-reveal className="text-display-md">
              Kata mereka yang sudah mencoba
            </h2>

            <div data-reveal className="relative mt-6">
              <Quote className="absolute -left-2 -top-3 h-12 w-12 text-brown-medium/15" aria-hidden />
              <div className="relative min-h-[190px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  >
                    <Stars rating={t.rating} />
                    <p className="mt-4 font-display text-xl leading-relaxed text-brown-dark sm:text-2xl">
                      “{t.quote}”
                    </p>
                    <div className="mt-5">
                      <p className="font-bold text-brown-dark">{t.name}</p>
                      <p className="text-sm text-brown-deep/70">{t.role}</p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Kontrol carousel */}
            <div data-reveal className="mt-6 flex items-center justify-between">
              <div className="flex gap-2" role="tablist" aria-label="Pilih testimoni">
                {testimonials.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Testimoni ${i + 1}`}
                    aria-selected={i === index}
                    role="tab"
                    className={`h-2.5 rounded-full transition-all ${
                      i === index ? 'w-7 bg-terracotta' : 'w-2.5 bg-brown-medium/30 hover:bg-brown-medium/50'
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Testimoni sebelumnya"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-cream-dark text-brown-dark shadow transition-colors hover:bg-brown-medium hover:text-cream"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Testimoni berikutnya"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-cream-dark text-brown-dark shadow transition-colors hover:bg-brown-medium hover:text-cream"
                >
                  <ChevronRight className="h-5 w-5" aria-hidden />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
