-- ============================================================================
--  MULYA BAKERY — MIGRASI: Panel Admin (CRUD produk) + Storage menu
-- ----------------------------------------------------------------------------
--  Jalankan SEKALI di: Supabase Dashboard > SQL Editor > New query,
--  SETELAH schema utama (tabel `products` sudah ada). Aman diulang (idempotent).
--
--  Tujuan: memberi OWNER (yang login) izin menulis ke tabel `products` dan ke
--  bucket foto/video menu, sementara publik tetap HANYA bisa membaca.
--
--  Keamanan inti: semua penulisan dijaga di DATABASE lewat Row Level Security,
--  BUKAN dengan menyembunyikan halaman /admin. Panel admin di frontend cuma
--  "remote control"; kalau tidak login, database menolak semua tulisannya.
--
--  PRASYARAT (dikerjakan di Dashboard, BUKAN di sini — lihat catatan di bawah):
--    1. Authentication > Users > "Add user"  -> buat 1 akun owner (email+password)
--    2. Authentication > Sign In / Providers  -> MATIKAN "Allow new users to
--       sign up". Tanpa ini, siapa pun bisa daftar & jadi admin.
-- ============================================================================

-- ── 1. Bucket Storage untuk foto & video menu ────────────────────────────────
--  Publik boleh BACA (situs perlu menampilkannya), tapi hanya yang LOGIN yang
--  boleh mengunggah. 20 MB agar cukup untuk video pendek; MP4 saja demi
--  kompatibilitas semua browser/HP (mov/webm sebaiknya dikonversi ke MP4 dulu).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('menu', 'menu', true, 20971520,
        array['image/jpeg', 'image/png', 'image/webp', 'video/mp4'])
on conflict (id) do update
  set public             = true,
      file_size_limit    = 20971520,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];

-- Dibuat ulang dengan aman (drop dulu bila sisa percobaan sebelumnya).
drop policy if exists "menu_read"   on storage.objects;
drop policy if exists "menu_insert" on storage.objects;
drop policy if exists "menu_update" on storage.objects;
drop policy if exists "menu_delete" on storage.objects;

-- Baca: publik (anon + authenticated).
create policy "menu_read"
  on storage.objects for select
  using (bucket_id = 'menu');

-- Tulis/ubah/hapus: HANYA yang login (owner).
create policy "menu_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'menu');

create policy "menu_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'menu')
  with check (bucket_id = 'menu');

create policy "menu_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'menu');

-- ── 2. RLS tabel products: publik baca lewat RPC, owner tulis langsung ────────
--  Menu publik diambil lewat get_menu() (SECURITY DEFINER) yang MELEWATI RLS,
--  jadi mengaktifkan RLS di sini tidak mematikan tampilan menu di situs.
--  Yang kita tambahkan: izin bagi OWNER (role 'authenticated') untuk membaca
--  baris mentah (buat form edit) dan menulis. Publik anonim tetap TIDAK bisa
--  menyentuh tabel ini secara langsung.
alter table public.products enable row level security;

drop policy if exists "products_admin_read"   on public.products;
drop policy if exists "products_admin_insert" on public.products;
drop policy if exists "products_admin_update" on public.products;
drop policy if exists "products_admin_delete" on public.products;

create policy "products_admin_read"
  on public.products for select
  to authenticated
  using (true);

create policy "products_admin_insert"
  on public.products for insert
  to authenticated
  with check (true);

create policy "products_admin_update"
  on public.products for update
  to authenticated
  using (true)
  with check (true);

create policy "products_admin_delete"
  on public.products for delete
  to authenticated
  using (true);

-- ============================================================================
--  (OPSIONAL, pengetatan) Kalau mau membatasi tulis ke SATU email owner saja —
--  supaya walau ada akun authenticated lain, dia tetap tak bisa mengubah menu —
--  ganti `using (true)` / `with check (true)` di atas dengan:
--
--      using ( auth.jwt() ->> 'email' = 'owner@emailkamu.com' )
--
--  Untuk sekarang, dengan signup dimatikan & cuma ada 1 akun owner, `true`
--  sudah aman.
-- ============================================================================

-- ── VERIFIKASI CEPAT ─────────────────────────────────────────────────────────
--    select id, public from storage.buckets where id = 'menu';   -- bucket ada
--    select polname from pg_policies where tablename = 'products';-- policy ada
-- ============================================================================
