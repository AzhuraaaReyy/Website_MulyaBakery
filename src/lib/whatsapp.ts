import { WHATSAPP_NUMBER, BRAND } from "../config/contact";
import { formatPrice } from "../data/products";
import type { CartItem } from "../context/CartContext";

/* ─────────────────────────────────────────────────────────────────────────────
 * CATATAN PENTING: JANGAN PAKAI EMOJI DI BERKAS INI.
 *
 * Emoji memakai 4 byte dalam UTF-8. Sebagian editor dan alat konversi hanya
 * menangani karakter sampai 3 byte dengan benar, sehingga emoji berubah jadi
 * tanda tanya kotak ketika pesan sampai di WhatsApp — sementara huruf biasa,
 * "Rp", dan tanda hubung panjang tetap utuh. Gejalanya membingungkan karena
 * terlihat seperti masalah tampilan, padahal kerusakannya di berkas sumber.
 *
 * Struktur pesan di bawah sengaja dibangun dari huruf, angka, dan tanda baca
 * biasa saja. Hasilnya tetap rapi, dan tidak bisa rusak lagi.
 *
 * Penebalan memakai sintaks WhatsApp: *teks* menjadi tebal.
 * ─────────────────────────────────────────────────────────────────────────── */

/**
 * Batas aman panjang teks pesan WhatsApp.
 *
 * wa.me menaruh seluruh pesan di query string URL. Kalau kepanjangan, WhatsApp
 * memotongnya diam-diam atau tautannya tidak terbuka sama sekali. Pelanggan
 * tidak diberi tahu apa pun, dan pesanan hilang begitu saja.
 */
const BATAS_PESAN = 3500;

const GARIS = "--------------------------------";

/** Membangun URL wa.me dengan pesan yang sudah disiapkan. */
export function buildWhatsAppUrl(
  message: string,
  number: string = WHATSAPP_NUMBER,
): string {
  const dipangkas =
    message.length > BATAS_PESAN
      ? `${message.slice(0, BATAS_PESAN)}\n\n... (pesan dipotong karena terlalu panjang)`
      : message;
  return `https://wa.me/${number}?text=${encodeURIComponent(dipangkas)}`;
}

/** Cek apakah pesan akan terpotong — dipakai untuk memperingatkan pelanggan. */
export function pesanTerlaluPanjang(message: string): boolean {
  return message.length > BATAS_PESAN;
}

/** Tanggal & jam Indonesia, mengikuti zona Asia/Jakarta. */
function stempelWaktu(): string {
  const sekarang = new Date();
  const tanggal = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(sekarang);
  const jam = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(sekarang);
  return `${tanggal}, ${jam} WIB`;
}

/** Sama seperti `stempelWaktu()`, tapi dari timestamp pesanan (ISO) yang sudah dibuat. */
function stempelWaktuDari(iso: string | null | undefined): string {
  if (!iso) return stempelWaktu();
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return stempelWaktu();
  const tanggal = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(d);
  const jam = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(d);
  return `${tanggal}, ${jam} WIB`;
}

/** 083162253730 -> 0831-6225-3730, supaya mudah dibaca dan ditelepon balik. */
function rapikanNomor(nomor: string): string {
  const angka = nomor.replace(/\D/g, "");
  const lokal = angka.startsWith("62") ? `0${angka.slice(2)}` : angka;
  const bagian = lokal.match(/^(\d{4})(\d{4})(\d{2,6})$/);
  return bagian ? `${bagian[1]}-${bagian[2]}-${bagian[3]}` : lokal;
}

/**
 * 081234567890 -> 6281234567890.
 * wa.me WAJIB nomor internasional (kode negara, tanpa "+" dan tanpa awalan 0).
 * Pelanggan sering mengetik nomor dengan awalan 0, jadi dipastikan di sini.
 */
