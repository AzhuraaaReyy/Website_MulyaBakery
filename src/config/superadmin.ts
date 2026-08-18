/**
 * Identifikasi SUPER ADMIN — email yang boleh membuka tab "Pengaturan Fitur".
 *
 * Diisi lewat env `VITE_SUPER_ADMIN_EMAILS` di `.env`, dipisah koma:
 *     VITE_SUPER_ADMIN_EMAILS=owner@example.com,mitra@example.com
 *
 * Halaman login admin tetap sama untuk semua email; setelah login, routing
 * dibedakan: email yang terdaftar di sini otomatis masuk ke dashboard super
 * admin (dengan tab pengaturan fitur), yang lain ke dashboard biasa.
 */

const envEmails = (
  import.meta.env.VITE_SUPER_ADMIN_EMAILS as string | undefined
)
  ?.split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean) ?? [];

/** Daftar email super admin (huruf kecil, tanpa spasi). */
export const SUPER_ADMIN_EMAILS = envEmails;

/** Cek apakah sebuah email termasuk super admin (case-insensitive). */
export function isSuperAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const e = email.trim().toLowerCase();
  return SUPER_ADMIN_EMAILS.length > 0 && SUPER_ADMIN_EMAILS.includes(e);
}