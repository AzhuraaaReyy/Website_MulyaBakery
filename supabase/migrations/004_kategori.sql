-- ============================================================================
--  MULYA BAKERY — MIGRASI: Kategori menu dinamis (CRUD dari panel admin)
-- ----------------------------------------------------------------------------
--  Jalankan SEKALI di: Supabase Dashboard > SQL Editor > New query.
--  Aman diulang (idempotent).
--
--  Sebelumnya kategori di-hardcode di kode (Menu.tsx & form admin). Sekarang
--  jadi DATA di tabel ini supaya owner bisa tambah/ubah/hapus kategori sendiri.
--
--  Catatan desain: products.category tetap kolom TEKS berisi NAMA kategori
--  (tidak diubah jadi foreign key), jadi get_menu() TIDAK perlu diubah. Nama
--  kategori = kunci utama tabel ini; mengganti nama di panel ikut memperbarui
--  products.category (cascade di sisi aplikasi).
-- ============================================================================

create table if not exists public.categories (
  name       text primary key,
  icon       text,                                   -- nama ikon (lihat kategoriIkon.tsx)
  sort_order int  not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

-- ── Baca ─────────────────────────────────────────────────────────────────────
drop policy if exists "categories_public_read" on public.categories;
drop policy if exists "categories_admin_read"  on public.categories;

-- Publik (situs) hanya melihat kategori aktif.
create policy "categories_public_read"
  on public.categories for select
  to anon
  using (is_active = true);

-- Owner (login) melihat semua, termasuk yang nonaktif.
create policy "categories_admin_read"
  on public.categories for select
  to authenticated
  using (true);

-- ── Tulis: hanya owner (login) ───────────────────────────────────────────────
drop policy if exists "categories_admin_insert" on public.categories;
drop policy if exists "categories_admin_update" on public.categories;
drop policy if exists "categories_admin_delete" on public.categories;

create policy "categories_admin_insert"
  on public.categories for insert
  to authenticated with check (true);

create policy "categories_admin_update"
  on public.categories for update
  to authenticated using (true) with check (true);

create policy "categories_admin_delete"
  on public.categories for delete
  to authenticated using (true);

-- ── Seed 4 kategori yang sudah ada (tidak menimpa bila sudah ada) ─────────────
insert into public.categories (name, icon, sort_order, is_active) values
  ('Roti Manis',        'croissant', 0, true),
  ('Roti Tawar',        'roti',      1, true),
  ('Kue Kering/Pastry', 'cookie',    2, true),
  ('Pesanan Custom',    'cake',      3, true)
on conflict (name) do nothing;

-- ── VERIFIKASI CEPAT ─────────────────────────────────────────────────────────
--    select * from public.categories order by sort_order;
-- ============================================================================
