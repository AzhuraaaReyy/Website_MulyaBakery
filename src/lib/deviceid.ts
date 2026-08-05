/**
 * Identitas perangkat anonim — dipakai untuk mencegah satu orang menekan like
 * atau mengirim ulasan berkali-kali.
 *
 * Jujur soal batasannya: ini BUKAN identitas yang kuat. Siapa pun bisa
 * menghapus localStorage atau membuka mode penyamaran untuk mendapat ID baru.
 * Kita menerima itu dengan sadar, karena alternatifnya (wajib login, atau
 * sidik jari browser) merugikan pelanggan jujur jauh lebih besar daripada
 * kerugian dari beberapa like ganda di situs toko roti.
 *
 * Yang penting: aturan "satu perangkat satu like" ditegakkan di DATABASE lewat
 * UNIQUE(product_id, device_id) — bukan di sini. File ini cuma penyedia ID.
 *
 * Tidak ada data pribadi yang disimpan. Hanya UUID acak.
 */

const STORAGE_KEY = "mb_device_id";

/** UUID v4 dengan cadangan untuk browser lama yang belum punya randomUUID. */
function buatUUID(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  if (
    typeof crypto !== "undefined" &&
    typeof crypto.getRandomValues === "function"
  ) {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // versi 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // varian
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
      "",
    );
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  // Jalur terakhir: Math.random tidak aman secara kriptografis, tapi untuk
  // sekadar membedakan perangkat ini sudah memadai.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

let cache: string | null = null;

/**
 * Ambil (atau buat) ID perangkat.
 * Mengembalikan `null` bila localStorage diblokir — misalnya mode penyamaran
 * ketat atau pengaturan privasi browser. Pemanggil harus siap menerima null
 * dan tetap berjalan tanpa fitur like, bukan menampilkan error.
 */
export function getDeviceId(): string | null {
  if (cache) return cache;

  try {
    const tersimpan = window.localStorage.getItem(STORAGE_KEY);
    if (tersimpan && /^[0-9a-f-]{36}$/i.test(tersimpan)) {
      cache = tersimpan;
      return cache;
    }

    const baru = buatUUID();
    window.localStorage.setItem(STORAGE_KEY, baru);
    cache = baru;
    return cache;
  } catch {
    // localStorage tidak tersedia. Situs tetap jalan, like saja yang mati.
    return null;
  }
}
