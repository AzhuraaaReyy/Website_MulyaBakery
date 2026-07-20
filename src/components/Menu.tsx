import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Star, Search } from "lucide-react";
import PlaceholderImage from "./PlaceholderImage";
import FeaturedVideo from "./FeaturedVideo";
import TornPaper from "./TornPaper";
import Decor from "./Decor";
import {
  products,
  formatPrice,
  type Product,
  type ProductCategory,
} from "../data/products";
import {
  productOrderUrl,
  customOrderUrl,
  generalOrderUrl,
} from "../lib/whatsapp";
import { useScrolly } from "../hooks/useScrolly";

const CATEGORIES: ("Semua" | ProductCategory)[] = [
  "Semua",
  "Roti Manis",
  "Roti Tawar",
  "Kue Kering/Pastry",
  "Pesanan Custom",
];

/**
 * Kartu produk — tinggi mengikuti isi, teks tidak dipotong.
 *
 * Kartu dalam satu baris tetap sejajar karena CSS Grid meregangkannya ke kartu
 * tertinggi di baris itu; tombol didorong ke dasar dengan `mt-auto` sehingga
 * ikut sejajar. Foto memakai rasio tetap, dan tiap ukuran font dikunci bersama
 * line-height-nya agar ritme barisnya konsisten antar kartu.
 */
function ProductCard({ product }: { product: Product }) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-paper-50 shadow-lift ring-1 ring-cocoa-700/10 transition-shadow hover:shadow-cocoa sm:rounded-[1.6rem]"
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
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-caramel px-2 py-0.5 font-text text-[10px] font-extrabold text-cocoa-900 shadow sm:left-3 sm:top-3 sm:gap-1.5 sm:px-3 sm:py-1 sm:text-xs">
            <Star
              className="h-2.5 w-2.5 fill-cocoa-900 sm:h-3 sm:w-3"
              aria-hidden
            />{" "}
            Best Seller
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5 sm:p-5">
        {/* Judul tampil penuh (tidak dipotong).
            Catatan: pakai sintaks `ukuran/leading` — `text-lg` polos membawa
            line-height bawaannya sendiri yang menimpa `leading-tight`, sehingga
            ritme baris antar kartu jadi tidak sama. */}
        <h3 className="font-heading text-sm/[1.25] text-cocoa-800 sm:text-lg/[1.25]">
          {product.name}
        </h3>

        <p className="mt-1.5 truncate font-text text-[10px] font-bold uppercase tracking-wider text-cocoa-500/70 sm:text-xs">
          {product.category}
        </p>

        {/* Deskripsi tampil penuh — tinggi kartu mengikuti isi */}
        <p className="mt-2 font-text text-xs/[1.625] text-cocoa-700/80 sm:text-sm/[1.625]">
          {product.description}
        </p>

        {/* Harga di baris sendiri — di kartu sempit, sebaris dengan judul jadi sesak */}
        <p className="mt-auto pt-3 font-text text-sm font-extrabold text-caramel sm:text-base">
          {formatPrice(product.price)}
        </p>

        <a
          href={productOrderUrl(product.name)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-cocoa-800 px-3 py-2.5 font-text text-xs font-bold text-paper-50 transition-all hover:bg-cocoa-900 sm:mt-4 sm:gap-2 sm:px-5 sm:py-3 sm:text-sm"
          aria-label={`Pesan ${product.name} via WhatsApp`}
        >
          <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
          Pesan
        </a>
      </div>
    </motion.article>
  );
}

