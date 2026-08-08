-- ============================================================================
--  MULYA BAKERY — MIGRASI: Izinkan ulasan berulang (tanpa batas 30 hari)
-- ----------------------------------------------------------------------------
--  Jalankan SEKALI di: Supabase Dashboard > SQL Editor > New query.
--  Aman diulang (idempotent).
--
--  Tujuan: Sebelumnya ada aturan yang membatasi HANYA 1 ulasan per perangkat
--  per 30 hari (baik untuk ulasan pelayanan maupun ulasan per produk). Akibatnya,
--  pelanggan yang membeli lagi di hari berbeda tidak bisa memberikan ulasan baru.
--
--  Perubahan: Kendala "sudah pernah mengulas" dihapus. Setiap pengiriman ulasan
--  baru selalu berhasil (pembatasan spam tetap dipertahankan lewat honeypot &
--  validasi teks). Dengan ini pelanggan bebas mengulas setiap kali mereka membeli.
--
--  Catatan: batas jendela 30 HARI dihapus, tetapi tetap ada pertahanan anti-spam
--  (honeypot website + validasi nama/rating/teks) seperti sebelumnya.
-- ============================================================================

-- ════════════════════════════════════════════════════════════════════════════
--  1. ULASAN PELAYANAN (submit_service_review)
--     Definisi asli ada di supaabase/migrations/001_review_photos_and_storage.sql
--     Kita tulis ulang persis, TAPI menghapus blok pengecekan 30 hari.
-- ════════════════════════════════════════════════════════════════════════════
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

  -- PERUBAHAN: blok "sudah mengirim ulasan pelayanan bulan ini" DIHAPUS.
  -- Pelanggan kini bebas mengirim ulasan setiap kali mereka membeli.

  -- MODERASI: ulasan BERFOTO ditahan (is_hidden = true) sampai owner meninjau.
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

-- ════════════════════════════════════════════════════════════════════════════
--  2. ULASAN PER PRODUK (submit_product_review)
--     Memicu pesan "kamu sudah pernah mengulas produk ini".
--     Ditulis ulang menghapus pengecekan duplikat per perangkat.
--
--     Struktur tabel `product_reviews` (dari database Anda):
--       id, product_id, order_id, device_id, reviewer_name, rating,
--       comment, verified_purchase, is_hidden, created_at
-- ════════════════════════════════════════════════════════════════════════════
create or replace function public.submit_product_review(payload jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product_id text := nullif(btrim(coalesce(payload->>'product_id', '')), '');
  v_name       text := btrim(coalesce(payload->>'reviewer_name', ''));
  v_rating     smallint := coalesce((payload->>'rating')::smallint, 0);
  v_comment    text := btrim(coalesce(payload->>'comment', ''));
  v_device     uuid := nullif(payload->>'device_id', '')::uuid;
  v_token      uuid := nullif(payload->>'review_token', '')::uuid;
  v_honeypot   text := coalesce(payload->>'website', '');
  v_order_id   uuid;
  v_verified   boolean := false;
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
  if char_length(v_comment) < 5 or char_length(v_comment) > 500 then
    raise exception 'ulasan minimal 5 karakter' using errcode = '22023';
  end if;
  if is_spam(v_comment) or is_spam(v_name) then
    raise exception 'ulasan terdeteksi sebagai spam' using errcode = '22023';
  end if;

  -- Produk (opsional) harus terdaftar bila diisi.
  if v_product_id is not null and not exists (
    select 1 from products where id = v_product_id
  ) then
    raise exception 'produk tidak ditemukan' using errcode = '22023';
  end if;

  if v_token is not null then
    select id into v_order_id from orders where review_token = v_token;
    v_verified := v_order_id is not null;
  end if;

  -- PERUBAHAN: blok "sudah pernah mengulas produk ini" DIHAPUS.
  -- Pelanggan kini bebas mengulas produk yang sama setiap kali membeli.

insert into product_reviews (
    product_id, order_id, reviewer_name, rating, comment,
    device_id, verified_purchase
  ) values (
    v_product_id, v_order_id, v_name, v_rating, v_comment,
    v_device, v_verified
  );
end;
$$;

-- ════════════════════════════════════════════════════════════════════════════
--  VERIFIKASI CEPAT
--    select * from pg_proc where proname = 'submit_product_review';
--    select * from pg_proc where proname = 'submit_service_review';
-- ============================================================================
