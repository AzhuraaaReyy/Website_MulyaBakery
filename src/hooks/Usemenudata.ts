import { useCallback, useEffect, useRef, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { dengarkan } from "../lib/dataevents";
import { getDeviceId } from "../lib/deviceid";
import { products as produkStatis, type Product } from "../data/products";

/**
 * Produk beserta statistik hidupnya (like, rating, penjualan).
 *
 * Perhatikan `rating` dan `sold` warisan dari data/products.ts SENGAJA tidak
 * dipakai lagi di kartu menu. Angka-angka itu dulu ditulis tangan; sekarang
 * semuanya dihitung dari data asli. Field lama dibiarkan ada supaya komponen
 * lain (showcase produk unggulan, modal detail) tidak ikut rusak.
 */
export interface MenuProduct extends Product {
  likeCount: number;
  likedByMe: boolean;
  /** null = belum ada satu pun ulasan. Bedakan dari 0 (dinilai buruk). */
  avgRating: number | null;
  reviewCount: number;
  unitsSold: number;
  score: number;
  isBestSeller: boolean;
}

interface BarisMenu {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string | null;
  video: string | null;
  featured: boolean;
  like_count: number;
  liked_by_me: boolean;
  avg_rating: number | null;
  review_count: number;
  units_sold: number;
  score: number;
  is_best_seller: boolean;
}

/**
 * Cadangan saat Supabase belum dikonfigurasi (mis. `npm run dev` tanpa .env).
 * Semua statistik dinolkan dengan sengaja — kartu menu akan menyembunyikan
 * rating & jumlah terjual, bukan menampilkan angka karangan.
 */
function cadanganStatis(): MenuProduct[] {
  return produkStatis.map((p) => ({
    ...p,
    likeCount: 0,
    likedByMe: false,
    avgRating: null,
    reviewCount: 0,
    unitsSold: 0,
    score: 0,
    isBestSeller: false,
  }));
}

export function useMenuData() {
  const [items, setItems] = useState<MenuProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(!isSupabaseConfigured);
  const dibongkar = useRef(false);
  const terakhirMuat = useRef(0);

  useEffect(() => {
    dibongkar.current = false;
    return () => {
      dibongkar.current = true;
    };
  }, []);

  const muat = useCallback(async () => {
    if (!supabase) {
      setItems(cadanganStatis());
      setOffline(true);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc("get_menu", {
        p_device_id: getDeviceId(),
      });
      if (error) throw error;
      if (dibongkar.current) return;

      const baris = (data ?? []) as BarisMenu[];
      setItems(
        baris.map((r) => ({
          id: r.id,
          name: r.name,
          price: r.price,
          category: r.category as Product["category"],
          description: r.description,
          image: r.image ?? "",
          video: r.video ?? undefined,
          featured: r.featured,
          likeCount: r.like_count ?? 0,
          likedByMe: Boolean(r.liked_by_me),
          avgRating: r.avg_rating === null ? null : Number(r.avg_rating),
          reviewCount: r.review_count ?? 0,
          unitsSold: r.units_sold ?? 0,
          score: r.score ?? 0,
          isBestSeller: Boolean(r.is_best_seller),
        })),
      );
      setOffline(false);
    } catch (err) {
      // Menu adalah isi utama halaman — lebih baik tampilkan katalog statis
      // daripada halaman kosong saat database sedang bermasalah.
      console.error("[useMenuData] gagal memuat menu:", err);
      if (dibongkar.current) return;
      setItems(cadanganStatis());
      setOffline(true);
    } finally {
      terakhirMuat.current = Date.now();
      if (!dibongkar.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void muat();
  }, [muat]);

  /* ── Segarkan begitu ada yang berubah ─────────────────────────────────────
     Dipanggil setelah pesanan tersimpan (angka "terjual" berubah) atau setelah
     ulasan menu dikirim (rating berubah). Tanpa ini, layar baru ikut berubah
     setelah halaman dimuat ulang — dan pelanggan menyangka datanya tidak masuk. */
  useEffect(() => dengarkan("menu", () => void muat()), [muat]);

  /* ── Segarkan saat pengguna kembali ke tab ────────────────────────────────
     Setelah checkout, pelanggan berpindah ke aplikasi WhatsApp. Ketika mereka
     kembali, data di layar sudah usang. Diberi jeda 15 detik supaya berpindah
     tab bolak-balik tidak membanjiri database dengan permintaan. */
  useEffect(() => {
    const onKembali = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - terakhirMuat.current < 15_000) return;
      void muat();
    };
    document.addEventListener("visibilitychange", onKembali);
    return () => document.removeEventListener("visibilitychange", onKembali);
  }, [muat]);

  /**
   * Tekan / batalkan like.
   *
   * Tampilan diperbarui lebih dulu (optimistic) supaya terasa instan, lalu
   * dikembalikan ke kondisi semula bila server menolak. Tanpa ini, hati baru
   * berubah setelah jaringan menjawab — di koneksi lambat terasa rusak.
   */
  const toggleLike = useCallback(
    async (productId: string) => {
      const deviceId = getDeviceId();
      if (!supabase || !deviceId) return;

      const sebelum = items;
      setItems((prev) =>
        prev.map((p) =>
          p.id === productId
            ? {
                ...p,
                likedByMe: !p.likedByMe,
                likeCount: p.likeCount + (p.likedByMe ? -1 : 1),
              }
            : p,
        ),
      );

      try {
        const { data, error } = await supabase.rpc("toggle_like", {
          p_product_id: productId,
          p_device_id: deviceId,
        });
        if (error) throw error;

        const hasil = Array.isArray(data) ? data[0] : data;
        if (hasil && !dibongkar.current) {
          setItems((prev) =>
            prev.map((p) =>
              p.id === productId
                ? { ...p, likedByMe: hasil.liked, likeCount: hasil.like_count }
                : p,
            ),
          );
        }
      } catch (err) {
        console.error("[useMenuData] gagal menyimpan like:", err);
        if (!dibongkar.current) setItems(sebelum);
      }
    },
    [items],
  );

  return { items, loading, offline, reload: muat, toggleLike };
}
