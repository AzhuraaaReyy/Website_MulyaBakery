/* ─────────────────────────────────────────────────────────────────────────────
 * TIPE & HELPERS untuk panel "Pesanan Khusus" (admin).
 * Sumber kebenaran skema: tabel `custom_orders` (migrasi 008).
 * Status & label memakai `STATUS` / `statusLabel` dari `./orderTypes`.
 * ─────────────────────────────────────────────────────────────────────────── */

export interface CustomOrderRow {
  id: string;
  order_code: string;
  customer_name: string;
  customer_phone: string;
  method: "antar" | "ambil";
  address: string | null;
  note: string | null;
  category: string;
  custom_label: string | null;
  event_date: string;
  quantity: string | null;
  theme: string | null;
  photo_url: string | null;
  status: string;
  shipping_fee: number;
  delivery_estimate: string | null;
  total: number;
  review_token: string;
  created_at: string;
}

/** "2026-08-25" menjadi "Sabtu, 25 Agustus 2026". */
export function formatTanggalAcara(iso: string): string {
  if (!iso) return "-";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}
