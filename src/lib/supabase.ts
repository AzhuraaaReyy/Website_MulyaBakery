import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Klien Supabase tunggal untuk seluruh aplikasi.
 *
 * Soal `anon key`: kunci ini MEMANG publik dan ikut ter-bundle ke JavaScript
 * yang dikirim ke browser. Itu bukan kebocoran — begitulah cara Supabase
 * dirancang. Yang menjaga data adalah Row Level Security di sisi database
 * (lihat supabase/schema.sql), bukan kerahasiaan kunci ini.
 *
 * Yang TIDAK BOLEH ada di sini selamanya: `service_role key`. Kunci itu
 * melewati seluruh RLS. Kalau sampai masuk ke frontend, semua data pelanggan
 * terbuka untuk siapa pun yang membuka DevTools.
 */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined;

/** Situs tetap bisa dibuka walau Supabase belum dikonfigurasi (mode statis). */
export const isSupabaseConfigured = Boolean(url && anonKey);

// Pagar pengaman: kalau seseorang tanpa sengaja menempelkan kunci rahasia ke
// sini, hentikan sekarang juga — jangan sampai lolos ke produksi.
//
// Diperiksa dalam DUA format sekaligus karena Supabase mengganti penamaannya:
//   lama : anon / service_role   → JWT, memuat teks "service_role" di dalamnya
//   baru : sb_publishable_...    → aman untuk browser
//          sb_secret_...         → RAHASIA, hanya untuk server
// Memeriksa format lama saja tidak lagi cukup.
if (
  anonKey &&
  (anonKey.startsWith("sb_secret_") || anonKey.includes("service_role"))
) {
  throw new Error(
    "[Supabase] Secret key terdeteksi di frontend. " +
      "Kunci ini melewati semua Row Level Security dan TIDAK BOLEH ada di browser. " +
      "Gunakan Publishable key (sb_publishable_...) atau anon key.",
  );
}

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.warn(
    "[Supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY belum diisi. " +
      "Situs berjalan dengan data statis: like, pesanan, dan ulasan tidak tersimpan.",
  );
}

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

/**
 * Ubah error Supabase menjadi kalimat yang bisa dibaca pelanggan.
 * Pesan dari database ditulis dalam bahasa Indonesia (lihat schema.sql), jadi
 * sebagian besar bisa langsung ditampilkan. Sisanya diganti pesan umum supaya
 * detail internal database tidak bocor ke layar pelanggan.
 */
export function readableError(err: unknown): string {
  if (!err) return "Terjadi kesalahan. Coba lagi ya.";

  const message =
    typeof err === "object" && err !== null && "message" in err
      ? String((err as { message: unknown }).message)
      : String(err);

  // Pesan yang sengaja kita lempar sendiri dari RPC — aman ditampilkan.
  const dikenali = [
    "nama tidak valid",
    "nomor HP tidak valid",
    "rating harus",
    "ulasan terlalu panjang",
    "ulasan minimal",
    "ulasan terdeteksi sebagai spam",
    "kamu sudah pernah mengulas",
    "kamu sudah mengirim ulasan",
    "alamat wajib",
    "alamat atau catatan terlalu panjang",
    "keranjang kosong",
    "produk tidak ditemukan",
    "produk tidak tersedia",
    "produk masih terhubung",
    "hanya admin yang boleh",
    "metode tidak valid",
    "jumlah item tidak wajar",
  ];

  const cocok = dikenali.find((f) =>
    message.toLowerCase().includes(f.toLowerCase()),
  );
  if (cocok) {
    // Ambil bagian pesan setelah prefix teknis PostgREST bila ada.
    return (
      message.replace(/^.*?:\s*/, "").trim() ||
      "Data yang dikirim belum sesuai."
    );
  }

  if (message.includes("Failed to fetch") || message.includes("NetworkError")) {
    return "Koneksi terputus. Periksa internetmu lalu coba lagi.";
  }

  return "Terjadi kesalahan di server. Coba beberapa saat lagi.";
}
