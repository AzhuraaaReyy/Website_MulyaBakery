import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { bookingOrderUrl, type OrderMethod } from "../lib/whatsapp";
import { uploadImage } from "../lib/uploadImage";
import { isSupabaseConfigured } from "../lib/supabase";
import { kunciScroll } from "../lib/scrollLock";
import ReviewModal from "./ReviewModal";

/* ── Config ─────────────────────────────────────────────────────────────── */

const CATEGORIES = [
  {
    id: "Kue Ulang Tahun",
    label: "Kue Ulang Tahun",
    desc: "Custom cake & tart pilihan spesial",
  },
  {
    id: "Hampers / Parsel",
    label: "Hampers / Parsel",
    desc: "Paket bingkisan manis & eksklusif",
  },
  {
    id: "Tumpeng / Tampah",
    label: "Tumpeng / Tampah",
    desc: "Tradisional & sajian istimewa acara",
  },
  {
    id: "Custom Design",
    label: "Custom Design",
    desc: "Bebas sesuai imajinasi & selera Anda",
  },
];

/* ── UI Sub-components ────────────────────────────────────── */

function FormField({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col space-y-1.5 font-itim">
      <div className="flex items-baseline justify-between gap-2 text-xs font-semibold text-neutral-800">
        <span className="inline-flex items-center gap-0.5 leading-none">
          {label}
          {required && <span className="text-pink-600 font-bold">*</span>}
        </span>
        {hint && (
          <span className="text-[11px] font-normal leading-none text-neutral-400 shrink-0">
            {hint}
          </span>
        )}
      </div>
      <div className="w-full font-itim">{children}</div>
      {error && (
        <p className="text-[11px] font-medium leading-tight text-pink-600">
          {error}
        </p>
      )}
    </div>
  );
}

