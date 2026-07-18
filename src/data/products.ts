/**
 * Data dummy produk. Ganti dengan data asli UMKM nanti.
 * `featured` menandai produk unggulan yang tampil di showcase (foto + switcher).
 */

export type ProductCategory =
  | "Roti Manis"
  | "Roti Tawar"
  | "Kue Kering/Pastry"
  | "Pesanan Custom";

export interface Product {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  description: string;
  /** Path foto produk (mis. "/images/roti-coklat-keju.jpg"). */
  image: string;
  bestSeller?: boolean;
  /** Tampil di showcase produk unggulan (video besar + switcher). */
  featured?: boolean;
  /**
   * (Opsional) Video produk untuk showcase unggulan (mis. "/videos/roti-coklat-keju.mp4").
   * Bila file belum ada, otomatis fallback ke foto `image` sebagai poster.
   */
  video?: string;
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

/* ─────────────────────────────────────────────────────────────────────────────
 * VIDEO DEMO (sementara)
 *
 * File video asli belum ada di `public/videos/` (baru berisi README), sehingga
 * showcase selalu jatuh ke poster foto. Agar fiturnya bisa dilihat berfungsi,
 * sementara ini dipakai klip sampel publik (MDN, W3Schools, Blender) — isinya
 * BUKAN roti, murni untuk demo. Butuh koneksi internet.
 *
 * CARA MENGEMBALIKAN: ganti nilai `video:` tiap produk di bawah dengan path
 * lokalnya (sudah ditulis sebagai komentar di sebelahnya), lalu taruh file
 * .mp4 di `public/videos/`. Tidak ada perubahan kode lain yang diperlukan.
 * ─────────────────────────────────────────────────────────────────────────── */
const TV = "https://test-videos.co.uk/vids";
const DEMO = {
  a: "https://mdn.github.io/shared-assets/videos/flower.mp4",
  b: `${TV}/jellyfish/mp4/h264/720/Jellyfish_720_10s_1MB.mp4`,
  c: `${TV}/sintel/mp4/h264/720/Sintel_720_10s_1MB.mp4`,
  d: `${TV}/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4`,
  e: "https://www.w3schools.com/html/mov_bbb.mp4",
};

export const products: Product[] = [
  {
    id: "roti-coklat-keju",
    name: "Roti Coklat Keju",
    price: 12000,
    category: "Roti Manis",
    description:
      "Roti empuk isi coklat leleh dan keju parut, favorit segala usia.",
    image: "/images/roti-coklat-keju.jpg",
    bestSeller: true,
    featured: true,
    video: DEMO.a, // asli: "/videos/roti-coklat-keju.mp4"
  },
  {
    id: "roti-tawar-gandum",
    name: "Roti Tawar Gandum",
    price: 22000,
    category: "Roti Tawar",
    description:
      "Roti tawar gandum utuh, lembut dan mengenyangkan untuk sarapan sehat.",
    image: "/images/roti-tawar-gandum.jpg",
    featured: true,
    video: DEMO.b, // asli: "/videos/roti-tawar-gandum.mp4"
  },
  {
    id: "roti-sobek-pandan",
    name: "Roti Sobek Pandan",
    price: 25000,
    category: "Roti Manis",
    description: "Roti sobek harum pandan, dijalin lembut dan manis pas.",
    image: "/images/roti-sobek-pandan.jpg",
    bestSeller: true,
    featured: true,
    video: DEMO.c, // asli: "/videos/roti-sobek-pandan.mp4"
  },
  {
    id: "croissant-butter",
    name: "Croissant Butter",
    price: 18000,
    category: "Kue Kering/Pastry",
    description:
      "Pastry berlapis renyah dengan butter premium, gurih dan buttery.",
    image: "/images/croissant-butter.jpg",
    featured: true,
    video: DEMO.d, // asli: "/videos/croissant-butter.mp4"
  },
  {
    id: "nastar-premium",
    name: "Nastar Premium",
    price: 65000,
    category: "Kue Kering/Pastry",
    description:
      "Kue kering lumer isi selai nanas homemade. Per toples 250 gram.",
    image: "/images/nastar-premium.jpg",
    bestSeller: true,
    featured: true,
    video: DEMO.e, // asli: "/videos/nastar-premium.mp4"
  },
  {
    id: "kue-ulang-tahun",
    name: "Kue Ulang Tahun Custom",
    price: 250000,
    category: "Pesanan Custom",
    description:
      "Kue custom sesuai tema acara Anda. Harga mulai dari, sesuai desain.",
    image: "/images/kue-ulang-tahun.jpg",
  },
];

/** Produk unggulan — dipakai di showcase (foto besar + switcher). */
export const featuredProducts = products.filter((p) => p.featured);
