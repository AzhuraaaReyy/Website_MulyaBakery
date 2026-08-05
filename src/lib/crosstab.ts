/**
 * Sinyal perubahan antar-TAB pada browser yang sama.
 *
 * Panel admin (/admin) dan halaman publik (/) adalah dua dokumen terpisah —
 * event bus di dalam React (lib/dataevents.ts) tidak menyeberang di antara
 * keduanya. Ketika owner menyetujui ulasan di tab admin, kita ingin tab situs
 * yang sedang terbuka langsung menyegarkan tanpa refresh manual.
 *
 * Caranya: menulis ke localStorage memicu event `storage` di SEMUA tab LAIN
 * dengan origin sama (bukan di tab yang menulis). Nilainya tidak penting —
 * cukup berubah — jadi kita isi timestamp.
 *
 * Batasnya jujur: ini hanya lintas-tab pada browser/perangkat yang SAMA. Untuk
 * perangkat lain (mis. pelanggan di HP-nya sendiri), halaman menyegarkan saat
 * dimuat atau saat tab-nya kembali fokus — bukan seketika. Itu memadai untuk
 * kebutuhan ini tanpa menambah Realtime.
 */

const KUNCI = "mb-testi-refresh";

/** Panggil setelah menyetujui ulasan agar tab situs yang terbuka ikut menyegar. */
export function sinyalTestimoniBerubah(): void {
  try {
    localStorage.setItem(KUNCI, String(Date.now()));
  } catch {
    // localStorage bisa diblokir (mode privasi ketat) — abaikan dengan aman.
  }
}

/** Dengarkan sinyal dari tab lain. Mengembalikan fungsi pembatal. */
export function dengarTestimoniLintasTab(fn: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === KUNCI) fn();
  };
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}
