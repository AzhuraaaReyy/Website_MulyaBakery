import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ChevronDown,
  Loader2,
  Lock,
  MapPin,
  MessageCircle,
  Printer,
  Save,
  Truck,
  X,
} from "lucide-react";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { readableError } from "../lib/supabase";
import { formatPrice } from "../data/products";
import { ongkirKonfirmasiUrl } from "../lib/whatsapp";
import { cetakStruk } from "../lib/struk";
import {
  geocodeAlamat,
  jarakDariToko,
  estimasiMenit,
  formatEstimasiMenit,
  formatJarakKm,
  urlRuteMaps,
} from "../lib/jarak";
import { Pagination, usePagination } from "./Pagination";
import {
  URUTAN_STATUS,
  statusLabel,
  subtotalPesanan,
  formatTanggal,
  formatJam,
  STATUS,
  type OrderRow,
} from "./orderTypes";

export default function PesananPanel() {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("semua");
  const [detail, setDetail] = useState<OrderRow | null>(null);

  const muat = useCallback(async (senyap = false) => {
    if (!supabaseAdmin) return;
    if (!senyap) setMemuat(true);
    setGalat(null);
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    if (error) setGalat(readableError(error));
    else setRows((data ?? []) as OrderRow[]);
    if (!senyap) setMemuat(false);
  }, []);

  useEffect(() => {
    void muat();
  }, [muat]);

  // Auto-refresh: data pesanan baru langsung muncul tanpa reload halaman.
  useEffect(() => {
    const id = window.setInterval(() => void muat(true), 15000);
    return () => window.clearInterval(id);
  }, [muat]);

  const tampil = useMemo(() => {
    if (filterStatus === "semua") return rows;
    return rows.filter((r) => r.status === filterStatus);
  }, [rows, filterStatus]);

  const {
    halaman,
    setHalaman,
    baris: barisHalaman,
  } = usePagination(tampil, filterStatus);

  const totalBayar = (r: OrderRow) => subtotalPesanan(r) + (r.shipping_fee ?? 0);

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="font-text text-sm text-cocoa-700/70">
          {memuat ? "Memuat…" : `${tampil.length} pesanan`}
        </p>
        <label className="flex items-center gap-2">
          <span className="font-text text-xs font-bold text-cocoa-700/70">
            Status
          </span>
          <span className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none rounded-full bg-paper-50 py-2 pl-4 pr-9 font-text text-sm text-cocoa-800 ring-1 ring-cocoa-700/15 focus:outline-none focus:ring-2 focus:ring-caramel"
            >
              <option value="semua">Semua</option>
              {URUTAN_STATUS.map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cocoa-700/50" />
          </span>
        </label>
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
      ) : tampil.length === 0 ? (
        <div className="rounded-2xl bg-paper-50 py-16 text-center ring-1 ring-cocoa-700/10">
          <p className="font-heading text-lg text-cocoa-800">
            Belum ada pesanan
          </p>
          <p className="mt-1 font-text text-sm text-cocoa-700/60">
            Pesanan dari pelanggan akan muncul di sini.
          </p>
        </div>
      ) : (
        <>
          {/* Tabel — desktop */}
          <div className="hidden overflow-hidden rounded-2xl bg-paper-50 ring-1 ring-cocoa-700/10 md:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-cocoa-700/10 font-text text-[11px] font-bold uppercase tracking-wide text-cocoa-700/55">
                  <th className="px-4 py-3">Pesanan</th>
                  <th className="px-4 py-3">Pelanggan</th>
                  <th className="px-4 py-3">Metode</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {barisHalaman.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-cocoa-700/5 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <p className="font-heading text-sm text-cocoa-800">
                        {row.order_code}
                      </p>
                      <p className="font-text text-[11px] text-cocoa-700/50">
                        {formatTanggal(row.created_at)} ·{" "}
                        {formatJam(row.created_at)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-text text-sm font-bold text-cocoa-800">
                        {row.customer_name}
                      </p>
                      <p className="font-text text-[11px] text-cocoa-700/50">
                        {row.customer_phone}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-text text-sm text-cocoa-700/80">
                      {row.method === "antar" ? "Diantar" : "Ambil sendiri"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-text text-sm font-bold text-cocoa-800">
                      {formatPrice(totalBayar(row))}
                    </td>
                    <td className="px-4 py-3">
                      <BadgeStatus status={row.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setDetail(row)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary-500 px-4 py-2 font-text text-xs font-bold text-white shadow-pink transition-colors hover:bg-primary-600"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Kartu — mobile */}
          <div className="flex flex-col gap-3 md:hidden">
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
                      {formatTanggal(row.created_at)} · {formatJam(row.created_at)}
                    </p>
                  </div>
                  <BadgeStatus status={row.status} />
                </div>
                <p className="mt-2 truncate font-text text-sm font-bold text-cocoa-800">
                  {row.customer_name}
                </p>
                <p className="font-text text-[11px] text-cocoa-700/50">
                  {row.customer_phone} ·{" "}
                  {row.method === "antar" ? "Diantar" : "Ambil sendiri"}
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-cocoa-700/10 pt-2.5">
                  <span className="font-text text-xs text-cocoa-700/60">
                    Total
                  </span>
                  <span className="font-heading text-sm text-cocoa-800">
                    {formatPrice(totalBayar(row))}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setDetail(row)}
                  className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary-500 px-4 py-2 font-text text-xs font-bold text-white shadow-pink transition-colors hover:bg-primary-600"
                >
                  Detail pesanan
                </button>
              </article>
            ))}
          </div>

          <Pagination
            total={tampil.length}
            halaman={halaman}
            setHalaman={setHalaman}
          />
        </>
      )}

      {detail && (
        <FormDetailPesanan
          order={detail}
          onBatal={() => setDetail(null)}
          onSelesai={() => {
            setDetail(null);
            void muat();
          }}
        />
      )}
    </>
  );
}

