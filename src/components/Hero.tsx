import { useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { MessageCircle, ArrowRight, Star } from 'lucide-react'
import { BRAND } from '../config/contact'
import { generalOrderUrl } from '../lib/whatsapp'
import { useScrolly } from '../hooks/useScrolly'
import PlaceholderImage from './PlaceholderImage'
import TornPaper from './TornPaper'
import Decor from './Decor'
import { products } from '../data/products'

// Foto produk untuk visual Hero (produk pertama).
const heroProduct = products[0]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11, delayChildren: 0.08 } },
}

function itemVariants(reduce: boolean | null) {
  return {
    hidden: { opacity: 0, y: reduce ? 0 : 26 },
    show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const } },
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
      className="relative overflow-hidden pb-40 pt-32 sm:pt-36 lg:pb-48 lg:pt-40"
      style={{
        // Gradasi hangat cokelat–cream: terang di kiri-atas, mengarah ke caramel.
        background:
          'radial-gradient(125% 95% at 14% 8%, #FDFAF3 0%, #F6E7C6 34%, #EDCB92 62%, #DFAA63 100%)',
      }}
    >
      {/* Tekstur kertas halus di atas gradasi */}
      <div className="paper-grain pointer-events-none absolute inset-0 opacity-70" aria-hidden />

      {/* ── Aksen bahan cut-out (kolase ala referensi) ──────────────────────
          Taruh PNG transparan di public/images/decor/. Selama file belum ada,
          elemen ini otomatis tidak dirender sama sekali. */}
      
      <Decor src="/images/decor/roti4.png" parallax={0.26} rotate={8}
        className="-bottom-[90px] -left-[25px] hidden w-20 lg:block lg:w-[300px] z-30" />
     
      <Decor src="/images/decor/roti4.png" parallax={0.26} rotate={8}
        className="-bottom-[20px] left-[120px] hidden w-20 lg:block lg:w-[200px] z-20" />
     
      <Decor src="/images/decor/roti4.png" parallax={0.26} rotate={8}
        className="bottom-[10px] right-[1360px] hidden w-20 lg:block lg:w-[200px] z-20" />
     

      <div className="container-wide relative grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        {/* ── Kolom kiri: teks ─────────────────────────────────────────── */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative z-10 text-center lg:text-left"
        >
          <motion.span variants={item} className="eyebrow-script">
            Bakery rumahan · sejak {BRAND.established}
          </motion.span>

          <motion.h1 variants={item} className="title-hero mt-3">
            <span className="block">Roti Hangat,</span>
            <span className="relative block text-cocoa-600">
              Bikin Bahagia
              {/* Coretan tangan di bawah kata — aksen ekspresif */}
              <svg
                viewBox="0 0 300 14"
                preserveAspectRatio="none"
                className="mx-auto mt-1 block h-3 w-[min(100%,18rem)] text-caramel lg:mx-0"
                aria-hidden
              >
                <path
                  d="M3 9c48-5 96-7 145-6 44 1 88 3 149 8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mx-auto mt-7 max-w-lg font-text text-lg leading-relaxed text-cocoa-700/90 lg:mx-0"
          >
            {BRAND.name} membuat roti fresh setiap hari dari dapur kecil kami bahan pilihan, tanpa
            pengawet. Setiap gigitan terasa seperti buatan rumah.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-9 flex flex-col items-center gap-3 sm:flex-row lg:justify-start"
          >
            {/* CTA WhatsApp — fungsi dipertahankan persis */}
            <a
              href={generalOrderUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cocoa w-full sm:w-auto"
            >
              <MessageCircle className="h-5 w-5" aria-hidden />
              Pesan Sekarang
            </a>
            <a
              href="#menu"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 font-text text-base font-bold text-cocoa-800 transition-colors hover:text-cocoa-600 sm:w-auto"
            >
              Lihat Menu
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden />
            </a>
          </motion.div>

          {/* Social proof */}
          <motion.div
            variants={item}
            className="mt-9 flex items-center justify-center gap-3 lg:justify-start"
          >
            <div className="flex" aria-hidden>
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-5 w-5 fill-caramel text-caramel" />
              ))}
            </div>
            <p className="font-text text-sm font-semibold text-cocoa-700/80">
              <span className="font-extrabold text-cocoa-800">4.9/5</span> dari 200+ pelanggan senang
            </p>
          </motion.div>
        </motion.div>

        {/* ── Kolom kanan: foto besar ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, rotate: reduce ? 0 : -3 }}
          animate={{ opacity: 1, scale: 1, rotate: reduce ? 0 : -2.5 }}
          transition={{ duration: 0.85, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-md lg:max-w-lg"
        >
          <motion.div
            animate={reduce ? {} : { y: [0, -12, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
          >
            {/* Foto utama — bingkai kertas tebal ala foto tempelan */}
            <div className="overflow-hidden rounded-[2rem] bg-paper-50 p-3 shadow-cocoa-lg ring-1 ring-cocoa-700/10">
              <PlaceholderImage
                alt={`Foto ${heroProduct.name}`}
                src={heroProduct.image}
                label={heroProduct.name}
                seed={heroProduct.id}
                rounded="rounded-[1.4rem]"
                className="aspect-[4/5] w-full"
              />
            </div>

            {/* Badge mengambang */}
            <motion.div
              animate={reduce ? {} : { y: [0, -9, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-5 -left-4 flex items-center gap-2.5 rounded-2xl bg-cocoa-800 px-5 py-3.5 shadow-cocoa sm:-left-8"
            >
              <span className="text-2xl" aria-hidden>
                🍞
              </span>
              <div className="text-left">
                <p className="font-heading text-base text-paper-50">Fresh Harian</p>
                <p className="font-text text-xs text-paper-200/80">Dipanggang tiap pagi</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Pemisah kertas sobek → section berikutnya (paper-100) */}
      <TornPaper fill="#F7F0E1" core="#FCF8F0" seed="hero-tear" height={84} />
    </section>
  )
}
