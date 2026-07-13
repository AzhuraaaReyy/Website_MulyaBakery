import { useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Sprout, Sun, HeartHandshake } from 'lucide-react'
import PlaceholderImage from './PlaceholderImage'
import WheatSprig from './WheatSprig'
import { BRAND } from '../config/contact'
import { useScrolly } from '../hooks/useScrolly'

const values = [
  {
    icon: Sprout,
    title: 'Bahan Pilihan',
    desc: 'Tepung berkualitas, butter asli, dan isian premium. Tanpa kompromi rasa.',
  },
  {
    icon: Sun,
    title: 'Fresh Harian',
    desc: 'Dipanggang setiap pagi dalam jumlah terbatas — selalu hangat saat sampai.',
  },
  {
    icon: HeartHandshake,
    title: 'Tanpa Pengawet',
    desc: 'Dibuat sepenuh hati seperti untuk keluarga sendiri, jujur dan alami.',
  },
]

export default function About() {
  const reduce = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  useScrolly(sectionRef)

  const years = new Date().getFullYear() - BRAND.established

  return (
    <section
      id="tentang"
      ref={sectionRef}
      className="relative overflow-hidden bg-cream-dark/70 py-20 lg:py-28"
    >
      {/* Shape organik dekoratif (kiri bawah) — senada dengan Hero */}
      <div
        data-parallax="0.14"
        className="blob-shape-2 pointer-events-none absolute -left-24 bottom-0 h-[280px] w-[280px] bg-gradient-to-br from-[#EAD6B0]/70 to-terracotta/20 sm:-left-28 sm:h-[420px] sm:w-[420px]"
        aria-hidden
      />
      <div
        data-parallax="0.26"
        className="dot-grid pointer-events-none absolute right-8 top-16 hidden h-28 w-28 opacity-50 lg:block"
        aria-hidden
      />

      <div className="container-warm relative grid items-center gap-12 lg:grid-cols-2">
        {/* Foto dapur — komposisi bertumpuk (layered) yang rapi & profesional */}
        <div data-reveal data-reveal-x="-60" className="order-1">
          <div className="group relative mx-auto w-full max-w-[17rem] pb-10 pr-8 sm:max-w-sm sm:pb-14 sm:pr-12 lg:max-w-md">
            {/* Shape organik lembut di belakang tumpukan (kedalaman) */}
            <div
              className="blob-shape-2 absolute -left-6 -top-6 h-[80%] w-[80%] bg-terracotta/15"
              aria-hidden
            />

            {/* Foto utama (belakang, sedikit miring) */}
            <div className="relative rotate-[-4deg] transition-transform duration-500 group-hover:rotate-[-2deg]">
              <div className="aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] shadow-warm-lg ring-[6px] ring-cream sm:ring-8">
                <PlaceholderImage
                  alt="Suasana dapur Roti Bahagia saat proses membuat roti"
                  src="/images/dapur.jpg"
                  label="Dapur Kami"
                  seed="dapur"
                  rounded="rounded-[1.4rem]"
                  className="h-full w-full"
                />
              </div>
            </div>

            {/* Foto detail (depan, menimpa sudut kanan bawah) */}
            <div className="absolute bottom-0 right-0 w-[54%] rotate-[6deg] transition-transform duration-500 group-hover:-translate-y-1.5 group-hover:rotate-[4deg]">
              <div className="aspect-square w-full overflow-hidden rounded-2xl shadow-warm-lg ring-[6px] ring-cream sm:ring-8">
                <PlaceholderImage
                  alt="Roti hangat buatan Roti Bahagia"
                  src="/images/roti-coklat-keju.jpg"
                  label="Roti Kami"
                  seed="roti-detail"
                  rounded="rounded-xl"
                  className="h-full w-full"
                />
              </div>
            </div>

            {/* Badge jumlah tahun (mengambang, kiri atas) */}
            <motion.div
              className="absolute -left-2 -top-3 rounded-2xl bg-terracotta px-4 py-3 text-cream shadow-warm sm:-left-4 sm:px-5 sm:py-4"
              animate={reduce ? {} : { y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <p className="font-display text-2xl font-bold leading-none sm:text-3xl">{years}+</p>
              <p className="text-xs sm:text-sm">tahun menemani Anda</p>
            </motion.div>
          </div>
        </div>

        {/* Cerita */}
        <div className="order-2 text-center lg:text-left">
          <span data-reveal className="eyebrow mb-4">
            <WheatSprig className="h-4 w-4" /> Cerita Kami
          </span>
          <h2 data-reveal className="text-display-md">
            Berawal dari dapur kecil, <span className="text-terracotta">dibuat dengan cinta</span>
          </h2>

          <div data-reveal className="mx-auto mt-5 max-w-lg space-y-4 text-brown-deep/80 lg:mx-0">
            <p>
              {BRAND.name} lahir dari kebiasaan sederhana: membuatkan roti hangat untuk keluarga di
              akhir pekan. Aroma roti yang baru keluar dari oven ternyata mengundang tetangga, lalu
              teman, lalu satu kota kecil kami.
            </p>
            <p>
              Sampai hari ini kami memegang prinsip yang sama — membuat setiap roti seperti untuk
              orang tersayang. Bukan pabrik, bukan mesin besar; hanya tangan-tangan sabar dan
              bahan-bahan terbaik.
            </p>
          </div>

          {/* Nilai/prinsip usaha */}
          <div data-stagger className="mt-8 grid gap-4 sm:grid-cols-3">
            {values.map((v) => (
              <div
                key={v.title}
                className="h-full rounded-2xl bg-cream p-5 text-center shadow-warm ring-1 ring-brown-medium/10 transition-transform duration-300 hover:-translate-y-1 sm:text-left"
              >
                <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-terracotta/15 text-terracotta sm:mx-0">
                  <v.icon className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="font-display text-lg text-brown-dark">{v.title}</h3>
                <p className="mt-1 text-sm text-brown-deep/75">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
