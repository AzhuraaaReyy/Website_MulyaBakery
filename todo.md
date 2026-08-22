# TODO — Mulya Bakery Landing Page

> Dibuat: (tanggal pengerjaan)
> Status pekerjaan sesi ini: **SELESAI** — BookingModal (Konsep Pesanan & Data Pengiriman) Responsif Mobile.

---

## 📌 Sesi Ini — BookingModal "Konsep Pesanan" & "Data & Pengiriman" Responsif Mobile

**Status:** KODE SELESAI — `npx tsc --noEmit` bersih & `npm run build` sukses.

### Perubahan (`src/components/BookingModal.tsx`)
1. **Step tabs (Konsep Pesanan / Data & Pengiriman):** label `text-sm` → `text-xs sm:text-sm` agar
   "Data & Pengiriman" tidak terpotong di layar sempit; span label diberi `min-w-0 truncate` dan badge
   nomor diberi `shrink-0` (perbaiki truncate di dalam flex — sebelumnya tanpa `min-w-0` label bisa
   meluber keluar kolom).
2. **Toggle metode ("Ambil di toko" / "Antar kurir"):** span diberi `min-w-0 truncate`.
3. **Ringkasan Pesanan:** label baris diberi `shrink-0`, nilai (Jenis Pesanan / Porsi) diberi `min-w-0`
   agar benar-benar terpotong rapi (ellipsis) di kolom sempit.

### Uji manual
Buka Pemesanan Khusus di HP (≤360px): tab & toggle tidak meluber/terpotong aneh, Ringkasan Pesanan
rapi saat nilai panjang, modal tetap bottom-sheet & bisa digulir.

---

## 📌 Sesi Ini — Testimoni 10 Terbaru + "Semua Ulasan" dengan Pagination

**Status:** KODE SELESAI — `npx tsc --noEmit` bersih & `npm run build` sukses.

### Keputusan user (dikonfirmasi)
1. Halaman utama testimoni hanya memuat **10 data terbaru** (sebelumnya 15) agar tidak memberatkan sistem.
2. Pelanggan tetap bisa melihat **semua ulasan** lewat **modal "Semua Ulasan"** dengan **pagination server-side** (10/halaman).
3. Urutan tetap **verified dulu, lalu terbaru** (tidak berubah dari perilaku sekarang).
4. **Desain UI/UX section testimoni yang ada TIDAK diubah** — slider 3D, kartu, header, tombol "Bagikan Pengalamanmu" apa adanya.

### Perubahan
- `supabase/migrations/011_review_pagination.sql` (BARU) — WAJIB dijalankan di Dashboard SQL Editor:
  `get_service_reviews_page(p_page default 1, p_size default 10)` → data satu halaman + kolom `total`
  (`count(*) over ()`), filter `is_hidden=false`, urut `verified_purchase desc, created_at desc`,
  clamp `p_size` 1–50, `security definer`, grant `anon, authenticated`.
- `src/components/SemuaUlasanModal.tsx` (BARU) — modal daftar semua ulasan:
  bottom-sheet di HP / tengah di desktop (`items-end sm:items-center`, `max-h-[90dvh]`,
  `rounded-t-3xl sm:rounded-3xl`, palet cocoa/paper, font Itim); per halaman 10 data via RPC baru;
  loading/error/empty state; baris ulasan (foto profil, nama + badge verified, bintang, quote, tanggal);
  footer pagination "Sebelumnya / Halaman X / Y / Berikutnya" (Prev/Next nonaktif di tepi).
- `src/components/Testimonials.tsx` — `p_limit: 15` → `10`; tombol kecil **"Lihat semua ulasan"**
  (link teks + ChevronRight) di bawah tombol "Bagikan Pengalamanmu"; render `SemuaUlasanModal`.
- **Responsive mobile:** footer pagination modal kini `flex-wrap` — di HP tombol "Sebelumnya" &
  "Berikutnya" berdampingan (`flex-1`) dan label "Halaman X / Y" turun ke baris sendiri di tengah;
  di desktop (`sm:flex-nowrap`) tetap satu baris seperti semula.

### Wajib dilakukan user
1. Jalankan `supabase/migrations/011_review_pagination.sql` di Supabase Dashboard SQL Editor.
2. Uji: section testimoni memuat 10 ulasan; klik "Lihat semua ulasan" → modal daftar + ganti halaman.

---

## 📌 Sesi Ini — Kolom Ongkir Detail Pesanan Rapi (Tidak Naik-Turun)

**Status:** SELESAI — `npx tsc --noEmit` bersih.

- `src/admin/PesananPanel.tsx` — grid "Biaya Pengiriman (Rp)" & "Estimasi Pengantaran"
  diubah `grid-cols-2` → `grid-cols-1 sm:grid-cols-2`. Sebelumnya selalu 2 kolom di HP
  sehingga label yang panjangnya berbeda wrap tidak rata → input terlihat "naik turun".
  Kini di HP bertumpuk sejajar; di desktop tetap 2 kolom (sejalan dengan `CustomPanel.tsx`).

---

## 📌 Sesi Ini — Justify Teks Fitur Baru + BookingModal Responsif Mobile

**Status:** KODE SELESAI — `npx tsc --noEmit` bersih & `npm run build` sukses.

### Keputusan user (dikonfirmasi)
1. Justify teks (rata kanan-kiri) diterapkan **hanya pada teks fitur baru** (bukan seluruh situs).
2. BookingModal ("Pemesanan Khusus") dibuat responsif mobile.

### Perubahan — justify teks (`text-justify`)
- `src/components/CartModal.tsx` — 4 paragraf popup "Informasi Pengiriman", catatan ongkir footer, peringatan "catatan/alamat panjang", catatan foto penanda rumah.
- `src/components/LockedCta.tsx` — deskripsi modal "Coming Soon".
- `src/components/FeatureGate.tsx` — deskripsi teaser "Coming Soon!".
- `src/components/ProductDetailModal.tsx` — paragraf deskripsi produk.
- `src/components/OrderSuccess.tsx` — paragraf penjelasan + ajakan ulasan + peringatan WA diblokir.
- `src/components/ReviewModal.tsx` — teks layar sukses.
- `src/components/WhyUs.tsx` — deskripsi kartu keunggulan.
- **Catatan:** Testimonials (quote & intro) dibiarkan `text-center` (desain tengah yang disengaja) — `text-justify` tidak ditimpa agar tidak merusak desain.

