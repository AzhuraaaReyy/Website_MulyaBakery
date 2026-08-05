/**
 * Pengunci scroll halaman.
 *
 * MASALAH YANG DISELESAIKAN
 * Pola yang lazim dipakai di dalam komponen modal seperti ini:
 *
 *     const prev = document.body.style.overflow
 *     document.body.style.overflow = 'hidden'
 *     return () => { document.body.style.overflow = prev }
 *
 * bekerja baik selama hanya ada SATU modal. Begitu ada dua yang bisa terbuka
 * bersamaan — keranjang, lalu formulir ulasan di atasnya — pola itu rusak.
 * Modal kedua membaca nilai "sebelumnya" ketika modal pertama sudah menyetel
 * `hidden`, sehingga ia mencatat `hidden` sebagai keadaan asli halaman. Saat
 * semuanya ditutup, nilai yang dipulihkan adalah `hidden`, dan halaman terkunci
 * selamanya. Bagi pengguna gejalanya: setelah checkout, halaman tidak bisa
 * digulir sama sekali sampai di-refresh.
 *
 * CARA KERJA
 * Keadaan asli halaman hanya direkam sekali, saat kunci PERTAMA dipasang.
 * Scroll baru dipulihkan setelah kunci TERAKHIR dilepas. Berapa pun banyaknya
 * modal yang bertumpuk, halaman selalu kembali ke keadaan semula.
 */

let jumlahKunci = 0;
let gayaAsli = "";

/**
 * Kunci scroll halaman. Mengembalikan fungsi pelepas.
 *
 * Pelepasnya aman dipanggil berkali-kali — panggilan kedua dan seterusnya
 * diabaikan. Ini penting karena React Strict Mode di mode pengembangan sengaja
 * menjalankan efek dua kali untuk menyingkap kebocoran seperti ini.
 */
export function kunciScroll(): () => void {
  if (typeof document === "undefined") return () => {};

  if (jumlahKunci === 0) {
    gayaAsli = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  jumlahKunci += 1;

  let sudahDilepas = false;
  return () => {
    if (sudahDilepas) return;
    sudahDilepas = true;
    jumlahKunci = Math.max(0, jumlahKunci - 1);
    if (jumlahKunci === 0) {
      document.body.style.overflow = gayaAsli;
    }
  };
}

/**
 * Buka paksa semua kunci.
 *
 * Jaring pengaman terakhir. Kalau suatu saat ada komponen yang lupa melepas
 * kuncinya, seluruh halaman menjadi tidak bisa digulir — kerusakan yang jauh
 * lebih parah daripada sekadar modal yang salah tutup. Fungsi ini memberi jalan
 * keluar tanpa perlu memuat ulang halaman.
 */
export function bukaSemuaKunci(): void {
  if (typeof document === "undefined") return;
  jumlahKunci = 0;
  document.body.style.overflow = gayaAsli;
}