export default function Menu() {
  const sectionRef = useRef<HTMLElement>(null);
  useScrolly(sectionRef);

  const [activeCat, setActiveCat] =
    useState<(typeof CATEGORIES)[number]>("Semua");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const filtered = products.filter(
    (p) =>
      (activeCat === "Semua" || p.category === activeCat) &&
      (q === "" ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)),
  );

  const countFor = (cat: (typeof CATEGORIES)[number]) =>
    cat === "Semua"
      ? products.length
      : products.filter((p) => p.category === cat).length;

  return (
    <section
      id="menu"
      ref={sectionRef}
      className="relative overflow-hidden bg-paper-50 pb-36 pt-24 lg:pb-44 lg:pt-32"
    >
      <div
        className="paper-grain pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
      />

      {/* Aksen bahan cut-out */}
      {/* Decor bagian tengah*/}
      <Decor
        src="/images/decor/roti5.png"
        parallax={0.22}
        rotate={-18}
        className="top-[1740px] right-[100px] hidden w-20 lg:block lg:w-[100px] -z-0"
      />
      <Decor
        src="/images/decor/roti3.png"
        parallax={0.22}
        rotate={-18}
        className="top-[1740px] right-[245px] hidden w-20 lg:block lg:w-[130px] -z-0"
      />
      <Decor
        src="/images/decor/selai2.png"
        parallax={0.22}
        rotate={-18}
        className="top-[1700px] right-[70px] hidden w-20 lg:block lg:w-[320px] -z-0"
      />
      <Decor
        src="/images/decor/roti4.png"
        parallax={0.22}
        rotate={-18}
        className="top-[1630px] right-[80px] hidden w-20 lg:block lg:w-[300px] -z-0"
      />

      {/* Decor bagian bawah*/}
      <Decor
        src="/images/decor/selai2.png"
        parallax={0.22}
        rotate={-18}
        className="bottom-[150px] -left-[10px] hidden w-20 lg:block lg:w-[350px] -z-0"
      />
      <Decor
        src="/images/decor/roti6.png"
        parallax={0.22}
        rotate={-18}
        className="bottom-[150px] -left-[10px] hidden w-20 lg:block lg:w-[350px] -z-0"
      />

      <Decor
        src="/images/decor/roti6.png"
        parallax={0.22}
        rotate={-18}
        className="bottom-[180px] -left-[30px] hidden w-20 lg:block lg:w-[200px] -z-0"
      />

      {/* Decor bagian atas*/}
      <div className="container-wide relative">
        <Decor
          src="/images/decor/roti4.png"
          parallax={0.22}
          rotate={-18}
          className="bottom-[20px] -left-[30px] hidden w-20 lg:block lg:w-[350px] z-20"
        />

        <Decor
          src="/images/decor/roti6.png"
          parallax={0.22}
          rotate={-18}
          className="bottom-[40px] -left-[70px] hidden w-20 lg:block lg:w-[200px] z-30"
        />
        <Decor
          src="/images/decor/roti6.png"
          parallax={0.22}
          rotate={-18}
          className="bottom-[130px] left-[140px] hidden w-20 lg:block lg:w-[200px] z-10"
        />
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span data-reveal className="eyebrow-script">
            Produk unggulan
          </span>
          <h2 data-reveal className="title-1 mt-2">
            Roti pilihan, dibuat hangat-hangat
          </h2>
          <p
            data-reveal
            className="mt-5 font-text text-lg leading-relaxed text-cocoa-700/85"
          >
            Lihat produk andalan kami dalam video. Pilih produk di bawah video
            untuk menggantinya.
          </p>
        </div>
      </div>

      {/* ── Signature: video produk, dibungkus pita kertas sobek ──────────
          Pita bergradasi hangat dengan tepi sobek di atas & bawah — seolah
          dirobek dari halaman. Semua logic switching produk tetap utuh. */}
      <div
        data-reveal
        className="relative mt-16 py-16 sm:py-20"
        style={{
          background:
            "radial-gradient(120% 130% at 20% 0%, #F8EDD5 0%, #EFD3A0 45%, #DFAA63 100%)",
        }}
      >
        <TornPaper
          position="top"
          fill="#FCF8F0"
          core="#FFFFFF"
          seed="video-top"
          height={72}
        />
        <TornPaper
          position="bottom"
          fill="#FCF8F0"
          core="#FFFFFF"
          seed="video-bottom"
          height={76}
        />

        <div className="container-wide relative">
          <FeaturedVideo />
        </div>
      </div>

      <div className="container-wide relative">
        {/* Search */}
        <div
          data-reveal
          className="mx-auto mt-20 flex max-w-xl items-center gap-3 rounded-full bg-paper-50 px-6 py-3.5 shadow-lift ring-1 ring-cocoa-700/15 transition-shadow focus-within:ring-2 focus-within:ring-caramel"
        >
          <Search className="h-5 w-5 shrink-0 text-cocoa-500/60" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari roti favoritmu…"
            aria-label="Cari produk"
            className="w-full bg-transparent font-text text-cocoa-800 placeholder:text-cocoa-700/40 focus:outline-none"
          />
        </div>

        {/* Pill kategori */}
        <div data-reveal className="mt-6 flex flex-wrap justify-center gap-2.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCat(cat)}
              aria-pressed={activeCat === cat}
              className={`rounded-full px-5 py-2.5 font-text text-sm font-bold transition-all ${
                activeCat === cat
                  ? "bg-cocoa-800 text-paper-50 shadow-cocoa"
                  : "bg-paper-50 text-cocoa-800 ring-1 ring-cocoa-700/15 hover:bg-paper-200"
              }`}
            >
              {cat}
              <span
                className={
                  activeCat === cat ? "text-paper-200/60" : "text-cocoa-700/45"
                }
              >
                {" "}
                ({countFor(cat)})
              </span>
            </button>
          ))}
        </div>

        {/* Grid kartu produk */}
        {filtered.length > 0 ? (
          <motion.div
            layout
            data-stagger
            // Mobile 2 kolom · tablet 3 · desktop 4
            className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6"
          >
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        ) : (
          <p className="mt-12 text-center font-text text-cocoa-700/60">
            Tidak ada produk yang cocok. Coba kata kunci atau kategori lain.
          </p>
        )}

        {/* Lihat semua / pesan */}
        <a
          data-reveal
          href={generalOrderUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 block w-full rounded-2xl border-2 border-dashed border-cocoa-700/25 py-4 text-center font-text font-bold text-cocoa-800 transition-colors hover:border-cocoa-700/50 hover:bg-paper-200/60"
        >
          Lihat semua &amp; pesan lewat WhatsApp →
        </a>

        {/* CTA custom order */}
        <div
          data-reveal
          className="mt-14 flex flex-col items-center justify-between gap-5 rounded-[1.8rem] bg-gradient-to-br from-cocoa-700 to-cocoa-900 px-8 py-9 text-center shadow-cocoa-lg sm:flex-row sm:text-left"
        >
          <div>
            <h3 className="font-heading text-2xl text-paper-50">
              Butuh pesanan khusus untuk acara?
            </h3>
            <p className="mt-1.5 font-text text-paper-200/85">
              Ulang tahun, hampers, arisan kantor — kami siap bantu wujudkan.
            </p>
          </div>
          <a
            href={customOrderUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-butter px-7 py-3.5 font-text font-bold text-cocoa-900 transition-transform hover:-translate-y-0.5"
          >
            <MessageCircle className="h-5 w-5" aria-hidden />
            Diskusi Custom Order
          </a>
        </div>
      </div>
    </section>
  );
}
