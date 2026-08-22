import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Store,
  Bike,
  MessageCircle,
  AlertCircle,
  Loader2,
  MapPin,
  ShoppingBag,
} from "lucide-react";
import { bookingOrderUrl, type OrderMethod } from "../lib/whatsapp";
import { uploadImage } from "../lib/uploadImage";
import { supabase, readableError, isSupabaseConfigured } from "../lib/supabase";
import { kunciScroll } from "../lib/scrollLock";
import OrderSuccess from "./OrderSuccess";
import ReviewModal from "./ReviewModal";
import LocationPickerModal from "./LocationPickerModal";

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

/* ── Main Modal ──────────────────────────────────────────────────────────── */

interface HasilCustom {
  orderCode: string;
  reviewToken: string | null;
  waUrl: string;
  waDiblokir: boolean;
}

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

  const [mengirim, setMengirim] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [hasil, setHasil] = useState<HasilCustom | null>(null);
  const idemRef = useRef<string | null>(null);

  // Modal pilih lokasi (MapLibre + lokasi saat ini + reverse-geocode).
  const [pilihLokasiBuka, setPilihLokasiBuka] = useState(false);

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
      if (e.key === "Escape") {
        if (hasil) tutupSemua();
        else onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, hasil]);

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

  const resetForm = () => {
    setStep(1);
    setCategory("");
    setCustomLabel("");
    setPhoto("");
    setPhotoError(null);
    setName("");
    setPhone("");
    setDate("");
    setQty("");
    setTheme("");
    setMethod("ambil");
    setAddress("");
    setNote("");
    setTouched1(false);
    setTouched2(false);
    setGalat(null);
    idemRef.current = null;
  };

  const tutupSemua = () => {
    setUlasanTerbuka(false);
    onClose();
    window.setTimeout(() => {
      setHasil(null);
      resetForm();
    }, 320);
  };

  // Buka ulasan OTOMATIS setelah pesanan custom tersimpan & layar sukses tampil.
  useEffect(() => {
    if (!hasil) return;
    const timer = window.setTimeout(() => {
      setUlasanTerbuka(true);
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [hasil]);

  const kirim = async () => {
    setTouched2(true);
    setGalat(null);
    if (!canSubmit) return;

    const waTab = window.open("", "_blank");
    setMengirim(true);

    try {
      let orderCode: string | null = null;
      let reviewToken: string | null = null;

      if (supabase) {
        if (!idemRef.current) {
          idemRef.current =
            typeof crypto !== "undefined" && crypto.randomUUID
              ? crypto.randomUUID()
              : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        }

        const { data, error } = await supabase.rpc("create_custom_order", {
          payload: {
            idempotency_key: idemRef.current,
            customer_name: name.trim(),
            customer_phone: phone.trim(),
            method,
            address: address.trim() || null,
            note: note.trim() || null,
            category: finalType,
            custom_label: customLabel.trim() || null,
            event_date: date,
            quantity: qty.trim() || null,
            theme: theme.trim() || null,
            photo_url: photo || null,
          },
        });

        if (error) throw error;
        const baris = Array.isArray(data) ? data[0] : data;
        orderCode = baris?.order_code ?? null;
        reviewToken = baris?.review_token ?? null;
      }

      const waUrl = bookingOrderUrl(
        {
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
        },
        orderCode,
      );

      let diblokir = true;
      if (waTab && !waTab.closed) {
        waTab.location.href = waUrl;
        diblokir = false;
      }

      setHasil({
        orderCode: orderCode ?? "—",
        reviewToken,
        waUrl,
        waDiblokir: diblokir,
      });
      idemRef.current = null;
    } catch (err) {
      try {
        waTab?.close();
      } catch {
        /* ignore */
      }
      console.error("[BookingModal] gagal membuat pesanan custom:", err);
      setGalat(readableError(err));
    } finally {
      setMengirim(false);
    }
  };

  return (
    <>
      {/* Import Font Itim & Utility Class penyembunyi scrollbar */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Itim&display=swap');
        .font-section3-p {
          font-family: 'Itim', cursive, sans-serif !important;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Form ulasan otomatis muncul setelah booking dikirim */}
      <ReviewModal
        open={ulasanTerbuka}
        onClose={() => setUlasanTerbuka(false)}
        reviewToken={hasil?.reviewToken ?? null}
      />

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-end justify-center p-3 sm:items-center sm:p-4 md:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Overlay */}
            <button
              type="button"
              aria-label="Tutup pemesanan khusus"
              onClick={hasil ? tutupSemua : onClose}
              className="absolute inset-0 bg-cocoa-900/50 backdrop-blur-sm"
            />

            {/* Modal Container (di tengah) */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={hasil ? "Pesanan khusus terkirim" : "Pemesanan Khusus"}
              initial={{ opacity: 0, scale: 0.97, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="relative flex max-h-[90dvh] sm:max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl bg-paper-100 shadow-cocoa-lg ring-1 ring-cocoa-700/10"
            >

              {/* Header */}
              <div className="flex items-center justify-between border-b border-cocoa-700/10 px-4 sm:px-5 py-3.5 sm:py-4 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <ShoppingBag
                    className="h-5 w-5 shrink-0 text-cocoa-800"
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <h2 className="font-heading text-lg sm:text-xl text-cocoa-800 truncate">
                      Pemesanan Khusus
                    </h2>
                    <p className="font-section3-p text-xs text-cocoa-700/60">
                      Kreasi manis kustomisasi untuk momen spesial Anda
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={hasil ? tutupSemua : onClose}
                  aria-label="Tutup"
                  className="rounded-full p-2 text-cocoa-700/70 transition-colors hover:bg-paper-200 hover:text-cocoa-900 shrink-0"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              {hasil ? (
                <OrderSuccess
                  orderCode={hasil.orderCode}
                  waUrl={hasil.waUrl}
                  waDiblokir={hasil.waDiblokir}
                  onBukaUlasan={() => setUlasanTerbuka(true)}
                  onSelesai={tutupSemua}
                />
              ) : (
                <>
                  {/* Container form (ditambahkan kelas no-scrollbar) */}
                  <div className="flex-1 overflow-y-auto no-scrollbar px-4 sm:px-5 py-4 space-y-5">
                    {/* Step Navigation Tabs */}
                    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-paper-200 p-1">
                      {(
                        [
                          { n: "01", label: "Konsep Pesanan", aktif: step === 1 },
                          { n: "02", label: "Data & Pengiriman", aktif: step === 2 },
                        ] as const
                      ).map((t) => (
                        <button
                          key={t.n}
                          type="button"
                          aria-pressed={t.aktif}
                          onClick={() => {
                            if (t.n === "01") setStep(1);
                            else goToStep2();
                          }}
                          className={`flex items-center justify-center gap-1.5 rounded-xl px-1 py-2 font-section3-p text-xs sm:text-sm font-bold transition-all ${
                            t.aktif
                              ? "bg-cocoa-800 text-paper-50 shadow-cocoa"
                              : "text-cocoa-700/70 hover:text-cocoa-900"
                          }`}
                        >
                          <span
                            className={`shrink-0 text-[10px] font-bold leading-none px-1.5 py-0.5 rounded-md ${
                              t.aktif
                                ? "bg-paper-50/20 text-paper-50"
                                : "bg-paper-50 text-cocoa-700/60"
                            }`}
                          >
                            {t.n}
                          </span>
                          <span className="min-w-0 truncate">{t.label}</span>
                        </button>
                      ))}
                    </div>

                    <AnimatePresence mode="wait">
                      {step === 1 ? (
                        <motion.div
                          key="step1"
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 6 }}
                          transition={{ duration: 0.15 }}
                          className="space-y-4"
                        >
                          {/* Category Selection */}
                          <Field
                            label="Kategori Pilihan"
                            required
                            error={
                              touched1 && !typeOk
                                ? "Harap isi atau pilih kategori"
                                : undefined
                            }
                          >
                            <input
                              list="category-options"
                              placeholder="Ketik kategori atau pilih dari daftar..."
                              value={category}
                              onChange={(e) => setCategory(e.target.value)}
                              className={inputCls}
                            />
                            <datalist id="category-options">
                              {CATEGORIES.map((cat) => (
                                <option key={cat.id} value={cat.label}>
                                  {cat.desc}
                                </option>
                              ))}
                            </datalist>
                          </Field>

                          {category.toLowerCase().includes("custom") && (
                            <Field
                              label="Detail Request Custom"
                              required
                              error={
                                touched1 && !typeOk
                                  ? "Harap isi detail custom pesanan"
                                  : undefined
                              }
                            >
                              <input
                                placeholder="Contoh: Cupcake Tema Kelulusan 12 pcs"
                                value={customLabel}
                                onChange={(e) =>
                                  setCustomLabel(e.target.value)
                                }
                                className={inputCls}
                              />
                            </Field>
                          )}

                          {/* Date & Quantity */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                            <Field
                              label="Tanggal Acara"
                              required
                              hint="Pesan H-2"
                              error={
                                touched1 && !dateOk
                                  ? "Pilih tanggal acara"
                                  : undefined
                              }
                            >
                              <input
                                type="date"
                                min={minDate}
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className={inputCls}
                              />
                            </Field>

                            <Field label="Porsi / Ukuran">
                              <input
                                placeholder="Contoh: 1 Loyang, 20 Porsi, Loyang 22cm, dll."
                                value={qty}
                                onChange={(e) => setQty(e.target.value)}
                                className={inputCls}
                              />
                            </Field>
                          </div>

                          {/* Theme & Details */}
                          <Field label="Tema / Ucapan">
                            <textarea
                              rows={2}
                              placeholder="Contoh: Warna pink pastel, ucapan: Happy Birthday"
                              value={theme}
                              onChange={(e) => setTheme(e.target.value)}
                              className={inputCls}
                            />
                          </Field>

                          {/* Photo Reference Upload */}
                          <Field label="Foto referensi (opsional)">
                            {photo ? (
                              <div className="flex items-center gap-3">
                                <img
                                  src={photo}
                                  alt="Pratinjau foto referensi"
                                  className="h-16 w-16 rounded-xl object-cover ring-1 ring-cocoa-700/15"
                                />
                                <button
                                  type="button"
                                  onClick={() => setPhoto("")}
                                  className="font-section3-p text-sm font-semibold text-red-500 hover:underline"
                                >
                                  Hapus foto
                                </button>
                              </div>
                            ) : (
                              <label
                                className={`flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-cocoa-700/30 px-4 py-3 text-center font-section3-p text-sm text-cocoa-700/80 transition-colors hover:bg-paper-200 ${
                                  uploading || !isSupabaseConfigured
                                    ? "pointer-events-none opacity-60"
                                    : ""
                                }`}
                              >
                                {uploading
                                  ? "Mengunggah…"
                                  : isSupabaseConfigured
                                    ? "Tambah foto — JPG/PNG/WEBP · maks 5 MB"
                                    : "Upload foto belum aktif"}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="sr-only"
                                  disabled={
                                    uploading || !isSupabaseConfigured
                                  }
                                  onChange={handleFile}
                                />
                              </label>
                            )}
                            {photoError && (
                              <span className="mt-1 block font-section3-p text-xs text-red-500">
                                {photoError}
                              </span>
                            )}
                          </Field>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="step2"
                          initial={{ opacity: 0, x: 6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -6 }}
                          transition={{ duration: 0.15 }}
                          className="space-y-4"
                        >
                          {/* User Data Inputs */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                            <Field
                              label="Nama Pemesan"
                              required
                              error={
                                touched2 && !nameOk
                                  ? "Nama minimal 2 karakter"
                                  : undefined
                              }
                            >
                              <input
                                placeholder="Nama lengkap Anda"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoComplete="name"
                                className={inputCls}
                              />
                            </Field>

                            <Field
                              label="Nomor WhatsApp"
                              required
                              error={
                                touched2 && !phoneOk
                                  ? "Nomor WhatsApp tidak valid"
                                  : undefined
                              }
                            >
                              <input
                                type="tel"
                                inputMode="tel"
                                placeholder="Contoh: 08123456789"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                autoComplete="tel"
                                className={inputCls}
                              />
                            </Field>
                          </div>

                          {/* Method Selection */}
                          <div>
                            <span className="font-section3-p text-xs font-bold text-cocoa-700/90">
                              Metode Penerimaan{" "}
                              <span className="text-red-500">*</span>
                            </span>
                            <div className="mt-1.5 grid grid-cols-2 gap-2 rounded-2xl bg-paper-200 p-1">
                              <button
                                type="button"
                                onClick={() => setMethod("ambil")}
                                aria-pressed={method === "ambil"}
                                className={`flex items-center justify-center gap-1.5 rounded-xl py-2 font-section3-p text-sm font-bold transition-all ${
                                  method === "ambil"
                                    ? "bg-cocoa-800 text-paper-50 shadow-cocoa"
                                    : "text-cocoa-700/70 hover:text-cocoa-900"
                                }`}
                              >
                                <Store
                                  className="h-4 w-4 shrink-0"
                                  aria-hidden
                                />
                                <span className="min-w-0 truncate">Ambil di toko</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setMethod("antar")}
                                aria-pressed={method === "antar"}
                                className={`flex items-center justify-center gap-1.5 rounded-xl py-2 font-section3-p text-sm font-bold transition-all ${
                                  method === "antar"
                                    ? "bg-cocoa-800 text-paper-50 shadow-cocoa"
                                    : "text-cocoa-700/70 hover:text-cocoa-900"
                                }`}
                              >
                                <Bike className="h-4 w-4 shrink-0" aria-hidden />
                                <span className="min-w-0 truncate">Antar kurir</span>
                              </button>
                            </div>
                          </div>

                          <AnimatePresence initial={false}>
                            {needAddress && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <Field
                                  label="Alamat pengantaran"
                                  required
                                  hint={`${address.length}/300`}
                                  error={
                                    touched2 && !addressOk
                                      ? "Alamat wajib diisi lengkap"
                                      : undefined
                                  }
                                >
                                  <textarea
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    rows={2}
                                    maxLength={300}
                                    placeholder="Nama jalan, nomor rumah, RT/RW, patokan..."
                                    className={inputCls}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setPilihLokasiBuka(true)}
                                    className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-cocoa-700/30 px-4 py-2.5 text-center font-section3-p text-sm text-cocoa-700/80 transition-colors hover:bg-paper-200"
                                  >
                                    <MapPin
                                      className="h-4 w-4 shrink-0"
                                      aria-hidden
                                    />
                                    Pilih lokasi dari peta
                                  </button>
                                </Field>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <Field label="Catatan Tambahan">
                            <textarea
                              rows={2}
                              placeholder="Contoh: Alergi bahan tertentu, waktu pengiriman khusus"
                              value={note}
                              onChange={(e) => setNote(e.target.value)}
                              className={inputCls}
                            />
                          </Field>

                          {/* Ringkasan Pesanan */}
                          <div className="rounded-2xl bg-paper-50 p-3.5 ring-1 ring-cocoa-700/10">
                            <div className="flex items-center justify-between border-b border-cocoa-700/10 pb-2">
                              <span className="font-section3-p text-sm font-bold text-cocoa-800">
                                Ringkasan Pesanan
                              </span>
                              <span className="rounded-full bg-cocoa-800 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-paper-50">
                                {method === "ambil"
                                  ? "Ambil Toko"
                                  : "Antar Kurir"}
                              </span>
                            </div>
                            <div className="mt-2.5 space-y-1.5">
                              <div className="flex items-center justify-between gap-3">
                                <span className="shrink-0 font-section3-p text-xs text-cocoa-700/70">
                                  Jenis Pesanan:
                                </span>
                                <span className="min-w-0 truncate font-section3-p text-xs font-bold text-cocoa-800 text-right max-w-[180px]">
                                  {finalType || "-"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-3">
                                <span className="font-section3-p text-xs text-cocoa-700/70">
                                  Tanggal Acara:
                                </span>
                                <span className="font-section3-p text-xs font-bold text-cocoa-800">
                                  {date || "-"}
                                </span>
                              </div>
                              {qty && (
                                <div className="flex items-center justify-between gap-3">
                                  <span className="shrink-0 font-section3-p text-xs text-cocoa-700/70">
                                    Porsi / Ukuran:
                                  </span>
                                  <span className="min-w-0 truncate font-section3-p text-xs font-bold text-cocoa-800 text-right max-w-[180px]">
                                    {qty}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Footer */}
                  <div className="border-t border-cocoa-700/10 bg-paper-50 px-4 sm:px-5 py-3.5 sm:py-4 shrink-0">
                    {galat && (
                      <div
                        role="alert"
                        className="mb-3 flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 ring-1 ring-red-200"
                      >
                        <AlertCircle
                          className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
                          aria-hidden
                        />
                        <p className="font-section3-p text-xs sm:text-sm text-red-700">
                          {galat}
                        </p>
                      </div>
                    )}

                    {step === 1 ? (
                      <button
                        type="button"
                        onClick={goToStep2}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-cocoa-800 px-5 py-3 font-section3-p text-base font-bold text-paper-50 shadow-cocoa transition-all hover:-translate-y-0.5 hover:bg-cocoa-900 active:scale-[0.99]"
                      >
                        Lanjutkan ke Data Pemesan →
                      </button>
                    ) : (
                      <>
                        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                          <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="w-full rounded-full px-4 py-3 font-section3-p text-sm font-bold text-cocoa-800 ring-1 ring-cocoa-700/20 transition-colors hover:bg-paper-200 sm:w-auto"
                          >
                            ← Kembali
                          </button>
                          <button
                            type="button"
                            onClick={kirim}
                            disabled={!canSubmit}
                            className="inline-flex w-full flex-1 items-center justify-center gap-2 rounded-full bg-cocoa-800 px-5 py-3 font-section3-p text-base font-bold text-paper-50 shadow-cocoa transition-all hover:-translate-y-0.5 hover:bg-cocoa-900 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 active:scale-[0.99]"
                          >
                            {mengirim ? (
                              <>
                                <Loader2
                                  className="h-5 w-5 animate-spin"
                                  aria-hidden
                                />
                                <span>Menyimpan pesanan…</span>
                              </>
                            ) : (
                              <>
                                <MessageCircle className="h-5 w-5" aria-hidden />
                                <span>Kirim via WhatsApp</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="mt-2 text-center font-section3-p text-xs text-cocoa-700/70">
                          Pesanan diteruskan ke WhatsApp owner untuk dikonfirmasi.
                        </p>
                      </>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal pilih lokasi pengiriman */}
      <LocationPickerModal
        open={pilihLokasiBuka}
        onClose={() => setPilihLokasiBuka(false)}
        onPilih={(alamat) => {
          setAddress(alamat);
          setPilihLokasiBuka(false);
        }}
      />
    </>
  );
}

const inputCls =
  "w-full rounded-xl bg-paper-50 px-3.5 py-2 sm:py-2.5 font-section3-p text-sm text-cocoa-800 ring-1 ring-cocoa-700/15 transition-shadow placeholder:text-cocoa-700/40 focus:outline-none focus:ring-2 focus:ring-caramel";

function Field({
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
    <label className="block">
      <span className="mb-1 flex items-baseline justify-between gap-2">
        <span className="font-section3-p text-xs font-bold text-cocoa-700/90">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </span>
        {hint && (
          <span className="font-section3-p text-[11px] text-cocoa-700/50">
            {hint}
          </span>
        )}
      </span>
      {children}
      {error && (
        <span className="mt-1 block font-section3-p text-xs text-red-500">
          {error}
        </span>
      )}
    </label>
  );
}