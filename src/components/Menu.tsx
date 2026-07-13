import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Star, Sparkles, Search } from 'lucide-react'
import PlaceholderImage from './PlaceholderImage'
import FeaturedVideo from './FeaturedVideo'
import { products, formatPrice, type Product, type ProductCategory } from '../data/products'
import { productOrderUrl, customOrderUrl, generalOrderUrl } from '../lib/whatsapp'
import { useScrolly } from '../hooks/useScrolly'

const CATEGORIES: ('Semua' | ProductCategory)[] = [
  'Semua',
  'Roti Manis',
  'Roti Tawar',
  'Kue Kering/Pastry',
  'Pesanan Custom',
]

function ProductCard({ product }: { product: Product }) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="group flex h-full flex-col overflow-hidden rounded-3xl bg-cream shadow-warm ring-1 ring-brown-medium/10"
    >
      <div className="relative">
        <PlaceholderImage
          alt={`Foto ${product.name}`}
          src={product.image}
          label={product.name}
          seed={product.id}
          rounded="rounded-none"
          className="aspect-[4/3] w-full"
        />
        {product.bestSeller && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-terracotta px-3 py-1 text-xs font-bold text-cream shadow">
            <Star className="h-3 w-3 fill-cream" aria-hidden /> Best Seller
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="font-display text-xl text-brown-dark">{product.name}</h3>
          <span className="shrink-0 font-bold text-terracotta">{formatPrice(product.price)}</span>
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide text-brown-medium/70">
          {product.category}
        </p>
        <p className="mt-2 flex-1 text-sm text-brown-deep/75">{product.description}</p>

        <a
          href={productOrderUrl(product.name)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-brown-medium px-5 py-2.5 text-sm font-semibold text-cream transition-all hover:bg-brown-dark group-hover:shadow-warm"
          aria-label={`Pesan ${product.name} via WhatsApp`}
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          Pesan
        </a>
      </div>
    </motion.article>
  )
}

export default function Menu() {
  const sectionRef = useRef<HTMLElement>(null)
  useScrolly(sectionRef)

  const [activeCat, setActiveCat] = useState<(typeof CATEGORIES)[number]>('Semua')
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()
  const filtered = products.filter(
    (p) =>
      (activeCat === 'Semua' || p.category === activeCat) &&
      (q === '' || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)),
  )

  const countFor = (cat: (typeof CATEGORIES)[number]) =>
    cat === 'Semua' ? products.length : products.filter((p) => p.category === cat).length

  return (
    <section id="menu" ref={sectionRef} className="relative py-20 lg:py-28">
      <div className="container-warm relative">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span data-reveal className="eyebrow mb-4">
            <Sparkles className="h-4 w-4" aria-hidden /> Produk Unggulan
          </span>
          <h2 data-reveal className="text-display-md">
            Roti pilihan, dibuat hangat-hangat
          </h2>
          <p data-reveal className="mt-4 text-brown-deep/75">
            Lihat produk andalan kami dalam video. Pilih produk di bawah video untuk menggantinya.
          </p>
        </div>

        {/* Signature: Video produk unggulan (bisa berganti) */}
        <div
          data-reveal
          className="mt-12 rounded-[2.5rem] bg-cream/70 p-4 shadow-warm ring-1 ring-brown-medium/10 sm:p-6"
        >
          <FeaturedVideo />
        </div>

        {/* Search */}
        <div
          data-reveal
          className="mx-auto mt-16 flex max-w-xl items-center gap-3 rounded-full bg-cream px-5 py-3 shadow-warm ring-1 ring-brown-medium/10 focus-within:ring-terracotta"
        >
          <Search className="h-5 w-5 shrink-0 text-brown-medium/60" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari roti favoritmu…"
            aria-label="Cari produk"
            className="w-full bg-transparent text-brown-dark placeholder:text-brown-deep/40 focus:outline-none"
          />
        </div>

        {/* Pill kategori */}
        <div data-reveal className="mt-6 flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCat(cat)}
              aria-pressed={activeCat === cat}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                activeCat === cat
                  ? 'bg-terracotta text-cream shadow-warm'
                  : 'bg-cream text-brown-dark ring-1 ring-brown-medium/15 hover:bg-cream-dark'
              }`}
            >
              {cat}
              <span className={activeCat === cat ? 'text-cream/70' : 'text-brown-deep/40'}>
                {' '}
                ({countFor(cat)})
              </span>
            </button>
          ))}
        </div>

        {/* Grid kartu produk */}
        {filtered.length > 0 ? (
          <motion.div layout data-stagger className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        ) : (
          <p className="mt-12 text-center text-brown-deep/60">
            Tidak ada produk yang cocok. Coba kata kunci atau kategori lain.
          </p>
        )}

        {/* Lihat semua / pesan */}
        <a
          data-reveal
          href={generalOrderUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 block w-full rounded-2xl border border-brown-medium/25 py-4 text-center font-semibold text-brown-dark transition-colors hover:bg-cream"
        >
          Lihat semua &amp; pesan lewat WhatsApp →
        </a>

        {/* CTA custom order */}
        <div
          data-reveal
          className="mt-12 flex flex-col items-center justify-between gap-4 rounded-3xl bg-gradient-to-br from-terracotta to-brown-medium px-7 py-8 text-center sm:flex-row sm:text-left"
        >
          <div>
            <h3 className="font-display text-2xl text-cream">Butuh pesanan khusus untuk acara?</h3>
            <p className="mt-1 text-cream/90">
              Ulang tahun, hampers, arisan kantor — kami siap bantu wujudkan.
            </p>
          </div>
          <a
            href={customOrderUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-cream px-7 py-3.5 font-semibold text-brown-dark transition-transform hover:-translate-y-0.5"
          >
            <MessageCircle className="h-5 w-5" aria-hidden />
            Diskusi Custom Order
          </a>
        </div>
      </div>
    </section>
  )
}