### Perubahan — BookingModal responsif mobile (`src/components/BookingModal.tsx`)
- Outer modal: `items-center justify-center` → `items-end justify-center sm:items-center` (bottom-sheet di HP, keyboard tidak menutupi footer).
- Kartu: `max-h-[85vh] … rounded-2xl sm:rounded-3xl` → `max-h-[90dvh] sm:max-h-[85vh] … rounded-t-3xl sm:rounded-3xl`.
- Footer step 2: `flex items-center gap-2` → `flex flex-col gap-2.5 sm:flex-row sm:items-center`; tombol "← Kembali" `w-full sm:w-auto`, "Kirim via WhatsApp" `w-full flex-1` (bertumpuk di layar sempit).

### Uji manual
1. Buka Pemesanan Khusus di HP → modal menempel bawah, ketik data → tombol "Kirim via WhatsApp" selalu terlihat; footer step 2 bertumpuk rapi di layar sempit.
2. Cek popup Info Pengiriman, modal Coming Soon (matikan fitur), deskripsi produk, layar sukses → teks rata kanan-kiri.

---

## 📌 Sesi Ini — Responsive Mobile Fitur Baru + Scrollbar Tersembunyi

**Status:** KODE SELESAI — `npx tsc --noEmit` bersih & `npm run build` sukses.

### Keputusan user (dikonfirmasi)
1. ReviewModal di HP jadi **bottom-sheet** (`items-end` mobile, tengah di `sm:`) agar keyboard tidak menutupi tombol "Kirim Ulasan".
2. Footer modal detail admin saat status **Selesai/Batal (terkunci)**: sembunyikan tombol
   disabled "Konfirmasi ke Pelanggan" & "Simpan" → ganti tombol **"Tutup"** + **"Cetak Struk"** (bila selesai).
3. **Semua scrollbar disembunyikan** (termasuk halaman utama, custom scrollbar pink lama dihapus) — scroll tetap berfungsi.
4. Popup "Informasi Pengiriman" CartModal jadi **bottom-sheet + konten scrollable** agar tidak terpotong di layar pendek/landscape.

### Perubahan
- `src/index.css` — hapus styling `::-webkit-scrollbar` pink lama; tambah aturan global
  `* { scrollbar-width: none; -ms-overflow-style: none; }` & `*::-webkit-scrollbar { display: none; }`.
- `src/components/LockedCta.tsx` — konten modal "Coming Soon" dipecah jadi area scrollable
  (`overflow-y-auto`, `min-h-0`) + footer tombol "Mengerti" tetap terlihat.
- `src/components/ReviewModal.tsx` — outer modal `items-end justify-center sm:items-center`,
  kartu `rounded-t-3xl sm:rounded-3xl`; baris checkbox multi-pilih `py-2` → `py-2.5` (touch target lebih besar).
- `src/admin/PesananPanel.tsx` — saat `terkunci`: footer hanya "Tutup" + "Cetak Struk"; bila tidak terkunci tombol lama tetap.
- `src/admin/CustomPanel.tsx` — pola sama (Tutup + Cetak Struk bila `selesai` & total > 0).
- `src/components/CartModal.tsx` — bottom-sheet utama `h-[90vh]` → `h-[90dvh]` (tidak tertutup keyboard);
  popup "Informasi Pengiriman": outer `items-end justify-center sm:items-center p-3 sm:p-4`,
  kartu `flex max-h-[90dvh] flex-col overflow-hidden`, isi teks `overflow-y-auto`,
  header/isi/tombol dipisah dengan padding sendiri (Batal + Mengerti & Lanjutkan selalu terlihat).

### Uji manual
1. Buka keranjang di HP → popup Info Pengiriman: gulir konten, tombol selalu terlihat; pilih Diantar.
2. Tulis ulasan di HP → modal menempel bawah, ketik nama/komentar, tombol "Kirim Ulasan" tetap terjangkau.
3. Admin `/admin` → detail pesanan status Selesai → hanya "Tutup" + "Cetak Struk"; status non-final → tombol lama.
4. Matikan fitur section di Pengaturan Fitur → klik teaser "Coming Soon" → konten panjang bisa digulir.
5. Pastikan tidak ada scrollbar terlihat di mana pun (halaman, modal, panel) tapi scroll tetap jalan.

---

## 📌 Konteks Singkat Proyek

Landing page UMKM roti **"Mulya Bakery"** (React 18 + Vite + TypeScript + TailwindCSS

- Framer Motion + GSAP). Backend memakai **Supabase** (RLS aktif). Checkout semua
  pemesanan lewat **WhatsApp**.

* Landing publik di `/` (lihat `src/App.tsx`)
* Panel admin di `/admin` (lazy-loaded, lihat `src/admin/AdminApp.tsx`)
* Data menu live dari RPC `get_menu` (lihat `src/hooks/Usemenudata.ts`)
* Struktur komponen: Navbar, Hero, About, Menu, HowToOrder, WhyUs, Testimonials,
  Gallery, LocationContact, FAQ, Footer + modal (Cart, Booking, ProductDetail, Review)

---

## 📌 Sesi Ini — Cetak Struk di Panel Admin

**Status:** KODE SELESAI — verifikasi `npx tsc --noEmit` & `npm run build` (lihat bagian bawah).

### Keputusan user (dikonfirmasi)
- Tombol cetak hanya di **modal Detail Pesanan** & **Detail Pesanan Khusus**.
- Format **struk thermal 80mm** (monospace, garis putus-putus, siap printer kasir).
- Aktif **hanya saat status "Selesai"** (custom juga wajib total > 0).

### Perubahan
- `src/lib/struk.ts` (BARU) — `buatStrukHtml(data)` menyusun dokumen HTML mandiri
  (header BRAND/CONTACT dari `config/contact.ts`, rincian, subtotal, ongkir, total,
  data pemesan, footer); `cetakStruk(data)` membuka jendela baru lalu auto-print.
  Semua teks user di-escape (anti-injection).
- `src/admin/PesananPanel.tsx` — tombol **Cetak Struk** (ikon Printer) di footer
  `FormDetailPesanan` saat status `selesai`; isi: kode, tanggal, item + subtotal,
  ongkir (`shipping_fee`), total, data pemesan.
- `src/admin/CustomPanel.tsx` — tombol sama di `FormDetailCustom` saat status
  `selesai` & total > 0; isi: kode, konsep (kategori/detail/porsi/tanggal acara/tema),
  total produk, ongkir, total.

