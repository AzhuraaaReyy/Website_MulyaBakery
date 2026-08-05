import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Klien Supabase KHUSUS panel admin (/admin).
 *
 * Bedanya dengan klien publik (lib/supabase.ts):
 *   - persistSession: true   -> owner tetap login walau halaman di-refresh.
 *   - autoRefreshToken: true -> token diperbarui otomatis, sesi tidak putus.
 *   - storageKey berbeda     -> tidak bentrok dengan klien publik bila keduanya
 *                               kebetulan termuat.
 *
 * Yang menjaga data tetap RLS di database: owner login -> dapat JWT peran
 * 'authenticated' -> hanya dia yang boleh menulis products & bucket 'menu'.
 * Kunci yang dipakai TETAP publishable/anon key (aman di browser); login-lah
 * yang menaikkan hak, bukan kunci rahasia.
 */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined;

export const isAdminConfigured = Boolean(url && anonKey);

// Pagar pengaman sama seperti klien publik: jangan pernah ada secret key di
// frontend — ia melewati seluruh RLS.
if (
  anonKey &&
  (anonKey.startsWith("sb_secret_") || anonKey.includes("service_role"))
) {
  throw new Error(
    "[Admin] Secret key terdeteksi di frontend. Gunakan Publishable/anon key.",
  );
}

export const supabaseAdmin: SupabaseClient | null = isAdminConfigured
  ? createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: "mb-admin-auth",
      },
    })
  : null;
