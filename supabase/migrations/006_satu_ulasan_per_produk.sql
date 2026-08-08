-- ============================================================================
--  MULYA BAKERY — MIGRASI: Satu ulasan per produk per perangkat per 1 minggu
-- ----------------------------------------------------------------------------
--  Jalankan SEKALI di: Supabase Dashboard > SQL Editor > New query.
--  Aman diulang (idempotent).
--
--  Tujuan: Batasi frekuensi ulasan agar sehat & tidak spam. Aturannya:
--
--    1. Setiap pelanggan (perangkat/device_id) HANYA boleh memberi SATU ulasan
--       untuk SATU produk dalam jangka waktu 7 hari (1 minggu).
--    2. Boleh mengulas produk LAIN (masing-masing maksimal 1 ulasan / 7 hari).
--    3. Produk yang sama boleh diulas LAGI setelah lewat 7 hari dari ulasan
--       terakhirnya.
--
--  Penerapan: fungsi `submit_product_review` (yang dipanggil dari ReviewModal)
--  diperbarui agar menolak bila sudah ada ulasan dari `device_id` yang sama
--  untuk `product_id` yang sama dalam 7 HARI TERAKHIR. Karena validasi ada di
--  DATABASE (security definer), tidak bisa dimanipulasi dari frontend.
--
--  Catatan: `device_id` mungkin kosong (null) untuk pengunjung yang
--  memblokir penyimpanan. Untuk perangkat dengan device_id null, pembatasan
--  tidak bisa diterapkan secara akurat — jadi aturan ini hanya berlaku untuk
--  perangkat yang punya device_id (mayoritas pengunjung normal).
-- ============================================================================

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

-- ATURAN BARU: satu ulasan per produk per perangkat per 1 MINGGU.
  -- Tolak bila sudah ada ulasan dari device yang sama untuk produk yang sama
  -- dalam 7 hari terakhir. Setelah lewat 7 hari, boleh mengulas lagi.
  if (v_product_id is not null and v_device is not null and exists (
    select 1 from product_reviews
    where device_id = v_device
      and product_id = v_product_id
      and created_at > now() - interval '7 days'
  )) then
    raise exception 'kamu sudah pernah mengulas produk ini, coba lagi nanti!'
      using errcode = '22023';
  end if;

  insert into product_reviews (
    product_id, order_id, reviewer_name, rating, comment,
    device_id, verified_purchase
  ) values (
    v_product_id, v_order_id, v_name, v_rating, v_comment,
    v_device, v_verified
  );
end;
$$;

-- ============================================================================
--  VERIFIKASI CEPAT
--    select * from pg_proc where proname = 'submit_product_review';
--    -- Coba ulangi: panggil rpc dengan product_id & device_id yang sama dua kali
--    -- -> kedua kalinya harus gagal dengan pesan "kamu sudah pernah mengulas produk ini"
-- ============================================================================
