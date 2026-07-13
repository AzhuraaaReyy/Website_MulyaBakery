# Video Produk Unggulan

Taruh video tiap produk unggulan di sini untuk showcase di section **Menu**.
Video besar di atas akan **berganti** saat produk dipilih dari thumbnail di bawahnya.

## Nama file (cocokkan dengan `video` di `src/data/products.ts`)

```
public/videos/
├─ roti-coklat-keju.mp4
├─ roti-tawar-gandum.mp4
├─ roti-sobek-pandan.mp4
├─ croissant-butter.mp4
└─ nastar-premium.mp4
```

> Selama file belum ada, showcase otomatis menampilkan **foto** produk (`image`)
> sebagai poster — jadi halaman tetap tampil normal.

## Tips video

- Format **MP4 (H.264)** agar didukung semua browser/HP.
- Durasi pendek **5–10 detik**, di-loop (memutar roti, close-up tekstur, dsb).
- **Tanpa audio** (video di-mute & autoplay — audio tidak diperlukan).
- Rasio **16:9** (mis. 1280×720). Kompres agar ringan (≤ 3–5 MB per video).
- Bisa buat dari foto/klip HP, atau rekam roti di turntable.

## Menyesuaikan

Di `src/data/products.ts`, tiap produk unggulan punya field `video`:

```ts
video: "/videos/roti-coklat-keju.mp4"
```

Hapus baris `video` bila sebuah produk cukup pakai foto (poster) saja.
Poster diambil otomatis dari field `image`.
