import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Plus, Check, Star } from "lucide-react";
import PlaceholderImage from "./PlaceholderImage";
import { formatPrice, type Product } from "../data/products";
import { useCart } from "../context/CartContext";
import { kunciScroll } from "../lib/scrollLock";
import { parseVideo } from "../lib/video";

/**
 * Pemutar video produk di dalam modal. Isi kolom `video` bisa berupa:
 *   - tautan YouTube -> disematkan lewat iframe (inline, tanpa redirect),
 *   - URL MP4 (mis. dari Storage) -> diputar sebagai <video>,
 *   - kosong / gagal -> jatuh ke foto produk sebagai poster.
 * Untuk MP4, dicoba ulang sekali sebelum menyerah ke foto.
 */
function ProductVideo({ product }: { product: Product }) {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  const media = parseVideo(product.video);

  const onError = () => {
    if (attempt < 1) setAttempt((a) => a + 1);
    else setFailed(true);
  };

  if (media.type === "none" || failed) {
    return (
      <PlaceholderImage
        alt={`Foto ${product.name}`}
        src={product.image}
        label={product.name}
        seed={product.id}
        rounded="rounded-none"
        className="h-full w-full"
      />
    );
  }

  if (media.type === "youtube") {
    return (
      <iframe
        src={media.embedUrl}
        title={`Video ${product.name}`}
        className="h-full w-full"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    );
  }

  return (
    <video
      key={`${media.src}#${attempt}`}
      className="h-full w-full object-cover"
      poster={product.image}
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
      onError={onError}
    >
      <source src={media.src} type="video/mp4" />
    </video>
  );
}

/**
 * Modal detail produk: video besar + info lengkap + tombol tambah keranjang.
 * Bottom-sheet di mobile, dialog tengah di desktop.
 */
export default function ProductDetailModal({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  // Kunci scroll body via pengunci bersama (reference-counted) — aman meski
  // terbuka berbarengan dengan modal/drawer lain.
  useEffect(() => {
    if (!product) return;
    return kunciScroll();
  }, [product]);

  // Reset feedback tombol & tutup dengan Escape selama modal buka.
  useEffect(() => {
    if (!product) return;
    setAdded(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [product, onClose]);

  const handleAdd = () => {
    if (!product) return;
    add(product);
    setAdded(true);
  };

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Overlay */}
          <button
            type="button"
            aria-label="Tutup"
            onClick={onClose}
            className="absolute inset-0 bg-cocoa-900/60 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={product.name}
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[1.5rem] bg-paper-50 shadow-cocoa-lg sm:max-h-[86vh] sm:rounded-[1.75rem] md:min-h-[380px] md:flex-row"
          >
            {/* Tombol tutup */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-cocoa-900/50 text-paper-50 backdrop-blur-sm transition-colors hover:bg-cocoa-900"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Video / foto */}
            <div className="relative aspect-video w-full shrink-0 bg-cocoa-900 md:aspect-auto md:w-1/2">
              <ProductVideo key={product.id} product={product} />
              {product.bestSeller && (
                <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-cocoa-900/90 px-2.5 py-1 font-text text-[10px] font-extrabold uppercase tracking-wide text-butter backdrop-blur-sm sm:text-xs">
                  <Star className="h-3 w-3 fill-butter" aria-hidden /> Best Seller
                </span>
              )}
            </div>

            {/* Info — di HP (kolom) harus bisa digulir sendiri supaya tombol
                harga & "Tambah ke Keranjang" tidak terpotong di layar pendek;
                min-h-0 wajib agar overflow bekerja di dalam flex-col. */}
            <div className="flex w-full min-h-0 flex-1 flex-col overflow-y-auto p-6 sm:p-8 md:w-1/2">
              <p className="font-text text-xs font-bold uppercase tracking-wider text-caramel">
                {product.category}
              </p>
              <h3 className="mt-1 font-heading text-2xl text-cocoa-800 sm:text-3xl">
                {product.name}
              </h3>
              <p className="mt-4 font-text leading-relaxed text-cocoa-700/85">
                {product.description}
              </p>

              <div className="mt-auto pt-6">
                <p className="font-text text-xs uppercase tracking-wider text-cocoa-500/60">
                  Harga
                </p>
                <p className="font-heading text-3xl text-cocoa-800">
                  {formatPrice(product.price)}
                </p>
                <button
                  type="button"
                  onClick={handleAdd}
                  className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 font-text text-base font-bold shadow-cocoa transition-all ${
                    added
                      ? "bg-green-600 text-paper-50"
                      : "bg-cocoa-800 text-paper-50 hover:-translate-y-0.5 hover:bg-cocoa-900"
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="h-5 w-5" aria-hidden /> Ditambahkan
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5" aria-hidden /> Tambah ke Keranjang
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
