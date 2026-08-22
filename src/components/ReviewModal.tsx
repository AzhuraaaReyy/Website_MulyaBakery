import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Star,
  Send,
  CheckCircle2,
  BadgeCheck,
  AlertCircle,
  Check,
} from "lucide-react";
import { supabase, readableError, isSupabaseConfigured } from "../lib/supabase";
import { uploadImage } from "../lib/uploadImage";
import { beritahu } from "../lib/dataevents";
import { kunciScroll } from "../lib/scrollLock";
import { getDeviceId } from "../lib/deviceid";
import { useMenuData } from "../hooks/Usemenudata";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Token dari pesanan asli. Ada = ulasan ditandai "Pembeli terverifikasi". */
  reviewToken?: string | null;
  /** Produk yang baru saja dipesan — dipakai sebagai pilihan awal menu. */
  produkDipesan?: { id: string; name: string }[];
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
    <div className="w-full">
      <div
        className="flex items-center gap-1 sm:gap-1.5"
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
              className={`h-7 w-7 sm:h-8 sm:w-8 transition-colors ${
                n <= tampil ? "fill-caramel text-caramel" : "text-cocoa-500/25"
              }`}
            />
          </button>
        ))}
      </div>
      <p className="font-section3-p mt-1.5 text-xs text-cocoa-700/70">
        {["Pilih bintang", "Kecewa", "Kurang", "Cukup", "Puas", "Sangat Puas"][
          tampil
        ] ?? "Pilih bintang"}
      </p>
    </div>
  );
}

/* ── Isi modal ───────────────────────────────────────────────────────────── */

