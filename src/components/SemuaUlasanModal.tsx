import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  BadgeCheck,
  AlertCircle,
  Star,
  MessageSquarePlus,
} from "lucide-react";
import PlaceholderImage from "./PlaceholderImage";
import { supabase, readableError } from "../lib/supabase";
import { kunciScroll } from "../lib/scrollLock";

const PER_HALAMAN = 10;

interface UlasanRow {
  id: string;
  reviewer_name: string;
  reviewer_role: string | null;
  rating: number;
  quote: string;
  photo_url: string | null;
  verified_purchase: boolean;
  created_at: string;
  total: number;
}

function Bintang({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`Rating ${rating} dari 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < rating
              ? "fill-caramel text-caramel"
              : "fill-cocoa-900/15 text-cocoa-900/15"
          }`}
          aria-hidden
        />
      ))}
    </div>
  );
}

/**
 * MODAL "SEMUA ULASAN" — daftar seluruh ulasan pelanggan dengan pagination
 * server-side (10/halaman lewat RPC `get_service_reviews_page`), agar halaman
 * utama cukup memuat 10 terbaru dan tidak membebani sistem.
 * Gaya mengikuti modal lain di situs (bottom-sheet di HP, tengah di desktop).
 */
export default function SemuaUlasanModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<UlasanRow[]>([]);
  const [total, setTotal] = useState(0);
  const [memuat, setMemuat] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  // Buka modal → kembali ke halaman 1.
  useEffect(() => {
    if (open && page !== 1) setPage(1);
  }, [open, page]);

  // Muat data satu halaman (server-side).
  useEffect(() => {
    if (!open) return;
    setMemuat(true);
    setGalat(null);
    (async () => {
      if (!supabase) {
        setRows([]);
        setTotal(0);
        setMemuat(false);
        return;
      }
      try {
        const { data, error } = await supabase.rpc(
          "get_service_reviews_page",
          { p_page: page, p_size: PER_HALAMAN },
        );
        if (error) throw error;
        const list = (data ?? []) as UlasanRow[];
        setRows(list);
        setTotal(list[0]?.total ?? 0);
      } catch (err) {
        setGalat(readableError(err));
        setRows([]);
        setTotal(0);
      } finally {
        setMemuat(false);
      }
    })();
  }, [open, page]);

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

  const totalHalaman = Math.max(1, Math.ceil(total / PER_HALAMAN));
  const bisaPrev = page > 1;
  const bisaNext = page < totalHalaman;

  return (
    <>
      {/* Font Itim untuk teks body */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Itim&display=swap');
        .font-section3-p {
          font-family: 'Itim', cursive, sans-serif !important;
        }
      `}</style>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-end justify-center p-3 sm:items-center sm:p-4 md:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label="Tutup semua ulasan"
              onClick={onClose}
              className="absolute inset-0 bg-cocoa-900/55 backdrop-blur-sm"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Semua ulasan pelanggan"
              initial={{ y: 40, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="relative flex max-h-[90dvh] sm:max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-paper-100 shadow-cocoa-lg ring-1 ring-cocoa-700/10 sm:rounded-3xl"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-cocoa-700/10 px-4 py-3.5 sm:px-6 sm:py-4 shrink-0">
                <div className="min-w-0">
                  <span className="font-script text-lg sm:text-xl text-caramel block">
                    Ulasan Pengguna
                  </span>
                  <h2 className="font-heading text-lg sm:text-2xl text-cocoa-800">
                    Semua Ulasan
                  </h2>
                  {total > 0 && (
                    <p className="mt-0.5 font-section3-p text-xs text-cocoa-700/60">
                      {total} ulasan terverifikasi &amp; terbaru
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Tutup"
                  className="shrink-0 rounded-full p-1.5 sm:p-2 text-cocoa-700/70 transition-colors hover:bg-paper-200 hover:text-cocoa-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Isi */}
              <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {memuat ? (
                  <div className="flex items-center justify-center gap-2 py-14 text-cocoa-700/60">
                    <Loader2 className="h-5 w-5 animate-spin" /> Memuat ulasan…
                  </div>
                ) : galat ? (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-xl bg-red-50 p-3 ring-1 ring-red-200"
                  >
                    <AlertCircle
                      className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
                      aria-hidden
                    />
                    <p className="font-section3-p text-xs sm:text-sm text-red-700">
                      {galat}
                    </p>
                  </div>
                ) : rows.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-12 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-paper-200 text-cocoa-700/50">
                      <MessageSquarePlus className="h-6 w-6" aria-hidden />
                    </span>
                    <p className="font-section3-p text-sm text-cocoa-700/70">
                      Belum ada ulasan.
                    </p>
                  </div>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {rows.map((item) => (
                      <li
                        key={item.id}
                        className="flex gap-3 rounded-2xl bg-paper-50 p-3.5 ring-1 ring-cocoa-700/10"
                      >
                        <span className="h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-caramel/40 bg-paper-100">
                          <PlaceholderImage
                            alt={item.reviewer_name}
                            src={item.photo_url ?? ""}
                            label={item.reviewer_name}
                            seed={item.id}
                            rounded="rounded-full"
                            className="h-full w-full object-cover"
                          />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate font-section3-p text-sm font-bold text-cocoa-900">
                              {item.reviewer_name}
                              {item.verified_purchase && (
                                <BadgeCheck
                                  className="ml-1 inline h-4 w-4 shrink-0 text-emerald-600"
                                  aria-label="Pembeli terverifikasi"
                                />
                              )}
                            </p>
                            <span className="shrink-0 font-section3-p text-[11px] text-cocoa-700/50">
                              {new Date(item.created_at).toLocaleDateString(
                                "id-ID",
                                { month: "short", year: "numeric" },
                              )}
                            </span>
                          </div>
                          <div className="mt-1">
                            <Bintang rating={item.rating} />
                          </div>
                          <p className="mt-1.5 font-section3-p text-sm leading-relaxed text-cocoa-700/85 text-justify">
                            "{item.quote}"
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Footer pagination */}
              <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-cocoa-700/10 bg-paper-50 px-4 py-3 sm:flex-nowrap sm:px-6 sm:py-3.5">
                <button
                  type="button"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={!bisaPrev || memuat}
                  className="order-1 inline-flex flex-1 items-center justify-center gap-1 rounded-full bg-paper-200 px-3.5 py-2 font-section3-p text-sm font-bold text-cocoa-800 transition-colors hover:bg-paper-300 disabled:cursor-not-allowed disabled:opacity-40 sm:order-none sm:flex-none"
                >
                  <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
                  Sebelumnya
                </button>

                <span className="order-3 w-full text-center font-section3-p text-sm font-bold text-cocoa-800 sm:order-none sm:w-auto">
                  {total === 0
                    ? "Halaman 1 / 1"
                    : `Halaman ${page} / ${totalHalaman}`}
                </span>

                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!bisaNext || memuat}
                  className="order-2 inline-flex flex-1 items-center justify-center gap-1 rounded-full bg-paper-200 px-3.5 py-2 font-section3-p text-sm font-bold text-cocoa-800 transition-colors hover:bg-paper-300 disabled:cursor-not-allowed disabled:opacity-40 sm:order-none sm:flex-none"
                >
                  Berikutnya
                  <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}