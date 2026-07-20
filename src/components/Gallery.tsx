import { useRef } from 'react'
import { motion } from 'framer-motion'
import PlaceholderImage from './PlaceholderImage'
import TornPaper from './TornPaper'
import Decor from './Decor'
import { useScrolly } from '../hooks/useScrolly'

// Item galeri (foto produk & proses).
// Taruh foto di public/images/ dengan nama sesuai `image`; bila belum ada,
// otomatis fallback ke placeholder gradient.
// `tilt` = kemiringan tempelan, `tape` = ada selotip di ujung atas.
const items = [
  { id: 'g1', label: 'Adonan Segar', image: '/images/galeri-adonan.jpg', span: 'sm:col-span-2 sm:row-span-2', tilt: '-1.2deg', tape: true },
  { id: 'g2', label: 'Roti Panggang', image: '/images/galeri-roti-panggang.jpg', tilt: '1.4deg', tape: false },
  { id: 'g3', label: 'Isian Coklat', image: '/images/galeri-isian-coklat.jpg', tilt: '-1deg', tape: true },
  { id: 'g4', label: 'Croissant', image: '/images/galeri-croissant.jpg', tilt: '1.1deg', tape: false },
  { id: 'g5', label: 'Oven Hangat', image: '/images/galeri-oven.jpg', tilt: '-1.5deg', tape: false },
  { id: 'g6', label: 'Siap Diantar', image: '/images/galeri-siap-diantar.jpg', span: 'sm:col-span-2', tilt: '0.9deg', tape: true },
]

export default function Gallery() {
  const sectionRef = useRef<HTMLElement>(null)
  useScrolly(sectionRef)

  return (
    <section
      id="galeri"
      ref={sectionRef}
      className="relative overflow-hidden bg-paper-200 pb-40 pt-24 lg:pb-48 lg:pt-32"
    >
      <div className="paper-grain pointer-events-none absolute inset-0 opacity-60" aria-hidden />

      {/* Aksen bahan cut-out */}
      <Decor src="/images/decor/roti4.png" parallax={0.22} rotate={-16}
        className="left-10 top-[70px] hidden w-28 lg:block lg:w-[300px] z-20" />
      <Decor src="/images/decor/roti3.png" parallax={0.22} rotate={-16}
        className="left-4 top-[150px] hidden w-28 lg:block lg:w-[200px] z-10" />
      <Decor src="/images/decor/rotirotate.png" parallax={0.22} rotate={-16}
        className="left-[200px] top-[150px] hidden w-28 lg:block lg:w-[150px] z-10" />

      <Decor src="/images/decor/roti6.png" parallax={-0.2} rotate={22}
        className="right-[120px] bottom-20 hidden w-28 lg:block lg:w-[300px] z-30" />
      <Decor src="/images/decor/roti.png" parallax={-0.2} rotate={22}
        className="right-[300px] bottom-[120px] hidden w-28 lg:block lg:w-[150px] z-20" />
      <Decor src="/images/decor/roti4.png" parallax={-0.2} rotate={22}
        className="right-[300px] bottom-[120px] hidden w-28 lg:block lg:w-[170px] z-20" />
      <Decor src="/images/decor/roti4.png" parallax={-0.2} rotate={22}
        className="right-[240px] bottom-[100px] hidden w-28 lg:block lg:w-[170px] z-20" />
      <Decor src="/images/decor/roti3.png" parallax={-0.2} rotate={22}
        className="right-[100px] bottom-[120px] hidden w-28 lg:block lg:w-[180px] z-10" />
      <Decor src="/images/decor/selai2.png" parallax={-0.2} rotate={22}
        className="right-[120px] bottom-[90px] hidden w-28 lg:block lg:w-[300px] z-5" />

      <div className="container-wide relative">
        <div className="mx-auto max-w-2xl text-center">
          <span data-reveal className="eyebrow-script">
            Galeri
          </span>
          <h2 data-reveal className="title-1 mt-2">
            Intip momen di dapur kami
          </h2>
        </div>

        {/* Dinding foto — tiap foto dibingkai kertas & ditempel sedikit miring */}
        <div
          data-stagger
          className="mt-16 grid auto-rows-[170px] grid-cols-2 gap-5 sm:auto-rows-[190px] sm:grid-cols-4 sm:gap-6"
        >
          {/* Pembungkus luar = anak langsung [data-stagger]; GSAP menghapus
              transform-nya setelah reveal, jadi kemiringan diletakkan di DALAM. */}
          {items.map((item) => (
            <div key={item.id} className={item.span ?? ''}>
              <motion.div
                whileHover={{ scale: 1.04 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                style={{ rotate: item.tilt }}
                className="group relative h-full w-full z-30"
              >
                <div className="h-full w-full rounded-[1.4rem] bg-paper-50 p-2.5 shadow-lift ring-1 ring-cocoa-700/10 transition-shadow group-hover:shadow-cocoa">
                  <div className="relative h-full w-full overflow-hidden rounded-[1rem]">
                    <PlaceholderImage
                      alt={item.label}
                      src={item.image}
                      label={item.label}
                      seed={item.id}
                      rounded="rounded-[1rem]"
                      className="h-full w-full"
                    />
                    {/* Label muncul saat hover */}
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-cocoa-900/75 via-cocoa-900/10 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <span className="font-heading text-lg text-paper-50">{item.label}</span>
                    </div>
                  </div>
                </div>

                {item.tape && (
                  <span
                    className="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 -rotate-3 rounded-[3px] bg-caramel/25 ring-1 ring-caramel/30"
                    aria-hidden
                  />
                )}
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Sobekan ke Cara Pesan (paper-100) */}
      <TornPaper fill="#F7F0E1" core="#FCF8F0" seed="galeri-tear" height={80} />
    </section>
  )
}
