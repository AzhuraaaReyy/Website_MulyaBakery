import { supabaseAdmin } from "./supabaseAdmin";
import { kompresGambar } from "./uploadImage";

/**
 * Unggah aset menu (foto/video produk) ke bucket 'menu' memakai klien ADMIN —
 * jadi hanya berhasil bila owner sedang login (RLS mensyaratkan authenticated).
 *
 * Foto: diperkecil & dikompres ke WebP dulu (biasanya jatuh ke ~150-300 KB)
 * supaya storage tidak cepat penuh. Video: MP4 diunggah apa adanya (tidak bisa
 * dikompres di browser), hanya dicek ukuran & tipenya.
 */

const BUCKET = "menu";
const FOTO_MIME = ["image/jpeg", "image/png", "image/webp"];
const MAKS_FOTO_ASLI = 15 * 1024 * 1024; // 15 MB sebelum kompres
const MAKS_VIDEO = 20 * 1024 * 1024; // 20 MB (samakan dengan batas bucket)

function namaAcak(folder: string, ext: string): string {
  return `${folder}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}.${ext}`;
}

async function unggah(path: string, blob: Blob, contentType: string): Promise<string> {
  if (!supabaseAdmin) {
    throw new Error("Upload belum aktif — Supabase belum terhubung.");
  }
  const { error } = await supabaseAdmin.storage.from(BUCKET).upload(path, blob, {
    cacheControl: "604800", // 7 hari — aset menu jarang berubah, hemat bandwidth
    upsert: false,
    contentType,
  });
  if (error) throw error;
  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** Unggah foto produk (dikompres ke WebP). Mengembalikan URL publik. */
export async function unggahFotoMenu(file: File): Promise<string> {
  if (!FOTO_MIME.includes(file.type)) {
    throw new Error("Format foto harus JPG, PNG, atau WEBP.");
  }
  if (file.size > MAKS_FOTO_ASLI) {
    throw new Error("Ukuran foto maksimal 15 MB.");
  }
  const blob = await kompresGambar(file);
  const isWebp = blob.type === "image/webp";
  const ext = isWebp ? "webp" : file.name.split(".").pop()?.toLowerCase() || "jpg";
  return unggah(namaAcak("foto", ext), blob, isWebp ? "image/webp" : file.type);
}

/** Unggah video produk (MP4). Mengembalikan URL publik. */
export async function unggahVideoMenu(file: File): Promise<string> {
  if (file.type !== "video/mp4") {
    throw new Error("Video harus format MP4. Konversi dulu bila perlu.");
  }
  if (file.size > MAKS_VIDEO) {
    throw new Error("Ukuran video maksimal 20 MB. Kompres/perpendek dulu.");
  }
  return unggah(namaAcak("video", "mp4"), file, "video/mp4");
}