function IsiModal({
  onClose,
  reviewToken,
  produkDipesan,
  onSubmitted,
}: Omit<Props, "open">) {
  const { items } = useMenuData();
  const [sukses, setSukses] = useState(false);
  const [kirim, setKirim] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  const [website, setWebsite] = useState(""); // Honeypot field

  // Data Form
  const daftarProduk =
    produkDipesan && produkDipesan.length > 0
      ? produkDipesan
      : items.map((p) => ({ id: p.id, name: p.name }));

  const [produkDipilih, setProdukDipilih] = useState<string[]>([]);
  const [nama, setNama] = useState("");
  const [rating, setRating] = useState(0);
  const [komentar, setKomentar] = useState("");
  const [foto, setFoto] = useState("");
  const [uploadFoto, setUploadFoto] = useState(false);
  const [galatFoto, setGalatFoto] = useState<string | null>(null);

  // Saat ulasan dibuka setelah pesanan, semua produk yang baru dibeli
  // otomatis tercentang — pelanggan bisa mengulas semuanya sekali kirim.
  useEffect(() => {
    if (produkDipesan && produkDipesan.length > 0) {
      setProdukDipilih(produkDipesan.map((p) => p.id));
    }
  }, [produkDipesan]);

  const toggleProduk = (id: string) => {
    setProdukDipilih((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  async function pilihFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setGalatFoto(null);
    setUploadFoto(true);
    try {
      setFoto(await uploadImage(file, "ulasan"));
    } catch (err) {
      setGalatFoto(
        err instanceof Error ? err.message : "Gagal mengunggah foto.",
      );
    } finally {
      setUploadFoto(false);
    }
  }

  const formValid =
    produkDipilih.length >= 1 &&
    rating >= 1 &&
    nama.trim().length >= 2 &&
    komentar.trim().length >= 10;

  const deviceId = getDeviceId();

  async function kirimUlasan() {
    if (!formValid || !supabase) return;
    setKirim(true);
    setGalat(null);

    // Nama menu terpilih digabung untuk badge ulasan pelayanan
    // (dipotong agar tetap ringkas di kartu testimoni).
    const produkTerpilih = daftarProduk.filter((p) =>
      produkDipilih.includes(p.id),
    );
    const namaMenu = produkTerpilih.length
      ? produkTerpilih.map((p) => p.name).join(", ").slice(0, 60)
      : "Menu Mulya Bakery";

    try {
      // 1. Kirim ulasan untuk SEMUA menu terpilih (sekali kirim).
      const { error: errMenu } = await supabase.rpc("submit_product_review", {
        payload: {
          product_ids: produkDipilih,
          reviewer_name: nama.trim(),
          rating: rating,
          comment: komentar.trim(),
          device_id: deviceId,
          review_token: reviewToken ?? null,
          website,
        },
      });

      if (errMenu) throw errMenu;

      // 2. Daftarkan ulasan ke testimoni (service_reviews) — TANPA syarat foto.
      //    Foto bersifat opsional: bila ada dikirim sekaligus (ditahan admin lewat
      //    is_hidden); bila tidak ada, ulasan tetap tampil di halaman.
      {
        const { error: errService } = await supabase.rpc(
          "submit_service_review",
          {
            payload: {
              reviewer_name: nama.trim(),
              reviewer_role: namaMenu, // Nama menu digabung agar badge muncul
              rating: rating,
              quote: komentar.trim(),
              photo_url: foto || null,
              device_id: deviceId,
              review_token: reviewToken ?? null,
              website,
            },
          },
        );

        if (errService) throw errService;
      }

      setSukses(true);
      beritahu("menu");
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
      <div className="flex flex-col items-center gap-4 px-5 py-10 sm:px-6 sm:py-14 text-center">
        <span className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-green-100 text-green-600 shrink-0">
          <CheckCircle2 className="h-8 w-8 sm:h-9 sm:w-9" aria-hidden />
        </span>
        <h2 className="font-heading text-xl sm:text-2xl text-cocoa-800 leading-snug">
          {produkDipilih.length > 1
            ? `Terima kasih, ${produkDipilih.length} ulasanmu terkirim!`
            : "Terima kasih, ulasanmu terkirim!"}
        </h2>
        <p className="font-section3-p max-w-sm text-sm sm:text-base leading-relaxed text-cocoa-700/80 text-justify">
          {foto
            ? "Ulasan dan fotomu berhasil masuk! Ulasan akan tampil setelah ditinjau oleh tim kami."
            : "Terima kasih! Ulasanmu sudah tampil di halaman testimoni."}
        </p>
        <div className="mt-2 flex w-full justify-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto rounded-full bg-cocoa-800 px-8 py-3 font-text text-sm font-bold text-paper-50 shadow-cocoa transition-transform hover:-translate-y-0.5"
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
      <div className="flex items-start justify-between gap-3 border-b border-cocoa-700/10 px-4 py-3.5 sm:px-6 sm:py-4">
        <div className="min-w-0 flex-1">
          <span className="font-script text-lg sm:text-xl text-caramel block">
            Ulasan Pengguna
          </span>
          <h2 className="font-heading text-lg sm:text-2xl text-cocoa-800 truncate">
            Bagikan Pengalamanmu
          </h2>
          {reviewToken && (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 font-text text-[10px] sm:text-[11px] font-bold text-green-700">
              <BadgeCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="truncate">Pembeli terverifikasi</span>
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className="shrink-0 rounded-full p-1.5 sm:p-2 text-cocoa-700/70 transition-colors hover:bg-paper-200 hover:text-cocoa-900"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Isi Formulir Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Honeypot Input (Anti-Spam Bot) */}
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

        <div className="flex flex-col gap-3.5 sm:gap-4">
          <Kolom
            label="Menu yang kamu coba"
            wajib
            bantuan={`${produkDipilih.length} dipilih`}
          >
            <div className="max-h-44 overflow-y-auto rounded-xl bg-paper-50 p-1.5 ring-1 ring-cocoa-700/15 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {daftarProduk.length === 0 && (
                <p className="px-2.5 py-2 font-section3-p text-xs text-cocoa-700/60">
                  Belum ada menu yang bisa dipilih.
                </p>
              )}
              {daftarProduk.map((p) => {
                const aktif = produkDipilih.includes(p.id);
                return (
                  <label
                    key={p.id}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2.5 transition-colors ${
                      aktif
                        ? "bg-cocoa-800 text-paper-50"
                        : "text-cocoa-800 hover:bg-paper-200"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={aktif}
                      onChange={() => toggleProduk(p.id)}
                      className="sr-only"
                    />
                    <span
                      aria-hidden
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                        aktif
                          ? "border-paper-50 bg-paper-50"
                          : "border-cocoa-700/30 bg-paper-50"
                      }`}
                    >
                      {aktif && (
                        <Check
                          className={`h-3 w-3 stroke-[3] ${
                            aktif ? "text-cocoa-800" : ""
                          }`}
                        />
                      )}
                    </span>
                    <span className="truncate font-section3-p text-sm">
                      {p.name}
                    </span>
                  </label>
                );
              })}
            </div>
          </Kolom>

          <Kolom label="Bagaimana pengalaman keseluruhanmu?" wajib>
            <PilihBintang
              value={rating}
              onChange={setRating}
              label="Rating ulasan"
            />
          </Kolom>

          <Kolom label="Nama kamu" wajib>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Nama panggilan juga boleh"
              maxLength={60}
              className={inputCls}
            />
          </Kolom>

          <Kolom
            label="Ceritakan ulasanmu"
            wajib
            bantuan={`${komentar.length}/500 · min 10 huruf`}
          >
            <textarea
              value={komentar}
              onChange={(e) => setKomentar(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Bagaimana rasa makanan, kecepatan pelayanan, atau keramahan kami?"
              className={inputCls}
            />
          </Kolom>

          <Kolom
            label="Foto pesanan / suasana (opsional)"
            bantuan="ditinjau dulu sebelum tampil"
          >
            {foto ? (
              <div className="flex items-center gap-3">
                <img
                  src={foto}
                  alt="Pratinjau foto ulasan"
                  className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl object-cover ring-1 ring-cocoa-700/15 shrink-0"
                />
                <button
                  type="button"
                  onClick={() => setFoto("")}
                  className="font-text text-xs sm:text-sm font-semibold text-red-500 hover:underline"
                >
                  Hapus foto
                </button>
              </div>
            ) : (
              <label
                className={`flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-cocoa-700/30 px-3 py-2.5 text-center font-section3-p text-xs sm:text-sm text-cocoa-700/70 transition-colors hover:bg-paper-200 ${
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
                  accept="image/*"
                  className="sr-only"
                  disabled={uploadFoto || !isSupabaseConfigured}
                  onChange={pilihFoto}
                />
              </label>
            )}
            {galatFoto && (
              <span className="mt-1 block font-section3-p text-xs text-red-500">
                {galatFoto}
              </span>
            )}
          </Kolom>
        </div>

        {galat && (
          <div
            role="alert"
            className="mt-3.5 flex items-start gap-2 rounded-xl bg-red-50 p-3 ring-1 ring-red-200"
          >
            <AlertCircle
              className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
              aria-hidden
            />
            <p className="font-section3-p text-xs sm:text-sm text-red-700 break-words">
              {galat}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-cocoa-700/10 bg-paper-50 px-4 py-3 sm:px-6 sm:py-4 shrink-0">
        <button
          type="button"
          disabled={kirim || uploadFoto || !formValid}
          onClick={kirimUlasan}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-cocoa-800 px-5 py-3 sm:py-3.5 font-text text-sm sm:text-base font-bold text-paper-50 shadow-cocoa transition-all hover:-translate-y-0.5 hover:bg-cocoa-900 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          <Send className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" aria-hidden />
          <span>{kirim ? "Mengirim…" : "Kirim Ulasan"}</span>
        </button>
        <p className="font-section3-p mt-2 text-center text-[11px] sm:text-xs text-cocoa-700/60">
          Ulasan jujurmu sangat berarti untuk perkembangan kami 🙏
        </p>
      </div>
    </>
  );
}

/* ── Kerangka Modal Utama ────────────────────────────────────────────────── */

export default function ReviewModal(props: Props) {
  const { open, onClose } = props;

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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Itim&display=swap');
        .font-section3-p {
          font-family: 'Itim', cursive, sans-serif !important;
        }
      `}</style>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-end justify-center p-3 sm:items-center sm:p-4 md:p-6"
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
              className="relative flex max-h-[90dvh] sm:max-h-[85vh] w-full max-w-full sm:max-w-lg flex-col overflow-hidden rounded-t-3xl bg-paper-100 shadow-cocoa-lg sm:rounded-3xl"
            >
              <IsiModal {...props} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Bagian Komponen Terpisah ───────────────────────────────────────────── */

const inputCls =
  "w-full rounded-xl bg-paper-50 px-3.5 py-2.5 font-section3-p text-sm text-cocoa-800 ring-1 ring-cocoa-700/15 transition-shadow placeholder:text-cocoa-700/40 focus:outline-none focus:ring-2 focus:ring-caramel";

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
    <label className="block w-full">
      <span className="mb-1 flex items-baseline justify-between gap-2">
        <span className="font-section3-p text-xs sm:text-sm font-bold text-cocoa-700/90">
          {label}
          {wajib && <span className="text-red-500"> *</span>}
        </span>
        {bantuan && (
          <span className="font-section3-p text-[10px] sm:text-[11px] text-cocoa-700/50 shrink-0">
            {bantuan}
          </span>
        )}
      </span>
      {children}
    </label>
  );
}