### Uji manual
1. Buka `/admin` → tab Pesanan → detail pesanan berstatus **Selesai** → tombol "Cetak Struk".
2. Ulangi untuk Pesanan Khusus (selesai dengan total final).
3. Pastikan dialog cetak muncul dan struk rapi (lebar 80mm).

---

## 📌 Sesi Ini — README.md + .env.example

**Status:** SELESAI.

- `README.md` (BARU) — ringkasan proyek, fitur, tech stack, struktur proyek, setup
  `.env`, panduan migrasi 001–010, akun admin & super admin, script, deploy Vercel,
  catatan go-live.
- `.env.example` (BARU) — template env aman (tanpa nilai asli) dengan komentar
  lengkap untuk semua variabel `VITE_*` yang dibaca kode (Supabase, WA, super admin).

---

## 📌 Sesi Ini — Ulasan Multi-Produk (1 Form untuk Banyak Menu)

**Status:** KODE SELESAI — verifikasi `npx tsc --noEmit` & `npm run build` (lihat bagian bawah).

### Keputusan user (dikonfirmasi)
1. Aturan "1 ulasan per produk per 7 hari" (migrasi 006) **DIHAPUS total** — pelanggan
   boleh mengulas produk yang sama lagi setiap membeli (anti-spam tetap: honeypot + validasi teks).
2. Badge testimoni (`reviewer_role`) = **gabungan nama produk** terpilih (dipotong ~60 karakter).

### Perubahan
- `supabase/migrations/010_review_multi_produk.sql` (BARU) — WAJIB dijalankan di Dashboard:
  `submit_product_review` kini menerima **array `product_ids`** (fallback `product_id` tunggal),
  insert 1 baris `product_reviews` per produk dalam satu pengiriman; blok duplikat 7 hari dihapus.
  `get_menu` (rating kartu menu) tidak perlu diubah — otomatis konsisten dari `product_reviews`.
- `src/components/ReviewModal.tsx` — pilih menu jadi **wajib & multi-pilih** (checkbox list
  scrollable). Setelah pesanan, semua produk yang dibeli otomatis tercentang. Submit memakai
  `product_ids`. Layar sukses menyesuaikan jumlah. Pop-up "sudah pernah mengulas" dihapus.
- `src/components/CartModal.tsx` — teks footer Diantar diperjelas: "Belum termasuk ongkir —
  biaya kirim dikonfirmasi via WhatsApp sebelum pesanan diproses."

### Wajib dilakukan user
1. Jalankan `supabase/migrations/010_review_multi_produk.sql` di Supabase Dashboard SQL Editor.
2. Uji: checkout 2–3 produk → ulasan auto-muncul semua tercentang → submit 1x →
   rating kartu menu berubah konsisten.

---

## 📌 Sesi Ini — Feature Gating (Super Admin) + Panel Pengaturan Fitur

**Status:** SELESAI — `npx tsc --noEmit` bersih & `npm run build` sukses.

### Konsep
- **Super admin** = email tertentu dari env `VITE_SUPER_ADMIN_EMAILS` (koma).
  Login tetap halaman admin biasa; setelah login, email super admin otomatis
  diarahkan ke dashboard super admin (dengan tab "Pengaturan Fitur").
- **19 fitur** bisa dimatikan/nyalakan via panel "Pengaturan Fitur". Fitur yang
  mati menampilkan pola visual **Blurred Content Gate**: konten di-blur + kartu
  "Coming Soon!" + keterangan (section), atau tombol gembok yang membuka modal
  keterangan (CTA).
- Flag disimpan di Supabase (`feature_flags`), dibaca publik (fail-open: bila
  gagal muat / tanpa Supabase, semua fitur AKTIF → situs normal).

### Fitur yang bisa di-toggle
1. **Section (blur penuh):** hero, tentang, menu, cara_pesan, keunggulan,
   testimoni, galeri, kontak, faq.
2. **Interaktif (CTA terkunci):** keranjang (tombol +, Tambah ke Keranjang,
   CartButton disembunyikan), pesanan_khusus (banner Custom Order),
   ulasan (tombol tulis ulasan di Testimoni & OrderSuccess), pesan_wa
   (Navbar desktop+mobile, Hero, Cara Pesan, bubble WA Galeri).
3. **Panel admin (blur):** panel_menu, panel_kategori, panel_pesanan,
   panel_pesanan_khusus, panel_laporan, panel_testimoni.

### File baru
- `supabase/migrations/009_feature_flags.sql` — tabel `feature_flags` + RLS
  (anon read, authenticated update) + seed 19 baris.
- `src/config/featureFlags.ts` — `FeatureKey`, `FEATURE_DEFAULTS`, `semuaFiturAktif()`.
- `src/config/superadmin.ts` — `isSuperAdmin(email)` dari env.
- `src/context/FeatureFlagsContext.tsx` — Provider + `useFeatureFlags()` (fetch
  + fail-open + refresh saat kembali ke tab).
- `src/components/FeatureGate.tsx` — blur + teaser "Coming Soon!" (section).
- `src/components/LockedCta.tsx` — tombol gembok + `FeatureTeaserModal`.
- `src/admin/FeaturePanel.tsx` — toggle on/off + edit judul/keterangan.

### File diubah
- `src/App.tsx` — `FeatureFlagsProvider` + 9 section dibungkus `FeatureGate`.
- `src/components/Menu.tsx`, `ProductDetailModal.tsx`, `CartButton.tsx`,
  `Testimonials.tsx`, `OrderSuccess.tsx` — gate fitur interaktif.
- `src/components/Navbar.tsx`, `Hero.tsx`, `HowToOrder.tsx`, `Gallery.tsx` — gate `pesan_wa`.
- `src/admin/AdminApp.tsx` — routing pasca-login `isSuperAdmin(email)` +
  `FeatureFlagsProvider`.
- `src/admin/AdminDashboard.tsx` — prop `isSuperAdmin`; tab "Pengaturan Fitur"
  (ikon Settings2) hanya super admin; 6 panel dibungkus `FeatureGate`.
- `.env` — `VITE_SUPER_ADMIN_EMAILS` (isi email Anda).

### Wajib dilakukan user
1. Jalankan `supabase/migrations/009_feature_flags.sql` di Supabase Dashboard.
2. Isi `VITE_SUPER_ADMIN_EMAILS` di `.env` dengan email admin Anda, lalu login
   `/admin` → otomatis ke dashboard super admin (tab "Pengaturan Fitur").
