import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle, Star, Play } from 'lucide-react'
import PlaceholderImage from './PlaceholderImage'
import { featuredProducts, formatPrice, type Product } from '../data/products'
import { productOrderUrl } from '../lib/whatsapp'

/** Pemutar video produk — fallback ke foto (poster) bila video belum ada/gagal. */
function ProductVideo({ product }: { product: Product }) {
  const [failed, setFailed] = useState(false)

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
      key={product.video}
      className="h-full w-full object-cover"
      poster={product.image}
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
      onError={() => setFailed(true)}
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

  return (
    <div>
      {/* Video besar */}
      <div className="relative aspect-video w-full overflow-hidden rounded-[2rem] bg-black/50 shadow-2xl ring-1 ring-white/10">
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
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />

        {/* Info produk aktif + CTA */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
          <div>
            {p.bestSeller && (
              <span className="mb-3 inline-flex items-center gap-1 rounded-full bg-terracotta px-3 py-1 text-xs font-bold text-cream shadow">
                <Star className="h-3 w-3 fill-cream" aria-hidden /> Best Seller
              </span>
            )}
            <h3 className="font-display text-3xl text-white sm:text-4xl">{p.name}</h3>
            <p className="mt-1 text-white/80">
              {p.category} · <span className="font-semibold text-terracotta">{formatPrice(p.price)}</span>
            </p>
          </div>
          <a
            href={productOrderUrl(p.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary shrink-0"
          >
            <MessageCircle className="h-5 w-5" aria-hidden />
            Pesan {p.name.split(' ')[0]}
          </a>
        </div>
      </div>

      {/* Switcher thumbnail — pilih produk untuk mengganti video */}
      <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
        {featuredProducts.map((item, i) => {
          const isActive = i === activeIndex
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-pressed={isActive}
              aria-label={`Putar video ${item.name}`}
              className={`group relative aspect-video w-32 shrink-0 overflow-hidden rounded-xl ring-2 transition-all sm:w-36 ${
                isActive
                  ? 'ring-terracotta'
                  : 'ring-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <PlaceholderImage
                alt={`Thumbnail ${item.name}`}
                src={item.image}
                seed={item.id}
                rounded="rounded-none"
                className="h-full w-full"
              />
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <span className="pointer-events-none absolute inset-x-0 bottom-1 truncate px-2 text-center text-[11px] font-semibold text-white">
                {item.name}
              </span>
              {isActive && (
                <span className="pointer-events-none absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-terracotta text-cream">
                  <Play className="h-2.5 w-2.5 fill-cream" aria-hidden />
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
