# 🍞 Roti Bahagia — Landing Page UMKM Roti

Landing page hangat & homey untuk UMKM roti rumahan. Murni frontend statis (tanpa
backend/API) — semua data dummy, semua aksi "pesan" diarahkan ke WhatsApp (`wa.me`).

## ✨ Fitur Utama

- **Showcase produk unggulan (2D)** — foto besar produk + daftar thumbnail switcher.
  Ganti produk memakai transisi crossfade halus (Framer Motion). Ringan, tanpa WebGL,
  responsif penuh di semua layar.
- **Scrollytelling GSAP** — reveal, stagger, parallax, dan garis timeline yang
  "menggambar" mengikuti scroll (ScrollTrigger). Menghormati `prefers-reduced-motion`.
- **Warm & homey design** — palet coklat & krem, font display serif (Fraunces) + body
  sans (Manrope), bentuk organik (blob) + wave divider yang mengalir halus antar section.
- **Peta interaktif** — embed Google Maps (bisa zoom/geser) di section Kontak.
- **Pesan via WhatsApp** — tiap kartu produk punya tombol yang membuka chat dengan
  pesan otomatis berisi nama produk; CTA Hero/Footer memakai pesan umum.
- **Fully responsive** & aksesibilitas dasar (kontras, focus terlihat, alt text).

## 🧱 Tech Stack

React + TypeScript · Vite · Tailwind CSS · Framer Motion · GSAP ScrollTrigger ·
Lucide React.

## 🚀 Menjalankan

```bash
npm install
npm run dev      # mode development
npm run build    # build produksi
npm run preview  # preview hasil build
```

## 🗂️ Struktur

```
src/
├─ config/contact.ts        # Nomor WA, brand, lokasi, embed peta — GANTI dengan data asli
├─ data/                    # products, testimonials, faq (data dummy)
├─ lib/                     # whatsapp.ts (builder URL wa.me), gsap.ts
├─ hooks/                   # useScrolly (scrollytelling GSAP)
├─ components/
│  ├─ ProductShowcase.tsx   # showcase produk unggulan 2D (foto + switcher)
│  ├─ PlaceholderImage.tsx  # <img> dengan fallback gradient otomatis
│  └─ Hero, About, Menu, WhyUs, Testimonials, Gallery,
│     HowToOrder, LocationContact, FAQ, Footer, Navbar, ...
└─ App.tsx
```

## ⚙️ Cara Menyesuaikan

| Ingin ganti…            | Edit file                                             |
| ----------------------- | ----------------------------------------------------- |
| Nomor WhatsApp / kontak | `src/config/contact.ts` (`WHATSAPP_NUMBER`)           |
| Produk & harga          | `src/data/products.ts`                                |
| Produk mana yang unggul | flag `featured: true` di `src/data/products.ts`       |
| Foto produk             | Taruh di `public/images/`, cocokkan dengan field `image` |
| Peta lokasi             | `mapEmbedSrc` / `mapsQuery` di `src/config/contact.ts` |
| Testimoni / FAQ         | `src/data/testimonials.ts` · `src/data/faq.ts`        |
| Warna / font            | `tailwind.config.js`                                  |

## 🖼️ Foto

Komponen `<PlaceholderImage>` menampilkan foto asli bila tersedia, atau **placeholder
gradient bertema** bila file belum ada / gagal dimuat — jadi halaman selalu rapi.
Taruh foto di `public/images/` dengan nama sesuai field `image` (produk), `avatar`
(testimoni), atau path pada masing-masing komponen (galeri, foto dapur).

> Nama file case-sensitive di server produksi (Linux): `Roti.JPG` ≠ `roti.jpg`.
