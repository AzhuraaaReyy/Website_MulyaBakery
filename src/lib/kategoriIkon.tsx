import {
  Croissant,
  Sandwich,
  Cookie,
  Cake,
  Donut,
  Coffee,
  IceCreamCone,
  Pizza,
  Wheat,
  Cherry,
  CupSoda,
  Salad,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

/**
 * Peta nama-ikon (teks yang disimpan di kolom categories.icon) -> komponen
 * ikon. Dipakai bersama oleh chip kategori di situs publik dan pemilih ikon di
 * panel admin, jadi keduanya selalu konsisten.
 */
export const IKON_KATEGORI: Record<string, LucideIcon> = {
  croissant: Croissant,
  roti: Sandwich,
  cookie: Cookie,
  cake: Cake,
  donut: Donut,
  kopi: Coffee,
  eskrim: IceCreamCone,
  pizza: Pizza,
  gandum: Wheat,
  buah: Cherry,
  minuman: CupSoda,
  salad: Salad,
};

/** Urutan pilihan yang muncul di pemilih ikon panel admin. */
export const DAFTAR_IKON = Object.keys(IKON_KATEGORI);

/** Ambil komponen ikon dari namanya; fallback ke ikon umum bila tak dikenal. */
export function ikonKategori(nama?: string | null): LucideIcon {
  return (nama && IKON_KATEGORI[nama]) || UtensilsCrossed;
}
