# TODO — Mulya Bakery Landing Page

> Dibuat: (tanggal pengerjaan)
> Status pekerjaan sesi ini: **SEDANG BERLANGSUNG** — tidak selesai di sesi ini.

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
