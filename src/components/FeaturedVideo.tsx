import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle, Star } from 'lucide-react'
import PlaceholderImage from './PlaceholderImage'
import CircularGallery from './CircularGallery'
import { featuredProducts, formatPrice, type Product } from '../data/products'
import { productOrderUrl } from '../lib/whatsapp'

/**
 * Pemutar video produk — fallback ke foto (poster) bila video belum ada/gagal.
 *
 * Gangguan jaringan sesaat bisa membuat video gagal dimuat padahal filenya baik;
 * karena itu dicoba ulang sekali sebelum benar-benar menyerah ke poster.
 */
function ProductVideo({ product }: { product: Product }) {
  const [attempt, setAttempt] = useState(0)
  const [failed, setFailed] = useState(false)

  const onError = () => {
    if (attempt < 1) setAttempt((a) => a + 1)
    else setFailed(true)
  }

  if (!product.video || failed) {
    return (
      <PlaceholderImage
        alt={`Foto ${product.name}`}
        src={product.image}
        label={product.name}
        seed={product.id}
        rounded="rounded-none"
        className="h-full w-full"
      />
    )
  }

  return (
    <video
      // `attempt` ikut jadi key agar percobaan ulang benar-benar memuat ulang.
      key={`${product.video}#${attempt}`}
      className="h-full w-full object-cover"
      poster={product.image}
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
      onError={onError}
    >
      <source src={product.video} type="video/mp4" />
    </video>
  )
}

/**
 * Showcase produk unggulan berbasis VIDEO. Video besar di atas berganti sesuai
 * produk yang dipilih dari daftar thumbnail di bawahnya.
 */
export default function FeaturedVideo() {
  const [activeIndex, setActiveIndex] = useState(0)
  const p = featuredProducts[activeIndex]

  // WAJIB di-memo: `items` masuk dependency effect galeri, jadi array baru
  // tiap render akan membangun ulang seluruh scene WebGL.
  const galleryItems = useMemo(
    () => featuredProducts.map((item) => ({ image: item.image, text: item.name })),
    [],
  )

  return (
    <div>
      {/* Video besar — dibingkai kertas tebal */}
      <div className="rounded-[1.9rem] bg-paper-50 p-2.5 shadow-cocoa-lg sm:p-3">
        <div className="relative aspect-video w-full overflow-hidden rounded-[1.4rem] bg-cocoa-900">
          <AnimatePresence mode="wait">
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <ProductVideo product={p} />
            </motion.div>
          </AnimatePresence>

          {/* Gradasi gelap untuk keterbacaan teks */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-cocoa-900/85 via-cocoa-900/25 to-transparent" />

          {/* Info produk aktif + CTA */}
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
            <div>
              {p.bestSeller && (
                <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-caramel px-3 py-1 font-text text-xs font-extrabold text-cocoa-900 shadow">
                  <Star className="h-3 w-3 fill-cocoa-900" aria-hidden /> Best Seller
                </span>
              )}
              <h3 className="font-heading text-3xl text-paper-50 sm:text-4xl">{p.name}</h3>
              <p className="mt-1 font-text text-paper-200/85">
                {p.category} ·{' '}
                <span className="font-extrabold text-butter">{formatPrice(p.price)}</span>
              </p>
            </div>
            <a
              href={productOrderUrl(p.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-paper-50 px-7 py-3.5 font-text text-base font-bold text-cocoa-800 shadow-cocoa transition-all hover:-translate-y-0.5 hover:bg-white"
            >
              <MessageCircle className="h-5 w-5" aria-hidden />
              Pesan {p.name.split(' ')[0]}
            </a>
          </div>
        </div>
      </div>

      {/* Switcher thumbnail — pilih produk untuk mengganti video */}
      {/* Galeri melengkung (WebGL) — klik salah satu foto untuk memutar videonya,
          atau geret/panah kiri-kanan untuk menjelajah. */}
      <CircularGallery
        items={galleryItems}
        activeIndex={activeIndex}
        onSelect={setActiveIndex}
        className="mt-6 h-[320px] sm:h-[380px]"
      />

      {/* Fallback yang bisa diakses keyboard & screen reader.
          Canvas WebGL tidak terbaca assistive tech, jadi daftar tombol ini
          tetap disediakan — juga berguna bila WebGL tidak tersedia. */}
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        {featuredProducts.map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveIndex(i)}
            aria-pressed={i === activeIndex}
            aria-label={`Putar video ${item.name}`}
            className={`rounded-full px-4 py-2 font-text text-xs font-bold transition-all ${
              i === activeIndex
                ? 'bg-cocoa-800 text-paper-50 shadow-cocoa'
                : 'bg-paper-50 text-cocoa-800 ring-1 ring-cocoa-700/15 hover:bg-paper-200'
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>
    </div>
  )
}
