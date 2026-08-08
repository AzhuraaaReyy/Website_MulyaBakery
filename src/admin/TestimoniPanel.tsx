import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Eye,
  EyeOff,
  Star,
  AlertCircle,
  BadgeCheck,
  ImageIcon,
  Check,
  Filter,
} from "lucide-react";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { readableError } from "../lib/supabase";
import { pathStorageDariUrl } from "../lib/storage";
import { uploadImage } from "../lib/uploadImage";
import { sinyalTestimoniBerubah } from "../lib/crosstab";

interface Testimoni {
  id: string;
  reviewer_name: string;
  reviewer_role: string | null;
  rating: number;
  quote: string;
  photo_url: string | null;
  verified_purchase: boolean;
  is_hidden: boolean;
  created_at: string;
}

type FilterStatus = "semua" | "tampil" | "tersembunyi" | "menunggu";

const FILTERS: { id: FilterStatus; label: string }[] = [
  { id: "semua", label: "Semua" },
  { id: "tampil", label: "Tampil" },
  { id: "tersembunyi", label: "Tersembunyi" },
  { id: "menunggu", label: "Perlu Persetujuan" },
];

function Bintang({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`Rating ${n} dari 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < n ? "fill-caramel text-caramel" : "text-cocoa-500/25"
          }`}
          aria-hidden
        />
      ))}
    </div>
  );
}