3. Catatan: tab "Pengaturan Fitur" sengaja TIDAK bisa dimatikan agar super
   admin tidak terkunci. Penguatan RLS super admin (tabel `super_admins`)
   dijelaskan sebagai komentar di migrasi 009 (opsional).

---

## 📌 Sesi Ini — BookingModal: Gaya Visual = CartModal + Pilih Lokasi

**Status:** SELESAI — `npx tsc --noEmit` bersih & `npm run build` sukses.

Perbaikan lanjutan pada form pemesanan khusus (`src/components/BookingModal.tsx`):

1. **Pilih lokasi dari peta** — tombol "Pilih lokasi dari peta" di field Alamat
   (khusus Diantar), memakai `LocationPickerModal` yang sama dengan CartModal
   (MapLibre + lokasi saat ini + reverse-geocode Nominatim).
2. **UI/UX disamakan dengan CartModal** — tanpa mengubah data/alur form:
   - Shell jadi kartu **di tengah layar** (`max-w-lg`, `bg-paper-100`, palet
     cocoa/paper/caramel), `font-heading` untuk judul & `font-section3-p` (Itim) untuk teks.
   - Field, input (`inputCls`), toggle metode (Store/Bike), step tabs, tombol
     primer `bg-cocoa-800`, dan layar sukses `OrderSuccess` konsisten dengan CartModal.
   - Data yang dipertahankan: kategori, detail custom, foto, tanggal, porsi,
     tema, nama, HP, metode, alamat, catatan + alur 2 langkah & validasi.

---

## 📌 Sesi Ini — Pemesanan Khusus = Konsep CartModal

**Status:** SELESAI — `npx tsc --noEmit` bersih & `npm run build` sukses.

Keputusan user (dikonfirmasi): tabel & panel admin **terpisah** (`custom_orders`),
alur status/ongkir **sama persis** dengan pesanan biasa, masuk **Laporan**
setelah admin mengisi total harga final.

### Perubahan
- `supabase/migrations/008_custom_orders.sql` (BARU) — WAJIB dijalankan di Dashboard:
  tabel `custom_orders` (order_code `MB-C-…`, status 5 nilai, ongkir/estimasi,
  total, review_token, idempotency_key), RLS (publik tak baca), RPC
  `create_custom_order(payload)` idempotent (security definer).
- `src/lib/whatsapp.ts` — `bookingOrderUrl(b, orderCode?)` menyertakan
  `No. Pesanan` (gaya nota); baru `ongkirKonfirmasiMessageCustom`/
  `ongkirKonfirmasiCustomUrl` (+ `OrderCustomOngkirInfo`).
- `src/components/BookingModal.tsx` — submit kini: panggil RPC
  `create_custom_order` (idempotency) → buka WA robust → layar `OrderSuccess`
  (order_code) → ReviewModal otomatis dengan `reviewToken` (Pembeli terverifikasi).
- `src/admin/customOrderTypes.ts` (BARU) — `CustomOrderRow` + `formatTanggalAcara`.
- `src/admin/CustomPanel.tsx` (BARU) — tab "Pesanan Khusus": daftar + filter
  status + detail (data pemesan, konsep/foto, input Total Harga Produk final,
  ongkir/estimasi auto via `jarak.ts`, status, lock selesai/batal, Konfirmasi WA
  custom, pagination 10, auto-refresh 15s).
- `src/admin/AdminDashboard.tsx` — tab baru "Pesanan Khusus" (ikon CakeSlice).
- `src/admin/LaporanPanel.tsx` — ikut muat `custom_orders`; pendapatan/jumlah
  pesanan menyertakan custom dengan `total > 0` & status valid; produk
  terjual/terlaris tetap pesanan biasa; rincian gabungan (pesanan + custom).

### Catatan
- `order_code` custom memakai awalan `MB-C-` agar mudah dibedakan dari pesanan biasa.
- Wajib menjalankan migrasi 008 dulu; sebelum itu tab "Pesanan Khusus" akan
  menampilkan error tabel belum ada.

---

## 📌 Sesi Ini — Nomor WhatsApp Kedua (Alternatif)

**Status:** SELESAI — `npx tsc --noEmit` bersih & `npm run build` sukses.

Keputusan user (dikonfirmasi): **kedua nomor tampil di bagian kontak**, semua
pesan/CTA tetap mengarah ke nomor utama.

### Perubahan
- `.env` — tambah `VITE_WHATSAPP_NUMBER2=6283148391567` (OPSIONAL; bila kosong, nomor kedua disembunyikan).
- `src/config/contact.ts` — baca env2 → `WHATSAPP_NUMBER2` + `CONTACT.whatsapp2`/`whatsapp2Display` (kosong saat tidak diisi).
- `src/components/Footer.tsx` — baris kontak nomor kedua (desktop & mobile), ikon WA, tautan `https://wa.me/<nomor2>`.
- `src/components/LocationContact.tsx` — kartu "WhatsApp Alternatif" di daftar Hubungi langsung (kondisional).
- `scripts/check-env.mjs` — validasi format nomor kedua (warning non-blokir bila format salah).
- Routing pesan TIDAK berubah — semua pesanan/booking tetap ke nomor utama (`buildWhatsAppUrl` default).

---

## 📌 Sesi Ini — Fitur Laporan Penjualan & Ongkir (Diantar)

**Status:** SELESAI — `npx tsc --noEmit` bersih & `npm run build` sukses.

### File baru / diubah
- `supabase/migrations/007_laporan_dan_ongkir.sql` (BARU) — wajib dijalankan di Supabase Dashboard
- `src/lib/whatsapp.ts` — label SUBTOTAL PRODUK utk antar + `ongkirKonfirmasiMessage/Url`
- `src/components/CartModal.tsx` — popup info pengiriman + label footer + tombol "Pilih lokasi"
- `src/components/LocationPickerModal.tsx` (BARU) — MapLibre + geolocation + Nominatim
- `src/admin/AdminDashboard.tsx` — tab Pesanan & Laporan
- `src/admin/PesananPanel.tsx` (BARU) — daftar/detail pesanan, input ongkir & estimasi, status, konfirmasi WA
- `src/admin/LaporanPanel.tsx` (BARU) — ringkasan penjualan + filter waktu
- `src/admin/orderTypes.ts` (BARU) — tipe & helper bersama pesanan/laporan

