import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
 * PAGINATION BERSAMA untuk semua panel admin
 *
 * `usePagination` memotong daftar jadi halaman-halaman + otomatis reset ke
 * halaman 1 saat `kunci` berubah (mis. filter) dan menjaga halaman tetap valid
 * bila daftar mengecil. `Pagination` adalah kontrol tampilannya (konsisten di
 * semua panel: Produk, Pesanan, Laporan, Kategori, Testimoni, Moderasi).
 * ─────────────────────────────────────────────────────────────────────────── */

const PER_HALAMAN = 10;

/** State pagination + potongan daftar halaman aktif. */
export function usePagination<T>(
  data: T[],
  kunci: unknown,
  perHalaman: number = PER_HALAMAN,
): {
  halaman: number;
  setHalaman: (h: number) => void;
  totalHalaman: number;
  baris: T[];
} {
  const [halaman, setHalaman] = useState(1);

  // Reset ke halaman 1 saat kunci berubah (mis. filter/rentang berbeda).
  useEffect(() => {
    setHalaman(1);
  }, [kunci]);

  const totalHalaman = Math.max(1, Math.ceil(data.length / perHalaman));

  // Jaga halaman tetap valid saat daftar mengecil (mis. setelah hapus/filter).
  useEffect(() => {
    if (halaman > totalHalaman) setHalaman(totalHalaman);
  }, [halaman, totalHalaman]);

  const baris = data.slice(
    (halaman - 1) * perHalaman,
    halaman * perHalaman,
  );

  return { halaman, setHalaman, totalHalaman, baris };
}

/** Kontrol pagination — "Menampilkan X–Y dari Z" + tombol prev/next. */
export function Pagination({
  total,
  perHalaman = PER_HALAMAN,
  halaman,
  setHalaman,
}: {
  total: number;
  perHalaman?: number;
  halaman: number;
  setHalaman: (h: number) => void;
}) {
  const totalHalaman = Math.max(1, Math.ceil(total / perHalaman));
  if (totalHalaman <= 1) return null;

  const dari = (halaman - 1) * perHalaman + 1;
  const sampai = Math.min(halaman * perHalaman, total);

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="font-text text-xs text-cocoa-700/60">
        Menampilkan {dari}–{sampai} dari {total}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setHalaman(Math.max(1, halaman - 1))}
          disabled={halaman <= 1}
          aria-label="Halaman sebelumnya"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-paper-50 text-cocoa-800 ring-1 ring-cocoa-700/10 transition-colors hover:bg-cocoa-800 hover:text-paper-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-paper-50 disabled:hover:text-cocoa-800"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="px-2 font-text text-sm font-bold text-cocoa-800">
          {halaman} / {totalHalaman}
        </span>
        <button
          type="button"
          onClick={() => setHalaman(Math.min(totalHalaman, halaman + 1))}
          disabled={halaman >= totalHalaman}
          aria-label="Halaman berikutnya"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-paper-50 text-cocoa-800 ring-1 ring-cocoa-700/10 transition-colors hover:bg-cocoa-800 hover:text-paper-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-paper-50 disabled:hover:text-cocoa-800"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}