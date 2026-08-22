/**
 * Cetak struk pesanan (format thermal 80mm) dari panel admin.
 *
 * Tidak memakai library tambahan — menyusun dokumen HTML mandiri lalu dibuka
 * di jendela baru dan otomatis memicu dialog cetak browser. Dipicu dari klik
 * tombol, jadi popup blocker tidak akan memblokirnya.
 */

import { BRAND, CONTACT, LOCATION } from "../config/contact";
import { formatPrice } from "../data/products";

/* ── Tipe data ───────────────────────────────────────────────────────────── */

/** Satu baris detail pada struk. */
export interface StrukBaris {
  /** Nama produk (regular) ATAU label konsep (custom, mis. "Kategori"). */
  judul: string;
  /** Rincian produk (mis. "2 x Rp 15.000"). Kosong untuk baris konsep. */
  detail?: string;
  /** Nilai di kanan (mis. "Rp 30.000" atau "Kue Ulang Tahun"). */
  nilai?: string;
}

export interface StrukData {
  orderCode: string;
  /** Tanggal & jam siap tampil (sudah diformat pemanggil). */
  tanggal: string;
  metode: string;
  status: string;
  customerName: string;
  customerPhone: string;
  alamatKirim?: string;
  catatan?: string;
  estimasi?: string;
  /** Label baris subtotal — "Subtotal Produk" (pesanan) / "Total Produk" (custom). */
  labelSubtotal: string;
  baris: StrukBaris[];
  subtotal: number;
  ongkir?: number;
  total: number;
}

/* ── Helper ──────────────────────────────────────────────────────────────── */

/** Escape teks user agar tidak merusak struktur HTML / menyisipkan markup. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const GARIS = "--------------------------------";

/* ── Dokumen HTML ────────────────────────────────────────────────────────── */

export function buatStrukHtml(data: StrukData): string {
  const garis = `<div class="garis">${GARIS}</div>`;

  const detailBaris = data.baris
    .map((b) => {
      // Baris produk (ada detail) → nama + "qty x harga = nilai".
      if (b.detail !== undefined) {
        return (
          `<div class="item">` +
          `<div>${esc(b.judul)}</div>` +
          `<div class="baris"><span>${esc(b.detail)}</span>` +
          (b.nilai ? `<span>${esc(b.nilai)}</span>` : "") +
          `</div>` +
          `</div>`
        );
      }
      // Baris konsep/label → "label .... nilai".
      return (
        `<div class="baris"><span>${esc(b.judul)}</span>` +
        (b.nilai ? `<span class="kanan">${esc(b.nilai)}</span>` : "") +
        `</div>`
      );
    })
    .join("\n");

  const ongkirBaris =
    data.ongkir !== undefined && data.ongkir > 0
      ? `<div class="baris"><span>Ongkir</span><span>${formatPrice(data.ongkir)}</span></div>`
      : "";

  const infoTambahan: string[] = [];
  if (data.alamatKirim) {
    infoTambahan.push(
      `<div class="baris"><span>Alamat</span><span class="kanan">${esc(data.alamatKirim)}</span></div>`,
    );
  }
  if (data.catatan) {
    infoTambahan.push(
      `<div class="baris"><span>Catatan</span><span class="kanan">${esc(data.catatan)}</span></div>`,
    );
  }
  if (data.estimasi) {
    infoTambahan.push(
      `<div class="baris"><span>Estimasi</span><span class="kanan">${esc(data.estimasi)}</span></div>`,
    );
  }

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Struk ${esc(data.orderCode)}</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 10px 8px; font-family: 'Courier New', Courier, monospace; font-size: 12px; color: #000; background: #fff; }
  .struk { width: 80mm; margin: 0 auto; }
  .kepala { text-align: center; }
  .kepala h1 { font-size: 16px; margin: 0; letter-spacing: 1px; }
  .kepala p { margin: 2px 0 0; font-size: 10px; line-height: 1.3; }
  .garis { border-top: 1px dashed #000; margin: 8px 0; white-space: pre; text-align: center; font-size: 10px; }
  .baris { display: flex; justify-content: space-between; gap: 8px; }
  .baris .kanan { text-align: right; white-space: nowrap; }
  .item { margin-bottom: 6px; }
  .judul { font-weight: bold; text-align: center; margin-bottom: 6px; }
  .info { margin-bottom: 4px; }
  .total { font-size: 14px; font-weight: bold; }
  .kaki { text-align: center; margin-top: 10px; }
  .kaki p { margin: 2px 0; }
  @page { size: 80mm auto; margin: 0; }
  @media print {
    body { padding: 0; }
  }
</style>
</head>
<body>
  <div class="struk">
    <div class="kepala">
      <h1>${esc(BRAND.name.toUpperCase())}</h1>
      <p>${esc(BRAND.tagline)}</p>
      <p>${esc(LOCATION.addressLine)}${LOCATION.city ? `, ${esc(LOCATION.city)}` : ""}</p>
      ${CONTACT.whatsappDisplay ? `<p>${esc(CONTACT.whatsappDisplay)}</p>` : ""}
    </div>

    ${garis}

    <div class="info">
      <div class="baris"><span>No. Pesanan</span><span class="kanan">${esc(data.orderCode)}</span></div>
      <div class="baris"><span>Tanggal</span><span class="kanan">${esc(data.tanggal)}</span></div>
      <div class="baris"><span>Metode</span><span class="kanan">${esc(data.metode)}</span></div>
      <div class="baris"><span>Status</span><span class="kanan">${esc(data.status)}</span></div>
    </div>

    ${garis}

    <div class="judul">RINCIAN PESANAN</div>
    ${detailBaris}

    ${garis}

    <div class="baris"><span>${esc(data.labelSubtotal)}</span><span>${formatPrice(data.subtotal)}</span></div>
    ${ongkirBaris}
    <div class="baris total"><span>TOTAL PEMBAYARAN</span><span>${formatPrice(data.total)}</span></div>

    ${garis}

    <div class="baris"><span>Nama</span><span class="kanan">${esc(data.customerName)}</span></div>
    <div class="baris"><span>No. HP</span><span class="kanan">${esc(data.customerPhone)}</span></div>
    ${infoTambahan.join("\n")}

    <div class="kaki">
      <p>Terima kasih sudah berbelanja!</p>
      <p>Kunjungi lagi ya :)</p>
    </div>
  </div>
</body>
</html>`;
}

/* ── Cetak ───────────────────────────────────────────────────────────────── */

/**
 * Buka jendela baru berisi struk lalu picu dialog cetak.
 * Dipanggil dari klik tombol (user gesture) sehingga aman dari popup blocker.
 */
export function cetakStruk(data: StrukData): void {
  const win = window.open("", "_blank", "noopener,noreferrer");
  if (!win) return;
  win.document.open();
  win.document.write(buatStrukHtml(data));
  win.document.close();
  win.focus();
  // Jeda kecil agar dokumen benar-benar siap sebelum mencetak.
  window.setTimeout(() => {
    try {
      win.print();
    } catch {
      /* abaikan bila jendela sudah ditutup user */
    }
  }, 150);
}