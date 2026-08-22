# Mulya Bakery — Landing Page

Landing page UMKM roti **Mulya Bakery**: katalog menu live, pemesanan via
**WhatsApp**, panel admin CRUD, dan sistem **feature gating** super admin.
Dibangun dengan React 18 + Vite + TypeScript + TailwindCSS, dan backend
**Supabase** (Row Level Security aktif).

- Landing publik di `/` — `src/App.tsx`
- Panel admin di `/admin` — lazy-loaded, `src/admin/AdminApp.tsx`
- Checkout semua pemesanan lewat WhatsApp (nomor utama + nomor alternatif opsional)

---

## Fitur

### Landing publik
- **Navbar** — tautan navigasi + tombol keranjang.
- **Hero, Tentang (About), Keunggulan (WhyUs), Galeri, FAQ, Footer** — section dengan animasi GSAP/Framer Motion + latar scroll-story (OGL).
- **Menu** — data live dari Supabase (RPC `get_menu`); rating rata-rata & jumlah terjual dihitung otomatis dari ulasan/pesanan asli.
- **Pemesanan Khusus** — form custom order (kue ulang tahun, hampers, tumpeng, custom design) dengan alur terpisah dari pesanan biasa.
- **Testimoni** — ulasan pelanggan + moderasi foto oleh admin (foto baru disembunyikan sampai disetujui).
- **Lokasi & Kontak** — peta MapLibre GL (OpenStreetMap), lokasi saat ini, reverse-geocode Nominatim (gratis, tanpa API key).
- **Ulasan Multi-Produk** — pelanggan bisa memilih **banyak menu** dalam **satu form** ulasan (cocok untuk pesanan 2–3 jenis roti); rating kartu menu otomatis konsisten.

### Alur pesanan
- Keranjang → isi data pemesan → pesan terkirim ke WhatsApp + tercatat di Supabase (kode pesanan).
- Metode **Diantar**: biaya pengiriman dikonfirmasi via WhatsApp sebelum diproses; **estimasi waktu otomatis** dari jarak (haversine toko→pelanggan, Nominatim).
- Metode **Ambil di toko**: tanpa ongkir.
- Ulasan otomatis muncul setelah pesanan terkirim, dengan produk yang dibeli sudah tercentang.

### Panel admin (`/admin`)
- **Menu** — CRUD produk (foto + video).
- **Kategori** — kelola kategori menu.
- **Pesanan** — daftar/detail, input ongkir & estimasi, status, konfirmasi via WhatsApp.
- **Pesanan Khusus** — kelola custom order (terpisah dari pesanan biasa).
- **Laporan** — ringkasan penjualan + filter waktu (mencakup pesanan custom).
- **Testimoni** — CRUD ulasan + moderasi ulasan berfoto.
