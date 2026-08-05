import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Check,
  Sparkles,
  Calendar,
  Palette,
  Wallet,
  FileText,
  MessageCircle,
  Store,
  Bike,
  ChevronLeft,
  Phone,
  MapPin,
  Upload,
  Cake,
  Gift,
  UtensilsCrossed,
  Users,
  ArrowRight,
} from "lucide-react";
import { bookingOrderUrl, type OrderMethod } from "../lib/whatsapp";
import { uploadImage } from "../lib/uploadImage";
import { isSupabaseConfigured } from "../lib/supabase";
import { kunciScroll } from "../lib/scrollLock";

/* ── Config ─────────────────────────────────────────────────────────────── */

const CATEGORIES = [
  {
    id: "Kue Ulang Tahun",
    label: "Kue Ulang Tahun",
    icon: Cake,
    desc: "Custom cake & tart",
  },
  {
    id: "Hampers / Parsel",
    label: "Hampers / Parsel",
    icon: Gift,
    desc: "Paket bingkisan",
  },
  {
    id: "Tumpeng / Tampah",
    label: "Tumpeng / Tampah",
    icon: UtensilsCrossed,
    desc: "Snack & sajan",
  },
  {
    id: "Custom Design",
    label: "Custom Design",
    icon: Sparkles,
    desc: "Request bebas",
  },
];

const QTY_SUGGESTIONS = [
  "10-15 Porsi",
  "20-25 Porsi",
  "Loyang 22cm",
  "Paket Acara",
];
const BUDGET_SUGGESTIONS = [
  "< Rp 300rb",
  "Rp 300-500rb",
  "Rp 500rb-1jt",
  "> Rp 1jt",
];

/* ── UI Sub-components ─────────────────────────────────────────────────── */

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
    <div className="space-y-1">
      <div className="flex items-center justify-between font-text text-[10px] font-bold tracking-wider text-cocoa-700 uppercase">
        <span>
          {label}{" "}
          {required && <span className="text-caramel font-bold">*</span>}
        </span>
        {hint && (
          <span className="text-cocoa-400 font-normal normal-case">{hint}</span>
        )}
      </div>
      {children}
      {error && (
        <p className="font-text text-[11px] font-medium text-rose-500">
          {error}
        </p>
      )}
    </div>
  );
}

function InputField({
  icon: Icon,
  error,
  className = "",
  ...props
}: {
  icon?: React.ElementType;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative flex items-center">
      {Icon && (
        <Icon className="pointer-events-none absolute left-3 h-4 w-4 text-cocoa-400" />
      )}
      <input
        {...props}
        className={`w-full rounded-lg border bg-white px-3 py-2 font-text text-xs text-cocoa-900 transition-all placeholder:text-cocoa-300 focus:outline-none focus:ring-2 focus:ring-caramel/20 focus:border-caramel ${
          Icon ? "pl-9" : ""
        } ${
          error
            ? "border-rose-400 ring-1 ring-rose-400/20"
            : "border-cocoa-200 hover:border-cocoa-300"
        } ${className}`}
      />
    </div>
  );
}

