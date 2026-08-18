import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Loader2,
  Package,
  ShoppingBag,
  Trophy,
  Wallet,
} from "lucide-react";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { readableError } from "../lib/supabase";
import { formatPrice } from "../data/products";
import {
  STATUS_PENDAPATAN,
  statusLabel,
  subtotalPesanan,
  formatTanggal,
  STATUS,
  type OrderRow,
} from "./orderTypes";
import type { CustomOrderRow } from "./customOrderTypes";
import { Pagination, usePagination } from "./Pagination";

/* ─────────────────────────────────────────────────────────────────────────────
 * PANEL LAPORAN PENJUALAN (admin)
 *
 * - Ringkasan (Total Pendapatan, Total Pesanan, Total Produk Terjual, Produk
 *   Terlaris) HANYA dari pesanan berstatus valid: Disetujui/Proses & Selesai.
 *   Dibatalkan TIDAK dihitung sebagai pendapatan.
 * - Pendapatan = subtotal produk saja; ongkir dipisah (biaya kurir pihak
 *   ketiga, bukan pendapatan Mulya Bakery).
 * - Pesanan KHUSUS (custom) ikut dihitung sebagai pendapatan hanya bila
 *   admin sudah mengisi total harga final (`total > 0`) dan berstatus valid.
 *   Produk terjual / produk terlaris tetap dari pesanan biasa saja.
 * - Filter waktu: Hari ini / Minggu ini / Bulan ini / Rentang tanggal.
 * ─────────────────────────────────────────────────────────────────────────── */

type FilterWaktu = "hari" | "minggu" | "bulan" | "custom";

const FILTER: { id: FilterWaktu; label: string }[] = [
  { id: "hari", label: "Hari ini" },
  { id: "minggu", label: "Minggu ini" },
  { id: "bulan", label: "Bulan ini" },
  { id: "custom", label: "Rentang tanggal" },
];

