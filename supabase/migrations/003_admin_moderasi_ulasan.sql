-- ============================================================================
--  MULYA BAKERY — MIGRASI: Moderasi ulasan berfoto dari panel admin
-- ----------------------------------------------------------------------------
--  Jalankan SEKALI di: Supabase Dashboard > SQL Editor > New query,
--  SETELAH 001 (kolom is_hidden & photo_url pada service_reviews sudah ada).
--  Aman diulang (idempotent).
--
--  Tujuan: owner bisa MENYETUJUI / MENOLAK ulasan berfoto langsung dari /admin,
--  tanpa membuka Table Editor Supabase. Untuk itu owner (role 'authenticated')
--  perlu bisa: membaca ulasan yang MASIH tersembunyi, mengubah is_hidden, dan
--  menghapus ulasan yang ditolak beserta fotonya di Storage.
--
--  Publik anonim TETAP hanya bisa menulis lewat submit_service_review() dan
--  membaca lewat get_service_reviews() (yang hanya mengembalikan is_hidden=false).
-- ============================================================================

-- ── 1. RLS service_reviews: owner boleh baca/ubah/hapus ──────────────────────
alter table public.service_reviews enable row level security;

drop policy if exists "service_reviews_admin_read"   on public.service_reviews;
drop policy if exists "service_reviews_admin_update" on public.service_reviews;
drop policy if exists "service_reviews_admin_delete" on public.service_reviews;

-- Baca SEMUA baris (termasuk yang masih tersembunyi) — hanya yang login.
create policy "service_reviews_admin_read"
  on public.service_reviews for select
  to authenticated
  using (true);

-- Setujui/tolak = ubah is_hidden — hanya yang login.
create policy "service_reviews_admin_update"
  on public.service_reviews for update
  to authenticated
  using (true)
  with check (true);

-- Hapus ulasan yang ditolak — hanya yang login.
create policy "service_reviews_admin_delete"
  on public.service_reviews for delete
  to authenticated
  using (true);

-- ── 2. Izin hapus objek di bucket 'uploads' (foto ulasan yang ditolak) ───────
--  Bucket 'uploads' sebelumnya hanya bisa dibaca publik & di-insert. Agar foto
--  ulasan yang DITOLAK ikut terhapus (tidak menyisakan sampah di Storage),
--  tambahkan izin DELETE khusus untuk yang login.
drop policy if exists "uploads_delete" on storage.objects;

create policy "uploads_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'uploads');

-- ── VERIFIKASI CEPAT ─────────────────────────────────────────────────────────
--    select count(*) from public.service_reviews where is_hidden = true; -- antrean
--    select polname from pg_policies where tablename = 'service_reviews';
-- ============================================================================
