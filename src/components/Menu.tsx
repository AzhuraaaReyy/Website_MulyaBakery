import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Star,
  Search,
  Plus,
  Check,
  Heart,
  Play,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Cake,
  Sparkles,
} from "lucide-react";
import PlaceholderImage from "./PlaceholderImage";
import ProductDetailModal from "./ProductDetailModal";
import BookingModal from "./BookingModal";

import { formatPrice, type Product } from "../data/products";
import { useCart } from "../context/CartContext";
import { useScrolly } from "../hooks/useScrolly";
import { ScrollTrigger } from "../lib/gsap";
import { useMenuData, type MenuProduct } from "../hooks/Usemenudata";
import { supabase } from "../lib/supabase";
import { ikonKategori } from "../lib/kategoriIkon";
import { useFeatureFlags } from "../context/FeatureFlagsContext";
import LockedCta from "./LockedCta";

const PER_ROW = 8;

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function ringkasAngka(n: number): string {
  if (n < 1000) return String(n);
  const ribu = n / 1000;
  return `${ribu.toFixed(ribu < 10 ? 1 : 0).replace(".", ",")}rb`;
}

/* ══════════════════════════════════════════════════════════════════════════
 * KARTU PRODUK (Clean, Tactile, Modern & Mobile Responsive Badge)
 * ══════════════════════════════════════════════════════════════════════════ */