### Ringkasan keputusan (dikonfirmasi user)
- Popup info pengiriman muncul SEKALI saat keranjang dibuka (default Diantar) + tiap toggle "Diantar" ditekan. Tidak utk "Ambil sendiri".
- Skema `orders` SUDAH punya `status` (CHECK: baru/diproses/selesai/batal) & `total`; `order_items` sudah simpan `product_name`, `unit_price`, `qty`. Skema BUKAN bagian repo (hanya di Dashboard).
- Status pesanan: Baru → Menunggu Konfirmasi Ongkir → Disetujui/Proses → Selesai → Dibatalkan (tambah `menunggu_ongkir` ke CHECK constraint).
- Pendapatan = subtotal produk saja (ongkir dipisah). Status valid = `diproses` + `selesai`.
- Estimasi pengantaran = dari toko ke pelanggan, diisi ADMIN (bukan input pelanggan), masuk pesan konfirmasi WA.
- Tab admin dipisah: **Pesanan** & **Laporan**.
- Pilih lokasi: MapLibre + OSM + `navigator.geolocation` + reverse-geocode Nominatim (gratis, tanpa API key).

### Alur ongkir
Pelanggan pilih Diantar → popup info → checkout tetap → pesan WA "SUBTOTAL PRODUK … belum termasuk ongkir" → admin isi ongkir (+ estimasi) → status jadi `menunggu_ongkir` → klik **Konfirmasi ke Pelanggan** (wa.me otomatis) → pelanggan setuju → admin ubah status.

---

## 🧭 Sesi Ini — Estimasi Pengantaran Otomatis dari Jarak

**Status:** SELESAI — `npx tsc --noEmit` bersih & `npm run build` sukses.

Keputusan user (dikonfirmasi):
- Sumber titik pelanggan: **geocode alamat di panel admin** (Nominatim) — tanpa ubah DB/RPC.
- Rumus: jarak haversine toko→pelanggan, **25 km/jam + buffer 10 menit**, min 15 menit, dibulatkan ke kelipatan 5.
- Data lalu lintas Google Maps: **gratis** — baseline otomatis + tombol "Lihat rute di Google Maps" (admin cek ETA/macet, lalu boleh mengedit).
- Estimasi tetap bisa diedit admin.
- Pesanan **Ambil di toko dibiarkan apa adanya** (fitur khusus Diantar).

File:
- `src/config/contact.ts` — tambah `LOCATION.lat/lng` (sumber koordinat toko).
- `src/components/LocationPickerModal.tsx` — pakai `LOCATION.lat/lng`.
- `src/lib/jarak.ts` (BARU) — `hitungJarakKm`, `jarakDariToko`, `estimasiMenit`, `formatJarakKm`, `formatEstimasiMenit`, `geocodeAlamat`, `urlRuteMaps`.
- `src/admin/PesananPanel.tsx` — tombol "Hitung estimasi otomatis", info jarak, tautan rute Maps, catatan bila alamat tak terpetakan.

---

## ⚙️ Sesi Ini — Perbaikan Panel Admin

**Status:** SELESAI — `npx tsc --noEmit` bersih & `npm run build` sukses.

1. **Auto-refresh tanpa reload** (interval 15 detik, silent): Pesanan, Laporan, Testimoni, Moderasi. Data baru langsung muncul.
2. **Pagination seragam** — komponen baru `src/admin/Pagination.tsx` (`Pagination` + hook `usePagination`, 10 baris/halaman, reset saat filter berubah): diterapkan ke Pesanan, Laporan, Kategori, Testimoni, Moderasi (Produk sudah punya).
3. **Kunci pesanan final** — status `selesai`/`batal` di `PesananPanel` tidak bisa diubah: banner kuning, input ongkir/estimasi & dropdown status di-disable, tombol Simpan/Konfirmasi nonaktif.
4. **Estimasi otomatis saat buka detail** — tombol "Hitung estimasi otomatis" dihapus; begitu detail Diantar dibuka (alamat ada, estimasi kosong, belum final), estimasi langsung dihitung & terisi, lengkap dengan info jarak + tautan rute Maps. Rate-limit Nominatim aman karena 1 permintaan per bukaan detail.

File: `src/admin/Pagination.tsx` (BARU), `PesananPanel.tsx`, `LaporanPanel.tsx`, `KategoriPanel.tsx`, `TestimoniPanel.tsx`, `ModerasiPanel.tsx`.

---

## ✅ Yang SUDAH Dikerjakan Sesi Ini

### 1. Membaca Keseluruhan Proyek

Telah dibaca & dipahami seluruh file inti:

- Konfigurasi: `package.json`, `tailwind.config.js`, `vite.config.ts`, `index.css`, `main.tsx`
- Landing: `App.tsx` + semua komponen `/components`
- Admin: `AdminApp`, `AdminDashboard`, `ProdukPanel`, `KategoriPanel`, `ModerasiPanel`
- Hooks & lib: `Usemenudata`, `gsap`, `whatsapp`, `supabase`, `supabaseAdmin`,
  `dataevents`, `kategoriIkon`, `video`, `scrollLock`, `deviceid`, dll.
- Data & config: `data/products.ts`, `data/faq.ts`, `config/contact.ts`
- Migrasi SQL: `supabase/migrations/001..006`

### 2. Perubahan pada `src/components/ReviewModal.tsx`

**(SUDAH DITERAPKAN, tinggal diverifikasi build)**

**a. Modal Kini di Tengah di Semua Ukuran Layar**

- Sebelumnya: di HP modal menempel di bawah (`rounded-t-3xl`).
- Sekarang: `rounded-3xl` penuh + diposisikan `items-center justify-center` dengan
  padding agar selalu di tengah.

**b. Pop-up Khusus "Sudah Pernah Mengulas"**

- Saat RPC `submit_product_review` / `submit_service_review` menolak karena pengguna
  sudah mengulas menu tersebut (aturan 1 ulasan per produk per 7 hari), tampilan
  bukan lagi pesan merah inline, melainkan **layar pop-up di tengah**:
  - Ikon peringatan (AlertCircle)
  - Judul "Kamu sudah pernah mengulas menu ini"
  - Keterangan batas 7 hari
  - Tombol **Kembali** (kembali ke form) & **Tutup** (tutup modal)
- Deteksi duplikat via regex pada pesan error:
  `/sudah pernah mengulas|sudah mengirim ulasan|minggu depan/i`
- Ditambah state `popDuplikat`.

---

## 🔍 Yang Perlu DICEK / DILANJUTKAN BESOK

### 1. Verifikasi Build (URGENT — belum tuntas)

