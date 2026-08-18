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
- **Pengaturan Fitur (khusus Super Admin)** — nyalakan/matikan **19 fitur**; fitur mati tampil pola *Blurred Content Gate* "Coming Soon" / tombol gembok.

### Feature Gating
- Super admin = email di `VITE_SUPER_ADMIN_EMAILS` (koma). Login `/admin` biasa, setelah login otomatis diarahkan ke dashboard super admin.
- Flag disimpan di tabel `feature_flags`, dibaca publik dengan **fail-open**: bila gagal dimuat, semua fitur AKTIF (situs normal).

---

## Tech Stack

| Teknologi | Fungsi |
| --- | --- |
| React 18 + TypeScript | UI |
| Vite 5 | Build tool & dev server |
| TailwindCSS | Styling (palet cocoa/paper/caramel + pink #FFE4E9/#FF69B4) |
| Framer Motion | Animasi komponen & modal |
| GSAP + ScrollTrigger | Animasi scroll |
| OGL | Latar scroll-story (WebGL) |
| MapLibre GL + OpenStreetMap + Nominatim | Peta lokasi & reverse-geocode (gratis) |
| Supabase (PostgreSQL + RLS) | Database, Storage, Auth |
| lucide-react | Ikon |

---

## Struktur Proyek

```
.
├── public/
│   ├── images/            # foto statis (logo, ikon toko)
│   └── videos/            # video demo produk
├── scripts/
│   └── check-env.mjs      # pagar pengaman build (cek variabel env wajib)
├── src/
│   ├── admin/             # panel admin (/admin)
│   │   ├── AdminApp.tsx        # akar admin + login (Supabase Auth)
│   │   ├── AdminDashboard.tsx  # sidebar + routing tab
│   │   ├── ProdukPanel.tsx     # CRUD menu
│   │   ├── KategoriPanel.tsx   # CRUD kategori
│   │   ├── PesananPanel.tsx    # pesanan + ongkir + estimasi
│   │   ├── CustomPanel.tsx     # pesanan khusus
│   │   ├── LaporanPanel.tsx    # laporan penjualan
│   │   ├── TestimoniPanel.tsx  # CRUD + moderasi ulasan
│   │   ├── FeaturePanel.tsx    # toggle fitur (super admin)
│   │   ├── Pagination.tsx      # pagination seragam
│   │   └── *.ts                # tipe data & helper
│   ├── components/         # komponen landing
│   │   ├── Navbar.tsx, Hero.tsx, About.tsx, Menu.tsx, WhyUs.tsx
│   │   ├── Testimonials.tsx, Gallery.tsx, HowToOrder.tsx
│   │   ├── LocationContact.tsx, FAQ.tsx, Footer.tsx
│   │   ├── CartButton.tsx, CartModal.tsx, OrderSuccess.tsx
│   │   ├── BookingModal.tsx, ReviewModal.tsx, ProductDetailModal.tsx
│   │   ├── LocationPickerModal.tsx (MapLibre)
│   │   ├── FeatureGate.tsx, LockedCta.tsx
│   │   └── ScrollStoryBackground.tsx
│   ├── context/           # CartContext, FeatureFlagsContext
│   ├── config/            # contact.ts (pusat data kontak), featureFlags.ts, superadmin.ts
│   ├── data/              # products.ts (fallback statis), faq.ts
│   ├── hooks/             # useMenuData (RPC get_menu), useScrolly, dll.
│   └── lib/               # supabase, whatsapp, jarak, uploadImage, gsap, dll.
├── supabase/migrations/   # skrip SQL (001–010) — jalankan di Dashboard
├── .env.example           # template variabel lingkungan
├── vercel.json            # SPA fallback untuk hosting statis
└── package.json
```

---

## Persiapan Lokal

```bash
npm install
npm run dev      # jalankan dev server Vite
```

### 1. Buat file `.env`

Salin dari template lalu isi:

```bash
cp .env.example .env
```

### 2. Variabel lingkungan

| Variabel | Wajib | Deskripsi |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | ✅ | URL proyek Supabase (`https://xxxx.supabase.co`) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` (atau `VITE_SUPABASE_ANON_KEY`) | ✅ | Kunci publik/publishable — **bukan** service_role/secret |
| `VITE_WHATSAPP_NUMBER` | ✅ | Nomor WA tujuan pesanan, format internasional `628xxxxxxxxxx` |
| `VITE_WHATSAPP_NUMBER2` | – | Nomor WA alternatif (tampil di kontak; kosongkan untuk menyembunyikan) |
| `VITE_SUPER_ADMIN_EMAILS` | – | Email super admin, pisah koma bila lebih dari satu |

> ⚠️ Jangan pernah menaruh `service_role key` / `sb_secret_...` di frontend —
> ia melewati semua Row Level Security. `scripts/check-env.mjs` akan **menggagalkan
> build** bila secret terdeteksi.

---

## Supabase & Migrasi

Setiap migrasi dijalankan **sekali, berurutan**, di
`Supabase Dashboard > SQL Editor > New query`:

1. **001** — Storage `uploads` + kolom `photo_url` ulasan pelayanan
2. **002** — Panel admin: RLS `products` + Storage `menu`
3. **003** — Moderasi ulasan berfoto dari admin
4. **004** — Tabel & ikon kategori
5. **005** — Izinkan ulasan berulang (tanpa batas 30 hari)
6. **006** — Satu ulasan per produk per perangkat per 7 hari
   *(dimatikan kembali oleh 010)*
7. **007** — Laporan penjualan & ongkir Diantar
8. **008** — Pemesanan khusus (`custom_orders`)
9. **009** — Feature flags (19 fitur) + panel super admin
10. **010** — Ulasan multi-produk (`product_ids` array, batas 7 hari dihapus)

> Beberapa fungsi inti (mis. `get_menu`, `create_order`) dibuat langsung di
> Dashboard dan bukan bagian repo — hanya migrasi yang mengubahnya yang ada
> di `supabase/migrations/`.

### Akun admin
1. **Supabase Dashboard → Authentication → Users → Add user** — buat akun owner (email + password). Tidak ada password default; login memakai Supabase Auth.
2. **Authentication → Sign In / Providers** — matikan *"Allow new users to sign up"* agar orang lain tidak bisa mendaftar jadi admin.
3. Login di `/admin` dengan akun tersebut.

### Super admin (tab "Pengaturan Fitur")
1. Jalankan migrasi **009**.
2. Isi email Anda di `VITE_SUPER_ADMIN_EMAILS` (mis. `owner@example.com`) lalu **restart dev server**.
3. Login `/admin` → otomatis masuk dashboard super admin dengan tab **Pengaturan Fitur**.

---

## Script

```bash
npm run dev       # dev server Vite
npm run lint      # typecheck (tsc --noEmit)
npm run build     # prebuild (check-env) + typecheck + build produksi
npm run preview   # pratinjau hasil build
```

`prebuild` memanggil `scripts/check-env.mjs`:
- env kosong → peringatan (build tetap lanjut);
- `STRICT_ENV=1` → build **gagal** bila ada variabel wajib kosong (untuk CI/deploy);
- secret key terdeteksi → build **selalu gagal**.

---

## Deploy (Vercel)

1. `vercel.json` sudah menyediakan **SPA fallback** (semua rute → `index.html`), jadi `/admin` bisa dibuka langsung tanpa 404.
2. Isi semua variabel `VITE_*` di **Vercel → Project → Environment Variables** (jangan hanya di `.env` lokal).
3. Build dengan `STRICT_ENV=1` bila ingin memastikan deploy gagal bila env kosong.

---

## Catatan Go-Live

- **Data kontak** satu sumber di `src/config/contact.ts` (alamat, jam buka, sosmed, koordinat toko `LOCATION.lat/lng`). Ubah di satu file ini.
- **Video demo produk** di `src/data/products.ts` masih memakai klip sampel — ganti dengan MP4 lokal di `public/videos/`.
- **Gambar toko fisik** di `LocationContact.tsx` masih `/images/icontoko.png` — siap diganti.
- Progres pekerjaan sesi dicatat di [`todo.md`](./todo.md).