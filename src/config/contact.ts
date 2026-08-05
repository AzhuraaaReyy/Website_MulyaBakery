/**
 * Konfigurasi kontak global.
 * Dipakai di seluruh halaman: Navbar, Hero, About, HowToOrder, LocationContact,
 * Footer, dan seluruh tautan pemesanan WhatsApp.
 */

/* ─────────────────────────────────────────────────────────────────────────────
 * NOMOR WHATSAPP TUJUAN PESANAN
 *
 * Diambil dari environment variable, BUKAN ditulis langsung di sini. Alasannya
 * bukan kerapian, tapi keselamatan data: kalau situs sempat live dengan nomor
 * yang salah, seluruh pesanan — lengkap dengan nama, nomor HP, dan alamat rumah
 * pelanggan — terkirim ke WhatsApp orang asing.
 *
 * Isi di file `.env` (lihat `.env.example`):
 *     VITE_WHATSAPP_NUMBER=628xxxxxxxxxx
 *
 * Format: kode negara tanpa tanda "+" dan tanpa spasi.
 *     081234567890  →  6281234567890
 *
 * Build produksi akan GAGAL bila nilainya masih contoh — lihat
 * `scripts/check-env.mjs`. Lebih baik build gagal daripada data pelanggan
 * nyasar ke nomor yang salah.
 * ─────────────────────────────────────────────────────────────────────────── */

const NOMOR_CONTOH = "6283162253730";

const dariEnv = (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined)
  ?.replace(/\D/g, "")
  .trim();

export const WHATSAPP_NUMBER = dariEnv || NOMOR_CONTOH;

if (import.meta.env.DEV && WHATSAPP_NUMBER === NOMOR_CONTOH) {
  console.warn(
    "[Kontak] VITE_WHATSAPP_NUMBER belum diisi — memakai nomor contoh. " +
      "Pesanan TIDAK akan sampai ke owner. Isi di file .env sebelum dipakai sungguhan.",
  );
}

/** Nomor siap tampil: 6281234567890 → +62 812-3456-7890 */
function formatTampil(nomor: string): string {
  if (!nomor.startsWith("62")) return `+${nomor}`;
  const inti = nomor.slice(2);
  const bagian = inti.match(/^(\d{3})(\d{4})(\d{0,6})$/);
  if (!bagian) return `+62 ${inti}`;
  return `+62 ${bagian[1]}-${bagian[2]}${bagian[3] ? `-${bagian[3]}` : ""}`;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * DATA BISNIS
 *
 * ⚠️ MASIH DATA CONTOH. Ganti seluruhnya dengan data asli Mulya Bakery
 * sebelum situs dipublikasikan.
 * ─────────────────────────────────────────────────────────────────────────── */

export const BRAND = {
  name: "Mulya Bakery",
  tagline: "Roti rumahan, dibuat dengan cinta setiap hari.",
  established: 2021,
};

export const CONTACT = {
  whatsapp: WHATSAPP_NUMBER,
  whatsappDisplay: formatTampil(WHATSAPP_NUMBER),
  phone: formatTampil(WHATSAPP_NUMBER),
  instagram: "mulyabakery",
  instagramUrl: "https://instagram.com/mulyabakery",
  email: "halo@mulyabakery.id",
};

export const LOCATION = {
  addressLine: "Jl. Contoh No. 12, Kel. Contoh",
  city: "Semarang, Jawa Tengah",
  mapsQuery: "Mulya Bakery Semarang",
  /**
   * (Opsional) Tempel URL embed dari Google Maps untuk menampilkan lokasi PERSIS.
   * Cara: buka Google Maps → cari lokasi → Share/Bagikan → "Embed a map" →
   * salin isi atribut src="..." pada iframe, tempel di sini.
   * Bila dibiarkan kosong, peta otomatis dibuat dari `mapsQuery` di atas.
   */
  mapEmbedSrc: "",
  hours: [
    { day: "Senin – Jumat", time: "07.00 – 20.00" },
    { day: "Sabtu – Minggu", time: "08.00 – 21.00" },
    { day: "Hari libur nasional", time: "08.00 – 15.00" },
  ],
};