function TextareaField({
  icon: Icon,
  error,
  rows = 2,
  className = "",
  ...props
}: {
  icon?: React.ElementType;
  error?: string;
  rows?: number;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="relative flex">
      {Icon && (
        <Icon className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-cocoa-400" />
      )}
      <textarea
        {...props}
        rows={rows}
        className={`w-full rounded-lg border bg-white px-3 py-2 font-text text-xs text-cocoa-900 transition-all placeholder:text-cocoa-300 focus:outline-none focus:ring-2 focus:ring-caramel/20 focus:border-caramel ${
          Icon ? "pl-9" : ""
        } ${
          error
            ? "border-rose-400 ring-1 ring-rose-400/20"
            : "border-cocoa-200 hover:border-cocoa-300"
        } ${className}`}
      />
    </div>
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

  const [category, setCategory] = useState("Kue Ulang Tahun");
  const [customLabel, setCustomLabel] = useState("");
  const [photo, setPhoto] = useState("");
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [qty, setQty] = useState("");
  const [theme, setTheme] = useState("");
  const [budget, setBudget] = useState("");
  const [method, setMethod] = useState<OrderMethod>("ambil");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");

  const [touched1, setTouched1] = useState(false);
  const [touched2, setTouched2] = useState(false);

  const finalType =
    category === "Custom Design"
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
      setPhotoError(err instanceof Error ? err.message : "Gagal upload foto");
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
        budget: budget.trim(),
        method,
        address: address.trim(),
        note: note.trim(),
        photoUrl: photo || undefined,
      }),
      "_blank",
      "noopener,noreferrer",
    );
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Tutup"
            onClick={onClose}
            className="absolute inset-0 bg-cocoa-950/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/5"
          >
            {/* Modal Header */}
            <div className="shrink-0 border-b border-cocoa-100 bg-white px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-text text-[10px] font-bold tracking-wider text-caramel uppercase">
                    Mulya Bakery Order System
                  </p>
                  <h2 className="font-heading text-lg font-bold text-cocoa-900 sm:text-xl">
                    Form Booking Custom
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-cocoa-400 hover:bg-cocoa-50 hover:text-cocoa-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Minimal Step Indicator */}
              <div className="mt-3.5 flex items-center gap-2 border-t border-cocoa-100/60 pt-3">
                <div className="flex flex-1 items-center gap-2">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                      step === 1
                        ? "bg-cocoa-900 text-white"
                        : "bg-emerald-600 text-white"
                    }`}
                  >
                    {step === 1 ? "1" : <Check className="h-3 w-3" />}
                  </span>
                  <span
                    className={`font-text text-xs ${step === 1 ? "font-bold text-cocoa-900" : "text-cocoa-500"}`}
                  >
                    Konsep Pesanan
                  </span>
                </div>
                <div className="h-px w-6 bg-cocoa-200" />
                <div className="flex flex-1 items-center gap-2 justify-end">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                      step === 2
                        ? "bg-cocoa-900 text-white"
                        : "bg-cocoa-100 text-cocoa-400"
                    }`}
                  >
                    2
                  </span>
                  <span
                    className={`font-text text-xs ${step === 2 ? "font-bold text-cocoa-900" : "text-cocoa-400"}`}
                  >
                    Data Pemesan
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Body (Scrollable Container) */}
            <div className="min-h-0 flex-1 overflow-y-auto p-5 space-y-4">
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
                    {/* Category Selector (2x2 Grid) */}
                    <div className="space-y-1">
                      <span className="font-text text-[10px] font-bold tracking-wider text-cocoa-700 uppercase">
                        Kategori Pesanan <span className="text-caramel">*</span>
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {CATEGORIES.map((cat) => {
                          const isSelected = category === cat.id;
                          const Icon = cat.icon;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setCategory(cat.id)}
                              className={`flex items-start gap-2.5 rounded-lg border p-2.5 text-left transition-all ${
                                isSelected
                                  ? "border-caramel bg-caramel/5 ring-1 ring-caramel/30"
                                  : "border-cocoa-200/80 bg-white hover:border-cocoa-300"
                              }`}
                            >
                              <div
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                                  isSelected
                                    ? "bg-caramel text-white"
                                    : "bg-cocoa-100/60 text-cocoa-600"
                                }`}
                              >
                                <Icon className="h-3.5 w-3.5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-text text-xs font-bold text-cocoa-900 leading-tight truncate">
                                  {cat.label}
                                </p>
                                <p className="font-text text-[10px] text-cocoa-400 truncate">
                                  {cat.desc}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {category === "Custom Design" && (
                      <FormField
                        label="Nama Request Custom"
                        required
                        error={touched1 && !typeOk ? "Harap diisi" : undefined}
                      >
                        <InputField
                          placeholder="mis. Cupcake Set 12 pcs, Roti Sobek..."
                          value={customLabel}
                          onChange={(e) => setCustomLabel(e.target.value)}
                        />
                      </FormField>
                    )}

                    {/* Date & Quantity */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <FormField
                        label="Tanggal Acara"
                        required
                        hint="Min. H+2"
                        error={
                          touched1 && !dateOk ? "Pilih tanggal" : undefined
                        }
                      >
                        <InputField
                          type="date"
                          min={minDate}
                          icon={Calendar}
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                        />
                      </FormField>

                      <FormField label="Porsi / Ukuran">
                        <InputField
                          icon={Users}
                          placeholder="mis. 20 porsi / loyang 22cm"
                          value={qty}
                          onChange={(e) => setQty(e.target.value)}
                        />
                        <div className="mt-1 flex flex-wrap gap-1">
                          {QTY_SUGGESTIONS.map((item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => setQty(item)}
                              className="rounded border border-cocoa-200 bg-cocoa-50/50 px-1.5 py-0.5 font-text text-[10px] text-cocoa-600 hover:border-caramel hover:text-caramel"
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </FormField>
                    </div>

                    {/* Theme & Budget */}
                    <FormField label="Tema / Warna / Tulisan Ucapan">
                      <TextareaField
                        icon={Palette}
                        placeholder='mis. Tema Pastel Pink, tulisan "Happy Birthday Sarah"'
                        rows={2}
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                      />
                    </FormField>

                    <FormField label="Estimasi Budget">
                      <InputField
                        icon={Wallet}
                        placeholder="Rp 300.000 - Rp 500.000"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                      />
                      <div className="mt-1 flex flex-wrap gap-1">
                        {BUDGET_SUGGESTIONS.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setBudget(item)}
                            className="rounded border border-cocoa-200 bg-cocoa-50/50 px-1.5 py-0.5 font-text text-[10px] text-cocoa-600 hover:border-caramel hover:text-caramel"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </FormField>

                    {/* Photo Reference (Compact Dropzone) */}
                    <div className="space-y-1">
                      <span className="font-text text-[10px] font-bold tracking-wider text-cocoa-700 uppercase">
                        Foto Referensi{" "}
                        <span className="font-normal text-cocoa-400">
                          (Opsional)
                        </span>
                      </span>

                      {photo ? (
                        <div className="flex items-center gap-3 rounded-lg border border-cocoa-200 bg-white p-2">
                          <img
                            src={photo}
                            alt="Ref"
                            className="h-10 w-10 rounded object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-text text-xs font-semibold text-cocoa-800 truncate">
                              Foto Referensi Ter-upload
                            </p>
                            <p className="font-text text-[10px] text-cocoa-400">
                              Siap dikirimkan via WA
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPhoto("")}
                            className="p-1 text-cocoa-400 hover:text-rose-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <label
                          className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-cocoa-200 p-3 text-center transition-colors hover:bg-cocoa-50/50 ${
                            uploading || !isSupabaseConfigured
                              ? "opacity-50 pointer-events-none"
                              : ""
                          }`}
                        >
                          <Upload className="h-4 w-4 text-cocoa-400" />
                          <span className="font-text text-xs font-medium text-cocoa-600">
                            {uploading
                              ? "Mengunggah..."
                              : "Unggah Foto Contoh / Sketch"}
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
                        <p className="font-text text-[11px] font-medium text-rose-500">
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
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <FormField
                        label="Nama Lengkap"
                        required
                        error={touched2 && !nameOk ? "Isi nama" : undefined}
                      >
                        <InputField
                          icon={FileText}
                          placeholder="Nama Anda"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </FormField>

                      <FormField
                        label="No. WhatsApp"
                        required
                        error={
                          touched2 && !phoneOk
                            ? "No. WA tidak valid"
                            : undefined
                        }
                      >
                        <InputField
                          type="tel"
                          icon={Phone}
                          placeholder="08xxxxxxxxxx"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </FormField>
                    </div>

                    {/* Method Toggle */}
                    <div className="space-y-1">
                      <span className="font-text text-[10px] font-bold tracking-wider text-cocoa-700 uppercase">
                        Metode Pengambilan{" "}
                        <span className="text-caramel">*</span>
                      </span>
                      <div className="grid grid-cols-2 gap-2 rounded-lg bg-cocoa-50 p-1 border border-cocoa-100">
                        <button
                          type="button"
                          onClick={() => setMethod("ambil")}
                          className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 font-text text-xs font-semibold transition-all ${
                            method === "ambil"
                              ? "bg-white text-cocoa-900 shadow-sm"
                              : "text-cocoa-500 hover:text-cocoa-800"
                          }`}
                        >
                          <Store className="h-3.5 w-3.5" /> Ambil Toko
                        </button>
                        <button
                          type="button"
                          onClick={() => setMethod("antar")}
                          className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 font-text text-xs font-semibold transition-all ${
                            method === "antar"
                              ? "bg-white text-cocoa-900 shadow-sm"
                              : "text-cocoa-500 hover:text-cocoa-800"
                          }`}
                        >
                          <Bike className="h-3.5 w-3.5" /> Antar Kurir
                        </button>
                      </div>
                    </div>

                    {needAddress && (
                      <FormField
                        label="Alamat Pengantaran"
                        required
                        error={
                          touched2 && !addressOk
                            ? "Isi alamat lengkap"
                            : undefined
                        }
                      >
                        <TextareaField
                          icon={MapPin}
                          rows={2}
                          placeholder="Jalan, No. Rumah, Patokan..."
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                        />
                      </FormField>
                    )}

                    <FormField label="Catatan Tambahan">
                      <TextareaField
                        icon={FileText}
                        rows={2}
                        placeholder="Info alergi, ucapan khusus, dll."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                      />
                    </FormField>

                    {/* Summary Box */}
                    <div className="rounded-lg border border-cocoa-200/80 bg-cocoa-50/40 p-3 font-text text-xs space-y-1.5">
                      <div className="flex justify-between font-bold text-cocoa-900 border-b border-cocoa-200/60 pb-1">
                        <span>Ringkasan Order</span>
                        <span className="text-[10px] text-caramel uppercase font-semibold">
                          {method === "ambil" ? "Pick-Up Toko" : "Delivery"}
                        </span>
                      </div>
                      <div className="flex justify-between text-cocoa-600">
                        <span>Produk:</span>
                        <span className="font-semibold text-cocoa-900">
                          {finalType}
                        </span>
                      </div>
                      <div className="flex justify-between text-cocoa-600">
                        <span>Tanggal:</span>
                        <span className="font-semibold text-cocoa-900">
                          {date || "-"}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Modal Footer */}
            <div className="shrink-0 border-t border-cocoa-100 bg-white px-5 py-3.5">
              {step === 1 ? (
                <button
                  type="button"
                  onClick={goToStep2}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-cocoa-900 py-2.5 font-text text-xs font-bold text-white shadow hover:bg-cocoa-800 active:scale-[0.99] transition-all"
                >
                  Lanjut ke Data Pemesan <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center justify-center gap-1 rounded-xl border border-cocoa-200 px-3 py-2.5 font-text text-xs font-semibold text-cocoa-700 hover:bg-cocoa-50"
                  >
                    <ChevronLeft className="h-4 w-4" /> Kembali
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={!canSubmit}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 font-text text-xs font-bold text-white shadow hover:bg-emerald-700 disabled:opacity-50 transition-all active:scale-[0.99]"
                  >
                    <MessageCircle className="h-4 w-4 fill-current" />
                    Kirim via WhatsApp
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