function InputField({
  error,
  className = "",
  ...props
}: {
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full h-10 rounded-xl border bg-pink-50/20 px-3.5 text-xs text-neutral-900 font-itim transition-all leading-normal placeholder:font-normal placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400 ${
        error
          ? "border-pink-300 bg-pink-50/50"
          : "border-pink-200/80 hover:border-pink-300"
      } ${className}`}
    />
  );
}

function TextareaField({
  error,
  rows = 2,
  className = "",
  ...props
}: {
  error?: string;
  rows?: number;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      rows={rows}
      className={`w-full rounded-xl border bg-pink-50/20 px-3.5 py-2.5 text-xs text-neutral-900 font-itim transition-all leading-relaxed placeholder:font-normal placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400 resize-none ${
        error
          ? "border-pink-300 bg-pink-50/50"
          : "border-pink-200/80 hover:border-pink-300"
      } ${className}`}
    />
  );
}

/* ── Main Modal ──────────────────────────────────────────────────────────── */

export default function BookingModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);

  // Kategori awal diubah menjadi string kosong ""
  const [category, setCategory] = useState("");
  const [customLabel, setCustomLabel] = useState("");
  const [photo, setPhoto] = useState("");
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [qty, setQty] = useState("");
  const [theme, setTheme] = useState("");
  const [method, setMethod] = useState<OrderMethod>("ambil");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");

  const [touched1, setTouched1] = useState(false);
  const [touched2, setTouched2] = useState(false);
  const [ulasanTerbuka, setUlasanTerbuka] = useState(false);

  const finalType =
    category === "Custom Design" || category.toLowerCase().includes("custom")
      ? customLabel.trim() || "Custom Design"
      : category;

  const minDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().slice(0, 10);
  }, []);

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

  const needAddress = method === "antar";
  const typeOk = finalType.trim().length > 0;
  const dateOk = date !== "";
  const nameOk = name.trim().length >= 2;
  const phoneOk = /^(0|62)8[1-9][0-9]{6,11}$/.test(phone.replace(/\D/g, ""));
  const addressOk = !needAddress || address.trim().length >= 5;

  const step1Valid = typeOk && dateOk;
  const canSubmit = step1Valid && nameOk && phoneOk && addressOk;

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPhotoError(null);
    setUploading(true);
    try {
      setPhoto(await uploadImage(file, "booking"));
    } catch (err) {
      setPhotoError(
        err instanceof Error ? err.message : "Gagal mengunggah foto",
      );
    } finally {
      setUploading(false);
    }
  };

  const goToStep2 = () => {
    setTouched1(true);
    if (step1Valid) setStep(2);
  };

  const submit = () => {
    setTouched2(true);
    if (!canSubmit) return;
    window.open(
      bookingOrderUrl({
        name: name.trim(),
        phone: phone.trim(),
        type: finalType,
        date,
        quantity: qty.trim(),
        theme: theme.trim(),
        budget: "",
        method,
        address: address.trim(),
        note: note.trim(),
        photoUrl: photo || undefined,
      }),
      "_blank",
      "noopener,noreferrer",
    );
    // Tutup modal booking, lalu buka form ulasan otomatis setelah jeda singkat
    // agar pelanggan sempat melihat pesan WhatsApp yang terbuka.
    onClose();
    window.setTimeout(() => setUlasanTerbuka(true), 1200);
  };

  return (
    <>
      {/* Form ulasan otomatis muncul setelah booking dikirim */}
      <ReviewModal
        open={ulasanTerbuka}
        onClose={() => setUlasanTerbuka(false)}
      />

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 md:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Inject Font 'Itim' & Pengaturan Placeholder Tidak Bold */}
            <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Itim&display=swap');
            
            .font-itim, .font-itim * { 
              font-family: 'Itim', cursive, sans-serif; 
            }

            /* Memastikan semua teks placeholder tidak tebal */
            ::placeholder {
              font-weight: 400 !important;
            }
            ::-webkit-input-placeholder {
              font-weight: 400 !important;
            }
            ::-moz-placeholder {
              font-weight: 400 !important;
            }
            :-ms-input-placeholder {
              font-weight: 400 !important;
            }

            /* Hide scrollbar */
            .no-scrollbar::-webkit-scrollbar {
              display: none;
            }
            .no-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>

            {/* Backdrop */}
            <button
              type="button"
              aria-label="Tutup"
              onClick={onClose}
              className="absolute inset-0 bg-neutral-950/40 backdrop-blur-xs transition-opacity"
            />

            {/* Modal Container */}
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-2xl border border-pink-200/80 font-itim"
            >
              {/* Modal Header */}
              <div className="shrink-0 border-b border-pink-100 bg-gradient-to-b from-pink-50/70 via-pink-50/20 to-white px-5 py-4 sm:px-6 sm:pt-6 sm:pb-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] sm:text-[11px] font-bold tracking-widest text-pink-700 uppercase leading-none">
                      Pemesanan Khusus
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mt-1 leading-none truncate">
                      Mulya Bakery
                    </h2>
                    <p className="text-xs text-neutral-500 mt-1 leading-normal">
                      Kreasi manis kustomisasi untuk momen spesial Anda
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="shrink-0 rounded-full h-8 w-8 flex items-center justify-center text-neutral-400 hover:bg-pink-100/60 hover:text-pink-900 transition-colors text-sm font-bold"
                  >
                    ✕
                  </button>
                </div>

                {/* Step Navigation Tabs */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all ${
                      step === 1
                        ? "bg-pink-100/80 text-neutral-900 font-semibold border border-pink-300/70 shadow-xs"
                        : "bg-neutral-50 text-neutral-500 font-medium border border-neutral-200/60"
                    }`}
                  >
                    <span
                      className={`text-[10px] font-bold leading-none px-1.5 py-0.5 rounded-md ${
                        step === 1
                          ? "bg-pink-200/80 text-pink-900"
                          : "bg-neutral-200/60 text-neutral-600"
                      }`}
                    >
                      01
                    </span>
                    <span className="truncate leading-none p-1">
                      Konsep Pesanan
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all ${
                      step === 2
                        ? "bg-pink-100/80 text-neutral-900 font-semibold border border-pink-300/70 shadow-xs"
                        : "bg-neutral-50 text-neutral-500 font-medium border border-neutral-200/60"
                    }`}
                  >
                    <span
                      className={`text-[10px] font-bold leading-none px-1.5 py-0.5 rounded-md ${
                        step === 2
                          ? "bg-pink-200/80 text-pink-900"
                          : "bg-neutral-200/60 text-neutral-600"
                      }`}
                    >
                      02
                    </span>
                    <span className="truncate leading-none p-1">
                      Data & Pengiriman
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar px-5 py-4 sm:px-6 sm:py-5 space-y-4 sm:space-y-5">
                <AnimatePresence mode="wait">
                  {step === 1 ? (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 6 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-4 sm:space-y-5"
                    >
                      {/* Category Selection */}
                      <div className="space-y-1.5">
                        <FormField
                          label="Kategori Pilihan"
                          required
                          error={
                            touched1 && !typeOk
                              ? "Harap isi atau pilih kategori"
                              : undefined
                          }
                        >
                          <div className="relative">
                            <InputField
                              list="category-options"
                              placeholder="Ketik kategori atau pilih dari daftar..."
                              value={category}
                              onChange={(e) => setCategory(e.target.value)}
                            />
                            <datalist id="category-options">
                              {CATEGORIES.map((cat) => (
                                <option key={cat.id} value={cat.label}>
                                  {cat.desc}
                                </option>
                              ))}
                            </datalist>
                          </div>
                        </FormField>

                        {category.toLowerCase().includes("custom") && (
                          <div className="mt-2">
                            <FormField
                              label="Detail Request Custom"
                              required
                              error={
                                touched1 && !typeOk
                                  ? "Harap isi detail custom pesanan"
                                  : undefined
                              }
                            >
                              <InputField
                                placeholder="Contoh: Cupcake Tema Kelulusan 12 pcs"
                                value={customLabel}
                                onChange={(e) => setCustomLabel(e.target.value)}
                              />
                            </FormField>
                          </div>
                        )}
                      </div>

                      {/* Date & Quantity */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 items-start">
                        <FormField
                          label="Tanggal Acara"
                          required
                          hint="Pesan H-2"
                          error={
                            touched1 && !dateOk
                              ? "Pilih tanggal acara"
                              : undefined
                          }
                        >
                          <InputField
                            type="date"
                            min={minDate}
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                          />
                        </FormField>

                        <FormField label="Porsi / Ukuran">
                          <InputField
                            placeholder="Contoh: 1 Loyang, 20 Porsi, Loyang 22cm, dll."
                            value={qty}
                            onChange={(e) => setQty(e.target.value)}
                          />
                        </FormField>
                      </div>

                      {/* Theme & Details */}
                      <FormField label="Tema / Ucapan">
                        <TextareaField
                          rows={2}
                          placeholder="Contoh: Warna pink pastel, ucapan: Happy Birthday"
                          value={theme}
                          onChange={(e) => setTheme(e.target.value)}
                        />
                      </FormField>

                      {/* Photo Reference Upload */}
                      <div className="space-y-1.5">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-xs font-semibold text-neutral-800 leading-none">
                            Foto Referensi{" "}
                            <span className="font-normal text-neutral-400">
                              (Opsional)
                            </span>
                          </span>
                          <span className="text-[11px] font-normal text-neutral-400 leading-none shrink-0">
                            Lampirkan gambar contoh
                          </span>
                        </div>

                        {photo ? (
                          <div className="flex items-center justify-between rounded-xl border border-pink-200 bg-pink-50/30 p-2.5">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={photo}
                                alt="Referensi"
                                className="h-10 w-10 shrink-0 rounded-lg object-cover border border-pink-200"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-neutral-900 leading-tight truncate">
                                  Berhasil Diunggah
                                </p>
                                <p className="text-[10px] text-neutral-500 leading-tight truncate mt-0.5">
                                  Terlampir pada pemesanan
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setPhoto("")}
                              className="shrink-0 text-xs font-semibold text-pink-700 hover:text-pink-900 px-2 py-1"
                            >
                              Hapus
                            </button>
                          </div>
                        ) : (
                          <label
                            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-pink-300/80 bg-pink-50/20 p-3.5 text-center transition-all hover:bg-pink-50/50 hover:border-pink-300 ${
                              uploading || !isSupabaseConfigured
                                ? "opacity-50 pointer-events-none"
                                : ""
                            }`}
                          >
                            <span className="text-xs font-semibold text-pink-900 leading-none">
                              {uploading
                                ? "Mengunggah..."
                                : "Klik untuk Unggah Foto / Sketsa"}
                            </span>
                            <span className="text-[10px] text-neutral-500 mt-1 leading-none">
                              Format JPG, PNG (Maksimal 5MB)
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleFile}
                              disabled={uploading || !isSupabaseConfigured}
                            />
                          </label>
                        )}
                        {photoError && (
                          <p className="text-[11px] font-medium text-pink-600 leading-tight">
                            {photoError}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-4 sm:space-y-5"
                    >
                      {/* User Data Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 items-start">
                        <FormField
                          label="Nama Pemesan"
                          required
                          error={
                            touched2 && !nameOk
                              ? "Nama minimal 2 karakter"
                              : undefined
                          }
                        >
                          <InputField
                            placeholder="Nama lengkap Anda"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                          />
                        </FormField>

                        <FormField
                          label="Nomor WhatsApp"
                          required
                          error={
                            touched2 && !phoneOk
                              ? "Nomor WhatsApp tidak valid"
                              : undefined
                          }
                        >
                          <InputField
                            type="tel"
                            placeholder="Contoh: 08123456789"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                          />
                        </FormField>
                      </div>

                      {/* Method Selection */}
                      <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-neutral-800 leading-none">
                          Metode Penerimaan{" "}
                          <span className="text-pink-600 font-bold">*</span>
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setMethod("ambil")}
                            className={`rounded-xl border p-3 text-left transition-all ${
                              method === "ambil"
                                ? "border-pink-300 bg-pink-100/60 text-neutral-900 shadow-xs ring-1 ring-pink-300/50"
                                : "border-pink-100 bg-pink-50/10 text-neutral-800 hover:border-pink-200 hover:bg-pink-50/40"
                            }`}
                          >
                            <span className="text-xs font-bold leading-tight block">
                              Ambil di Toko
                            </span>
                            <span className="text-[10px] text-neutral-500 leading-tight block mt-0.5">
                              Tanpa biaya tambahan
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setMethod("antar")}
                            className={`rounded-xl border p-3 text-left transition-all ${
                              method === "antar"
                                ? "border-pink-300 bg-pink-100/60 text-neutral-900 shadow-xs ring-1 ring-pink-300/50"
                                : "border-pink-100 bg-pink-50/10 text-neutral-800 hover:border-pink-200 hover:bg-pink-50/40"
                            }`}
                          >
                            <span className="text-xs font-bold leading-tight block">
                              Antar Kurir
                            </span>
                            <span className="text-[10px] text-neutral-500 leading-tight block mt-0.5">
                              Kirim ke lokasi Anda
                            </span>
                          </button>
                        </div>
                      </div>

                      {needAddress && (
                        <FormField
                          label="Alamat Pengantaran"
                          required
                          error={
                            touched2 && !addressOk
                              ? "Alamat wajib diisi lengkap"
                              : undefined
                          }
                        >
                          <TextareaField
                            rows={2}
                            placeholder="Nama jalan, nomor rumah, RT/RW, patokan..."
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                          />
                        </FormField>
                      )}

                      <FormField label="Catatan Tambahan">
                        <TextareaField
                          rows={2}
                          placeholder="Contoh: Alergi bahan tertentu, waktu pengiriman khusus"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                        />
                      </FormField>

                      {/* Ringkasan Ringkas */}
                      <div className="rounded-xl border border-pink-200/80 bg-pink-50/30 p-3.5 text-xs space-y-2">
                        <div className="flex items-center justify-between font-bold text-neutral-900 border-b border-pink-200/50 pb-2">
                          <span className="leading-none">
                            Ringkasan Pesanan
                          </span>
                          <span className="rounded-md bg-pink-200/70 border border-pink-300/70 px-2 py-0.5 text-[10px] font-semibold text-pink-900 uppercase leading-none">
                            {method === "ambil" ? "Ambil Toko" : "Antar Kurir"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-neutral-500">
                            Jenis Pesanan:
                          </span>
                          <span className="font-semibold text-neutral-900 truncate max-w-[180px] text-right">
                            {finalType || "-"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-neutral-500">
                            Tanggal Acara:
                          </span>
                          <span className="font-semibold text-neutral-900">
                            {date || "-"}
                          </span>
                        </div>
                        {qty && (
                          <div className="flex justify-between items-center">
                            <span className="text-neutral-500">
                              Porsi / Ukuran:
                            </span>
                            <span className="font-semibold text-neutral-900">
                              {qty}
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Modal Footer Buttons */}
              <div className="shrink-0 border-t border-pink-100 bg-white px-5 py-3.5 sm:px-6 sm:py-4">
                {step === 1 ? (
                  <button
                    type="button"
                    onClick={goToStep2}
                    className="w-full rounded-xl bg-pink-400 border border-pink-300/80 py-2.5 sm:py-3 text-xs font-bold text-neutral-900 tracking-wide transition-all hover:bg-pink-300 active:scale-[0.99] shadow-xs"
                  >
                    Lanjutkan ke Data Pemesan →
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="rounded-xl border border-pink-200 px-3.5 py-2.5 sm:py-3 text-xs font-semibold text-neutral-700 hover:bg-pink-50 transition-colors"
                    >
                      ← Kembali
                    </button>
                    <button
                      type="button"
                      onClick={submit}
                      disabled={!canSubmit}
                      className="flex-1 rounded-xl bg-emerald-600 py-2.5 sm:py-3 text-xs font-bold text-white tracking-wide shadow-xs transition-all hover:bg-emerald-700 disabled:opacity-40 active:scale-[0.99]"
                    >
                      Kirim Pesanan via WhatsApp
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
