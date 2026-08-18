/**
 * Daftar fitur situs yang bisa di-toggle oleh super admin (Feature Gating).
 *
 * Setiap kunci punya judul & keterangan "Coming Soon" yang dipakai:
 *   - sebagai data awal bila tabel `feature_flags` belum ada / gagal dimuat
 *     (mode statis tanpa Supabase → semua fitur AKTIF),
 *   - sebagai acuan di panel admin "Pengaturan Fitur".
 *
 * Kunci WAJIB sinkron dengan seed di supabase/migrations/009_feature_flags.sql.
 */

export const FEATURE_KEYS = [
  // ── Bagian (section) halaman publik ──────────────────────────────────────
  "hero",
  "tentang",
  "menu",
  "cara_pesan",
  "keunggulan",
  "testimoni",
  "galeri",
  "kontak",
  "faq",

  // ── Fitur interaktif publik ──────────────────────────────────────────────
  "keranjang",
  "pesanan_khusus",
  "ulasan",
  "pesan_wa",

  // ── Fitur panel admin ────────────────────────────────────────────────────
  "panel_menu",
  "panel_kategori",
  "panel_pesanan",
  "panel_pesanan_khusus",
  "panel_laporan",
  "panel_testimoni",
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];

export interface FeatureMeta {
  title: string;
  description: string;
}

/** Status fitur hasil muat dari database. */
export interface FeatureFlagRow extends FeatureMeta {
  key: FeatureKey;
  enabled: boolean;
}

/** Nilai awal (fallback) — semua fitur AKTIF dengan keterangan standar. */
export const FEATURE_DEFAULTS: Record<FeatureKey, FeatureMeta> = {
  // Section publik
  hero: {
    title: "Sambutan / Hero",
    description:
      "Banner pembuka situs sedang disiapkan. Tunggu kabar dari kami ya!",
  },
  tentang: {
    title: "Tentang Kami",
    description:
      "Cerita dan profil Mulya Bakery akan segera hadir di sini.",
  },
  menu: {
    title: "Menu Produk",
    description:
      "Daftar roti & kue favorit sedang diperbarui. Segera hadir!",
  },
  cara_pesan: {
    title: "Cara Pemesanan",
    description:
      "Panduan langkah demi langkah pemesanan sedang disiapkan.",
  },
  keunggulan: {
    title: "Keunggulan Kami",
    description:
      "Keunggulan produk & pelayanan kami akan segera ditampilkan.",
  },
  testimoni: {
    title: "Testimoni Pelanggan",
    description:
      "Kumpulan cerita manis pelanggan sedang dikumpulkan. Segera hadir!",
  },
  galeri: {
    title: "Galeri",
    description:
      "Galeri foto produk & proses pembuatan akan segera hadir.",
  },
  kontak: {
    title: "Lokasi & Kontak",
    description: "Informasi alamat dan kontak kami sedang disiapkan.",
  },
  faq: {
    title: "FAQ",
    description:
      "Kumpulan pertanyaan yang sering ditanyakan sedang diperbarui.",
  },

  // Interaktif publik
  keranjang: {
    title: "Keranjang & Checkout",
    description:
      "Pesan langsung dari menu via keranjang belanja. Sedang disiapkan!",
  },
  pesanan_khusus: {
    title: "Pemesanan Khusus",
    description:
      "Konsultasi pesanan khusus (kue ulang tahun, hampers, snackbox) segera hadir.",
  },
  ulasan: {
    title: "Tulis Ulasan",
    description:
      "Fitur berbagi ulasan & pengalaman pelanggan sedang disiapkan.",
  },
  pesan_wa: {
    title: "Pesan via WhatsApp",
    description:
      "Tombol pesan langsung via WhatsApp sedang diperbarui. Segera hadir!",
  },

  // Panel admin
  panel_menu: {
    title: "Panel Admin: Menu",
    description:
      "Kelola produk menu. Sedang disiapkan untuk dikelola kembali.",
  },
  panel_kategori: {
    title: "Panel Admin: Kategori",
    description:
      "Kelola kategori produk. Sedang disiapkan untuk dikelola kembali.",
  },
  panel_pesanan: {
    title: "Panel Admin: Pesanan",
    description:
      "Kelola pesanan pelanggan. Sedang disiapkan untuk dikelola kembali.",
  },
  panel_pesanan_khusus: {
    title: "Panel Admin: Pesanan Khusus",
    description:
      "Kelola pesanan khusus pelanggan. Sedang disiapkan.",
  },
  panel_laporan: {
    title: "Panel Admin: Laporan",
    description:
      "Lihat laporan penjualan & pendapatan. Sedang disiapkan.",
  },
  panel_testimoni: {
    title: "Panel Admin: Testimoni",
    description:
      "Moderasi ulasan & testimoni pelanggan. Sedang disiapkan.",
  },
};

/** Semua fitur AKTIF (fallback mode statis / gagal muat). */
export function semuaFiturAktif(): Record<FeatureKey, FeatureFlagRow> {
  const out = {} as Record<FeatureKey, FeatureFlagRow>;
  for (const key of FEATURE_KEYS) {
    out[key] = { key, enabled: true, ...FEATURE_DEFAULTS[key] };
  }
  return out;
}