/** Awal hari pada zona lokal. */
function awalHari(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** Baris gabungan pesanan biasa + custom untuk tabel rincian. */
type RincianBaris = {
  id: string;
  created_at: string;
  order_code: string;
  customer_name: string;
  method: "antar" | "ambil";
  status: string;
  subtotal: number;
  ongkir: number;
  total: number;
};

export default function LaporanPanel() {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [customs, setCustoms] = useState<CustomOrderRow[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterWaktu>("hari");
  const [dari, setDari] = useState("");
  const [sampai, setSampai] = useState("");

  const muat = useCallback(async (senyap = false) => {
    if (!supabaseAdmin) return;
    if (!senyap) setMemuat(true);
    setGalat(null);

    const [resPesanan, resCustom] = await Promise.all([
      supabaseAdmin
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("custom_orders")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

    if (resPesanan.error) setGalat(readableError(resPesanan.error));
    else setRows((resPesanan.data ?? []) as OrderRow[]);

    if (resCustom.error && !resPesanan.error)
      setGalat(readableError(resCustom.error));
    else setCustoms((resCustom.data ?? []) as CustomOrderRow[]);

    if (!senyap) setMemuat(false);
  }, []);

  useEffect(() => {
    void muat();
  }, [muat]);

  // Auto-refresh: laporan ikut terbarui tanpa reload halaman.
  useEffect(() => {
    const id = window.setInterval(() => void muat(true), 15000);
    return () => window.clearInterval(id);
  }, [muat]);

  // Default rentang custom: awal bulan sampai hari ini.
  useEffect(() => {
    if (!dari) {
      const d = new Date();
      setDari(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`,
      );
    }
    if (!sampai) {
      const d = new Date();
      setSampai(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      );
    }
  }, [dari, sampai]);

  const { start, end } = useMemo(() => {
    const now = new Date();
    if (filter === "hari") {
      return { start: awalHari(now), end: now };
    }
    if (filter === "minggu") {
      const day = now.getDay(); // 0 = Minggu
      const diff = day === 0 ? 6 : day - 1;
      const s = new Date(now);
      s.setDate(s.getDate() - diff);
      return { start: awalHari(s), end: now };
    }
    if (filter === "bulan") {
      return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: now };
    }
    const s = dari ? new Date(`${dari}T00:00:00`) : awalHari(now);
    const e = sampai ? new Date(`${sampai}T23:59:59`) : now;
    return { start: s, end: e };
  }, [filter, dari, sampai]);

  const pesananRentang = useMemo(() => {
    return rows.filter((r) => {
      const t = new Date(r.created_at).getTime();
      return t >= start.getTime() && t <= end.getTime();
    });
  }, [rows, start, end]);

  const customRentang = useMemo(() => {
    return customs.filter((r) => {
      const t = new Date(r.created_at).getTime();
      return t >= start.getTime() && t <= end.getTime();
    });
  }, [customs, start, end]);

  // Daftar rincian gabungan (pesanan biasa + custom), urut terbaru dulu.
  const rincian = useMemo<RincianBaris[]>(() => {
    const o: RincianBaris[] = pesananRentang.map((r) => {
      const subtotal = subtotalPesanan(r);
      const ongkir = r.method === "antar" ? (r.shipping_fee ?? 0) : 0;
      return {
        id: r.id,
        created_at: r.created_at,
        order_code: r.order_code,
        customer_name: r.customer_name,
        method: r.method,
        status: r.status,
        subtotal,
        ongkir,
        total: subtotal + ongkir,
      };
    });
    const c: RincianBaris[] = customRentang.map((r) => {
      const ongkir = r.method === "antar" ? (r.shipping_fee ?? 0) : 0;
      return {
        id: r.id,
        created_at: r.created_at,
        order_code: r.order_code,
        customer_name: r.customer_name,
        method: r.method,
        status: r.status,
        subtotal: r.total,
        ongkir,
        total: r.total + ongkir,
      };
    });
    return [...o, ...c].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [pesananRentang, customRentang]);

  // Pagination rincian (reset ke halaman 1 saat rentang berubah).
  const {
    halaman,
    setHalaman,
    baris: barisHalaman,
  } = usePagination(rincian, `${filter}|${dari}|${sampai}`);

  // Ringkasan HANYA dari status valid (diproses + selesai).
  // Pesanan custom ikut dihitung hanya bila total harga final sudah diisi.
  const validOrders = useMemo(
    () => pesananRentang.filter((r) => STATUS_PENDAPATAN.includes(r.status)),
    [pesananRentang],
  );
  const validCustoms = useMemo(
    () =>
      customRentang.filter(
        (r) => STATUS_PENDAPATAN.includes(r.status) && (r.total ?? 0) > 0,
      ),
    [customRentang],
  );

  const ringkasan = useMemo(() => {
    let pendapatan = 0;
    let produkTerjual = 0;
    const perProduk = new Map<string, number>();
    for (const o of validOrders) {
      pendapatan += subtotalPesanan(o);
      for (const it of o.order_items ?? []) {
        produkTerjual += it.qty;
        perProduk.set(it.product_name, (perProduk.get(it.product_name) ?? 0) + it.qty);
      }
    }
    for (const c of validCustoms) {
      pendapatan += c.total;
    }
    const terlaris = [...perProduk.entries()].sort((a, b) => b[1] - a[1])[0];
    return {
      pendapatan,
      jumlahPesanan: validOrders.length + validCustoms.length,
      produkTerjual,
      terlaris,
    };
  }, [validOrders, validCustoms]);

  const terlarisLabel = ringkasan.terlaris
    ? `${ringkasan.terlaris[0]}`
    : "—";
  const terlarisQty = ringkasan.terlaris ? ringkasan.terlaris[1] : 0;

  return (
    <>
      <div className="mb-5">
        <p className="font-text text-sm text-cocoa-700/70">
          {memuat ? "Memuat…" : `${rincian.length} pesanan di rentang ini`}
        </p>

        {/* Filter waktu */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {FILTER.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-full px-4 py-2 font-text text-xs font-bold transition-colors ${
                filter === f.id
                  ? "bg-primary-500 text-white shadow-pink"
                  : "bg-paper-50 text-cocoa-700/70 ring-1 ring-cocoa-700/10 hover:bg-pink-100 hover:text-primary-600"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filter === "custom" && (
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <label className="block">
              <span className="mb-1 block font-text text-xs font-bold text-cocoa-700/70">
                Dari
              </span>
              <input
                type="date"
                value={dari}
                onChange={(e) => setDari(e.target.value)}
                className="rounded-xl bg-paper-50 px-3 py-2 font-text text-sm text-cocoa-800 ring-1 ring-cocoa-700/15 focus:outline-none focus:ring-2 focus:ring-caramel"
              />
            </label>
            <label className="block">
              <span className="mb-1 block font-text text-xs font-bold text-cocoa-700/70">
                Sampai
              </span>
              <input
                type="date"
                value={sampai}
                onChange={(e) => setSampai(e.target.value)}
                className="rounded-xl bg-paper-50 px-3 py-2 font-text text-sm text-cocoa-800 ring-1 ring-cocoa-700/15 focus:outline-none focus:ring-2 focus:ring-caramel"
              />
            </label>
          </div>
        )}
      </div>

      {galat && (
        <div className="mb-4 flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3 ring-1 ring-red-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <p className="font-text text-sm text-red-700">{galat}</p>
        </div>
      )}

      {memuat ? (
        <div className="flex items-center justify-center gap-2 py-16 text-cocoa-700/60">
          <Loader2 className="h-5 w-5 animate-spin" /> Memuat…
        </div>
      ) : (
        <>
          {/* Kartu ringkasan */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KartuRingkasan
              Icon={Wallet}
              label="Pendapatan produk"
              value={formatPrice(ringkasan.pendapatan)}
              sub="produk + pesanan khusus"
            />
            <KartuRingkasan
              Icon={ShoppingBag}
              label="Total pesanan"
              value={String(ringkasan.jumlahPesanan)}
              sub="status valid"
            />
            <KartuRingkasan
              Icon={Package}
              label="Produk terjual"
              value={String(ringkasan.produkTerjual)}
              sub="unit terjual"
            />
            <KartuRingkasan
              Icon={Trophy}
              label="Produk terlaris"
              value={terlarisLabel}
              sub={`${terlarisQty} unit terjual`}
            />
          </div>

          <p className="mt-3 font-text text-xs text-cocoa-700/50">
            Ringkasan hanya menghitung pesanan berstatus Disetujui/Proses &
            Selesai. Pesanan khusus dihitung setelah total harga final diisi.
            Biaya pengiriman tidak dihitung sebagai pendapatan produk.
          </p>

          {/* Tabel rincian */}
          {rincian.length === 0 ? (
            <div className="mt-4 rounded-2xl bg-paper-50 py-16 text-center ring-1 ring-cocoa-700/10">
              <p className="font-heading text-lg text-cocoa-800">
                Tidak ada pesanan di rentang ini
              </p>
              <p className="mt-1 font-text text-sm text-cocoa-700/60">
                Ubah rentang waktu untuk melihat data.
              </p>
            </div>
          ) : (
            <div className="mt-4 hidden overflow-hidden rounded-2xl bg-paper-50 ring-1 ring-cocoa-700/10 md:block">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-cocoa-700/10 font-text text-[11px] font-bold uppercase tracking-wide text-cocoa-700/55">
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Pesanan</th>
                    <th className="px-4 py-3">Pelanggan</th>
                    <th className="px-4 py-3">Metode</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Subtotal</th>
                    <th className="px-4 py-3 text-right">Ongkir</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {barisHalaman.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-cocoa-700/5 last:border-0"
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-text text-xs text-cocoa-700/70">
                        {formatTanggal(row.created_at)}
                      </td>
                      <td className="px-4 py-3 font-heading text-sm text-cocoa-800">
                        {row.order_code}
                      </td>
                      <td className="px-4 py-3 font-text text-sm text-cocoa-800">
                        {row.customer_name}
                      </td>
                      <td className="px-4 py-3 font-text text-xs text-cocoa-700/70">
                        {row.method === "antar" ? "Diantar" : "Ambil sendiri"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 font-text text-[11px] font-bold ${STATUS[row.status]?.badge ?? "bg-cocoa-700/10 text-cocoa-700/70"}`}
                        >
                          {statusLabel(row.status)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-text text-sm font-bold text-cocoa-800">
                        {formatPrice(row.subtotal)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-text text-sm text-cocoa-700/70">
                        {row.method === "antar" ? formatPrice(row.ongkir) : "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-text text-sm font-bold text-cocoa-800">
                        {formatPrice(row.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Kartu rincian — mobile */}
          {rincian.length > 0 && (
            <div className="mt-4 flex flex-col gap-3 md:hidden">
              {barisHalaman.map((row) => (
                <article
                  key={row.id}
                  className="rounded-2xl bg-paper-50 p-4 ring-1 ring-cocoa-700/10"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-heading text-sm text-cocoa-800">
                        {row.order_code}
                      </p>
                      <p className="font-text text-[11px] text-cocoa-700/50">
                        {formatTanggal(row.created_at)} · {row.customer_name}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 font-text text-[11px] font-bold ${STATUS[row.status]?.badge ?? "bg-cocoa-700/10 text-cocoa-700/70"}`}
                    >
                      {statusLabel(row.status)}
                    </span>
                  </div>
                  <div className="mt-3 space-y-1.5 border-t border-cocoa-700/10 pt-2.5 font-text text-xs text-cocoa-700/80">
                    <div className="flex justify-between">
                      <span>Subtotal produk</span>
                      <span className="font-bold text-cocoa-800">
                        {formatPrice(row.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ongkir</span>
                      <span>
                        {row.method === "antar" ? formatPrice(row.ongkir) : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between font-text text-sm">
                      <span className="font-bold text-cocoa-800">Total</span>
                      <span className="font-heading text-cocoa-800">
                        {formatPrice(row.total)}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <Pagination
            total={rincian.length}
            halaman={halaman}
            setHalaman={setHalaman}
          />
        </>
      )}
    </>
  );
}

function KartuRingkasan({
  Icon,
  label,
  value,
  sub,
}: {
  Icon: typeof Wallet;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl bg-paper-50 p-4 ring-1 ring-cocoa-700/10">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500 text-white shadow-pink">
        <Icon className="h-[18px] w-[18px]" aria-hidden />
      </span>
      <p className="mt-2.5 font-text text-[11px] font-bold uppercase tracking-wide text-cocoa-700/55">
        {label}
      </p>
      <p className="mt-1 truncate font-heading text-base text-cocoa-800 sm:text-lg">
        {value}
      </p>
      <p className="mt-0.5 truncate font-text text-[11px] text-cocoa-700/50">
        {sub}
      </p>
    </div>
  );
}
