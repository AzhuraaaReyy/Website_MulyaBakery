import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { readableError } from "../lib/supabase";
import { DAFTAR_IKON, ikonKategori } from "../lib/kategoriIkon";
import { Pagination, usePagination } from "./Pagination";

interface Kat {
  name: string;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
}

/** Tab "Kategori": kelola daftar kategori menu (dipakai chip filter di situs). */
export default function KategoriPanel() {
  const [rows, setRows] = useState<Kat[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState<string | null>(null);
  const [editing, setEditing] = useState<Kat | "baru" | null>(null);

  const muat = useCallback(async () => {
    if (!supabaseAdmin) return;
    setMemuat(true);
    setGalat(null);
    const { data, error } = await supabaseAdmin
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (error) setGalat(readableError(error));
    else setRows((data ?? []) as Kat[]);
    setMemuat(false);
  }, []);

  useEffect(() => {
    void muat();
  }, [muat]);

  const sortBerikut = useMemo(
    () => (rows.length ? Math.max(...rows.map((r) => r.sort_order)) + 1 : 0),
    [rows],
  );

  const {
    halaman,
    setHalaman,
    baris: barisHalaman,
  } = usePagination(rows, 0);

  const toggleAktif = async (row: Kat) => {
    if (!supabaseAdmin) return;
    const { error } = await supabaseAdmin
      .from("categories")
      .update({ is_active: !row.is_active })
      .eq("name", row.name);
    if (error) setGalat(readableError(error));
    else void muat();
  };

  const hapus = async (row: Kat) => {
    if (!supabaseAdmin) return;
    // Blokir hapus bila masih ada produk memakai kategori ini — cegah produk
    // "nyasar" tanpa kategori yang cocok di filter situs.
    const { count } = await supabaseAdmin
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("category", row.name);
    if ((count ?? 0) > 0) {
      window.alert(
        `Masih ada ${count} produk di kategori "${row.name}". ` +
          "Pindahkan produk-produk itu ke kategori lain dulu, baru bisa dihapus.",
      );
      return;
    }
    if (!window.confirm(`Hapus kategori "${row.name}"?`)) return;
    const { error } = await supabaseAdmin
      .from("categories")
      .delete()
      .eq("name", row.name);
    if (error) setGalat(readableError(error));
    else void muat();
  };

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="font-text text-sm text-cocoa-700/70">
          {memuat ? "Memuat…" : `${rows.length} kategori`}
        </p>
        <button
          type="button"
          onClick={() => setEditing("baru")}
          className="inline-flex items-center gap-2 rounded-full bg-primary-500 px-5 py-2.5 font-text text-sm font-bold text-white shadow-pink transition-all hover:-translate-y-0.5 hover:bg-primary-600"
        >
          <Plus className="h-4 w-4" /> Tambah Kategori
        </button>
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
      ) : rows.length === 0 ? (
        <div className="rounded-2xl bg-paper-50 py-16 text-center ring-1 ring-cocoa-700/10">
          <p className="font-heading text-lg text-cocoa-800">
            Belum ada kategori
          </p>
          <p className="mt-1 font-text text-sm text-cocoa-700/60">
            Tekan “Tambah Kategori” untuk mulai.
          </p>
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-2.5">
            {barisHalaman.map((row) => {
              const Icon = ikonKategori(row.icon);
            return (
              <li
                key={row.name}
                className={`flex items-center gap-3 rounded-2xl bg-paper-50 p-3 ring-1 ring-cocoa-700/10 ${
                  row.is_active ? "" : "opacity-60"
                }`}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-paper-200 text-cocoa-700">
                  <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-heading text-base text-cocoa-800">
                    {row.name}
                  </p>
                  <p className="font-text text-xs text-cocoa-700/55">
                    Urutan {row.sort_order}
                    {!row.is_active && " · nonaktif"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggleAktif(row)}
                    title={row.is_active ? "Nonaktifkan" : "Aktifkan"}
                    className="rounded-full p-2 text-cocoa-700/60 transition-colors hover:bg-paper-200 hover:text-cocoa-900"
                  >
                    {row.is_active ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(row)}
                    title="Edit"
                    className="rounded-full p-2 text-cocoa-700/60 transition-colors hover:bg-paper-200 hover:text-cocoa-900"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => hapus(row)}
                    title="Hapus"
                    className="rounded-full p-2 text-cocoa-700/50 transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
          </ul>

          <Pagination
            total={rows.length}
            halaman={halaman}
            setHalaman={setHalaman}
          />
        </>
      )}

      {editing && (
        <FormKategori
          awal={editing === "baru" ? null : editing}
          sortBerikut={sortBerikut}
          onBatal={() => setEditing(null)}
          onSelesai={() => {
            setEditing(null);
            void muat();
          }}
        />
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 * FORM TAMBAH / EDIT KATEGORI
 * ══════════════════════════════════════════════════════════════════════════ */

function FormKategori({
  awal,
  sortBerikut,
  onBatal,
  onSelesai,
}: {
  awal: Kat | null;
  sortBerikut: number;
  onBatal: () => void;
  onSelesai: () => void;
}) {
  const baru = awal === null;
  const [name, setName] = useState(awal?.name ?? "");
  const [icon, setIcon] = useState<string>(awal?.icon ?? DAFTAR_IKON[0]);
  const [sortOrder, setSortOrder] = useState(
    String(awal?.sort_order ?? sortBerikut),
  );
  const [isActive, setIsActive] = useState(awal?.is_active ?? true);
  const [galat, setGalat] = useState<string | null>(null);
  const [simpan, setSimpan] = useState(false);

  const valid = name.trim().length > 0;

  const kirim = async () => {
    if (!supabaseAdmin || !valid) return;
    setSimpan(true);
    setGalat(null);

    const isi = {
      name: name.trim(),
      icon,
      sort_order: Math.round(Number(sortOrder)) || 0,
      is_active: isActive,
    };

    let error;
    if (baru) {
      ({ error } = await supabaseAdmin.from("categories").insert(isi));
    } else {
      const namaLama = awal!.name;
      // Bila nama berubah, ikutkan semua produk yang memakai kategori lama —
      // agar tidak ada produk yang "putus" dari kategorinya.
      if (isi.name !== namaLama) {
        const { error: eProduk } = await supabaseAdmin
          .from("products")
          .update({ category: isi.name })
          .eq("category", namaLama);
        if (eProduk) {
          setSimpan(false);
          setGalat(readableError(eProduk));
          return;
        }
      }
      ({ error } = await supabaseAdmin
        .from("categories")
        .update(isi)
        .eq("name", namaLama));
    }

    setSimpan(false);
    if (error) {
      setGalat(
        error.message.includes("duplicate")
          ? `Kategori "${isi.name}" sudah ada.`
          : readableError(error),
      );
      return;
    }
    onSelesai();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-cocoa-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="flex max-h-[94dvh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-paper-100 shadow-cocoa-lg sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-cocoa-700/10 px-5 py-4">
          <h2 className="font-heading text-xl text-cocoa-800">
            {baru ? "Tambah Kategori" : "Edit Kategori"}
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
          <label className="block">
            <span className="mb-1.5 block font-text text-xs font-bold text-cocoa-700/80">
              Nama kategori <span className="text-red-500">*</span>
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
              placeholder="mis. Donat, Minuman, Roti Manis"
            />
            {!baru && (
              <span className="mt-1 block font-text text-[11px] text-cocoa-700/50">
                Mengganti nama otomatis memperbarui semua produk di kategori
                ini.
              </span>
            )}
          </label>

          {/* Pemilih ikon */}
          <div>
            <span className="mb-1.5 block font-text text-xs font-bold text-cocoa-700/80">
              Ikon
            </span>
            <div className="grid grid-cols-6 gap-2">
              {DAFTAR_IKON.map((nama) => {
                const Ikon = ikonKategori(nama);
                const dipilih = icon === nama;
                return (
                  <button
                    key={nama}
                    type="button"
                    onClick={() => setIcon(nama)}
                    aria-pressed={dipilih}
                    title={nama}
                    className={`flex aspect-square items-center justify-center rounded-xl ring-1 transition-colors ${
                      dipilih
                        ? "bg-primary-500 text-white ring-primary-500 shadow-pink"
                        : "bg-paper-50 text-cocoa-700 ring-pink-200 hover:bg-pink-100"
                    }`}
                  >
                    <Ikon className="h-5 w-5" strokeWidth={1.8} aria-hidden />
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block">
            <span className="mb-1.5 block font-text text-xs font-bold text-cocoa-700/80">
              Urutan tampil
            </span>
            <input
              type="number"
              inputMode="numeric"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className={inputCls}
            />
          </label>

          <button
            type="button"
            onClick={() => setIsActive((v) => !v)}
            aria-pressed={isActive}
            className={`rounded-full px-4 py-2 font-text text-sm font-bold transition-colors ${
              isActive
                ? "bg-primary-500 text-white shadow-pink"
                : "bg-pink-100 text-cocoa-700/70 hover:bg-pink-200 hover:text-primary-600"
            }`}
          >
            {isActive ? "Aktif (tampil di situs)" : "Nonaktif (disembunyikan)"}
          </button>

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
            disabled={!valid || simpan}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary-500 px-6 py-3.5 font-text text-base font-bold text-white shadow-pink transition-all hover:-translate-y-0.5 hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {simpan ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            {baru ? "Simpan Kategori" : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl bg-paper-50 px-4 py-2.5 font-text text-sm text-cocoa-800 ring-1 ring-cocoa-700/15 transition-shadow placeholder:text-cocoa-700/40 focus:outline-none focus:ring-2 focus:ring-caramel";