function ProductCard({
  product,
  onSelect,
  onToggleLike,
  interaktif,
}: {
  product: MenuProduct;
  onSelect: (p: Product) => void;
  onToggleLike: (id: string) => void;
  interaktif: boolean;
}) {
  const { add } = useCart();
  const { isOn } = useFeatureFlags();
  const [added, setAdded] = useState(false);
  const addedTimer = useRef<number | null>(null);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    add(product);
    setAdded(true);
    if (addedTimer.current) window.clearTimeout(addedTimer.current);
    addedTimer.current = window.setTimeout(() => setAdded(false), 1200);
  };

  const punyaRating = product.avgRating !== null && product.reviewCount > 0;

  return (
    <motion.article
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.97, y: 0 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      onClick={() => onSelect(product)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(product);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Lihat detail ${product.name}`}
      className="group relative flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-2xl bg-white border border-cocoa-900/5 shadow-sm hover:shadow-md hover:border-cocoa-900/15 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caramel"
    >
      {/* Container Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-paper-100">
        <PlaceholderImage
          alt={`Foto ${product.name}`}
          src={product.image}
          label={product.name}
          seed={product.id}
          rounded="rounded-none"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 group-active:scale-105"
        />

        {/* Hover & Touch Overlay Play Icon */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center bg-cocoa-900/10 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:opacity-100 group-active:opacity-100"
          aria-hidden
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-cocoa-900 shadow-md transform scale-90 transition-transform group-hover:scale-100 group-active:scale-100">
            <Play className="ml-0.5 h-4 w-4 fill-cocoa-900 text-cocoa-900" />
          </span>
        </div>

        {/* Badge Best Seller (Compact di Mobile) */}
        {product.isBestSeller && (
          <div className="absolute left-2 top-2 sm:left-2.5 sm:top-2.5 z-10 inline-flex items-center gap-0.5 sm:gap-1 rounded-full bg-cocoa-900/80 px-2 py-0.5 sm:px-2.5 sm:py-1 backdrop-blur-md text-white">
            <Sparkles
              className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-amber-300 shrink-0"
              aria-hidden
            />
            <span className="font-text text-[9px] sm:text-[10px] font-bold tracking-wider uppercase whitespace-nowrap">
              Best Seller
            </span>
          </div>
        )}

        {/* Floating Favorite Button (Compact di Mobile) */}
        <button
          type="button"
          disabled={!interaktif}
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike(product.id);
          }}
          aria-label={
            product.likedByMe
              ? `Batalkan suka untuk ${product.name}`
              : `Sukai ${product.name}`
          }
          aria-pressed={product.likedByMe}
          className={`absolute right-2 top-2 sm:right-2.5 sm:top-2.5 z-10 flex h-7 sm:h-8 items-center justify-center gap-1 rounded-full bg-white/80 px-1.5 sm:px-2 backdrop-blur-md transition-transform active:scale-90 hover:bg-white disabled:opacity-60 ${
            product.likeCount > 0
              ? "min-w-[1.75rem] sm:min-w-[2rem]"
              : "w-7 sm:w-8"
          }`}
        >
          <Heart
            className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-colors ${
              product.likedByMe
                ? "fill-rose-500 text-rose-500"
                : "text-cocoa-700/60"
            }`}
          />
          {product.likeCount > 0 && (
            <span className="font-text text-[10px] sm:text-[11px] font-bold text-cocoa-800">
              {ringkasAngka(product.likeCount)}
            </span>
          )}
        </button>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        {/* Product Name dengan Font Itim & Bold */}
        <h3 className="font-product-content text-[17px] font-bold text-cocoa-900 line-clamp-1 group-hover:text-caramel transition-colors">
          {product.name}
        </h3>

        {/* Product Description dengan Font Itim & Bold */}
        <p className="font-product-content mt-1 line-clamp-2 text-xs font-bold text-cocoa-700/70 leading-relaxed text-left">
          {product.description}
        </p>

        {/* Rating & Sales Metric */}
        <div className="mt-2.5 flex items-center gap-1.5 font-text text-xs text-cocoa-700/70">
          {punyaRating || product.unitsSold > 0 ? (
            <>
              {punyaRating && (
                <span className="inline-flex items-center gap-1 font-semibold text-cocoa-900">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {product.avgRating!.toFixed(1)}
                  <span className="font-normal text-cocoa-700/50">
                    ({product.reviewCount})
                  </span>
                </span>
              )}
              {punyaRating && product.unitsSold > 0 && (
                <span className="text-cocoa-300">•</span>
              )}
              {product.unitsSold > 0 && (
                <span className="text-cocoa-700/60">
                  {ringkasAngka(product.unitsSold)} terjual
                </span>
              )}
            </>
          ) : (
            <span className="text-cocoa-700/40 text-[11px]">
              Belum ada ulasan
            </span>
          )}
        </div>

        {/* Footer Card: Price & CTA */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          {/* Product Price dengan Font Itim & Bold */}
          <span className="font-product-content text-base font-bold text-cocoa-900 sm:text-lg">
            {formatPrice(product.price)}
          </span>

          {isOn("keranjang") ? (
            <button
              type="button"
              onClick={handleAdd}
              aria-label={`Tambah ${product.name} ke keranjang`}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200 active:scale-90 ${
                added
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-cocoa-900 text-white hover:bg-caramel hover:text-cocoa-900 shadow-sm"
              }`}
            >
              {added ? (
                <Check className="h-4 w-4 stroke-[3]" />
              ) : (
                <Plus className="h-4 w-4 stroke-[2.5]" />
              )}
            </button>
          ) : (
            <LockedCta feature="keranjang" variant="icon" />
          )}
        </div>
      </div>
    </motion.article>
  );
}

function SkeletonCard() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white border border-cocoa-900/5 p-3">
      <div className="aspect-[4/3] w-full animate-pulse rounded-xl bg-paper-200/60" />
      <div className="mt-3 flex flex-1 flex-col gap-2">
        <div className="h-4 w-2/3 animate-pulse rounded bg-paper-200/60" />
        <div className="h-3 w-full animate-pulse rounded bg-paper-200/60" />
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="h-5 w-16 animate-pulse rounded bg-paper-200/60" />
          <div className="h-8 w-8 animate-pulse rounded-xl bg-paper-200/60" />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 * SECTION MENU MAIN
 * ══════════════════════════════════════════════════════════════════════════ */

export default function Menu() {
  const sectionRef = useRef<HTMLElement>(null);
  useScrolly(sectionRef);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeCat, setActiveCat] = useState<string>("Semua");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [menggeser, setMenggeser] = useState(false);
  const [katDB, setKatDB] = useState<{ name: string; icon: string | null }[]>(
    [],
  );

  const { items, loading, offline, toggleLike } = useMenuData();
  const { isOn } = useFeatureFlags();

  const muatKategori = useCallback(() => {
    if (!supabase) return;
    void supabase
      .from("categories")
      .select("name, icon")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data) setKatDB(data as { name: string; icon: string | null }[]);
      });
  }, []);

  useEffect(() => {
    muatKategori();
  }, [muatKategori]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") muatKategori();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [muatKategori]);

  const kategoriTampil = katDB.length
    ? katDB
    : supabase
      ? []
      : Array.from(new Set(items.map((i) => i.category))).map((name) => ({
          name,
          icon: null as string | null,
        }));

  const q = query.trim().toLowerCase();
  const filtered = items.filter(
    (p) =>
      (activeCat === "Semua" || p.category === activeCat) &&
      (q === "" ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)),
  );

  const rows = chunk(filtered, PER_ROW);

  useEffect(() => {
    if (loading) return;
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 80);
    return () => window.clearTimeout(id);
  }, [loading, items.length]);

  const seret = useRef({
    aktif: false,
    mulaiX: 0,
    mulaiScroll: 0,
    bergerak: false,
  });

  const mulaiSeret = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = scrollRef.current;
    if (!el) return;
    seret.current = {
      aktif: true,
      mulaiX: e.clientX,
      mulaiScroll: el.scrollLeft,
      bergerak: false,
    };
    setMenggeser(true);
  };

  const gerakSeret = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el || !seret.current.aktif) return;
    const dx = e.clientX - seret.current.mulaiX;
    if (Math.abs(dx) > 4) seret.current.bergerak = true;
    el.scrollLeft = seret.current.mulaiScroll - dx;
  };

  const selesaiSeret = () => {
    if (!seret.current.aktif) return;
    seret.current.aktif = false;
    setMenggeser(false);
  };

  const tahanKlikSetelahSeret = (e: React.MouseEvent<HTMLDivElement>) => {
    if (seret.current.bergerak) {
      e.preventDefault();
      e.stopPropagation();
      seret.current.bergerak = false;
    }
  };

  const scrollByCards = (dir: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const kartu = el.querySelector<HTMLElement>("[data-kartu]");
    const langkah = kartu ? kartu.offsetWidth + 20 : el.clientWidth * 0.75;
    el.scrollBy({ left: dir * langkah * 2, behavior: "smooth" });
  };

  return (
    <section
      id="menu"
      ref={sectionRef}
      className="relative bg-gradient-to-br from-pink-300 via-rose-100 to-pink-400 py-16 sm:py-24 overflow-hidden"
    >
      {/* ── Injection Custom Font Google (Itim) khusus Konten Produk ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Itim&display=swap');
        .font-product-content {
          font-family: 'Itim', cursive, sans-serif !important;
          font-weight: 700 !important;
        }
      `}</style>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
        {/* ── Header Clean Editorial ────────────────────────────────────── */}
        {/* Header Section */}
        <div className="mx-auto max-w-2xl text-center">
          {/* Badge Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full bg-caramel/20 px-3.5 py-1 text-xs font-semibold text-cocoa-800 sm:text-sm">
            <span className="h-2 w-2 rounded-full bg-caramel"></span>
            <span className="eyebrow-script !m-0">Menu Favorit</span>
          </div>

          <h2
            data-reveal
            className="title-1 mt-2 text-2xl tracking-tight text-cocoa-900 sm:text-3xl lg:text-4xl"
          >
            Pilihan Roti & Kue Favorit
          </h2>

          <p
            data-reveal
            className="font-section3-p mt-3 text-center text-base leading-relaxed text-cocoa-700/85 sm:text-lg lg:text-xl"
          >
            Temukan berbagai pilihan roti dan kue segar buatan rumahan yang siap
            menemani setiap momen spesial Anda.
          </p>
        </div>

        {/* ── Search Bar Modern Minimalist ─────────────────────────────── */}
        <div data-reveal className="mx-auto mt-8 max-w-md">
          <div className="relative flex items-center rounded-2xl bg-white/90 backdrop-blur-sm px-4 py-3 border border-cocoa-900/10 shadow-sm focus-within:border-pink-400 focus-within:ring-2 focus-within:ring-pink-300/40 transition-all">
            <Search className="h-4 w-4 shrink-0 text-cocoa-700/40" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari roti atau kue..."
              maxLength={60}
              className="ml-3 w-full bg-transparent font-text text-sm text-cocoa-900 placeholder:text-cocoa-700/40 focus:outline-none"
            />
          </div>
        </div>

        {/* ── Horizontal Category Tabs ─────────────────────────────────── */}
        <div
          data-reveal
          className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] justify-start sm:justify-center"
        >
          {[{ name: "Semua", icon: "__semua__" }, ...kategoriTampil].map(
            (cat) => {
              const active = activeCat === cat.name;
              const Icon =
                cat.icon === "__semua__" ? LayoutGrid : ikonKategori(cat.icon);
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setActiveCat(cat.name)}
                  aria-pressed={active}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 font-text text-xs font-semibold transition-all duration-200 active:scale-95 ${
                    active
                      ? "bg-cocoa-900 text-white shadow-sm"
                      : "bg-white/80 text-cocoa-700/80 border border-cocoa-900/5 hover:bg-white hover:text-cocoa-900"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${active ? "text-pink-300" : "text-cocoa-700/60"}`}
                  />
                  <span>{cat.name}</span>
                </button>
              );
            },
          )}
        </div>

        {/* ── Section Title & Carousel Nav Controls ─────────────────────── */}
        <div
          data-reveal
          className="mt-10 flex items-center justify-between border-b border-cocoa-900/10 pb-4"
        >
          <div>
            <h3 className="font-heading text-xl  text-cocoa-900">
              {activeCat === "Semua" ? "Semua Produk" : activeCat}
            </h3>
            <span className="font-text text-xs text-cocoa-700/60">
              {loading
                ? "Memuat data..."
                : `Menampilkan ${filtered.length} varian`}
            </span>
          </div>

          {!loading && filtered.length > 3 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scrollByCards(-1)}
                aria-label="Geser kiri"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 text-cocoa-800 border border-cocoa-900/10 transition-all active:scale-90 hover:bg-cocoa-900 hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollByCards(1)}
                aria-label="Geser kanan"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 text-cocoa-800 border border-cocoa-900/10 transition-all active:scale-90 hover:bg-cocoa-900 hover:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* ── Grid/Carousel Product List ────────────────────────────────── */}
        {loading ? (
          <div className="mt-6 overflow-hidden">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        ) : filtered.length > 0 ? (
          <div
            ref={scrollRef}
            data-stagger
            onPointerDown={mulaiSeret}
            onPointerMove={gerakSeret}
            onPointerUp={selesaiSeret}
            onPointerLeave={selesaiSeret}
            onPointerCancel={selesaiSeret}
            onClickCapture={tahanKlikSetelahSeret}
            className={`mt-6 overflow-x-auto pb-6 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] ${
              menggeser
                ? "cursor-grabbing select-none"
                : "snap-x snap-mandatory cursor-grab"
            }`}
          >
            <div className="flex w-max flex-col gap-5">
              {rows.map((row, ri) => (
                <div
                  key={ri}
                  className="grid grid-flow-col auto-cols-[160px] sm:auto-cols-[200px] md:auto-cols-[220px] lg:auto-cols-[240px] gap-4"
                >
                  {row.map((product) => (
                    <div
                      key={product.id}
                      data-kartu
                      data-reveal
                      className="snap-start h-full"
                    >
                      <ProductCard
                        product={product}
                        onSelect={setSelected}
                        onToggleLike={toggleLike}
                        interaktif={!offline}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            data-reveal
            className="my-16 flex flex-col items-center justify-center text-center"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/60 text-cocoa-700/40">
              <Search className="h-6 w-6" />
            </div>
            <p className="mt-4 font-heading text-base font-semibold text-cocoa-900">
              Menu tidak ditemukan
            </p>
            <p className="mt-1 font-text text-xs text-cocoa-700/60">
              Coba cari dengan kata kunci lain atau ganti kategori.
            </p>
          </div>
        )}

        <>
          {/* Import Google Font 'Itim' */}
          <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Itim&display=swap');
    .section-3-container p,
    .font-section3-p {
      font-family: 'Itim', cursive, sans-serif !important;
    }
  `}</style>

          {/* ── Custom Order CTA Banner (Soft Pink Banner) ───────────────────── */}
          <div
            data-reveal
            className="relative mt-8 sm:mt-12 w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-pink-200/80 bg-white p-5 sm:p-8 md:p-10 text-cocoa-900 shadow-md backdrop-blur-sm"
          >
            <div className="relative z-10 flex flex-col items-start justify-between gap-5 md:flex-row md:items-center md:gap-8">
              {/* Teks & Deskripsi */}
              <div className="w-full max-w-xl min-w-0 flex-1">
                <span className="inline-flex items-center gap-1.5 font-text text-[11px] sm:text-xs font-bold tracking-wider uppercase text-pink-600">
                  <Cake className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="truncate">Custom Order</span>
                </span>

                <h3 className="mt-1.5 sm:mt-2 bg-cocoa-900 bg-clip-text font-heading text-xl sm:text-2xl md:text-3xl  leading-snug sm:leading-tight text-transparent">
                  Butuh Pesanan Khusus Acara Spesial?
                </h3>

                <p className="font-section3-p mt-2 text-sm sm:text-base leading-relaxed sm:leading-normal text-cocoa-800/80 text-left sm:text-justify">
                  Kami siap membantu menyediakan hampers, snackbox, hingga kue
                  ulang tahun sesuai permintaan Anda.
                </p>
              </div>

              {/* Tombol Aksion */}
              <div className="w-full shrink-0 md:w-auto">
                {isOn("pesanan_khusus") ? (
                  <button
                    type="button"
                    onClick={() => setBookingOpen(true)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-pink-300/80 bg-gradient-to-r from-pink-200 to-pink-400 px-5 sm:px-6 py-3 sm:py-3.5 font-text text-xs sm:text-sm font-bold text-cocoa-900 shadow-sm transition-all duration-300 hover:border-pink-500 hover:from-pink-500 hover:to-pink-600 hover:text-white active:scale-95 md:w-auto"
                  >
                    <span>Konsultasi Pesanan</span>
                  </button>
                ) : (
                  <LockedCta
                    feature="pesanan_khusus"
                    className="w-full py-3 sm:py-3.5 md:w-auto"
                  />
                )}
              </div>
            </div>
          </div>
        </>
      </div>

      {/* Modals */}
      <ProductDetailModal
        product={selected}
        onClose={() => setSelected(null)}
      />
      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </section>
  );
}
