import { useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { MessageCircle, ArrowRight, Star, Wheat } from 'lucide-react'
import { BRAND } from '../config/contact'
import { generalOrderUrl } from '../lib/whatsapp'
import { useScrolly } from '../hooks/useScrolly'
import PlaceholderImage from './PlaceholderImage'
import WheatSprig from './WheatSprig'
import { products } from '../data/products'

// Foto produk untuk visual Hero (produk pertama).
const heroProduct = products[0]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

function itemVariants(reduce: boolean | null) {
  return {
    hidden: { opacity: 0, y: reduce ? 0 : 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
  }
}

export default function Hero() {
  const reduce = useReducedMotion()
  const item = itemVariants(reduce)
  const sectionRef = useRef<HTMLElement>(null)
  useScrolly(sectionRef)

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative overflow-hidden bg-gradient-to-b from-cream/70 to-cream-dark/60 pt-28 pb-32 sm:pt-32"
    >
      {/* Shape organik besar di belakang foto (kanan atas) — mengecil di mobile */}
      <div
        data-parallax="0.12"
        className="blob-shape-2 pointer-events-none absolute -right-20 -top-16 h-[300px] w-[300px] bg-gradient-to-br from-[#EAD6B0]/80 to-terracotta/25 sm:-right-28 sm:-top-24 sm:h-[460px] sm:w-[460px] lg:-right-32 lg:-top-28 lg:h-[560px] lg:w-[560px]"
        aria-hidden
      />
      <div
        data-parallax="0.28"
        className="dot-grid pointer-events-none absolute right-10 top-44 hidden h-32 w-32 opacity-60 lg:block"
        aria-hidden
      />

      <div className="container-warm relative grid items-center gap-12 lg:grid-cols-2">
        {/* Teks */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative z-10 text-center lg:text-left"
        >
          <motion.span variants={item} className="eyebrow mb-5">
            <Wheat className="h-4 w-4" aria-hidden /> Bakery Rumahan · Est. {BRAND.established}
          </motion.span>

          <motion.h1 variants={item} className="text-display-xl">
            <span className="block">Roti Hangat,</span>
            <span className="mt-1 block text-terracotta">Bikin Bahagia</span>
          </motion.h1>

          <motion.p variants={item} className="mx-auto mt-6 max-w-lg text-lg text-brown-deep/80 lg:mx-0">
            {BRAND.name} membuat roti fresh setiap hari dari dapur kecil kami — bahan pilihan, tanpa
            pengawet. Setiap gigitan terasa seperti buatan rumah.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start"
          >
            <a
              href={generalOrderUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brown-dark px-8 py-4 text-base font-semibold text-cream shadow-warm transition-all duration-300 hover:-translate-y-0.5 hover:bg-brown-deep hover:shadow-warm-lg sm:w-auto"
            >
              <MessageCircle className="h-5 w-5" aria-hidden />
              Pesan Sekarang
            </a>
            <a
              href="#menu"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-base font-semibold text-brown-dark transition-colors hover:text-terracotta sm:w-auto"
            >
              Lihat Menu
              <ArrowRight className="h-5 w-5" aria-hidden />
            </a>
          </motion.div>

          {/* Social proof + flourish gandum */}
          <motion.div
            variants={item}
            className="mt-8 flex items-center justify-center gap-3 lg:justify-start"
          >
            <WheatSprig className="hidden h-8 w-8 text-brown-medium/70 sm:block" />
            <div className="flex" aria-hidden>
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-5 w-5 fill-terracotta text-terracotta" />
              ))}
            </div>
            <p className="text-sm font-medium text-brown-deep/70">
              <span className="font-bold text-brown-dark">4.9/5</span> dari 200+ pelanggan senang
            </p>
          </motion.div>
        </motion.div>

        {/* Visual: foto dalam bentuk organik + shape berlapis */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto aspect-square w-full max-w-[17rem] sm:max-w-md lg:max-w-lg"
        >
          {/* Shape aksen berlapis di belakang foto */}
          <div className="blob-shape absolute -right-3 -top-3 h-[88%] w-[88%] bg-terracotta/20" aria-hidden />
          <div className="blob-shape-3 absolute -left-5 bottom-1 h-[55%] w-[55%] bg-brown-medium/15" aria-hidden />

          {/* Foto utama (mengambang lembut) */}
          <motion.div
            className="relative h-full w-full"
            animate={reduce ? {} : { y: [0, -14, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="blob-shape-3 h-full w-full overflow-hidden shadow-warm-lg ring-[6px] ring-cream sm:ring-[10px]">
              <PlaceholderImage
                alt={`Foto ${heroProduct.name}`}
                src={heroProduct.image}
                label={heroProduct.name}
                seed={heroProduct.id}
                rounded="blob-shape-3"
                className="h-full w-full"
              />
            </div>
          </motion.div>

          {/* Taburan tepung mengelilingi */}
          {!reduce &&
            [0, 1, 2, 3, 4].map((i) => (
              <motion.span
                key={i}
                className="absolute h-2.5 w-2.5 rounded-full bg-cream shadow"
                style={{
                  top: `${16 + Math.sin(i) * 30 + i * 7}%`,
                  left: `${10 + Math.cos(i * 1.6) * 30 + i * 3}%`,
                }}
                animate={{ y: [0, -10, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                aria-hidden
              />
            ))}

          {/* Badge mengambang */}
          <motion.div
            className="absolute -bottom-2 -left-2 flex items-center gap-2 rounded-2xl bg-cream px-4 py-3 shadow-warm sm:-left-5"
            animate={reduce ? {} : { y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="text-2xl" aria-hidden>
              🍞
            </span>
            <div className="text-left">
              <p className="text-sm font-bold text-brown-dark">Fresh Harian</p>
              <p className="text-xs text-brown-deep/70">Dipanggang tiap pagi</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Dekorasi bawah: gelombang + siluet gandum (versi bakery dari referensi) */}
      <BottomWave />
    </section>
  )
}

/** Gelombang dekoratif di bawah hero + siluet gandum di kiri (ala referensi). */
function BottomWave() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 leading-[0]" aria-hidden>
      <svg viewBox="0 0 1440 140" preserveAspectRatio="none" className="block h-24 w-full sm:h-32">
        <path
          d="M0 70 C240 20 480 20 720 60 C960 100 1200 120 1440 70 L1440 140 L0 140 Z"
          fill="#8B5E3C"
          fillOpacity="0.16"
        />
        <path
          d="M0 100 C300 60 560 70 720 92 C980 128 1200 130 1440 96 L1440 140 L0 140 Z"
          fill="#5C3A21"
          fillOpacity="0.16"
        />
        {/* siluet tangkai gandum */}
        <g stroke="#5C3A21" strokeOpacity="0.22" strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M120 138 V96" />
          <path d="M120 104c-8-2-13-7-13-13 7 0 13 5 13 12M120 104c8-2 13-7 13-13-7 0-13 5-13 12" />
          <path d="M150 138 V104" />
          <path d="M150 110c-6-1-10-5-10-10 5 0 10 4 10 9M150 110c6-1 10-5 10-10-5 0-10 4-10 9" />
        </g>
      </svg>
    </div>
  )
}
