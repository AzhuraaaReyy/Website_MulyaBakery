/**
 * Menafsirkan isi kolom `video` sebuah produk menjadi cara menampilkannya.
 *
 * Tiga kemungkinan:
 *   - kosong               -> tak ada video, pemanggil menampilkan foto.
 *   - tautan YouTube       -> disematkan lewat iframe (bandwidth ditanggung
 *                             YouTube, Supabase tidak tersentuh).
 *   - selain itu (MP4/URL) -> diputar sebagai <video> biasa (mis. dari bucket
 *                             Storage 'menu').
 *
 * Sengaja tidak me-redirect ke mana pun: YouTube pun disematkan inline dengan
 * autoplay + mute + loop, tanpa kontrol & branding berlebih.
 */

export type Video =
  | { type: "none" }
  | { type: "youtube"; embedUrl: string }
  | { type: "file"; src: string };

/** Ambil ID video dari berbagai bentuk URL YouTube (watch, youtu.be, shorts, embed). */
function ambilIdYouTube(url: string): string | null {
  const pola = [
    /(?:youtube\.com\/watch\?[^#]*\bv=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/shorts\/)([\w-]{11})/,
    /(?:youtube\.com\/embed\/)([\w-]{11})/,
  ];
  for (const p of pola) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export function parseVideo(raw?: string | null): Video {
  const url = (raw ?? "").trim();
  if (!url) return { type: "none" };

  const id = ambilIdYouTube(url);
  if (id) {
    // youtube-nocookie: mode privasi. playlist=id diperlukan agar loop=1 jalan
    // untuk video tunggal. controls=0 & modestbranding=1 menyamarkan UI YouTube.
    const q = new URLSearchParams({
      autoplay: "1",
      mute: "1",
      loop: "1",
      playlist: id,
      controls: "0",
      modestbranding: "1",
      playsinline: "1",
      rel: "0",
    });
    return {
      type: "youtube",
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?${q.toString()}`,
    };
  }

  return { type: "file", src: url };
}

/**
 * Sama seperti parseVideo, tapi untuk VIDEO TUTORIAL yang ditonton penuh:
 * ADA kontrol pemutar, ADA suara, TIDAK loop, TIDAK mute. Autoplay tetap
 * dinyalakan (dibuka dari klik pengguna, jadi gestur-nya sah).
 */
export function parseVideoTutorial(raw?: string | null): Video {
  const url = (raw ?? "").trim();
  if (!url) return { type: "none" };

  const id = ambilIdYouTube(url);
  if (id) {
    const q = new URLSearchParams({
      autoplay: "1",
      rel: "0",
      modestbranding: "1",
      playsinline: "1",
    });
    return {
      type: "youtube",
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?${q.toString()}`,
    };
  }

  return { type: "file", src: url };
}
