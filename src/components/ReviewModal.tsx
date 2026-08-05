import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Star,
  Send,
  CheckCircle2,
  UtensilsCrossed,
  HeartHandshake,
  BadgeCheck,
  AlertCircle,
} from "lucide-react";
import { supabase, readableError, isSupabaseConfigured } from "../lib/supabase";
import { uploadImage } from "../lib/uploadImage";
import { beritahu } from "../lib/dataevents";
import { kunciScroll } from "../lib/scrollLock";
import { getDeviceId } from "../lib/deviceid";
import { useMenuData } from "../hooks/Usemenudata";

type Tab = "menu" | "pelayanan";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Token dari pesanan asli. Ada = ulasan ditandai "Pembeli terverifikasi". */
  reviewToken?: string | null;
  /** Produk yang baru saja dipesan — dipakai sebagai pilihan awal tab menu. */
  produkDipesan?: { id: string; name: string }[];
  tabAwal?: Tab;
  /** Dipanggil setelah ulasan berhasil dikirim, agar daftar bisa dimuat ulang. */
  onSubmitted?: () => void;
}

/* ── Pemilih bintang ────────────────────────────────────────────────────── */

function PilihBintang({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (n: number) => void;
  label: string;
}) {
  const [hover, setHover] = useState(0);
  const tampil = hover || value;

  return (
    <div>
      <div
        className="flex items-center gap-1"
        role="radiogroup"
        aria-label={label}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} bintang`}
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onFocus={() => setHover(n)}
            onBlur={() => setHover(0)}
            className="rounded-md p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caramel"
          >
            <Star
              className={`h-8 w-8 transition-colors ${
                n <= tampil ? "fill-caramel text-caramel" : "text-cocoa-500/25"
              }`}
            />
          </button>
        ))}
      </div>
      <p className="mt-1.5 font-text text-xs text-cocoa-700/60">
        {["Pilih bintang", "Kecewa", "Kurang", "Cukup", "Enak", "Enak banget"][
          tampil
        ] ?? "Pilih bintang"}
      </p>
    </div>
  );
}

/* ── Isi modal (hanya dipasang saat terbuka, supaya tidak menembak
      permintaan data setiap halaman dibuka) ─────────────────────────────── */

function IsiModal({
  onClose,
  reviewToken,
  produkDipesan,
  tabAwal,
  onSubmitted,
}: Omit<Props, "open">) {
  const { items } = useMenuData();
  const [tab, setTab] = useState<Tab>(tabAwal ?? "menu");
  const [sukses, setSukses] = useState<Tab | null>(null);
  const [kirim, setKirim] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  // Kolom umpan bot. Tidak terlihat manusia; kalau terisi, permintaan diabaikan
  // di sisi database. Jangan pernah diberi label "honeypot" di HTML.
  const [website, setWebsite] = useState("");

  // Tab: ulasan menu
  const daftarProduk =
    produkDipesan && produkDipesan.length > 0
      ? produkDipesan
      : items.map((p) => ({ id: p.id, name: p.name }));
  const [produkId, setProdukId] = useState("");
  const [ratingMenu, setRatingMenu] = useState(0);
  const [komentar, setKomentar] = useState("");
  const [namaMenu, setNamaMenu] = useState("");

  // Tab: ulasan pelayanan
  const [namaLayanan, setNamaLayanan] = useState("");
  const [peran, setPeran] = useState("");
  const [ratingLayanan, setRatingLayanan] = useState(0);
  const [kutipan, setKutipan] = useState("");
  const [fotoLayanan, setFotoLayanan] = useState("");
  const [uploadFoto, setUploadFoto] = useState(false);
  const [galatFoto, setGalatFoto] = useState<string | null>(null);

  async function pilihFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // reset agar foto sama bisa dipilih ulang
    if (!file) return;
    setGalatFoto(null);
    setUploadFoto(true);
    try {
      setFotoLayanan(await uploadImage(file, "ulasan"));
    } catch (err) {
      setGalatFoto(
        err instanceof Error ? err.message : "Gagal mengunggah foto.",
      );
    } finally {
      setUploadFoto(false);
    }
  }

  useEffect(() => {
    if (!produkId && daftarProduk.length > 0) setProdukId(daftarProduk[0].id);
  }, [daftarProduk, produkId]);

  const menuValid =
    produkId !== "" && ratingMenu >= 1 && namaMenu.trim().length >= 2;
  const layananValid =
    ratingLayanan >= 1 &&
    namaLayanan.trim().length >= 2 &&
    kutipan.trim().length >= 10;

  const deviceId = getDeviceId();

  async function kirimUlasanMenu() {
    if (!menuValid || !supabase) return;
    setKirim(true);
    setGalat(null);
    try {
      const { error } = await supabase.rpc("submit_product_review", {
        payload: {
          product_id: produkId,
          reviewer_name: namaMenu.trim(),
          rating: ratingMenu,
          comment: komentar.trim() || null,
          device_id: deviceId,
          review_token: reviewToken ?? null,
          website, // umpan bot
        },
      });
      if (error) throw error;
      setSukses("menu");
      // Rating rata-rata produk berubah -> kartu menu harus ikut menyesuaikan.
      beritahu("menu");
      onSubmitted?.();
    } catch (err) {
      setGalat(readableError(err));
    } finally {
      setKirim(false);
    }
  }

  async function kirimUlasanLayanan() {
    if (!layananValid || !supabase) return;
    setKirim(true);
    setGalat(null);
    try {
      const { error } = await supabase.rpc("submit_service_review", {
        payload: {
          reviewer_name: namaLayanan.trim(),
          reviewer_role: peran.trim() || null,
          rating: ratingLayanan,
          quote: kutipan.trim(),
          photo_url: fotoLayanan || null,
          device_id: deviceId,
          review_token: reviewToken ?? null,
          website,
        },
      });
      if (error) throw error;
      setSukses("pelayanan");
      // Bagian Testimoni harus segera menampilkan ulasan yang baru masuk.
      beritahu("ulasan-pelayanan");
      onSubmitted?.();
    } catch (err) {
      setGalat(readableError(err));
    } finally {
      setKirim(false);
    }
  }

  /* ── Layar sukses ────────────────────────────────────────────────────── */
  if (sukses) {
    return (
      <div className="flex flex-col items-center gap-4 px-6 py-14 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle2 className="h-9 w-9" aria-hidden />
        </span>
        <h2 className="font-heading text-2xl text-cocoa-800">
          Terima kasih, ulasanmu terkirim
        </h2>
        <p className="max-w-sm font-text text-sm leading-relaxed text-cocoa-700/75">
          {sukses === "menu"
            ? "Bintangmu langsung ikut menghitung rating produk ini di halaman menu."
            : fotoLayanan
              ? "Ulasanmu masuk! Karena menyertakan foto, akan tampil di Testimoni setelah ditinjau pemilik."
              : "Ulasanmu akan tampil di bagian Testimoni halaman ini."}
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-2.5">
          {sukses === "menu" ? (
            <button
              type="button"
              onClick={() => {
                setSukses(null);
                setTab("pelayanan");
              }}
              className="rounded-full bg-paper-200 px-6 py-3 font-text text-sm font-bold text-cocoa-800 transition-colors hover:bg-cocoa-800 hover:text-paper-50"
            >
              Ulas pelayanannya juga
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setSukses(null);
                setTab("menu");
              }}
              className="rounded-full bg-paper-200 px-6 py-3 font-text text-sm font-bold text-cocoa-800 transition-colors hover:bg-cocoa-800 hover:text-paper-50"
            >
              Beri bintang untuk menu
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-cocoa-800 px-6 py-3 font-text text-sm font-bold text-paper-50 shadow-cocoa transition-transform hover:-translate-y-0.5"
          >
            Selesai
          </button>
        </div>
      </div>
    );
  }

  /* ── Formulir ────────────────────────────────────────────────────────── */
  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-cocoa-700/10 px-5 py-4 sm:px-6">
        <div>
          <span className="font-script text-xl text-caramel">Ulasan kamu</span>
          <h2 className="font-heading text-xl text-cocoa-800 sm:text-2xl">
            Bagikan pengalamanmu
          </h2>
          {reviewToken && (
            <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 font-text text-[11px] font-bold text-green-700">
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
              Pembeli terverifikasi
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className="shrink-0 rounded-full p-2 text-cocoa-700/70 transition-colors hover:bg-paper-200 hover:text-cocoa-900"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Tab */}
      <div className="grid grid-cols-2 gap-2 border-b border-cocoa-700/10 bg-paper-100 p-3 sm:px-6">
        {(
          [
            { id: "menu", label: "Ulasan Menu", icon: UtensilsCrossed },
            {
              id: "pelayanan",
              label: "Ulasan Pelayanan",
              icon: HeartHandshake,
            },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => {
              setTab(id);
              setGalat(null);
            }}
            className={`flex items-center justify-center gap-2 rounded-2xl px-3 py-3 font-text text-sm font-bold transition-colors ${
              tab === id
                ? "bg-cocoa-800 text-paper-50 shadow-cocoa"
                : "bg-paper-50 text-cocoa-700/70 ring-1 ring-cocoa-700/10 hover:text-cocoa-900"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>

      {/* Isi tab */}
      <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
        {/* Umpan bot — disembunyikan dari mata & pembaca layar, tapi tetap
            ditemukan skrip otomatis yang mengisi semua input. */}
        <input
          type="text"
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="pointer-events-none absolute left-[-9999px] h-0 w-0 opacity-0"
        />

        {tab === "menu" ? (
          <div className="flex flex-col gap-4">
            <Kolom label="Menu yang kamu coba" wajib>
              <select
                value={produkId}
                onChange={(e) => setProdukId(e.target.value)}
                className={inputCls}
              >
                {daftarProduk.length === 0 && (
                  <option value="">Memuat menu…</option>
                )}
                {daftarProduk.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Kolom>

            <Kolom label="Seberapa enak menurutmu?" wajib>
              <PilihBintang
                value={ratingMenu}
                onChange={setRatingMenu}
                label="Rating rasa"
              />
            </Kolom>

            <Kolom label="Nama kamu" wajib>
              <input
                type="text"
                value={namaMenu}
                onChange={(e) => setNamaMenu(e.target.value)}
                placeholder="Nama panggilan juga boleh"
                maxLength={60}
                className={inputCls}
              />
            </Kolom>

            <Kolom
              label="Ceritakan sedikit (opsional)"
              bantuan={`${komentar.length}/500`}
            >
              <textarea
                value={komentar}
                onChange={(e) => setKomentar(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Rasanya bagaimana? Teksturnya? Masih hangat saat sampai?"
                className={inputCls}
              />
            </Kolom>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <Kolom label="Bagaimana pelayanan kami?" wajib>
              <PilihBintang
                value={ratingLayanan}
                onChange={setRatingLayanan}
                label="Rating pelayanan"
              />
            </Kolom>

            <Kolom label="Nama kamu" wajib>
              <input
                type="text"
                value={namaLayanan}
                onChange={(e) => setNamaLayanan(e.target.value)}
                placeholder="Nama panggilan juga boleh"
                maxLength={60}
                className={inputCls}
              />
            </Kolom>

            <Kolom label="Pekerjaan / peran (opsional)">
              <input
                type="text"
                value={peran}
                onChange={(e) => setPeran(e.target.value)}
                placeholder="Mis. Ibu Rumah Tangga, Mahasiswa, Karyawan"
                maxLength={60}
                className={inputCls}
              />
            </Kolom>

            <Kolom
              label="Ulasan kamu"
              wajib
              bantuan={`${kutipan.length}/500 · minimal 10`}
            >
              <textarea
                value={kutipan}
                onChange={(e) => setKutipan(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder="Bagaimana proses pemesanannya? Ramah? Tepat waktu?"
                className={inputCls}
              />
            </Kolom>

            <Kolom label="Foto (opsional)" bantuan="ditinjau dulu sebelum tampil">
              {fotoLayanan ? (
                <div className="flex items-center gap-3">
                  <img
                    src={fotoLayanan}
                    alt="Pratinjau foto ulasan"
                    className="h-16 w-16 rounded-xl object-cover ring-1 ring-cocoa-700/15"
                  />
                  <button
                    type="button"
                    onClick={() => setFotoLayanan("")}
                    className="font-text text-sm font-semibold text-red-500 hover:underline"
                  >
                    Hapus foto
                  </button>
                </div>
              ) : (
                <label
                  className={`flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-cocoa-700/30 px-4 py-3 text-center font-text text-sm text-cocoa-700/70 transition-colors hover:bg-paper-200 ${
                    uploadFoto || !isSupabaseConfigured
                      ? "pointer-events-none opacity-60"
                      : ""
                  }`}
                >
                  {uploadFoto
                    ? "Mengunggah…"
                    : isSupabaseConfigured
                      ? "Tambah foto — JPG/PNG/WEBP · maks 5 MB"
                      : "Upload foto belum aktif"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    disabled={uploadFoto || !isSupabaseConfigured}
                    onChange={pilihFoto}
                  />
                </label>
              )}
              {galatFoto && (
                <span className="mt-1 block font-text text-xs text-red-500">
                  {galatFoto}
                </span>
              )}
            </Kolom>
          </div>
        )}

        {galat && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2.5 rounded-2xl bg-red-50 px-4 py-3 ring-1 ring-red-200"
          >
            <AlertCircle
              className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
              aria-hidden
            />
            <p className="font-text text-sm text-red-700">{galat}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-cocoa-700/10 bg-paper-50 px-5 py-4 sm:px-6">
        <button
          type="button"
          disabled={
            kirim || uploadFoto || (tab === "menu" ? !menuValid : !layananValid)
          }
          onClick={tab === "menu" ? kirimUlasanMenu : kirimUlasanLayanan}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-cocoa-800 px-6 py-3.5 font-text text-base font-bold text-paper-50 shadow-cocoa transition-all hover:-translate-y-0.5 hover:bg-cocoa-900 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          <Send className="h-5 w-5" aria-hidden />
          {kirim ? "Mengirim…" : "Kirim ulasan"}
        </button>
        <p className="mt-2 text-center font-text text-xs text-cocoa-700/60">
          Ulasan tanpa foto tampil langsung. Tulis yang jujur ya 🙏
        </p>
      </div>
    </>
  );
}

/* ── Kerangka modal ─────────────────────────────────────────────────────── */

export default function ReviewModal(props: Props) {
  const { open, onClose } = props;

  // Memakai pengunci bersama, bukan menyetel body.style sendiri. Modal ini
  // sering terbuka di ATAS drawer keranjang yang juga mengunci scroll; tanpa
  // penghitung acuan, yang menutup lebih dulu akan salah memulihkan keadaan.
  useEffect(() => {
    if (!open) return;
    return kunciScroll();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Tutup ulasan"
            onClick={onClose}
            className="absolute inset-0 bg-cocoa-900/55 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Formulir ulasan"
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-paper-100 shadow-cocoa-lg sm:max-w-lg sm:rounded-3xl"
          >
            <IsiModal {...props} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Bagian kecil bersama ───────────────────────────────────────────────── */

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
