/* ─────────────────────────────────────────────────────────────────────────────
 * TIPE & HELPERS BERSAMA untuk panel Pesanan & Laporan (admin).
 * Sumber kebenaran skema: tabel `orders` + `order_items` di Supabase.
 * ─────────────────────────────────────────────────────────────────────────── */

export interface OrderItemRow {
  id: string;
  product_id: string | null;
  product_name: string;
  unit_price: number;
  qty: number;
}

export interface OrderRow {
  id: string;
  order_code: string;
  customer_name: string;
  customer_phone: string;
  method: "antar" | "ambil";
  address: string | null;
  note: string | null;
  total: number;
  status: string;
  shipping_fee: number;
  delivery_estimate: string | null;
  created_at: string;
  order_items?: OrderItemRow[];
}

/** Status pesanan sesuai skema (migrasi 007) + label & warna tampilan. */
export const STATUS: Record<string, { label: string; badge: string }> = {
  baru: { label: "Baru", badge: "bg-cocoa-700/10 text-cocoa-700/70" },
  menunggu_ongkir: {
    label: "Menunggu Konfirmasi Ongkir",
    badge: "bg-amber-100 text-amber-700",
  },
  diproses: { label: "Disetujui / Proses", badge: "bg-blue-100 text-blue-700" },
  selesai: { label: "Selesai", badge: "bg-green-100 text-green-700" },
  batal: { label: "Dibatalkan", badge: "bg-red-100 text-red-600" },
};

export const URUTAN_STATUS = [
  "baru",
  "menunggu_ongkir",
  "diproses",
  "selesai",
  "batal",
] as const;

/** Status yang dianggap valid sebagai pendapatan (dibatalkan tidak masuk). */
export const STATUS_PENDAPATAN = ["diproses", "selesai"];

export function statusLabel(s: string): string {
  return STATUS[s]?.label ?? s;
}

export function formatTanggal(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatJam(iso: string): string {
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Total harga produk (subtotal) dari item pesanan — tanpa ongkir. */
export function subtotalPesanan(r: OrderRow): number {
  return (r.order_items ?? []).reduce(
    (n, it) => n + it.unit_price * it.qty,
    0,
  );
}