Perintah `npx tsc --noEmit` sempat berjalan tapi **belum ada hasil final**.

- [ ] Jalankan ulang `npx tsc --noEmit` dan pastikan tidak ada error tipe.
- [ ] Jalankan `npm run build` untuk memastikan build produksi sukses.
- [ ] Uji visual di browser (dev): buka modal ulasan, coba kirim ulasan dua kali
      pada produk yang sama untuk melihat pop-up duplikat.

### 2. Catatan/Potensi Lanjutan (belum diputuskan)

- Data kontak di `src/config/contact.ts` masih **data contoh** (alamat, email,
  nomor WA fallback). Perlu diganti data asli Mulya Bakery sebelum go-live.
- `VITE_WHATSAPP_NUMBER` & `VITE_SUPABASE_*` diisi lewat `.env` (lihat `.env.example`).
- Video demo produk di `src/data/products.ts` masih memakai klip sampel publik —
  perlu diganti file MP4 lokal di `public/videos/`.
- Perlu konfirmasi apakah penambahan/pengubahan lain diinginkan (mis. fitur baru,
  perubahan styling, dsb).

---

## 🧭 Cara Menjalankan

```bash
npm install
npm run dev        # jalankan dev server Vite
npm run build      # build produksi
npm run lint       # tsc --noEmit
```

---

## 📝 Catatan Pengerjaan Tambahan

- Saat menjalankan perintah di terminal Windows/PowerShell, **jangan pakai `&&`**
  karena PowerShell versi tua menolaknya. Pakai perintah terpisah atau `;`.
- Struktur file besar, perubahan UI disarankan diuji per-komponen.

## 📌 Daftar Task (Sesi Ini — dikerjakan satu per satu sesuai urutan)

1. [x] **Task #1 — Alur ulasan otomatis setelah pesanan & booking** (lihat catatan di bawah)
2. [x] **Task #2 — ProductDetailModal: font Itim (kecuali judul pakai default)**
3. [x] **Task #3 — ProductDetailModal: background pink + tombol CTA pink (teks putih)**
4. [x] **Task #4 — Halaman admin: desain kombinasi #FFE4E9 + #FF69B4**
5. [x] **Task #5 — Halaman admin responsive (desktop & mobile)**
6. [x] **Task #6 — Pusatkan data yang belum diisi (contact/produk) jadi satu bagian**

---

### ✅ Task #5 — Halaman Admin Responsive (SELESAI)

**Perubahan file & detail:**

- `src/admin/AdminApp.tsx`: Bingkai `min-h-screen` → `min-h-dvh` (agar pas tinggi layar dinamis mobile).
- `src/admin/AdminDashboard.tsx`: root `min-h-screen` → `min-h-dvh` + tambah `overflow-x-hidden` (cegah scrollbar landscape).
- `src/admin/ProdukPanel.tsx`:
  - Modal form: `max-h-[94vh]` → `max-h-[94dvh]`.
  - **Tabel → Responsif**: di desktop (`md:block`) tetap tabel penuh; di mobile (`md:hidden`) menjadi **kartu per produk** → **tanpa scrollbar horizontal**.
- `src/admin/KategoriPanel.tsx`: modal form `max-h-[94vh]` → `max-h-[94dvh]`.
- `src/admin/TestimoniPanel.tsx`: modal form `max-h-[94vh]` → `max-h-[94dvh]`.

**Catatan:** AdminDashboard sudah responsif sebelumnya (sidebar `lg:fixed`, drawer mobile, header sticky). Perubahan ini menyempurnakan tinggi modal & menghilangkan scrollbar horizontal pada tabel produk di mobile.

---

### ✅ Task #6 — Data Terpusat + Data Asli Mulya Bakery (SELESAI)

**Perubahan file:** `src/config/contact.ts`, `src/components/Footer.tsx`

- **`src/config/contact.ts`:**
  - Nomor WA fallback `6283162253730` → `6287837739102` (087837739102). Primer tetap dari `VITE_WHATSAPP_NUMBER`.
  - Instagram: `mulyabakery` → `mulyabakery_`, url → `https://www.instagram.com/mulyabakery_`.
  - Email → `""` (belum diisi, diisi nanti). Ditambah `facebook: ""` dan `facebookUrl: ""` (belum diisi).
  - Alamat → `Jl. Srikandi Raya, Suko, Lerep`, kota → `Kec. Ungaran Bar., Kabupaten Semarang, Jawa Tengah 50519`.
  - `mapsQuery` → `Mulya Bakery, Jl. Srikandi Raya, Suko, Lerep, Ungaran`.
  - Jam buka → satu baris `Senin – Minggu: 08.00 – 23.00`.
- **`src/components/Footer.tsx`:** Tombol Facebook (desktop & mobile) memakai `CONTACT.facebookUrl || "#"` — satu sumber data.

**Catatan:** Ini adalah pusat satu data. Untuk mengubah kontak/alamat/jam/sosmed nanti, cukup edit file `src/config/contact.ts`.

---

### ✅ Lokasi Map — Koordinat Toko Nyata (SELESAI)

**Perubahan file:** `src/components/LocationContact.tsx`

- Koordinat map hardcoded lama `[110.4194, -7.0051]` (contoh) diganti dengan koordinat toko asli **Mulya Bakery** dari link Google Maps yang diberikan (`https://maps.app.goo.gl/4d1EBhvuAwdj9ekZ7`):
  - **Lintang (lat):** `-7.1287625`
  - **Bujur (lng):** `110.3929844`
- Ditambahkan konstanta `TOKO_LNG` & `TOKO_LAT`, dipakai di 2 tempat:
  1. `resetPetaKeToko` (tombol "kembali ke toko")
  2. `initMap` (pembuatan map awal + penempatan marker)
- **Kartu mobile:** badge jarak `"0.3 km"` → `"Toko utama"` (marker tepat di toko), dan jam `"Buka • 07.00 - 20.00"` → dinamis dari `LOCATION.hours[0].time` (kini `08.00 - 23.00`).
- **Gambar toko fisik:** tetap memakai `/images/icontoko.png` (default, sesuai arahan) — siap diganti nanti.

**Catatan:** Untuk mengganti foto toko asli nanti, cukup ganti `src="/images/icontoko.png"` (ada di 4 tempat) dengan file foto baru di `public/images/`.

---

### ✅ About Section 1 — Urutan Mobile diubah (SELESAI)

**Perubahan file:** `src/components/About.tsx` (khusus Section 1 "About Hero Collage")

