import { supabase } from "./supabase";

/**
 * Unggah foto ke Supabase Storage (bucket publik "uploads") dan kembalikan URL
 * publiknya. Dipakai untuk foto referensi booking & foto ulasan.
 *
 * wa.me tidak bisa melampirkan file — hanya teks. Jadi alih-alih "mengirim"
 * foto, kita simpan fotonya di Storage lalu sisipkan URL-nya ke pesan. Untuk
 * ulasan, URL yang sama disimpan bersama ulasan agar bisa tampil di halaman.
 *
 * HEMAT STORAGE: sebelum diunggah, foto diperkecil (sisi terpanjang maksimal
 * MAKS_SISI) dan dikompres ke WebP. Foto kamera ponsel yang 4-5 MB biasanya
 * turun jadi ~150-300 KB — kualitas tetap layak tampil, tapi storage gratis
 * Supabase (1 GB) tidak cepat penuh. Semua terjadi di browser; tidak ada
 * pekerjaan tambahan di server.
 */

const BUCKET = "uploads";
const TIPE_DIIZINKAN = ["image/jpeg", "image/png", "image/webp"];

const MAKS_BYTE_ASLI = 15 * 1024 * 1024; // batas file asli (cegah crash memori)
const MAKS_BYTE_UNGGAH = 5 * 1024 * 1024; // batas akhir (sama dengan bucket)
const MAKS_SISI = 1400; // px — sisi terpanjang setelah diperkecil
const KUALITAS = 0.8; // kualitas WebP (0–1)

/**
 * Perkecil & kompres gambar di browser memakai canvas. Kalau gagal (mis. tipe
 * tidak didukung), kembalikan file asli apa adanya supaya unggahan tetap jalan.
 *
 * Diekspor agar panel admin (unggah foto menu) memakai kompresi yang sama.
 */
export async function kompresGambar(file: File): Promise<Blob> {
  try {
    const url = URL.createObjectURL(file);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("bukan gambar valid"));
      i.src = url;
    });

    const skala = Math.min(1, MAKS_SISI / Math.max(img.width, img.height));
    const w = Math.round(img.width * skala);
    const h = Math.round(img.height * skala);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      URL.revokeObjectURL(url);
      return file;
    }
    ctx.drawImage(img, 0, 0, w, h);
    URL.revokeObjectURL(url);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", KUALITAS),
    );

    // Pakai hasil kompres hanya bila memang lebih kecil dari aslinya.
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

export async function uploadImage(file: File, folder = "misc"): Promise<string> {
  if (!supabase) {
    throw new Error("Upload foto belum aktif — Supabase belum terhubung.");
  }
  if (!TIPE_DIIZINKAN.includes(file.type)) {
    throw new Error("Format foto harus JPG, PNG, atau WEBP.");
  }
  if (file.size > MAKS_BYTE_ASLI) {
    throw new Error("Ukuran foto maksimal 15 MB.");
  }

  const blob = await kompresGambar(file);

  // Jaga-jaga: kalau kompresi gagal pada foto raksasa, tolak dengan pesan ramah
  // alih-alih membiarkan bucket menolaknya dengan galat teknis.
  if (blob.size > MAKS_BYTE_UNGGAH) {
    throw new Error("Foto terlalu besar. Coba foto lain atau perkecil dulu.");
  }

  const isWebp = blob.type === "image/webp";
  const ext = isWebp
    ? "webp"
    : file.name.split(".").pop()?.toLowerCase() || "jpg";
  const contentType = isWebp ? "image/webp" : file.type;

  // Nama acak agar tidak menimpa milik orang lain & tidak mudah ditebak.
  const path = `${folder}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    cacheControl: "3600",
    upsert: false,
    contentType,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
