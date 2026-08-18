import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, X } from "lucide-react";
import { kunciScroll } from "../lib/scrollLock";
import {
  useFeatureFlags,
  type FeatureKey,
} from "../context/FeatureFlagsContext";

/**
 * TOMBOL TERKUNCI (CTA Lock) — pengganti tombol/aksi ketika sebuah fitur MATI.
 *
 * Berbeda dengan <FeatureGate> (mem-blur seluruh bagian), komponen ini
 * menggantikan sebuah TOMBOL kecil dengan tombol gembok "Coming Soon". Saat
 * diklik, modal kecil terbuka berisi keterangan lengkap fitur tersebut.
 *
 * Pakai:
 *   {fiturAktif ? <TombolAsli/> : <LockedCta feature="keranjang" />}
 */
export default function LockedCta({
  feature,
  variant = "full",
  label = "Segera Hadir",
  className,
}: {
  feature: FeatureKey;
  /** `full` = tombol lebar dengan teks · `icon` = tombol kecil persegi. */
  variant?: "full" | "icon";
  label?: string;
  className?: string;
}) {
  const { meta } = useFeatureFlags();
  const [buka, setBuka] = useState(false);
  const info = meta(feature);

  const base =
    "inline-flex items-center justify-center gap-2 rounded-full bg-cocoa-700/15 text-cocoa-800 ring-1 ring-cocoa-700/20 transition-all hover:bg-cocoa-700/25 active:scale-95";

  return (
    <>
      <button
        type="button"
        onClick={() => setBuka(true)}
        aria-label={`${info.title} — Coming Soon`}
        className={
          variant === "icon"
            ? `${className ?? ""} flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cocoa-700/15 text-cocoa-700 ring-1 ring-cocoa-700/20 transition-all hover:bg-cocoa-700/25 active:scale-90`
            : `${base} ${className ?? ""} px-4 py-2.5 font-text text-xs font-bold sm:text-sm`
        }
      >
        <Lock className="h-4 w-4 shrink-0" aria-hidden />
        {variant === "full" && <span>{label}</span>}
      </button>

      <FeatureTeaserModal
        open={buka}
        onClose={() => setBuka(false)}
        title={info.title}
        description={info.description}
      />
    </>
  );
}

/**
 * Modal keterangan fitur terkunci — "Coming Soon!" + judul + keterangan.
 * Dipakai oleh <LockedCta> dan bisa dipakai ulang di tempat lain.
 */
export function FeatureTeaserModal({
  open,
  onClose,
  title,
  description,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
}) {
  useEffect(() => {
    if (!open) return;
    return kunciScroll();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Tutup"
            onClick={onClose}
            className="absolute inset-0 bg-cocoa-900/55 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${title} — Coming Soon`}
            initial={{ y: 32, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 32, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="relative flex max-h-[90vh] w-full max-w-sm flex-col items-center gap-2.5 overflow-hidden rounded-3xl bg-paper-100 p-6 text-center shadow-cocoa-lg sm:max-w-md sm:p-8"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className="absolute right-3 top-3 rounded-full p-2 text-cocoa-700/70 transition-colors hover:bg-paper-200 hover:text-cocoa-900"
            >
              <X className="h-5 w-5" />
            </button>

            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-caramel/20 text-cocoa-800 ring-1 ring-caramel/40">
              <Lock className="h-7 w-7" aria-hidden />
            </span>
            <span className="inline-flex items-center rounded-full bg-pink-100 px-3 py-1 font-text text-[11px] font-extrabold uppercase tracking-wider text-pink-600">
              Coming Soon!
            </span>
            <h3 className="font-heading text-xl text-cocoa-800 sm:text-2xl">
              {title}
            </h3>
            <p className="font-section3-p text-sm leading-relaxed text-cocoa-700/80 sm:text-base">
              {description}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 w-full rounded-full bg-cocoa-800 px-6 py-3 font-text text-sm font-bold text-paper-50 shadow-cocoa transition-transform hover:-translate-y-0.5"
            >
              Mengerti
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}