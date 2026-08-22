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
  Star,
  AlertCircle,
  ImageIcon,
  Film,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { readableError } from "../lib/supabase";
import { unggahFotoMenu, unggahVideoMenu } from "../lib/uploadMenu";
import { parseVideo } from "../lib/video";
import { formatPrice } from "../data/products";

/** Cadangan kategori bila tabel categories belum terisi/termuat. */
const KATEGORI_CADANGAN = [
  "Roti Manis",
  "Roti Tawar",
  "Kue Kering/Pastry",
  "Pesanan Custom",
];

/** Jumlah baris per halaman pada tabel produk. */
const PER_HALAMAN = 10;

interface ProductRow {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string | null;
  video: string | null;
  featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
}

/** "Roti Coklat Keju" -> "roti-coklat-keju" untuk id produk baru. */
function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

/** Tab "Menu": tabel produk + CRUD. */
export default function ProdukPanel() {
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState<string | null>(null);
  const [editing, setEditing] = useState<ProductRow | "baru" | null>(null);
  const [halaman, setHalaman] = useState(1);
  const [kategori, setKategori] = useState<string[]>([]);

  // Muat daftar kategori dari DB untuk dropdown form (jatuh ke cadangan bila kosong).
  useEffect(() => {
    if (!supabaseAdmin) return;
    void supabaseAdmin
      .from("categories")
      .select("name")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data) setKategori((data as { name: string }[]).map((k) => k.name));
      });
  }, []);
  const opsiKategori = kategori.length ? kategori : KATEGORI_CADANGAN;

  const muat = useCallback(async () => {
    if (!supabaseAdmin) return;
    setMemuat(true);
    setGalat(null);
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) setGalat(readableError(error));
    else setRows((data ?? []) as ProductRow[]);
    setMemuat(false);
  }, []);

  useEffect(() => {
    void muat();
  }, [muat]);

  const sortBerikut = useMemo(
    () => (rows.length ? Math.max(...rows.map((r) => r.sort_order)) + 1 : 0),
    [rows],
  );

  // Pagination: potong daftar jadi 10 baris per halaman.
  const totalHalaman = Math.max(1, Math.ceil(rows.length / PER_HALAMAN));
  // Jaga halaman tetap valid saat daftar mengecil (mis. setelah hapus).
  useEffect(() => {
    if (halaman > totalHalaman) setHalaman(totalHalaman);
  }, [halaman, totalHalaman]);
  const barisHalaman = rows.slice(
    (halaman - 1) * PER_HALAMAN,
    halaman * PER_HALAMAN,
  );

  const hapus = async (row: ProductRow) => {
    if (!supabaseAdmin) return;
    if (
      !window.confirm(
        `Hapus permanen "${row.name}"? Like dan ulasan produk ini ikut terhapus, sementara riwayat pesanan lama tetap tersimpan.`,
      )
    )
      return;

    setGalat(null);
    const { error } = await supabaseAdmin.rpc("delete_product_permanently", {
      p_product_id: row.id,
    });
    if (error) {
      setGalat(readableError(error));
      return;
    }
    void muat();
  };

  const toggleAktif = async (row: ProductRow) => {
    if (!supabaseAdmin) return;
    const { error } = await supabaseAdmin
      .from("products")
      .update({ is_active: !row.is_active })
      .eq("id", row.id);
    if (error) setGalat(readableError(error));
    else void muat();
  };

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="font-text text-sm text-cocoa-700/70">
          {memuat ? "Memuat…" : `${rows.length} produk`}
        </p>
        <button
          type="button"
          onClick={() => setEditing("baru")}
          className="inline-flex items-center gap-2 rounded-full bg-primary-500 px-5 py-2.5 font-text text-sm font-bold text-white shadow-pink transition-all hover:-translate-y-0.5 hover:bg-primary-600"
        >
          <Plus className="h-4 w-4" /> Tambah Produk
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
            Belum ada produk
          </p>
          <p className="mt-1 font-text text-sm text-cocoa-700/60">
            Tekan “Tambah Produk” untuk mulai.
          </p>
        </div>
      ) : (
        <>
          {/* Tabel produk — desktop: tabel penuh; mobile: kartu (tanpa scrollbar horizontal) */}
          <div className="hidden overflow-hidden rounded-2xl bg-paper-50 ring-1 ring-cocoa-700/10 md:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-cocoa-700/10 font-text text-[11px] font-bold uppercase tracking-wide text-cocoa-700/55">
                  <th className="px-4 py-3">Produk</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Harga</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {barisHalaman.map((row) => (
                  <tr
                    key={row.id}
                    className={`border-b border-cocoa-700/5 last:border-0 ${
                      row.is_active ? "" : "opacity-60"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-paper-200">
                          {row.image ? (
                            <img
                              src={row.image}
                              alt=""
                              className="h-full w-full object-cover"
                              onError={(e) =>
                                (e.currentTarget.style.visibility = "hidden")
                              }
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-cocoa-700/30">
                              <ImageIcon className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate font-heading text-sm text-cocoa-800">
                              {row.name}
                            </span>
                            {row.featured && (
                              <Star
                                className="h-3.5 w-3.5 shrink-0 fill-caramel text-caramel"
                                aria-label="Unggulan"
                              />
                            )}
                            {row.video && (
                              <Film
                                className="h-3.5 w-3.5 shrink-0 text-cocoa-700/50"
                                aria-label="Ada video"
                              />
                            )}
                          </div>
                          <span className="block truncate font-text text-[11px] text-cocoa-700/45">
                            {row.id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-text text-sm text-cocoa-700/80">
                      {row.category}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-text text-sm font-bold text-cocoa-800">
                      {formatPrice(row.price)}
                    </td>
                    <td className="px-4 py-3">
                      {row.is_active ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 font-text text-[11px] font-bold text-green-700">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-cocoa-700/10 px-2.5 py-0.5 font-text text-[11px] font-bold text-cocoa-700/70">
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Kartu produk — tampil di mobile (md:hidden) */}
          <div className="flex flex-col gap-3 md:hidden">
            {barisHalaman.map((row) => (
              <article
                key={row.id}
                className={`rounded-2xl bg-paper-50 p-4 ring-1 ring-cocoa-700/10 ${
                  row.is_active ? "" : "opacity-60"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-paper-200">
                    {row.image ? (
                      <img
                        src={row.image}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={(e) =>
                          (e.currentTarget.style.visibility = "hidden")
                        }
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-cocoa-700/30">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate font-heading text-sm text-cocoa-800">
                        {row.name}
                      </p>
                      {row.featured && (
                        <Star
                          className="h-3.5 w-3.5 shrink-0 fill-caramel text-caramel"
                          aria-label="Unggulan"
                        />
                      )}
                      {row.video && (
                        <Film
                          className="h-3.5 w-3.5 shrink-0 text-cocoa-700/50"
                          aria-label="Ada video"
                        />
                      )}
                    </div>
                    <p className="truncate font-text text-[11px] text-cocoa-700/45">
                      {row.id}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="font-text text-sm font-bold text-cocoa-800">
                        {formatPrice(row.price)}
                      </span>
                      <span className="font-text text-xs text-cocoa-700/70">
                        {row.category}
                      </span>
                      {row.is_active ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 font-text text-[10px] font-bold text-green-700">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-cocoa-700/10 px-2 py-0.5 font-text text-[10px] font-bold text-cocoa-700/70">
                          Nonaktif
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-end gap-1 border-t border-cocoa-700/10 pt-2.5">
                  <button
                    type="button"
                    onClick={() => toggleAktif(row)}
                    title={row.is_active ? "Nonaktifkan" : "Aktifkan"}
                    className="flex items-center gap-1.5 rounded-full bg-paper-200 px-3 py-1.5 font-text text-xs font-bold text-cocoa-800 transition-colors hover:bg-cocoa-800 hover:text-paper-50"
                  >
                    {row.is_active ? (
                      <Eye className="h-3.5 w-3.5" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5" />
                    )}
                    {row.is_active ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(row)}
                    title="Edit"
                    className="flex items-center gap-1.5 rounded-full bg-paper-200 px-3 py-1.5 font-text text-xs font-bold text-cocoa-800 transition-colors hover:bg-cocoa-800 hover:text-paper-50"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => hapus(row)}
                    title="Hapus"
                    className="flex items-center gap-1.5 rounded-full bg-paper-200 px-3 py-1.5 font-text text-xs font-bold text-cocoa-800 transition-colors hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Hapus
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Kontrol pagination */}
          {totalHalaman > 1 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="font-text text-xs text-cocoa-700/60">
                Menampilkan {(halaman - 1) * PER_HALAMAN + 1}–
                {Math.min(halaman * PER_HALAMAN, rows.length)} dari{" "}
                {rows.length}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setHalaman((h) => Math.max(1, h - 1))}
                  disabled={halaman <= 1}
                  aria-label="Halaman sebelumnya"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-paper-50 text-cocoa-800 ring-1 ring-cocoa-700/10 transition-colors hover:bg-cocoa-800 hover:text-paper-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-paper-50 disabled:hover:text-cocoa-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-2 font-text text-sm font-bold text-cocoa-800">
                  {halaman} / {totalHalaman}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setHalaman((h) => Math.min(totalHalaman, h + 1))
                  }
                  disabled={halaman >= totalHalaman}
                  aria-label="Halaman berikutnya"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-paper-50 text-cocoa-800 ring-1 ring-cocoa-700/10 transition-colors hover:bg-cocoa-800 hover:text-paper-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-paper-50 disabled:hover:text-cocoa-800"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {editing && (
        <FormProduk
          awal={editing === "baru" ? null : editing}
          sortBerikut={sortBerikut}
          kategori={opsiKategori}
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
 * FORM TAMBAH / EDIT
 * ══════════════════════════════════════════════════════════════════════════ */

function FormProduk({
  awal,
  sortBerikut,
  kategori,
  onBatal,
  onSelesai,
}: {
  awal: ProductRow | null;
  sortBerikut: number;
  kategori: string[];
  onBatal: () => void;
  onSelesai: () => void;
}) {
  const baru = awal === null;

  const [id, setId] = useState(awal?.id ?? "");
  const [idDisentuh, setIdDisentuh] = useState(!baru); // pada mode baru: auto dari nama sampai diedit
  const [name, setName] = useState(awal?.name ?? "");
  const [price, setPrice] = useState(
    awal?.price != null ? String(awal.price) : "",
  );
  const [category, setCategory] = useState<string>(
    awal?.category ?? kategori[0] ?? "",
  );
  // Bila produk sedang memakai kategori yang tak ada di daftar (mis. nonaktif),
  // tetap sertakan agar tidak hilang dari dropdown.
  const opsiKategori =
    category && !kategori.includes(category)
      ? [category, ...kategori]
      : kategori;
  const [description, setDescription] = useState(awal?.description ?? "");
  const [image, setImage] = useState(awal?.image ?? "");
  const [video, setVideo] = useState(awal?.video ?? "");
  const [featured, setFeatured] = useState(awal?.featured ?? false);
  const [isActive, setIsActive] = useState(awal?.is_active ?? true);
  const [sortOrder, setSortOrder] = useState(
    String(awal?.sort_order ?? sortBerikut),
  );

  const [unggahFoto, setUnggahFoto] = useState(false);
  const [unggahVid, setUnggahVid] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [simpan, setSimpan] = useState(false);

  // Mode baru: id mengikuti nama sampai owner mengetik id sendiri.
  const idFinal = baru && !idDisentuh ? slugify(name) : id;

  const priceNum = Number(price);
  const valid =
    idFinal.trim().length > 0 &&
    name.trim().length > 0 &&
    Number.isFinite(priceNum) &&
    priceNum > 0 &&
    description.trim().length > 0;

  const pilihFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setGalat(null);
    setUnggahFoto(true);
    try {
      setImage(await unggahFotoMenu(file));
    } catch (err) {
      setGalat(err instanceof Error ? err.message : "Gagal unggah foto.");
    } finally {
      setUnggahFoto(false);
    }
  };

  const pilihVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setGalat(null);
    setUnggahVid(true);
    try {
      setVideo(await unggahVideoMenu(file));
    } catch (err) {
      setGalat(err instanceof Error ? err.message : "Gagal unggah video.");
    } finally {
      setUnggahVid(false);
    }
  };

  const kirim = async () => {
    if (!supabaseAdmin || !valid) return;
    setSimpan(true);
    setGalat(null);

    const isi = {
      name: name.trim(),
      price: Math.round(priceNum),
      category,
      description: description.trim(),
      image: image.trim() || null,
      video: video.trim() || null,
      featured,
      is_active: isActive,
      sort_order: Math.round(Number(sortOrder)) || 0,
    };

    const q = baru
      ? supabaseAdmin.from("products").insert({ id: idFinal.trim(), ...isi })
      : supabaseAdmin.from("products").update(isi).eq("id", awal!.id);

    const { error } = await q;
    setSimpan(false);
    if (error) {
      setGalat(
        error.message.includes("duplicate")
          ? `ID "${idFinal}" sudah dipakai produk lain. Ganti yang lain.`
          : readableError(error),
      );
      return;
    }
    onSelesai();
  };

  const jenisVideo = parseVideo(video).type;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-cocoa-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      {/* Inject Font Itim — semua teks form kecuali H2 memakai Itim */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Itim&display=swap');
        .font-itim, .font-itim * {
          font-family: 'Itim', cursive, sans-serif !important;
        }
      `}</style>
      <div className="flex max-h-[94dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl bg-paper-100 shadow-cocoa-lg sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-cocoa-700/10 px-5 py-4">
          <h2 className="font-heading text-xl text-cocoa-800">
            {baru ? "Tambah Produk" : "Edit Produk"}
          </h2>
          <button
            type="button"
            onClick={onBatal}
            className="rounded-full p-2 text-cocoa-700/70 transition-colors hover:bg-paper-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="font-itim flex-1 space-y-4 overflow-y-auto p-5">
          <Kolom label="Nama produk" wajib>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
              placeholder="mis. Roti Coklat Keju"
            />
          </Kolom>

          <Kolom
            label="ID / slug"
            wajib
            bantuan={
              baru ? "otomatis dari nama, bisa diubah" : "tidak bisa diubah"
            }
          >
            <input
              type="text"
              value={idFinal}
              disabled={!baru}
              onChange={(e) => {
                setIdDisentuh(true);
                setId(slugify(e.target.value));
              }}
              className={`${inputCls} ${!baru ? "opacity-60" : ""}`}
              placeholder="roti-coklat-keju"
            />
          </Kolom>

          <div className="grid grid-cols-2 gap-4">
            <Kolom label="Harga (Rp)" wajib>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={inputCls}
                placeholder="12000"
              />
            </Kolom>
            <Kolom label="Urutan tampil">
              <input
                type="number"
                inputMode="numeric"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className={inputCls}
              />
            </Kolom>
          </div>

          <Kolom label="Kategori" wajib>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputCls}
            >
              {opsiKategori.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </Kolom>

          <Kolom label="Deskripsi" wajib>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={inputCls}
              placeholder="Roti empuk isi coklat leleh dan keju parut…"
            />
          </Kolom>

          {/* Foto */}
          <Kolom label="Foto produk" bantuan="otomatis dikompres">
            <div className="flex items-center gap-3">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-paper-200 ring-1 ring-cocoa-700/10">
                {image ? (
                  <img
                    src={image}
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
                    : image
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
                {image && (
                  <button
                    type="button"
                    onClick={() => setImage("")}
                    className="text-left font-text text-xs font-semibold text-red-500 hover:underline"
                  >
                    Hapus foto
                  </button>
                )}
              </div>
            </div>
          </Kolom>

          {/* Video */}
          <Kolom
            label="Video produk (opsional)"
            bantuan="upload MP4 atau tempel link YouTube"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <label
                  className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-pink-100 px-4 py-2 font-text text-sm font-bold text-primary-600 transition-colors hover:bg-primary-500 hover:text-white ${
                    unggahVid ? "pointer-events-none opacity-60" : ""
                  }`}
                >
                  {unggahVid ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Film className="h-4 w-4" />
                  )}
                  {unggahVid ? "Mengunggah…" : "Upload MP4"}
                  <input
                    type="file"
                    accept="video/mp4"
                    className="hidden"
                    disabled={unggahVid}
                    onChange={pilihVideo}
                  />
                </label>
                {video && (
                  <span className="font-text text-xs font-semibold text-cocoa-700/70">
                    {jenisVideo === "youtube" ? "Link YouTube ✓" : "Video ✓"}
                  </span>
                )}
              </div>
              <input
                type="url"
                value={video}
                onChange={(e) => setVideo(e.target.value)}
                placeholder="atau tempel URL (YouTube / MP4)"
                className={inputCls}
              />
              {video && (
                <button
                  type="button"
                  onClick={() => setVideo("")}
                  className="text-left font-text text-xs font-semibold text-red-500 hover:underline"
                >
                  Hapus video
                </button>
              )}
            </div>
          </Kolom>

          {/* Toggle */}
          <div className="flex flex-wrap gap-2">
            <TombolToggle
              aktif={featured}
              onClick={() => setFeatured((v) => !v)}
              label="Unggulan"
            />
            <TombolToggle
              aktif={isActive}
              onClick={() => setIsActive((v) => !v)}
              label={isActive ? "Aktif (tampil)" : "Nonaktif (disembunyikan)"}
            />
          </div>

          {galat && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 px-3.5 py-2.5 ring-1 ring-red-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <p className="font-text text-sm text-red-700">{galat}</p>
            </div>
          )}
        </div>

        <div className="font-itim border-t border-cocoa-700/10 bg-paper-50 px-5 py-4">
          <button
            type="button"
            onClick={kirim}
            disabled={!valid || simpan || unggahFoto || unggahVid}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary-500 px-6 py-3.5 font-text text-base font-bold text-white shadow-pink transition-all hover:-translate-y-0.5 hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {simpan ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            {baru ? "Simpan Produk" : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Bagian kecil ────────────────────────────────────────────────────────── */

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
      className={`rounded-full px-4 py-2 font-text text-sm font-bold transition-colors ${
        aktif
          ? "bg-primary-500 text-white shadow-pink"
          : "bg-pink-100 text-cocoa-700/70 hover:bg-pink-200 hover:text-primary-600"
      }`}
    >
      {label}
    </button>
  );
}