**Permintaan user:** Pertahankan design saat ini; yang diubah hanya tata letak **mode mobile** Section 1 About. Urutan mobile diubah menjadi: **Badge & H1 → Kolase foto → Paragraf** (semula: Badge & H1 → Paragraf → Kolase).

**Cara implementasi:**

- Kolom kiri memakai `className="contents"`, sehingga elemen anaknya (badge/H1 & paragraf) menjadi item grid langsung bersama kolase foto.
- Badge/H1 → `order-1` (tetap pertama).
- Kolase foto → `order-2` (di tengah).
- Paragraf deskripsi → diberi `order-3` (pindah ke bawah kolase) + `lg:order-none` agar **desktop tidak berubah** (di desktop kolom kiri kembali `block` dan urutan normal: badge/H1 → paragraf).

**Catatan:** Hanya urutan mobile yang diubah. Desain, warna, font, dan tata letak desktop **persis sama** seperti sebelumnya.

---

### ✅ Build Guard `check-env.mjs` + script `prebuild` (SELESAI)

**Perubahan file:** `scripts/check-env.mjs` (baru), `package.json`

**Masalah:** Komentar di `contact.ts` & `package.json` menyebut build produksi akan GAGAL bila nomor WA masih contoh, tapi file `scripts/check-env.mjs` TIDAK ADA. Akibatnya situs bisa ter-deploy dengan data contoh → pesanan pelanggan nyasar ke nomor salah.

**Solusi:**

- Dibuat `scripts/check-env.mjs` — berjalan otomatis sebelum `npm run build` lewat script `prebuild`.
- Memeriksa: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (atau `VITE_SUPABASE_ANON_KEY`), dan `VITE_WHATSAPP_NUMBER`.
- Bila belum terisi → **peringatan tegas** (build tetap lanjut, karena `npm run build` lokal sering tanpa `.env`).
- Bila `STRICT_ENV=1` → **build GAGAL** (untuk CI/deploy).
- **Selalu GAGAL** bila terdeteksi secret key (`sb_secret_` / `service_role`) di frontend — pelanggaran keamanan serius.
- `package.json` ditambah script `"prebuild": "node scripts/check-env.mjs"`.

**Status:** `node scripts/check-env.mjs` sudah diuji — mendeteksi `.env` ada tapi variabel kosong, menampilkan peringatan yang benar.

---

### ✅ `vercel.json` — SPA Fallback untuk akses `/admin` di Vercel (SELESAI)

**Perubahan file:** `vercel.json` (baru)

**Masalah:** Admin panel diakses via URL `/admin` (lihat `main.tsx` yang merender AdminApp saat pathname diawali `/admin`). Saat dibuka langsung di Vercel, hosting statis bisa mengembalikan 404 karena tidak ada file `/admin`. Perlu SPA fallback.

**Solusi:** Dibuat `vercel.json` dengan rewrite semua rute ke `index.html`, sehingga `/admin` (dan path lain) selalu memuat aplikasi, lalu React menentukan kontennya.

---

### ✅ Perbaikan Upload Foto di Mobile — CartModal, BookingModal, ReviewModal (SELESAI)

**Masalah:** Upload foto tidak berfungsi di mode mobile (terutama iOS Safari).

**Akar penyebab:**

1. `<input type="file">` memakai `className="hidden"` (`display:none`) yang dipicu melalui `<label>`. Di iOS Safari, input file dengan `display:none` **tidak membuka file picker** dengan andal.
2. Atribut `accept="image/png,image/jpeg,image/webp"` (daftar MIME spesifik) bisa membuat file picker **tidak muncul** di iPhone.

**Perbaikan (hanya menyentuh bagian upload foto):**

- Ganti `className="hidden"` → `className="sr-only"` (visually-hidden tapi tetap bisa diklik — **tampilan tidak berubah**).
- Ganti `accept="image/png,image/jpeg,image/webp"` → `accept="image/*"` di CartModal & ReviewModal (BookingModal sudah `image/*`).

**File yang diubah:**

- `src/components/CartModal.tsx`
- `src/components/BookingModal.tsx`
- `src/components/ReviewModal.tsx`

**Catatan:** Verifikasi validasi tipe file tetap dijaga di `uploadImage.ts` (`TIPE_DIIZINKAN`). Tidak ada perubahan lain selain bagian input file.

---

### ✅ ProdukPanel Form Tambah/Edit — Font Itim (SELESAI)

**Permintaan user:** Di halaman admin `ProdukPanel.tsx`, bagian Form Tambah/Edit, seluruh font KECUALI H2 memakai font **Itim**.

**Perubahan file:** `src/admin/ProdukPanel.tsx`

- Injekt font Itim via `<style>` (`@import` + rule `.font-itim, .font-itim * { font-family: 'Itim', cursive, sans-serif !important; }`).
- Body form (`div` berisi kolom input) diberi class `font-itim`.
- Footer form (tempat tombol "Simpan Produk"/"Simpan Perubahan") diberi class `font-itim`.
- **H2** ("Tambah Produk"/"Edit Produk") di header **tidak** diberi `font-itim` → tetap `font-heading` (Caprasimo) sesuai arahan.
- Rule memakai `!important` untuk menimpa class `font-text` (Nunito Sans) pada input/label agar konsisten.

**Catatan:** Hanya Form Tambah/Edit produk yang diubah. Tabel daftar produk di halaman admin **tidak** diubah fontnya.

---

### ✅ Footer — Kolom MENU diselaraskan dengan Navbar (SELESAI)

**Perubahan file:** `src/components/Footer.tsx`

Kolom **MENU** (desktop grid & accordion mobile) awalnya memakai label/href yang tidak cocok dengan navbar (`#beranda`, `#tentang-kami`, `#produk`, `#galeri`). Disamakan dengan `NAV_LINKS` di `Navbar.tsx`:

- Tentang → `#tentang`
- Menu → `#menu`
- Cara Pesan → `#cara-pesan`
- Keunggulan → `#keunggulan`
- Testimoni → `#testimoni`
- Gallery → `#gallery`
- Kontak → `#kontak`

**Catatan:** Hanya kolom MENU yang diubah (label + href). **Desain footer TIDAK diubah** — struktur, warna, dan tata letak tetap persis seperti sebelumnya.

---

### ✅ Optimasi Map Lambat — `LocationContact.tsx` (Opsi A)

