-- ============================================================================
--  MULYA BAKERY — MIGRASI: Foto (Storage) + foto pada ulasan pelayanan
-- ----------------------------------------------------------------------------
--  Jalankan SEKALI di: Supabase Dashboard > SQL Editor > New query,
--  SETELAH schema utama (yang berisi tabel service_reviews & is_spam).
--  Aman dijalankan ulang (idempotent).
--
--  Menyinkronkan database dengan yang sudah diharapkan frontend:
--    - src/lib/uploadImage.ts        -> bucket "uploads"
--    - src/components/BookingModal.tsx  (foto referensi -> link WA)
--    - src/components/ReviewModal.tsx   (foto ulasan -> payload.photo_url)
--    - src/components/Testimonials.tsx  (menampilkan photo_url)
-- ============================================================================

-- ── 1. Bucket Storage publik untuk foto (referensi booking & foto ulasan) ────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('uploads', 'uploads', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public             = true,
      file_size_limit    = 5242880,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

-- Dibuat ulang dengan aman (drop dulu bila sudah ada dari percobaan sebelumnya).
drop policy if exists "uploads_read"   on storage.objects;
drop policy if exists "uploads_insert" on storage.objects;

create policy "uploads_read"
  on storage.objects for select
  using (bucket_id = 'uploads');

create policy "uploads_insert"
  on storage.objects for insert
  with check (bucket_id = 'uploads');

-- ── 2. Kolom foto pada ulasan pelayanan ──────────────────────────────────────
alter table public.service_reviews add column if not exists photo_url text;

-- ── 3. submit_service_review: menerima photo_url (opsional) ──────────────────
--  Foto WAJIB menunjuk ke bucket "uploads" milik proyek ini. Tanpa aturan ini,
--  kolom foto bisa dipakai menyelipkan tautan spam/eksternal ke halaman.
create or replace function public.submit_service_review(payload jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name     text := btrim(coalesce(payload->>'reviewer_name', ''));
  v_role     text := nullif(btrim(coalesce(payload->>'reviewer_role', '')), '');
  v_quote    text := btrim(coalesce(payload->>'quote', ''));
  v_rating   smallint := coalesce((payload->>'rating')::smallint, 0);
  v_device   uuid := nullif(payload->>'device_id', '')::uuid;
  v_token    uuid := nullif(payload->>'review_token', '')::uuid;
  v_photo    text := nullif(btrim(coalesce(payload->>'photo_url', '')), '');
  v_honeypot text := coalesce(payload->>'website', '');
  v_order_id uuid;
  v_verified boolean := false;
begin
  if v_honeypot <> '' then
    return;
  end if;

  if char_length(v_name) < 2 or char_length(v_name) > 60 then
    raise exception 'nama tidak valid' using errcode = '22023';
  end if;
  if v_rating < 1 or v_rating > 5 then
    raise exception 'rating harus 1-5' using errcode = '22023';
  end if;
  if char_length(v_quote) < 10 or char_length(v_quote) > 500 then
    raise exception 'ulasan minimal 10 karakter' using errcode = '22023';
  end if;
  if is_spam(v_quote) or is_spam(v_name) or is_spam(v_role) then
    raise exception 'ulasan terdeteksi sebagai spam' using errcode = '22023';
  end if;

  -- Foto (opsional) hanya boleh dari bucket "uploads" proyek ini.
  if v_photo is not null and (
       char_length(v_photo) > 500
       or v_photo !~ '^https://[a-z0-9.-]+/storage/v1/object/public/uploads/'
     ) then
    raise exception 'foto tidak valid' using errcode = '22023';
  end if;

  if v_token is not null then
    select id into v_order_id from orders where review_token = v_token;
    v_verified := v_order_id is not null;
  end if;

  if v_device is not null and exists (
    select 1 from service_reviews
    where device_id = v_device and created_at > now() - interval '30 days'
  ) then
    raise exception 'kamu sudah mengirim ulasan pelayanan bulan ini'
      using errcode = '22023';
  end if;

  -- MODERASI (opsi A): ulasan BERFOTO ditahan (is_hidden = true) sampai owner
  -- meninjaunya di Supabase > Table Editor. Ulasan teks tanpa foto tetap
  -- tampil langsung. Ini mencegah foto tak pantas nongol ke publik tanpa izin.
  insert into service_reviews (
    order_id, device_id, reviewer_name, reviewer_role,
    rating, quote, verified_purchase, photo_url, is_hidden
  ) values (
    v_order_id, v_device, v_name, v_role,
    v_rating, v_quote, v_verified, v_photo,
    v_photo is not null
  );
end;
$$;

-- ── 4. get_service_reviews: mengembalikan photo_url ──────────────────────────
--  Signature RETURNS TABLE berubah (nambah kolom), jadi WAJIB drop dulu —
--  create or replace tidak bisa mengubah tipe keluaran.
drop function if exists public.get_service_reviews(integer);

create function public.get_service_reviews(p_limit integer default 12)
returns table (
  id                uuid,
  reviewer_name     text,
  reviewer_role     text,
  rating            smallint,
  quote             text,
  photo_url         text,
  verified_purchase boolean,
  created_at        timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select id, reviewer_name, reviewer_role, rating, quote,
         photo_url, verified_purchase, created_at
  from service_reviews
  where is_hidden = false
  order by verified_purchase desc, created_at desc
  limit greatest(1, least(50, coalesce(p_limit, 12)));
$$;

revoke all    on function public.get_service_reviews(integer) from public;
grant  execute on function public.get_service_reviews(integer) to anon, authenticated;

-- ============================================================================
--  VERIFIKASI CEPAT (jalankan setelah di atas sukses):
--    select id, photo_url from public.service_reviews limit 1;  -- kolom ada
--    select * from public.get_service_reviews(1);               -- ada photo_url
-- ============================================================================