function BadgeStatus({ status }: { status: string }) {
  const info = STATUS[status];
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 font-text text-[11px] font-bold ${info?.badge ?? "bg-cocoa-700/10 text-cocoa-700/70"}`}
    >
      {info?.label ?? status}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 * FORM DETAIL PESANAN (input ongkir + status + konfirmasi WA)
 * ══════════════════════════════════════════════════════════════════════════ */

function FormDetailPesanan({
  order,
  onBatal,
  onSelesai,
}: {
  order: OrderRow;
  onBatal: () => void;
  onSelesai: () => void;
}) {
  const antar = order.method === "antar";
  const subtotal = subtotalPesanan(order);

  const [status, setStatus] = useState(order.status);
  const [ongkir, setOngkir] = useState(
    order.shipping_fee > 0 ? String(order.shipping_fee) : "",
  );
  const [estimasi, setEstimasi] = useState(order.delivery_estimate ?? "");
  const [simpan, setSimpan] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  // Estimasi otomatis dari jarak toko → lokasi pelanggan (khusus Diantar).
  const [menghitung, setMenghitung] = useState(false);
  const [infoJarak, setInfoJarak] = useState<{
    km: number;
    lat: number;
    lng: number;
  } | null>(null);
  const [galatGeocode, setGalatGeocode] = useState(false);

  const ongkirNum = Number(ongkir);
  const ongkirValid = !antar || (Number.isFinite(ongkirNum) && ongkirNum >= 0);
  const total = subtotal + (antar && Number.isFinite(ongkirNum) ? ongkirNum : 0);

  // Pesanan final (selesai / dibatalkan) terkunci — tidak bisa diubah lagi.
  const terkunci = order.status === "selesai" || order.status === "batal";

  // Setelah simpan ongkir pada pesanan Diantar yang masih "baru", status
  // otomatis jadi "Menunggu Konfirmasi Ongkir" — input ongkir BUKAN persetujuan
  // pelanggan. Pesanan yang sudah menunggu_ongkir tetap mengikuti pilihan admin.
  const statusAkhir =
    antar && order.status === "baru" && ongkir.trim() !== ""
      ? "menunggu_ongkir"
      : status;

  const kirim = async () => {
    if (!supabaseAdmin || !ongkirValid || terkunci) return;
    setSimpan(true);
    setGalat(null);

    const update: Record<string, unknown> = {
      status: statusAkhir,
      delivery_estimate: estimasi.trim() || null,
    };
    if (antar) {
      update.shipping_fee = Math.round(ongkirNum || 0);
      update.total = Math.round(subtotal + (ongkirNum || 0));
    }

    const { error } = await supabaseAdmin
      .from("orders")
      .update(update)
      .eq("id", order.id);
    setSimpan(false);
    if (error) {
      setGalat(readableError(error));
      return;
    }
    onSelesai();
  };

  const konfirmasi = () => {
    if (terkunci || !Number.isFinite(ongkirNum) || ongkirNum <= 0) return;
    const url = ongkirKonfirmasiUrl({
      orderCode: order.order_code,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      subtotal,
      shippingFee: Math.round(ongkirNum),
      deliveryEstimate: estimasi.trim() || null,
      address: order.address,
      createdAt: order.created_at,
      items: (order.order_items ?? []).map((it) => ({
        name: it.product_name,
        price: it.unit_price,
        qty: it.qty,
      })),
    });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  /** Cetak struk thermal 80mm — hanya untuk pesanan berstatus "selesai". */
  const cetak = () => {
    if (order.status !== "selesai") return;
    cetakStruk({
      orderCode: order.order_code,
      tanggal: `${formatTanggal(order.created_at)} · ${formatJam(order.created_at)}`,
      metode: antar ? "Diantar" : "Ambil di toko",
      status: statusLabel(order.status),
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      alamatKirim: order.address ?? undefined,
      catatan: order.note ?? undefined,
      estimasi: estimasi.trim() || order.delivery_estimate || undefined,
      labelSubtotal: "Subtotal Produk",
      baris: (order.order_items ?? []).map((it) => ({
        judul: it.product_name,
        detail: `${it.qty} x ${formatPrice(it.unit_price)}`,
        nilai: formatPrice(it.unit_price * it.qty),
      })),
      subtotal,
      ongkir:
        antar && Number.isFinite(ongkirNum) && ongkirNum > 0 ? ongkirNum : undefined,
      total,
    });
  };

  /** Hitung estimasi otomatis dari jarak toko → alamat pelanggan. */
  const hitungEstimasi = async () => {
    if (menghitung) return;
    const alamat = order.address;
    if (!alamat) {
      setGalatGeocode(true);
      return;
    }
    setMenghitung(true);
    setGalatGeocode(false);
    const titik = await geocodeAlamat(alamat);
    setMenghitung(false);
    if (!titik) {
      setGalatGeocode(true);
      return;
    }
    const km = jarakDariToko(titik.lat, titik.lng);
    setInfoJarak({ km, lat: titik.lat, lng: titik.lng });
    setEstimasi(formatEstimasiMenit(estimasiMenit(km)));
  };

  // Estimasi dihitung OTOMATIS begitu detail dibuka — tanpa tombol.
  // Dilewati bila sudah ada estimasi tersimpan / pesanan final / bukan Diantar.
  useEffect(() => {
    if (antar && order.address && estimasi.trim() === "" && !terkunci) {
      void hitungEstimasi();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-cocoa-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Itim&display=swap');
        .font-itim, .font-itim * {
          font-family: 'Itim', cursive, sans-serif !important;
        }
      `}</style>
      <div className="flex max-h-[94dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl bg-paper-100 shadow-cocoa-lg sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-cocoa-700/10 px-5 py-4">
          <div className="min-w-0">
            <h2 className="font-heading text-xl text-cocoa-800">
              Detail Pesanan
            </h2>
            <p className="font-text text-xs text-cocoa-700/50">
              {order.order_code} · {formatTanggal(order.created_at)} ·{" "}
              {formatJam(order.created_at)}
            </p>
          </div>
          <button
            type="button"
            onClick={onBatal}
            className="rounded-full p-2 text-cocoa-700/70 transition-colors hover:bg-paper-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="font-itim flex-1 space-y-4 overflow-y-auto p-5">
          {terkunci && (
            <div className="flex items-start gap-2 rounded-2xl bg-amber-50 px-4 py-3 ring-1 ring-amber-200">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
              <p className="font-itim text-sm text-amber-800">
                Pesanan berstatus “{statusLabel(order.status)}” — data tidak
                dapat diubah.
              </p>
            </div>
          )}

          {/* Data pemesan */}
          <div className="rounded-2xl bg-paper-50 p-4 ring-1 ring-cocoa-700/10">
            <p className="font-itim text-xs font-bold uppercase tracking-wide text-cocoa-700/60">
              Data pemesan
            </p>
            <dl className="mt-2 space-y-1.5 font-itim text-sm text-cocoa-800">
              <Row label="Nama" value={order.customer_name} />
              <Row label="No. HP" value={order.customer_phone} />
              <Row
                label="Pengambilan"
                value={antar ? "Diantar ke alamat" : "Ambil di toko"}
              />
              {antar && order.address && (
                <Row label="Alamat" value={order.address} multiline />
              )}
              {order.note && <Row label="Catatan" value={order.note} multiline />}
            </dl>
          </div>

          {/* Rincian produk */}
          <div className="rounded-2xl bg-paper-50 p-4 ring-1 ring-cocoa-700/10">
            <p className="font-itim text-xs font-bold uppercase tracking-wide text-cocoa-700/60">
              Rincian pesanan
            </p>
            <ul className="mt-2 space-y-2">
              {(order.order_items ?? []).map((it) => (
                <li
                  key={it.id}
                  className="flex items-start justify-between gap-3 font-itim text-sm text-cocoa-800"
                >
                  <div className="min-w-0">
                    <p className="font-bold">{it.product_name}</p>
                    <p className="text-xs text-cocoa-700/60">
                      {it.qty} x {formatPrice(it.unit_price)}
                    </p>
                  </div>
                  <p className="whitespace-nowrap font-bold">
                    {formatPrice(it.unit_price * it.qty)}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center justify-between border-t border-dashed border-cocoa-700/20 pt-2.5 font-itim text-sm text-cocoa-800">
              <span>Subtotal produk</span>
              <span className="font-bold">{formatPrice(subtotal)}</span>
            </div>
          </div>

          {/* Ongkir — hanya Diantar */}
          {antar && (
            <div className="rounded-2xl bg-paper-50 p-4 ring-1 ring-cocoa-700/10">
              <p className="font-itim text-xs font-bold uppercase tracking-wide text-cocoa-700/60">
                Biaya pengiriman (kurir toko / GoSend)
              </p>
              <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Kolom label="Biaya Pengiriman (Rp)" wajib>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={ongkir}
                    onChange={(e) => setOngkir(e.target.value)}
                    className={inputCls}
                    placeholder="14000"
                    disabled={terkunci}
                  />
                </Kolom>
                <Kolom label="Estimasi Pengantaran" bantuan="opsional">
                  <input
                    type="text"
                    value={estimasi}
                    onChange={(e) => setEstimasi(e.target.value)}
                    className={inputCls}
                    placeholder="mis. ±30 menit"
                    maxLength={60}
                    disabled={terkunci}
                  />
                </Kolom>
              </div>

              {/* Estimasi otomatis dari jarak toko → lokasi pelanggan */}
              <div className="mt-3 rounded-xl bg-paper-100/80 p-3 ring-1 ring-cocoa-700/10">
                {infoJarak && (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-xs text-cocoa-700/70">
                      Jarak ±{formatJarakKm(infoJarak.km)} dari toko
                    </span>
                    <a
                      href={urlRuteMaps(infoJarak.lat, infoJarak.lng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:underline"
                    >
                      <MapPin className="h-3.5 w-3.5" aria-hidden />
                      Lihat rute di Google Maps
                    </a>
                  </div>
                )}
                {menghitung && (
                  <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-cocoa-700/60">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                    Menghitung estimasi pengantaran…
                  </p>
                )}
                {galatGeocode && (
                  <p className="mt-2 text-[11px] leading-snug text-amber-700">
                    Alamat tidak dapat dipetakan — silakan isi estimasi secara
                    manual.
                  </p>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-dashed border-cocoa-700/20 pt-2.5 font-itim text-sm text-cocoa-800">
                <span>Biaya pengiriman</span>
                <span className="font-bold">
                  {Number.isFinite(ongkirNum) && ongkirNum > 0
                    ? formatPrice(ongkirNum)
                    : "—"}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between font-itim text-sm text-cocoa-800">
                <span className="font-bold">Total pembayaran</span>
                <span className="font-heading text-lg text-primary-600">
                  {formatPrice(total)}
                </span>
              </div>
              {order.status === "baru" && (
                <p className="mt-2 font-itim text-[11px] text-amber-700">
                  Simpan ongkir akan mengubah status menjadi “Menunggu
                  Konfirmasi Ongkir” — pesanan belum dianggap diproses sampai
                  pelanggan menyetujui.
                </p>
              )}
            </div>
          )}

          {/* Status */}
          <Kolom label="Status pesanan" wajib>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={inputCls}
              disabled={terkunci}
            >
              {URUTAN_STATUS.map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </select>
          </Kolom>

          {galat && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 px-3.5 py-2.5 ring-1 ring-red-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <p className="font-text text-sm text-red-700">{galat}</p>
            </div>
          )}
        </div>

        <div className="font-itim border-t border-cocoa-700/10 bg-paper-50 px-5 py-4">
          {terkunci ? (
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={onBatal}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-paper-200 px-5 py-3 font-itim text-sm font-bold text-cocoa-800 transition-colors hover:bg-paper-300 sm:flex-1"
              >
                <X className="h-4 w-4" />
                Tutup
              </button>
              {order.status === "selesai" && (
                <button
                  type="button"
                  onClick={cetak}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-cocoa-800 px-5 py-3 font-itim text-sm font-bold text-paper-50 shadow-cocoa transition-all hover:-translate-y-0.5 hover:bg-cocoa-900 sm:flex-1"
                >
                  <Printer className="h-4 w-4" />
                  Cetak Struk
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2.5 sm:flex-row">
                {order.status === "selesai" && (
                  <button
                    type="button"
                    onClick={cetak}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-cocoa-800 px-5 py-3 font-itim text-sm font-bold text-paper-50 shadow-cocoa transition-all hover:-translate-y-0.5 hover:bg-cocoa-900 sm:flex-1"
                  >
                    <Printer className="h-4 w-4" />
                    Cetak Struk
                  </button>
                )}
                {antar && (
                  <button
                    type="button"
                    onClick={konfirmasi}
                    disabled={
                      terkunci ||
                      !Number.isFinite(ongkirNum) ||
                      ongkirNum <= 0
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-cocoa-800 px-5 py-3 font-itim text-sm font-bold text-paper-50 shadow-cocoa transition-all hover:-translate-y-0.5 hover:bg-cocoa-900 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:flex-1"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Konfirmasi ke Pelanggan
                  </button>
                )}
                <button
                  type="button"
                  onClick={kirim}
                  disabled={terkunci || !ongkirValid || simpan}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-500 px-5 py-3 font-itim text-sm font-bold text-white shadow-pink transition-all hover:-translate-y-0.5 hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:flex-1"
                >
                  {simpan ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Simpan
                </button>
              </div>
              {antar && (
                <p className="mt-2 flex items-center justify-center gap-1 text-center font-itim text-[11px] text-cocoa-700/60">
                  <Truck className="h-3.5 w-3.5" aria-hidden />
                  Ongkir diisi manual oleh admin dari tarif kurir aktual; sistem
                  menghitung total.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className={multiline ? "flex gap-3" : "flex items-baseline gap-3"}>
      <dt className="w-24 shrink-0 text-cocoa-700/60">{label}</dt>
      <dd className="min-w-0 flex-1 break-words font-bold">{value}</dd>
    </div>
  );
}

function Kolom({
  label,
  wajib,
  bantuan,
  children,
}: {
  label: string;
  wajib?: boolean;
  bantuan?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="font-itim text-xs font-bold text-cocoa-700/80">
          {label}
          {wajib && <span className="text-red-500"> *</span>}
        </span>
        {bantuan && (
          <span className="font-itim text-[11px] text-cocoa-700/50">
            {bantuan}
          </span>
        )}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-xl bg-paper-50 px-4 py-2.5 font-itim text-sm text-cocoa-800 ring-1 ring-cocoa-700/15 transition-shadow placeholder:text-cocoa-700/40 focus:outline-none focus:ring-2 focus:ring-caramel";