**Masalah:** Map (MapLibre + OpenStreetMap) dimuat langsung saat halaman terbuka, padahal section "Lokasi & Kontak" ada di bawah halaman. Semua tile OSM ikut diunduh sejak awal → render awal lambat.

**Perbaikan:**

1. **Lazy-load map** via `IntersectionObserver` — map baru dibuat saat section mulai terlihat (rootMargin 160px), bukan saat halaman dibuka. Sebelum itu tidak ada tile OSM yang diunduh.
2. **Batasi `maxzoom`** dari 19 → 17 — mengurangi jumlah tile yang diunduh saat zoom.
3. **Ganti gambar Unsplash eksternal** di kartu toko (mobile & desktop) → `/images/icontoko.png` (lokal, tidak ada request eksternal).

**Detail teknis yang diubah di `LocationContact.tsx`:**

- Tambah `cleanupMapRef` untuk membersihkan map saat unmount.
- `initMap(container)` sebagai function internal; dipanggil sekali oleh IntersectionObserver (dengan fallback bila observer tak tersedia).
- Channel cleanup: `observer.disconnect()` + `cleanupMapRef.current?.()`.

**Status:** `npx tsc --noEmit` sedang diverifikasi.

---

### ✅ Task #2 & #3 — ProductDetailModal (SELESAI)

**Keputusan user:** Font **Itim** untuk semua teks KECUALI judul (nama produk/h1) tetap memakai font default.

**Perubahan file:** `src/components/ProductDetailModal.tsx`

- Injekt font Itim via tag `<style>` (`@import` + `.font-itim`).
- **Kategori** (`{product.category}`) → `font-itim`
- **Nama produk** (`<h3>`) → tetap `font-heading` (Caprasimo) ✅ sesuai arahan
- **Deskripsi** → `font-itim`
- **Label "Harga"** → `font-itim`
- **Background panel** → `bg-gradient-to-br from-pink-50 via-paper-100 to-paper-200 shadow-pink-lg`
- **Tombol CTA "Tambah ke Keranjang"** → `bg-primary-500 text-white hover:bg-primary-600` (pink, teks putih). Saat sudah ditambahkan tetap hijau.

### ✅ Task #4 — Halaman Admin Warna Pink (SELESAI)

Semua file admin memakai palet `#FFE4E9` (paper/pink-50) + `#FF69B4` (primary-500):

- `src/admin/AdminApp.tsx`: Bingkai `bg-gradient-pink-soft`, kartu login `bg-white/90 ring-pink-200 shadow-pink-lg`, ikon & tombol `bg-primary-500 text-white hover:bg-primary-600`.
- `src/admin/AdminDashboard.tsx`: sidebar aktif `bg-primary-500 text-white`, brand icon `bg-primary-500`, tombol keluar.
- `src/admin/ProdukPanel.tsx`: tombol "Tambah Produk", upload foto, upload video, submit form, `TombolToggle` → pink.
- `src/admin/KategoriPanel.tsx`: tombol tambah, simpan, toggle → pink.
- `src/admin/TestimoniPanel.tsx`: tombol tambah, simpan, toggle → pink.
- `tailwind.config.js`: palet paper (50–300) & primary (300–700) sudah berisi #FFE4E9 + #FF69B4.

**Status:** `npx tsc --noEmit` — hasil final perlu dikonfirmasi (beberapa kali berjalan tanpa output error).

---

### ✅ Task #1 — Alur Ulasan Otomatis Setelah Pesanan & Booking (SELESAI)

**Keputusan:** Opsi A — tetap pakai struktur ulasan yang ada (rating + nama + komentar + foto + pilih produk), tanpa migrasi DB baru.

**Perubahan file:**

- `src/components/CartModal.tsx`:
  - Tambah `useEffect` → saat checkout sukses (`hasil` ter-set), setelah jeda ±2 detik otomatis `setUlasanTerbuka(true)`.
  - Produk yang baru dibeli otomatis jadi pilihan awal via prop `produkDipesan` (sudah ada).
  - Tombol "Tulis ulasan" di `OrderSuccess` tetap berfungsi.
- `src/components/BookingModal.tsx`:
  - Import `ReviewModal` + tambah state `ulasanTerbuka`.
  - Setelah booking terkirim (WhatsApp dibuka), modal booking ditutup, lalu setelah jeda ±1,2 detik `ReviewModal` terbuka otomatis.
  - Karena booking bersifat custom (tanpa produk spesifik), `ReviewModal` dibuka TANPA `produkDipesan` → dropdown menu umum, ulasan terdaftar sebagai service review.

**Catatan penting (migrasi ulasan):**

- Migrasi `005` menghapus batas 1 ulasan/30 hari & 1/produk/7 hari.
- Migrasi `006` MENGEMBALIKAN batas 1 ulasan/produk/7 hari.
- Jadi aturan AKTIF = `006` (1 ulasan/produk/7 hari). Konsisten dgn pop-up "sudah pernah mengulas" di ReviewModal.

**Status:** Kode selesai. Verifikasi `npx tsc --noEmit` masih berjalan (belum ada hasil final).

---

pertanyaan untuk besok :

1. buatkan agar setelah redirect ke wa atau setelah memesan produk atau membuat booking produk arahkan langsung ke form testimonial agar langsung bisa memberikan feedback, untuk jenis roti nyaa disesuaikan agar menyesuaikan apa yang sudah dibeli oleh pelanggan — ✅ SELESAI (Task #1)

2. Untuk ProductDetailModal.tsx buatkan agar selain product.name menggunakan font berikut inii : <style>{`    @import url('https://fonts.googleapis.com/css2?family=Itim&display=swap');
.font-itim {
  font-family: 'Itim', cursive, sans-serif;
}`}</style>

3. Lalu ubahkan ProductDetailModal ini untuk backgroundnya menggunakan warna pink dan tombol cta nyaa saat ditekan / hover berwarna pink dengan teks-white

4 lalu dihalaman admin buatkan agar designnya menggunakan kombinasi warna #FFE4E9 dan #FF69B4

5. setiap halaman di admin harus responsive baik ituu di dekstop maupun mobile, harus responsive dengan tidak ada teks yang naik dan turun, lalu tidak ada scrollbar landscape, dan tingginya atau height dan width nyaa sesuai dengan layar pada device masing masing

6. Lalu kan ada beberapa data yang belum saya isi, nah buatkan itu menjadi satu bagian sajaa, jadi saya nanti tinggal mengubah ituu biar cepat dan efisien tapi tetap tepatt


