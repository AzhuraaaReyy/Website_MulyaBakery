/**
 * Cetak struk pesanan (format thermal 80mm) dari panel admin.
 */

import { BRAND, CONTACT, LOCATION } from "../config/contact";
import { formatPrice } from "../data/products";

/* ── Tipe Data ───────────────────────────────────────────────────────────── */

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
  tanggal: string;
  metode: string;
  status: string;
  customerName: string;
  customerPhone: string;
  alamatKirim?: string;
  catatan?: string;
  estimasi?: string;
  labelSubtotal: string;
  baris: StrukBaris[];
  subtotal: number;
  ongkir?: number;
  total: number;
}

/* ── Helper ──────────────────────────────────────────────────────────────── */

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ── Sub-Komponen HTML (Reusable Generators) ─────────────────────────────── */

function renderHeader(): string {
  const address = [LOCATION.addressLine, LOCATION.city]
    .filter(Boolean)
    .join(", ");
  return `
    <div class="kepala">
      <h1 class="brand-name">${esc(BRAND.name.toUpperCase())}</h1>
      ${BRAND.tagline ? `<p class="tagline">${esc(BRAND.tagline)}</p>` : ""}
      ${address ? `<p>${esc(address)}</p>` : ""}
      ${CONTACT.whatsappDisplay ? `<p>WA: ${esc(CONTACT.whatsappDisplay)}</p>` : ""}
    </div>
  `;
}

function renderMeta(data: StrukData): string {
  return `
    <div class="section-meta">
      <div class="baris"><span>No. Pesanan</span><span class="kanan tebal">${esc(data.orderCode)}</span></div>
      <div class="baris"><span>Tanggal</span><span class="kanan">${esc(data.tanggal)}</span></div>
      <div class="baris"><span>Metode</span><span class="kanan">${esc(data.metode)}</span></div>
      <div class="baris"><span>Status</span><span class="kanan">${esc(data.status)}</span></div>
    </div>
  `;
}

function renderItems(baris: StrukBaris[]): string {
  const itemsHtml = baris
    .map((b) => {
      // Baris produk (ada rincian qty x harga)
      if (b.detail !== undefined) {
        return `
          <div class="item-block">
            <div class="nama-produk">${esc(b.judul)}</div>
            <div class="baris rincian">
              <span>${esc(b.detail)}</span>
              ${b.nilai ? `<span class="kanan">${esc(b.nilai)}</span>` : ""}
            </div>
          </div>
        `;
      }
      // Baris label/konsep umum
      return `
        <div class="baris item-label">
          <span>${esc(b.judul)}</span>
          ${b.nilai ? `<span class="kanan tebal">${esc(b.nilai)}</span>` : ""}
        </div>
      `;
    })
    .join("");

  return `
    <div class="section-items">
      <div class="judul-seksi">- RINCIAN PESANAN -</div>
      ${itemsHtml}
    </div>
  `;
}

function renderTotals(data: StrukData): string {
  const ongkirHtml =
    data.ongkir !== undefined && data.ongkir > 0
      ? `<div class="baris"><span>Ongkir</span><span class="kanan">${formatPrice(data.ongkir)}</span></div>`
      : "";

  return `
    <div class="section-totals">
      <div class="baris"><span>${esc(data.labelSubtotal)}</span><span class="kanan">${formatPrice(data.subtotal)}</span></div>
      ${ongkirHtml}
      <div class="garis-tipis"></div>
      <div class="baris total-utama">
        <span>TOTAL</span>
        <span class="kanan">${formatPrice(data.total)}</span>
      </div>
    </div>
  `;
}

function renderCustomer(data: StrukData): string {
  return `
    <div class="section-customer">
      <div class="baris"><span>Pelanggan</span><span class="kanan tebal">${esc(data.customerName)}</span></div>
      <div class="baris"><span>No. HP</span><span class="kanan">${esc(data.customerPhone)}</span></div>
      ${
        data.alamatKirim
          ? `<div class="baris blok-teks"><span>Alamat:</span><p class="teks-panjang">${esc(data.alamatKirim)}</p></div>`
          : ""
      }
      ${
        data.catatan
          ? `<div class="baris blok-teks"><span>Catatan:</span><p class="teks-panjang">${esc(data.catatan)}</p></div>`
          : ""
      }
      ${
        data.estimasi
          ? `<div class="baris"><span>Estimasi</span><span class="kanan">${esc(data.estimasi)}</span></div>`
          : ""
      }
    </div>
  `;
}

