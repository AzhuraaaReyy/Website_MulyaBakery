/**
 * Papan pengumuman antar-komponen.
 *
 * MASALAH YANG DISELESAIKAN
 * Setiap komponen memanggil hook datanya sendiri-sendiri. `Menu` punya salinan
 * daftar menu, `Testimonials` punya salinan daftar ulasan, dan `ReviewModal`
 * punya salinannya lagi. Ketika pelanggan menyelesaikan pesanan lewat modal
 * keranjang, angka "terjual" di database memang bertambah — tetapi salinan yang
 * dipegang `Menu` tidak tahu apa-apa. Layar baru berubah setelah halaman dimuat
 * ulang, dan bagi pelanggan itu terlihat seperti pesanannya tidak tercatat.
 *
 * CARA KERJA
 * Siapa pun yang mengubah data memanggil `beritahu('menu')`. Semua komponen
 * yang mendengarkan langsung mengambil data terbaru. Tidak ada Provider yang
 * perlu dipasang di App.tsx, dan tidak ada prop yang perlu dioper turun.
 *
 * Sengaja tidak memakai pustaka state management: yang dibutuhkan cuma
 * "beri tahu aku kalau X berubah", dan itu tidak sebanding dengan menambah
 * satu dependensi lagi ke dalam bundel.
 */

export type Peristiwa = "menu" | "ulasan-pelayanan";

const pendengar: Record<Peristiwa, Set<() => void>> = {
  menu: new Set(),
  "ulasan-pelayanan": new Set(),
};

/**
 * Daftarkan satu fungsi untuk dipanggil setiap kali data berubah.
 * Mengembalikan fungsi pembatal — panggil saat komponen dilepas, kalau tidak
 * pendengarnya menumpuk dan komponen yang sudah tiada ikut dipanggil.
 */
export function dengarkan(peristiwa: Peristiwa, fn: () => void): () => void {
  pendengar[peristiwa].add(fn);
  return () => {
    pendengar[peristiwa].delete(fn);
  };
}

/** Umumkan bahwa data jenis tertentu baru saja berubah. */
export function beritahu(peristiwa: Peristiwa): void {
  for (const fn of pendengar[peristiwa]) {
    try {
      fn();
    } catch (err) {
      // Satu pendengar yang gagal tidak boleh menghentikan pendengar lain.
      console.error(`[dataEvents] pendengar "${peristiwa}" gagal:`, err);
    }
  }
}
