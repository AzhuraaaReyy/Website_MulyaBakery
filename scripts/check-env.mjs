/**
 * check-env.mjs — Pagar pengaman build produksi Mulya Bakery.
 *
 * Jalan OTOMATIS sebelum `npm run build` (via script "prebuild" di package.json).
 *
 * Tujuan: memastikan `.env` produksi berisi variabel WAJIB sebelum situs di-build.
 * Kalau salah satu hilang, build DILANJUTKAN TAPI dikeluarkan peringatan tegas.
 *
 * Mengapa tidak kita GAGALKAN build?
 *   - `npm run build` di mesin lokal sering dipakai tanpa `.env` (mode statis).
 *   - Mematikan build bisa menghambat kerja, sedangkan peringatan + pesan jelas
 *     sudah cukup menyadarkan bila ini akan di-deploy.
 *
 * Untuk pemaksaan penuh (fail), set environment `STRICT_ENV=1` saat build:
 *     STRICT_ENV=1 npm run build   (Linux/macOS)
 *     set STRICT_ENV=1 && npm run build   (Windows cmd)
 *
 * Variabel yang diperiksa:
 *   VITE_SUPABASE_URL                  -> URL proyek Supabase
 *   VITE_SUPABASE_PUBLISHABLE_KEY      -> publishable key (preferensi utama)
 *   VITE_SUPABASE_ANON_KEY             -> anon key (fallback nama lama)
 *   VITE_WHATSAPP_NUMBER               -> nomor WA tujuan pesanan
 *
 * Catatan: file ini TIDAK membaca isi .env secara langsung (Vite yang memuatnya).
 * Kita hanya membaca nilai dari process.env — Vite sudah menyuntikkan variabel
 * VITE_* ke process.env saat menjalankan script npm.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// ── 1. Cek apakah ada file .env di root ─────────────────────────────────────
const envFiles = [
  ".env",
  ".env.production",
  ".env.local",
  ".env.production.local",
];
const adaEnv = envFiles.some((f) => fs.existsSync(path.join(root, f)));

if (!adaEnv) {
  const pesan =
    "TIDAK ADA file .env ditemukan. Situs akan di-build dalam MODE STATIS " +
    "(produk contoh, tanpa pesanan/ulasan tersimpan). Sebelum go-live, buat " +
    "file .env dari .env.example dan isi VITE_SUPABASE_URL, " +
    "VITE_SUPABASE_PUBLISHABLE_KEY, dan VITE_WHATSAPP_NUMBER.";
  if (process.env.STRICT_ENV === "1") {
    console.error("\n[check-env] (STRICT) " + pesan + "\n");
    process.exit(1);
  }
  console.warn("\n⚠️ [check-env] " + pesan + "\n");
} else {
  console.log("[check-env] File .env ditemukan. Memeriksa variabel wajib…");
}

// ── 2. Cek nilai variabel wajib ─────────────────────────────────────────────
const pubKey =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

const cek = [
  {
    nama: "VITE_SUPABASE_URL",
    nilai: process.env.VITE_SUPABASE_URL,
    contoh: "https://xxxx.supabase.co",
  },
  {
    nama: "VITE_SUPABASE_PUBLISHABLE_KEY (atau VITE_SUPABASE_ANON_KEY)",
    nilai: pubKey,
    contoh: "sb_publishable_... / eyJhbGciOi...",
  },
  {
    nama: "VITE_WHATSAPP_NUMBER",
    nilai: process.env.VITE_WHATSAPP_NUMBER,
    contoh: "6287837739102 (format tanpa + dan tanpa spasi)",
  },
];

const hilang = cek.filter((c) => !c.nilai || !String(c.nilai).trim());

if (hilang.length) {
  const rincian = hilang
    .map((h) => `  - ${h.nama}  (contoh: ${h.contoh})`)
    .join("\n");

  const pesan =
    "Variabel lingkungan WAJIB berikut belum terisi di .env:\n" +
    rincian +
    "\n\nTanpa ini, situs bisa ter-deploy dengan data contoh dan pesanan " +
    "pelanggan tidak sampai ke owner. Isi file .env (lihat .env.example).";

  if (process.env.STRICT_ENV === "1") {
    console.error("\n[check-env] (STRICT) " + pesan + "\n");
    process.exit(1);
  }
  console.warn("\n⚠️ [check-env] " + pesan + "\n");
} else {
  console.log("[check-env] ✅ Semua variabel wajib terisi. Lanjut build…");
}

// ── 3. Validasi format nomor WhatsApp (kode negara, tanpa + / spasi) ───────
const wa = (process.env.VITE_WHATSAPP_NUMBER || "").replace(/\D/g, "");
if (wa && !/^62\d{8,14}$/.test(wa)) {
  const pesan =
    "VITE_WHATSAPP_NUMBER tampaknya bukan nomor Indonesia berformat internasional. " +
    `Dibaca: "${process.env.VITE_WHATSAPP_NUMBER}". Seharusnya mulai 62, mis. 6287837739102.`;
  if (process.env.STRICT_ENV === "1") {
    console.error("\n[check-env] (STRICT) " + pesan + "\n");
    process.exit(1);
  }
  console.warn("\n⚠️ [check-env] " + pesan + "\n");
}

// ── 4. Cegah secret key terbawa ke frontend ─────────────────────────────────
const secretTerdeteksi =
  (pubKey &&
    (pubKey.startsWith("sb_secret_") || pubKey.includes("service_role"))) ||
  (process.env.VITE_SUPABASE_SERVICE_ROLE_KEY &&
    /sb_secret_|service_role/i.test(
      process.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
    ));

if (secretTerdeteksi) {
  console.error(
    "\n\u{1F6A8} [check-env] SECRET KEY terdeteksi. JANGAN pernah menaruh " +
      "service_role key / sb_secret_ di frontend — ia melewati semua Row Level " +
      "Security. Pakai VITE_SUPABASE_PUBLISHABLE_KEY (publishable) atau anon key.\n",
  );
  process.exit(1); // selalu gagal — ini pelanggaran keamanan serius.
}

console.log("[check-env] Selesai.\n");