export default function TestimoniPanel() {
  const [rows, setRows] = useState<Testimoni[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>("semua");
  const [editing, setEditing] = useState<Testimoni | "baru" | null>(null);
  const [sibuk, setSibuk] = useState<string | null>(null);

  const muat = useCallback(async () => {
    if (!supabaseAdmin) return;
    setMemuat(true);
    setGalat(null);
    const { data, error } = await supabaseAdmin
      .from("service_reviews")
      .select(
        "id, reviewer_name, reviewer_role, rating, quote, photo_url, verified_purchase, is_hidden, created_at",
      )
      .order("created_at", { ascending: false });
    if (error) setGalat(readableError(error));
    else setRows((data ?? []) as Testimoni[]);
    setMemuat(false);
  }, []);

  useEffect(() => {
    void muat();
  }, [muat]);

  const barisFilter = useMemo(() => {
    switch (filter) {
      case "tampil":
        return rows.filter((r) => !r.is_hidden);
      case "tersembunyi":
        return rows.filter((r) => r.is_hidden);
      case "menunggu":
        return rows.filter((r) => r.is_hidden && r.photo_url);
      default:
        return rows;
    }
  }, [rows, filter]);

  const toggleTampil = async (row: Testimoni) => {
    if (!supabaseAdmin) return;
    setSibuk(row.id);
    const { error } = await supabaseAdmin
      .from("service_reviews")
      .update({ is_hidden: !row.is_hidden })
      .eq("id", row.id);
    setSibuk(null);
    if (error) {
      setGalat(readableError(error));
      return;
    }
    void muat();
    sinyalTestimoniBerubah();
  };

  const hapus = async (row: Testimoni) => {
    if (!supabaseAdmin) return;
    if (
      !window.confirm(
        `Hapus testimoni dari "${row.reviewer_name}"? Foto & ulasannya dihapus permanen.`,
      )
    )
      return;
    setSibuk(row.id);

    if (row.photo_url) {
      const path = pathStorageDariUrl(row.photo_url, "uploads");
      if (path) {
        await supabaseAdmin.storage.from("uploads").remove([path]);
      }
    }

    const { error } = await supabaseAdmin
      .from("service_reviews")
      .delete()
      .eq("id", row.id);
    setSibuk(null);
    if (error) {
      setGalat(readableError(error));
      return;
    }
    void muat();
    sinyalTestimoniBerubah();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-1 sm:px-0">
      {/* Top Header Controls */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-text text-sm text-cocoa-700/70 order-2 sm:order-1">
          {memuat ? "Memuat…" : `${barisFilter.length} testimoni`}
        </p>
        <button
          type="button"
          onClick={() => setEditing("baru")}
          className="order-1 sm:order-2 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-primary-500 px-5 py-2.5 font-text text-sm font-bold text-white shadow-pink transition-all hover:-translate-y-0.5 hover:bg-primary-600"
        >
          <Plus className="h-4 w-4" /> Tambah Testimoni
        </button>
      </div>

      {/* Filter status - Horizontal Scroll di Mobile, Wrap di Desktop */}
      <div className="mb-5 flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 sm:flex-wrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <span className="inline-flex shrink-0 items-center gap-1.5 font-text text-xs font-bold text-cocoa-700/60 mr-1">
          <Filter className="h-3.5 w-3.5" aria-hidden /> Filter:
        </span>
        {FILTERS.map((f) => {
          const aktif = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              aria-pressed={aktif}
              className={`shrink-0 rounded-full px-3.5 py-1.5 font-text text-xs font-bold transition-colors whitespace-nowrap ${
                aktif
                  ? "bg-primary-500 text-white shadow-pink"
                  : "bg-pink-50 text-cocoa-700/70 ring-1 ring-pink-200 hover:bg-pink-100 hover:text-primary-600"
              }`}
            >
              {f.label}
            </button>
          );
        })}
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
      ) : barisFilter.length === 0 ? (
        <div className="rounded-2xl bg-paper-50 py-16 text-center ring-1 ring-cocoa-700/10">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
            <Check className="h-7 w-7" />
          </span>
          <p className="mt-3 font-heading text-lg text-cocoa-800">
            Tidak ada testimoni
          </p>
          <p className="mt-1 font-text text-sm text-cocoa-700/60">
            Tekan “Tambah Testimoni” untuk mulai, atau ubah filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
          {barisFilter.map((row) => (
            <article
              key={row.id}
              className={`flex flex-col h-full overflow-hidden rounded-2xl bg-paper-50 ring-1 ring-cocoa-700/10 ${
                row.is_hidden ? "opacity-80" : ""
              }`}
            >
              {/* Foto - Diberi max-height terbatas di mobile agar proporsional */}
              <div className="relative block h-48 sm:h-52 w-full bg-paper-200 shrink-0 overflow-hidden">
                {row.photo_url ? (
                  <img
                    src={row.photo_url}
                    alt={`Foto dari ${row.reviewer_name}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-cocoa-700/30">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
                {row.is_hidden && (
                  <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-amber-500/95 px-2.5 py-0.5 font-text text-[10px] font-bold text-white shadow-sm backdrop-blur-xs">
                    <EyeOff className="h-3 w-3" aria-hidden /> Tersembunyi
                  </span>
                )}
              </div>

              {/* Isi Card */}
              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <Bintang n={row.rating} />

                {/* Quote dengan batasan baris konsisten */}
                <p className="mt-2.5 line-clamp-4 font-text text-sm leading-relaxed text-cocoa-800 flex-1">
                  “{row.quote}”
                </p>

                {/* Profil & Waktu */}
                <div className="mt-4 pt-2 border-t border-cocoa-700/5">
                  <p className="flex flex-wrap items-center gap-1.5 font-text text-sm font-bold text-cocoa-800">
                    <span>{row.reviewer_name}</span>
                    {row.verified_purchase && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-green-100 px-2 py-0.5 font-text text-[10px] font-bold text-green-700">
                        <BadgeCheck className="h-3 w-3" aria-hidden />
                        Terverifikasi
                      </span>
                    )}
                  </p>
                  {row.reviewer_role && (
                    <p className="font-text text-xs text-cocoa-700/60 truncate">
                      {row.reviewer_role}
                    </p>
                  )}
                  <p className="mt-0.5 font-text text-[11px] text-cocoa-700/45">
                    {new Date(row.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {/* Aksi - Selalu di bagian bawah rata (mt-auto) */}
                <div className="mt-4 flex items-center gap-1.5 sm:gap-2 pt-1 border-t border-cocoa-700/5">
                  <button
                    type="button"
                    onClick={() => toggleTampil(row)}
                    disabled={sibuk === row.id}
                    title={row.is_hidden ? "Tampilkan" : "Sembunyikan"}
                    className="inline-flex flex-1 items-center justify-center gap-1 sm:gap-1.5 rounded-full bg-paper-200 px-2.5 sm:px-3 py-2 font-text text-xs font-bold text-cocoa-800 transition-colors hover:bg-cocoa-800 hover:text-paper-50 disabled:opacity-50 min-w-0"
                  >
                    {sibuk === row.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                    ) : row.is_hidden ? (
                      <Eye className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5 shrink-0" />
                    )}
                    <span className="truncate">
                      {row.is_hidden ? "Tampilkan" : "Sembunyikan"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(row)}
                    title="Edit"
                    className="inline-flex items-center justify-center gap-1 rounded-full bg-paper-200 px-3 py-2 font-text text-xs font-bold text-cocoa-800 transition-colors hover:bg-cocoa-800 hover:text-paper-50 shrink-0"
                  >
                    <Pencil className="h-3.5 w-3.5 shrink-0" />
                    <span className="hidden xs:inline">Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => hapus(row)}
                    disabled={sibuk === row.id}
                    title="Hapus"
                    className="inline-flex items-center justify-center gap-1 rounded-full bg-paper-200 px-3 py-2 font-text text-xs font-bold text-cocoa-800 transition-colors hover:bg-red-500 hover:text-white disabled:opacity-50 shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5 shrink-0" />
                    <span className="hidden xs:inline">Hapus</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {editing && (
        <FormTestimoni
          awal={editing === "baru" ? null : editing}
          onBatal={() => setEditing(null)}
          onSelesai={() => {
            setEditing(null);
            void muat();
          }}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 * FORM TAMBAH / EDIT TESTIMONI
 * ══════════════════════════════════════════════════════════════════════════ */

function FormTestimoni({
  awal,
  onBatal,
  onSelesai,
}: {
  awal: Testimoni | null;
  onBatal: () => void;
  onSelesai: () => void;
}) {
  const baru = awal === null;
  const [nama, setNama] = useState(awal?.reviewer_name ?? "");
  const [role, setRole] = useState(awal?.reviewer_role ?? "");
  const [rating, setRating] = useState<number>(awal?.rating ?? 5);
  const [quote, setQuote] = useState(awal?.quote ?? "");
  const [foto, setFoto] = useState(awal?.photo_url ?? "");
  const [verified, setVerified] = useState(awal?.verified_purchase ?? false);
  const [isHidden, setIsHidden] = useState(awal?.is_hidden ?? false);
  const [galat, setGalat] = useState<string | null>(null);
  const [simpan, setSimpan] = useState(false);
  const [unggahFoto, setUnggahFoto] = useState(false);
  const prevFoto = useRef(awal?.photo_url ?? "");

  const valid =
    nama.trim().length >= 2 &&
    rating >= 1 &&
    rating <= 5 &&
    quote.trim().length >= 5;

  const pilihFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setGalat(null);
    setUnggahFoto(true);
    try {
      const url = await uploadImage(file, "ulasan");
      const pathLama = pathStorageDariUrl(foto, "uploads");
      if (pathLama) {
        await supabaseAdmin?.storage.from("uploads").remove([pathLama]);
      }
      setFoto(url);
    } catch (err) {
      setGalat(err instanceof Error ? err.message : "Gagal unggah foto.");
    } finally {
      setUnggahFoto(false);
    }
  };

  const kirim = async () => {
    if (!supabaseAdmin || !valid) return;
    setSimpan(true);
    setGalat(null);

    const isi = {
      reviewer_name: nama.trim(),
      reviewer_role: role.trim() || null,
      rating,
      quote: quote.trim(),
      photo_url: foto.trim() || null,
      verified_purchase: verified,
      is_hidden: isHidden,
    };

    let error;
    if (baru) {
      ({ error } = await supabaseAdmin
        .from("service_reviews")
        .insert({ ...isi, device_id: null, order_id: null }));
    } else {
      ({ error } = await supabaseAdmin
        .from("service_reviews")
        .update(isi)
        .eq("id", awal!.id));
    }

    setSimpan(false);
    if (error) {
      setGalat(readableError(error));
      return;
    }

    if (!baru && !foto.trim() && prevFoto.current) {
      const pathLama = pathStorageDariUrl(prevFoto.current, "uploads");
      if (pathLama) {
        await supabaseAdmin.storage.from("uploads").remove([pathLama]);
      }
    }

    sinyalTestimoniBerubah();
    onSelesai();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-cocoa-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl bg-paper-100 shadow-cocoa-lg sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-cocoa-700/10 px-5 py-4">
          <h2 className="font-heading text-xl text-cocoa-800">
            {baru ? "Tambah Testimoni" : "Edit Testimoni"}
          </h2>
          <button
            type="button"
            onClick={onBatal}
            className="rounded-full p-2 text-cocoa-700/70 transition-colors hover:bg-paper-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Kolom label="Nama penulis" wajib>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className={inputCls}
                placeholder="mis. Siti Rahma"
              />
            </Kolom>
            <Kolom label="Menu / role (opsional)">
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={inputCls}
                placeholder="mis. Roti Coklat Keju"
              />
            </Kolom>
          </div>

          <Kolom label="Rating" wajib>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  aria-label={`${n} bintang`}
                  className="rounded-md p-0.5"
                >
                  <Star
                    className={`h-7 w-7 transition-colors ${
                      n <= rating
                        ? "fill-caramel text-caramel"
                        : "text-cocoa-500/25"
                    }`}
                  />
                </button>
              ))}
            </div>
          </Kolom>

          <Kolom label="Isi ulasan" wajib>
            <textarea
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              rows={3}
              maxLength={500}
              className={inputCls}
              placeholder="Tulis testimoni pelanggan…"
            />
          </Kolom>

          <Kolom label="Foto (opsional)" bantuan="otomatis dikompres">
            <div className="flex items-center gap-3">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-paper-200 ring-1 ring-cocoa-700/10">
                {foto ? (
                  <img
                    src={foto}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-cocoa-700/30">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-primary-500 px-4 py-2 font-text text-sm font-bold text-white transition-colors hover:bg-primary-600 ${
                    unggahFoto ? "pointer-events-none opacity-60" : ""
                  }`}
                >
                  {unggahFoto ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ImageIcon className="h-4 w-4" />
                  )}
                  {unggahFoto
                    ? "Mengunggah…"
                    : foto
                      ? "Ganti foto"
                      : "Upload foto"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    disabled={unggahFoto}
                    onChange={pilihFoto}
                  />
                </label>
                {foto && (
                  <button
                    type="button"
                    onClick={() => setFoto("")}
                    className="text-left font-text text-xs font-semibold text-red-500 hover:underline"
                  >
                    Hapus foto
                  </button>
                )}
              </div>
            </div>
          </Kolom>

          <div className="flex flex-wrap gap-2">
            <TombolToggle
              aktif={verified}
              onClick={() => setVerified((v) => !v)}
              label={verified ? "Pembeli terverifikasi" : "Belum terverifikasi"}
            />
            <TombolToggle
              aktif={!isHidden}
              onClick={() => setIsHidden((v) => !v)}
              label={isHidden ? "Tersembunyi" : "Tampil di situs"}
            />
          </div>

          {galat && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 px-3.5 py-2.5 ring-1 ring-red-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <p className="font-text text-sm text-red-700">{galat}</p>
            </div>
          )}
        </div>

        <div className="border-t border-cocoa-700/10 bg-paper-50 px-5 py-4">
          <button
            type="button"
            onClick={kirim}
            disabled={!valid || simpan || unggahFoto}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary-500 px-6 py-3.5 font-text text-base font-bold text-white shadow-pink transition-all hover:-translate-y-0.5 hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {simpan ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            {baru ? "Simpan Testimoni" : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl bg-paper-50 px-4 py-2.5 font-text text-sm text-cocoa-800 ring-1 ring-cocoa-700/15 transition-shadow placeholder:text-cocoa-700/40 focus:outline-none focus:ring-2 focus:ring-caramel";

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
        <span className="font-text text-xs font-bold text-cocoa-700/80">
          {label}
          {wajib && <span className="text-red-500"> *</span>}
        </span>
        {bantuan && (
          <span className="font-text text-[11px] text-cocoa-700/50">
            {bantuan}
          </span>
        )}
      </span>
      {children}
    </label>
  );
}

function TombolToggle({
  aktif,
  onClick,
  label,
}: {
  aktif: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={aktif}
      className={`rounded-full px-4 py-2 font-text text-xs sm:text-sm font-bold transition-colors ${
        aktif
          ? "bg-primary-500 text-white shadow-pink"
          : "bg-pink-100 text-cocoa-700/70 hover:bg-pink-200 hover:text-primary-600"
      }`}
    >
      {label}
    </button>
  );
}