/* ── Dokumen HTML Utama ─────────────────────────────────────────────────── */

export function buatStrukHtml(data: StrukData): string {
  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Struk ${esc(data.orderCode)}</title>
<script>
  try { if (window.opener) window.opener = null; } catch (e) {}
</script>
<style>
  /* Reset & Dasar Printer Thermal */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  
  body {
    font-family: 'Courier New', Courier, monospace;
    font-size: 11px;
    line-height: 1.3;
    color: #000;
    background: #fff;
    padding: 4px;
  }
  
  /* Lebar printable area 80mm aman di 72mm - 76mm agar tidak terpotong margin fisik printer */
  .struk {
    width: 74mm;
    margin: 0 auto;
  }
  
  /* Layout Flexbox */
  .baris {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 6px;
    margin-bottom: 2px;
  }
  
  .kanan {
    text-align: right;
    white-space: nowrap;
  }
  
  .tebal { font-weight: bold; }
  
  /* Pembatas / Separator CSS */
  .garis {
    border-bottom: 1px dashed #000;
    margin: 6px 0;
  }
  
  .garis-tebal {
    border-bottom: 2px solid #000;
    margin: 6px 0;
  }
  
  .garis-tipis {
    border-bottom: 1px dotted #000;
    margin: 4px 0;
  }

  /* Header */
  .kepala { text-align: center; margin-bottom: 4px; }
  .kepala .brand-name { font-size: 15px; font-weight: bold; letter-spacing: 0.5px; }
  .kepala .tagline { font-size: 10px; font-style: italic; margin-bottom: 2px; }
  .kepala p { font-size: 10px; line-height: 1.2; }

  /* Rincian Pesanan */
  .judul-seksi { text-align: center; font-weight: bold; margin-bottom: 6px; font-size: 11px; }
  .item-block { margin-bottom: 5px; page-break-inside: avoid; }
  .nama-produk { font-weight: bold; word-break: break-word; }
  .rincian { font-size: 10.5px; padding-left: 4px; }
  .item-label { margin-bottom: 4px; }

  /* Total */
  .total-utama {
    font-size: 13px;
    font-weight: bold;
    padding: 2px 0;
  }

  /* Info Alamat / Catatan */
  .blok-teks {
    flex-direction: column;
    gap: 1px;
    margin-top: 3px;
  }
  .teks-panjang {
    font-size: 10.5px;
    word-break: break-word;
    white-space: pre-wrap;
    padding-left: 6px;
  }

  /* Footer */
  .kaki { text-align: center; margin-top: 8px; font-size: 10px; }
  .kaki p { margin: 1px 0; }

  @page {
    size: 80mm auto;
    margin: 0;
  }
  
  @media print {
    body { padding: 0; }
    .struk { width: 100%; }
  }
</style>
</head>
<body>
  <div class="struk">
    ${renderHeader()}
    <div class="garis-tebal"></div>

    ${renderMeta(data)}
    <div class="garis"></div>

    ${renderItems(data.baris)}
    <div class="garis"></div>

    ${renderTotals(data)}
    <div class="garis"></div>

    ${renderCustomer(data)}
    <div class="garis-tebal"></div>

    <div class="kaki">
      <p class="tebal">Terima Kasih Atas Pesanan Anda!</p>
      <p>Simpan struk ini sebagai bukti pembayaran.</p>
    </div>
  </div>
</body>
</html>`;
}

/* ── Cetak ───────────────────────────────────────────────────────────────── */

export function cetakStruk(data: StrukData): void {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.open();
  win.document.write(buatStrukHtml(data));
  win.document.close();
  win.focus();

  window.setTimeout(() => {
    try {
      win.print();
    } catch {
      /* abaikan bila jendela ditutup user */
    }
  }, 150);
}