function normalisasiNomorWa(nomor: string): string {
  const angka = nomor.replace(/\D/g, "");
  if (angka.startsWith("0")) return `62${angka.slice(1)}`;
  return angka;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * PESAN RINGKAS (tombol CTA di Hero, Navbar, Footer, kartu produk)
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Pesan umum untuk CTA di Hero & Footer (tanpa produk spesifik). */

export function generalOrderUrl(): string {
  return buildWhatsAppUrl(
    [
      `Halo ${BRAND.name},`,
      "",
      "Saya tertarik untuk memesan roti di Mulya Bakery.",
      "Boleh saya mendapatkan informasi mengenai menu yang tersedia",
      "dan ketersediaannya hari ini?",
      "",
      "Terima kasih. Saya menunggu informasinya.",
    ].join("\n"),
  );
}

export function productOrderUrl(productName: string): string {
  return buildWhatsAppUrl(
    [
      `Halo ${BRAND.name},`,
      "",
      `Saya tertarik dengan *${productName}* dan ingin memesannya.`,
      "Apakah produk tersebut masih tersedia untuk hari ini?",
      "",
      "Terima kasih. Mohon informasinya.",
    ].join("\n"),
  );
}

export function customOrderUrl(): string {
  return buildWhatsAppUrl(
    [
      `Halo ${BRAND.name},`,
      "",
      "Saya ingin berkonsultasi mengenai pesanan roti atau kue custom",
      "untuk sebuah acara.",
      "",
      "Boleh saya mendapatkan informasi mengenai pilihan menu,",
      "harga, dan waktu pengerjaannya?",
      "",
      "Terima kasih.",
    ].join("\n"),
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * PESANAN KERANJANG
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Metode pengambilan pesanan. */
export type OrderMethod = "ambil" | "antar";

/** Data diri pemesan yang ikut dikirim ke owner lewat WhatsApp. */
export interface CustomerInfo {
  name: string;
  phone: string;
  method: OrderMethod;
  /** Wajib bila `method === 'antar'`. */
  address?: string;
  note?: string;
  /** URL foto (di Supabase Storage). wa.me tak bisa lampirkan file, jadi
   *  tautannya disisipkan ke pesan agar owner bisa membukanya. */
  photoUrl?: string;
}

/**
 * Susun teks pesanan keranjang menjadi nota yang bisa langsung dibaca owner:
 * siapa pemesannya, apa isinya, ke mana diantar, dan berapa totalnya — tanpa
 * perlu bertanya balik.
 *
 * Dipisah dari pembuatan URL supaya panjangnya bisa diperiksa lebih dulu.
 */

export function cartOrderMessage(
  items: CartItem[],
  customer: CustomerInfo,
  orderCode?: string | null,
): string {
  const baris: string[] = [];

  // ── Header ────────────────────────────────────────────────────────────────
  baris.push(`*PESANAN ${BRAND.name.toUpperCase()}*`);
  baris.push("");
  baris.push(`Halo ${BRAND.name}, saya ingin melakukan pemesanan.`);
  baris.push("");

  if (orderCode) baris.push(`No. Pesanan : ${orderCode}`);
  baris.push(`Tanggal     : ${stempelWaktu()}`);

  baris.push("");
  baris.push(GARIS);

  // ── Rincian Pesanan ───────────────────────────────────────────────────────
  baris.push("*RINCIAN PESANAN*");
  baris.push("");

  let total = 0;
  let jumlahUnit = 0;

  items.forEach(({ product, qty }, i) => {
    const subtotal = product.price * qty;

    total += subtotal;
    jumlahUnit += qty;

    baris.push(`${i + 1}. ${product.name}`);
    baris.push(
      `   ${qty} x ${formatPrice(product.price)} = ${formatPrice(subtotal)}`,
    );
    baris.push("");
  });

  baris.push(GARIS);
  // Untuk Diantar, total produk belum termasuk biaya pengiriman — sengaja
  // diberi nama "SUBTOTAL PRODUK" agar pelanggan tidak mengira itu total akhir.
  // Untuk Ambil Sendiri (tanpa ongkir) label "TOTAL" tetap dipakai.
  baris.push(
    customer.method === "antar"
      ? `*SUBTOTAL PRODUK (${jumlahUnit} item) : ${formatPrice(total)}*`
      : `*TOTAL (${jumlahUnit} item) : ${formatPrice(total)}*`,
  );
  baris.push(GARIS);

  // ── Data Pemesan ──────────────────────────────────────────────────────────
  baris.push("");
  baris.push("*DATA PEMESAN*");
  baris.push("");

  baris.push(`Nama       : ${customer.name}`);
  baris.push(`No. HP     : ${rapikanNomor(customer.phone)}`);
  baris.push(
    `Pengambilan : ${
      customer.method === "antar" ? "Diantar ke alamat" : "Ambil di toko"
    }`,
  );

  if (customer.method === "antar" && customer.address) {
    baris.push(`Alamat     : ${customer.address}`);
  }

  if (customer.note) {
    baris.push(`Catatan    : ${customer.note}`);
  }

  if (customer.photoUrl) {
    baris.push(`Foto referensi : ${customer.photoUrl}`);
  }

  // ── Penutup ───────────────────────────────────────────────────────────────
  baris.push("");
  baris.push(GARIS);
  baris.push("");

  if (customer.method === "antar") {
    baris.push("Subtotal produk di atas belum termasuk biaya pengiriman.");
    baris.push("");
    baris.push("Mohon dibantu konfirmasi ketersediaan pesanan,");
    baris.push("biaya pengiriman, dan perkiraan waktu pengantaran.");
  } else {
    baris.push("Mohon dibantu konfirmasi ketersediaan pesanan");
    baris.push("dan waktu pengambilan yang tersedia.");
  }

  baris.push("");
  baris.push("Terima kasih. Saya menunggu konfirmasinya.");

  return baris.join("\n");
}

/** Bangun URL wa.me untuk pesanan keranjang. */
export function cartOrderUrl(
  items: CartItem[],
  customer: CustomerInfo,
  orderCode?: string | null,
): string {
  return buildWhatsAppUrl(cartOrderMessage(items, customer, orderCode));
}

/* ═══════════════════════════════════════════════════════════════════════════
 * BOOKING PESANAN CUSTOM
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Data booking / pre-order pesanan custom (kue ulang tahun, hampers, dll). */
export interface BookingInfo {
  name: string;
  phone: string;
  /** Jenis pesanan, mis. "Kue Ulang Tahun". */
  type: string;
  /** Tanggal dibutuhkan (format ISO yyyy-mm-dd). */
  date: string;
  quantity?: string;
  theme?: string;
  budget?: string;
  method: OrderMethod;
  /** Wajib bila `method === 'antar'`. */
  address?: string;
  note?: string;
  /** URL foto referensi (di Supabase Storage). wa.me tak bisa lampirkan file,
   *  jadi tautannya disisipkan ke pesan agar owner bisa membukanya. */
  photoUrl?: string;
}

/** Ubah "2026-08-25" menjadi "Sabtu, 25 Agustus 2026". */
function formatDateID(iso: string): string {
  if (!iso) return "-";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/**
 * Pesan booking pesanan custom. Formatnya sengaja disamakan dengan nota
 * keranjang supaya owner membaca dua jenis pesanan dengan pola yang sama.
 */

export function bookingOrderUrl(
  b: BookingInfo,
  orderCode?: string | null,
): string {
  const baris: string[] = [];

  baris.push(`*PESANAN CUSTOM ${BRAND.name.toUpperCase()}*`);
  baris.push("");
  baris.push(
    `Halo ${BRAND.name}, saya ingin berkonsultasi mengenai pesanan custom.`,
  );
  baris.push("");

  if (orderCode) baris.push(`No. Pesanan   : ${orderCode}`);
  baris.push(`Tanggal pesan : ${stempelWaktu()}`);

  baris.push("");
  baris.push(GARIS);

  // ── Detail Pesanan ────────────────────────────────────────────────────────
  baris.push("*DETAIL PESANAN*");
  baris.push("");

  baris.push(`Jenis         : ${b.type}`);
  baris.push(`Dibutuhkan    : ${formatDateID(b.date)}`);

  if (b.quantity) {
    baris.push(`Jumlah        : ${b.quantity}`);
  }

  if (b.theme) {
    baris.push(`Tema          : ${b.theme}`);
  }

  if (b.budget) {
    baris.push(`Anggaran      : ${b.budget}`);
  }

  baris.push("");
  baris.push(GARIS);

  // ── Data Pemesan ──────────────────────────────────────────────────────────
  baris.push("*DATA PEMESAN*");
  baris.push("");

  baris.push(`Nama          : ${b.name}`);
  baris.push(`No. HP        : ${rapikanNomor(b.phone)}`);
  baris.push(
    `Pengambilan   : ${
      b.method === "antar" ? "Diantar ke alamat" : "Ambil di toko"
    }`,
  );

  if (b.method === "antar" && b.address) {
    baris.push(`Alamat        : ${b.address}`);
  }

  if (b.note) {
    baris.push(`Catatan       : ${b.note}`);
  }

  if (b.photoUrl) {
    baris.push(`Foto referensi: ${b.photoUrl}`);
  }

  // ── Penutup ───────────────────────────────────────────────────────────────
  baris.push("");
  baris.push(GARIS);
  baris.push("");

  baris.push("Mohon dibantu untuk menginformasikan ketersediaan");
  baris.push(
    "tanggal tersebut, pilihan yang tersedia, dan perkiraan biayanya.",
  );

  baris.push("");
  baris.push("Terima kasih. Saya menunggu informasi selanjutnya.");

  return buildWhatsAppUrl(baris.join("\n"));
}

/* ═══════════════════════════════════════════════════════════════════════════
 * KONFIRMASI ONGKIR (dari admin panel ke pelanggan)
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Data pesanan yang dibutuhkan untuk pesan konfirmasi ongkir. */
export interface OrderOngkirInfo {
  /** No. pesanan (order_code). */
  orderCode: string;
  customerName: string;
  customerPhone: string;
  /** Total harga produk (subtotal), sebelum ongkir. */
  subtotal: number;
  /** Biaya pengiriman yang sudah diisi admin. */
  shippingFee: number;
  /** Estimasi waktu pengantaran (opsional, mis. "±30 menit"). */
  deliveryEstimate?: string | null;
  /** Alamat pengiriman pelanggan. */
  address?: string | null;
  /** Daftar produk pesanan — ditampilkan sebagai RINCIAN PESANAN. */
  items?: { name: string; price: number; qty: number }[];
  /** Waktu pesanan dibuat (ISO) — ditampilkan di baris "Tanggal". */
  createdAt?: string | null;
}

/**
 * Pesan konfirmasi ongkir yang dikirim admin ke pelanggan via WhatsApp.
 * Formatnya sengaja disamakan dengan nota pesanan awal (`cartOrderMessage`)
 * supaya pelanggan membaca pola yang sama — hanya sekarang sudah ada TOTAL
 * yang mencakup biaya pesanan + biaya pengiriman.
 * Dibuat otomatis dari data pesanan — admin tidak perlu mengetik ulang.
 * Tanpa emoji, memakai *bold* WhatsApp & garis pemisah yang sama.
 */
export function ongkirKonfirmasiMessage(o: OrderOngkirInfo): string {
  const total = o.subtotal + o.shippingFee;
  const jumlahUnit = (o.items ?? []).reduce((s, it) => s + it.qty, 0);
  const baris: string[] = [];

  // ── Header ────────────────────────────────────────────────────────────────
  baris.push(`*KONFIRMASI PESANAN ${BRAND.name.toUpperCase()}*`);
  baris.push("");
  baris.push(`Halo Kak ${o.customerName},`);
  baris.push("");
  baris.push("Berikut rincian pembayaran untuk pesanan Anda.");
  baris.push("");

  if (o.orderCode) baris.push(`No. Pesanan : ${o.orderCode}`);
  baris.push(`Tanggal     : ${stempelWaktuDari(o.createdAt)}`);

  baris.push("");
  baris.push(GARIS);

  // ── Rincian Pesanan / Biaya ───────────────────────────────────────────────
  if (o.items && o.items.length > 0) {
    baris.push("*RINCIAN PESANAN*");
    baris.push("");

    o.items.forEach((item, i) => {
      baris.push(`${i + 1}. ${item.name}`);
      baris.push(
        `   ${item.qty} x ${formatPrice(item.price)} = ${formatPrice(
          item.price * item.qty,
        )}`,
      );
      baris.push("");
    });
  } else {
    baris.push("*RINCIAN BIAYA*");
    baris.push("");
  }

  baris.push(GARIS);
  // Subtotal dan total dipisah agar jelas biaya pesanan vs biaya pengiriman.
  baris.push(
    jumlahUnit > 0
      ? `*SUBTOTAL PRODUK (${jumlahUnit} item) : ${formatPrice(o.subtotal)}*`
      : `*SUBTOTAL PRODUK : ${formatPrice(o.subtotal)}*`,
  );
  baris.push(`Biaya Pengiriman     : ${formatPrice(o.shippingFee)}`);

  if (o.deliveryEstimate) {
    baris.push(`Estimasi Pengantaran : ${o.deliveryEstimate}`);
  }

  baris.push(`*TOTAL PEMBAYARAN    : ${formatPrice(total)}*`);
  baris.push(GARIS);

  // ── Data Pemesan ──────────────────────────────────────────────────────────
  baris.push("");
  baris.push("*DATA PEMESAN*");
  baris.push("");

  baris.push(`Nama        : ${o.customerName}`);
  baris.push(`No. HP      : ${rapikanNomor(o.customerPhone)}`);
  baris.push("Pengambilan : Diantar ke alamat");

  if (o.address) {
    baris.push(`Alamat      : ${o.address}`);
  }

  // ── Penutup ───────────────────────────────────────────────────────────────
  baris.push("");
  baris.push(GARIS);
  baris.push("");

  baris.push("Mohon konfirmasi apakah pesanan dengan total");
  baris.push("tersebut dapat kami proses.");

  baris.push("");
  baris.push("Terima kasih.");

  return baris.join("\n");
}

/** Bangun URL wa.me ke nomor pelanggan berisi pesan konfirmasi ongkir. */
export function ongkirKonfirmasiUrl(o: OrderOngkirInfo): string {
  return buildWhatsAppUrl(
    ongkirKonfirmasiMessage(o),
    normalisasiNomorWa(o.customerPhone),
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * KONFIRMASI ONGKIR — PESANAN CUSTOM (dari admin panel ke pelanggan)
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Data pesanan custom yang dibutuhkan untuk pesan konfirmasi ongkir. */
export interface OrderCustomOngkirInfo {
  /** No. pesanan custom (order_code). */
  orderCode: string;
  customerName: string;
  customerPhone: string;
  /** Harga produk custom (total final yang diisi admin), sebelum ongkir. */
  totalProduk: number;
  /** Biaya pengiriman yang sudah diisi admin. */
  shippingFee: number;
  /** Estimasi waktu pengantaran (opsional, mis. "±30 menit"). */
  deliveryEstimate?: string | null;
  /** Alamat pengiriman pelanggan. */
  address?: string | null;
  /** Waktu pesanan dibuat (ISO) — ditampilkan di baris "Tanggal". */
  createdAt?: string | null;
}

/**
 * Pesan konfirmasi ongkir untuk pesanan CUSTOM. Formatnya mengikuti nota
 * pesanan custom awal (`bookingOrderUrl`) dan pesan konfirmasi keranjang
 * (`ongkirKonfirmasiMessage`) supaya pelanggan membaca pola yang sama.
 * Tanpa emoji, memakai *bold* WhatsApp & garis pemisah yang sama.
 */
export function ongkirKonfirmasiMessageCustom(o: OrderCustomOngkirInfo): string {
  const total = o.totalProduk + o.shippingFee;
  const baris: string[] = [];

  // ── Header ────────────────────────────────────────────────────────────────
  baris.push(`*KONFIRMASI PESANAN CUSTOM ${BRAND.name.toUpperCase()}*`);
  baris.push("");
  baris.push(`Halo Kak ${o.customerName},`);
  baris.push("");
  baris.push("Berikut rincian pembayaran untuk pesanan Anda.");
  baris.push("");

  if (o.orderCode) baris.push(`No. Pesanan : ${o.orderCode}`);
  baris.push(`Tanggal     : ${stempelWaktuDari(o.createdAt)}`);

  baris.push("");
  baris.push(GARIS);

  // ── Rincian Biaya ─────────────────────────────────────────────────────────
  baris.push("*RINCIAN BIAYA*");
  baris.push("");
  baris.push(GARIS);
  baris.push(`*TOTAL PRODUK         : ${formatPrice(o.totalProduk)}*`);
  baris.push(`Biaya Pengiriman     : ${formatPrice(o.shippingFee)}`);

  if (o.deliveryEstimate) {
    baris.push(`Estimasi Pengantaran : ${o.deliveryEstimate}`);
  }

  baris.push(`*TOTAL PEMBAYARAN    : ${formatPrice(total)}*`);
  baris.push(GARIS);

  // ── Data Pemesan ──────────────────────────────────────────────────────────
  baris.push("");
  baris.push("*DATA PEMESAN*");
  baris.push("");

  baris.push(`Nama        : ${o.customerName}`);
  baris.push(`No. HP      : ${rapikanNomor(o.customerPhone)}`);
  baris.push("Pengambilan : Diantar ke alamat");

  if (o.address) {
    baris.push(`Alamat      : ${o.address}`);
  }

  // ── Penutup ───────────────────────────────────────────────────────────────
  baris.push("");
  baris.push(GARIS);
  baris.push("");

  baris.push("Mohon konfirmasi apakah pesanan dengan total");
  baris.push("tersebut dapat kami proses.");

  baris.push("");
  baris.push("Terima kasih.");

  return baris.join("\n");
}

/** Bangun URL wa.me ke nomor pelanggan berisi pesan konfirmasi ongkir custom. */
export function ongkirKonfirmasiCustomUrl(o: OrderCustomOngkirInfo): string {
  return buildWhatsAppUrl(
    ongkirKonfirmasiMessageCustom(o),
    normalisasiNomorWa(o.customerPhone),
  );
}
