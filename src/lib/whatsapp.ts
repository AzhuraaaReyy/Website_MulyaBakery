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

/** 083162253730 -> 0831-6225-3730, supaya mudah dibaca dan ditelepon balik. */
function rapikanNomor(nomor: string): string {
  const angka = nomor.replace(/\D/g, "");
  const lokal = angka.startsWith("62") ? `0${angka.slice(2)}` : angka;
  const bagian = lokal.match(/^(\d{4})(\d{4})(\d{2,6})$/);
  return bagian ? `${bagian[1]}-${bagian[2]}-${bagian[3]}` : lokal;
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
      "Saya tertarik memesan dan ingin menanyakan menu serta",
      "ketersediaannya hari ini. Mohon informasinya.",
      "",
      "Terima kasih.",
    ].join("\n"),
  );
}

/** Pesan spesifik untuk kartu produk — nama produk sudah terisi otomatis. */
export function productOrderUrl(productName: string): string {
  return buildWhatsAppUrl(
    [
      `Halo ${BRAND.name},`,
      "",
      `Saya ingin menanyakan ketersediaan *${productName}* untuk hari ini.`,
      "",
      "Terima kasih.",
    ].join("\n"),
  );
}

/** Pesan untuk pesanan custom / acara. */
export function customOrderUrl(): string {
  return buildWhatsAppUrl(
    [
      `Halo ${BRAND.name},`,
      "",
      "Saya ingin memesan roti atau kue custom untuk sebuah acara.",
      "Mohon informasi mengenai pilihan, harga, dan waktu pengerjaannya.",
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

  // ── Kepala nota ──────────────────────────────────────────────────────────
  baris.push(`*PESANAN BARU - ${BRAND.name.toUpperCase()}*`);
  baris.push("");
  if (orderCode) baris.push(`No. Pesanan : ${orderCode}`);
  baris.push(`Tanggal     : ${stempelWaktu()}`);
  baris.push("");
  baris.push(GARIS);

  // ── Rincian barang ───────────────────────────────────────────────────────
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
      `    ${qty} x ${formatPrice(product.price)} = ${formatPrice(subtotal)}`,
    );
  });

  baris.push("");
  baris.push(GARIS);
  baris.push(`*TOTAL (${jumlahUnit} item) : ${formatPrice(total)}*`);
  baris.push(GARIS);
  baris.push("");

  // ── Data pemesan ─────────────────────────────────────────────────────────
  baris.push("*DATA PEMESAN*");
  baris.push("");
  baris.push(`Nama     : ${customer.name}`);
  baris.push(`No. HP   : ${rapikanNomor(customer.phone)}`);
  baris.push(
    `Metode   : ${customer.method === "antar" ? "Diantar ke alamat" : "Ambil di toko"}`,
  );
  if (customer.method === "antar" && customer.address) {
    baris.push(`Alamat   : ${customer.address}`);
  }
  if (customer.note) {
    baris.push(`Catatan  : ${customer.note}`);
  }
  if (customer.photoUrl) {
    baris.push(`Foto     : ${customer.photoUrl}`);
  }

  // ── Penutup ──────────────────────────────────────────────────────────────
  baris.push("");
  baris.push(GARIS);
  baris.push(
    customer.method === "antar"
      ? "Mohon konfirmasi ketersediaan stok, biaya pengiriman,"
      : "Mohon konfirmasi ketersediaan stok",
  );
  baris.push(
    customer.method === "antar"
      ? "dan perkiraan waktu pengantaran."
      : "dan waktu pengambilan yang memungkinkan.",
  );
  baris.push("");
  baris.push("Terima kasih.");

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
export function bookingOrderUrl(b: BookingInfo): string {
  const baris: string[] = [];

  baris.push(`*BOOKING PESANAN CUSTOM - ${BRAND.name.toUpperCase()}*`);
  baris.push("");
  baris.push(`Tanggal kirim : ${stempelWaktu()}`);
  baris.push("");
  baris.push(GARIS);

  baris.push("*DETAIL PESANAN*");
  baris.push("");
  baris.push(`Jenis        : ${b.type}`);
  baris.push(`Dibutuhkan   : ${formatDateID(b.date)}`);
  if (b.quantity) baris.push(`Jumlah       : ${b.quantity}`);
  if (b.theme) baris.push(`Tema         : ${b.theme}`);
  if (b.budget) baris.push(`Anggaran     : ${b.budget}`);

  baris.push("");
  baris.push(GARIS);
  baris.push("*DATA PEMESAN*");
  baris.push("");
  baris.push(`Nama         : ${b.name}`);
  baris.push(`No. HP       : ${rapikanNomor(b.phone)}`);
  baris.push(
    `Metode       : ${b.method === "antar" ? "Diantar ke alamat" : "Ambil di toko"}`,
  );
  if (b.method === "antar" && b.address)
    baris.push(`Alamat       : ${b.address}`);
  if (b.note) baris.push(`Catatan      : ${b.note}`);
  if (b.photoUrl) baris.push(`Foto ref.    : ${b.photoUrl}`);

  baris.push("");
  baris.push(GARIS);
  baris.push("Mohon konfirmasi ketersediaan tanggal tersebut");
  baris.push("beserta estimasi biayanya.");
  baris.push("");
  baris.push("Terima kasih.");

  return buildWhatsAppUrl(baris.join("\n"));
}
