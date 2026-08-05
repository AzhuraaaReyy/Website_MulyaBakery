import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Store,
  Bike,
  MessageCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useCart, type CartItem } from "../context/CartContext";
import { formatPrice } from "../data/products";
import {
  cartOrderMessage,
  buildWhatsAppUrl,
  pesanTerlaluPanjang,
  type OrderMethod,
} from "../lib/whatsapp";
import { supabase, readableError, isSupabaseConfigured } from "../lib/supabase";
import { uploadImage } from "../lib/uploadImage";
import { beritahu } from "../lib/dataevents";
import { kunciScroll } from "../lib/scrollLock";
import OrderSuccess from "./OrderSuccess";
import ReviewModal from "./ReviewModal";

interface HasilPesanan {
  orderCode: string;
  reviewToken: string | null;
  waUrl: string;
  waDiblokir: boolean;
  produk: { id: string; name: string }[];
}

/**
 * Keranjang + form checkout (drawer kanan).
 *
 * ALUR CHECKOUT (penting untuk dipahami sebelum mengubah apa pun):
 *   1. Tab kosong dibuka SEKARANG JUGA, selagi masih di dalam gestur klik.
 *   2. Pesanan disimpan ke database → dapat kode pesanan & token ulasan.
 *   3. Tab yang tadi dibuka diarahkan ke wa.me.
 *   4. Tab situs ini TIDAK ikut pindah — isinya berganti jadi layar konfirmasi.
 *
 * Langkah 1 terlihat aneh tapi wajib. Kalau `window.open` dipanggil setelah
 * `await`, peramban sudah menganggap gestur klik selesai dan memblokirnya
 * sebagai popup. Membuka tab lebih dulu lalu mengarahkannya belakangan adalah
 * satu-satunya cara yang bekerja andal di Safari iOS.
 */
export default function CartModal() {
  const { items, total, isOpen, close, setQty, remove, clear } = useCart();
  const isMobile = useIsMobile();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState<OrderMethod>("antar");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");
  const [uploadFoto, setUploadFoto] = useState(false);
  const [galatFoto, setGalatFoto] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const pilihFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // reset agar foto sama bisa dipilih ulang
    if (!file) return;
    setGalatFoto(null);
    setUploadFoto(true);
    try {
      setFotoUrl(await uploadImage(file, "pesanan"));
    } catch (err) {
      setGalatFoto(
        err instanceof Error ? err.message : "Gagal mengunggah foto.",
      );
    } finally {
      setUploadFoto(false);
    }
  };

  const [mengirim, setMengirim] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [hasil, setHasil] = useState<HasilPesanan | null>(null);
  const [ulasanTerbuka, setUlasanTerbuka] = useState(false);

  // Kunci idempotency dibuat sekali per isi keranjang. Kalau pelanggan menekan
  // tombol dua kali atau koneksinya putus lalu mengulang, server mengenali
  // kunci yang sama dan mengembalikan pesanan yang SUDAH ada — bukan bikin baru.
  const idemRef = useRef<string | null>(null);

  /* Kunci scroll halaman selama drawer terbuka.
     Efek ini SENGAJA hanya bergantung pada `isOpen`. Versi sebelumnya ikut
     menyertakan `ulasanTerbuka`, sehingga efeknya dijalankan ulang setiap kali
     modal ulasan dibuka — dan pada saat itu ia merekam `hidden` sebagai
     "keadaan asli" halaman. Ketika semuanya ditutup, nilai yang dipulihkan
     adalah `hidden`, dan halaman tidak bisa digulir lagi sampai di-refresh. */
  useEffect(() => {
    if (!isOpen) return;
    return kunciScroll();
  }, [isOpen]);

  // Tombol Escape ditangani terpisah, karena inilah yang memang perlu tahu
  // apakah modal ulasan sedang terbuka di atas drawer.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !ulasanTerbuka) close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close, ulasanTerbuka]);

  const needAddress = method === "antar";
  const nameOk = name.trim().length >= 2 && name.trim().length <= 60;
  // Nomor HP Indonesia: 08xx / 62xx / +62xx. Validasi lama ("minimal 8 angka")
  // meloloskan "aaaa12345678" — owner menelepon balik ke nomor yang salah.
  const phoneOk = /^(0|62)8[1-9][0-9]{6,11}$/.test(phone.replace(/\D/g, ""));
  const addressOk = !needAddress || address.trim().length >= 5;
  const canCheckout =
    items.length > 0 &&
    nameOk &&
    phoneOk &&
    addressOk &&
    !mengirim &&
    !uploadFoto;

  const pesanPratinjau = cartOrderMessage(items, {
    name: name.trim(),
    phone: phone.trim(),
    method,
    address: address.trim(),
    note: note.trim(),
    photoUrl: fotoUrl || undefined,
  });
  const kepanjangan = pesanTerlaluPanjang(pesanPratinjau);

  const resetForm = () => {
    setName("");
    setPhone("");
    setAddress("");
    setNote("");
    setFotoUrl("");
    setGalatFoto(null);
    setMethod("antar");
    setTouched(false);
    setGalat(null);
    idemRef.current = null;
  };

  const tutupSemua = () => {
    // Modal ulasan ikut ditutup. Kalau dibiarkan terbuka sementara drawer di
    // bawahnya sudah hilang, kuncinya tidak pernah dilepas.
    setUlasanTerbuka(false);
    close();
    // Tunda agar animasi keluar drawer selesai dulu sebelum isinya berganti.
    window.setTimeout(() => {
      setHasil(null);
      resetForm();
    }, 320);
  };

  const checkout = async () => {
    setTouched(true);
    setGalat(null);
    if (!canCheckout) return;

    // ── Langkah 1: buka tab SEKARANG (masih di dalam gestur klik) ──────────
    // Sengaja tanpa 'noopener': kita butuh pegangan ke tab itu agar bisa
    // diarahkan setelah pesanan tersimpan. Tujuannya wa.me — domain resmi
    // WhatsApp — jadi risiko tab-nabbing tidak berlaku di sini. Tombol
    // cadangan di layar konfirmasi tetap memakai rel="noopener noreferrer".
    const waTab = window.open("", "_blank");

    setMengirim(true);
    const daftarProduk = items.map(({ product }) => ({
      id: product.id,
      name: product.name,
    }));

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

        const { data, error } = await supabase.rpc("create_order", {
          payload: {
            idempotency_key: idemRef.current,
            customer_name: name.trim(),
            customer_phone: phone.trim(),
            method,
            address: address.trim() || null,
            note: note.trim() || null,
            // Hanya id & jumlah yang dikirim. HARGA TIDAK DIKIRIM —
            // server mengambilnya sendiri dari tabel produk. Kalau harga
            // dipercaya dari browser, siapa pun bisa memesan seharga Rp 1.
            items: items.map(({ product, qty }) => ({
              product_id: product.id,
              qty,
            })),
          },
        });

        if (error) throw error;
        const baris = Array.isArray(data) ? data[0] : data;
        orderCode = baris?.order_code ?? null;
        reviewToken = baris?.review_token ?? null;
      }

      // ── Langkah 3: arahkan tab WhatsApp ─────────────────────────────────
      const waUrl = buildWhatsAppUrl(
        cartOrderMessage(
          items,
          {
            name: name.trim(),
            phone: phone.trim(),
            method,
            address: address.trim(),
            note: note.trim(),
            photoUrl: fotoUrl || undefined,
          },
          orderCode,
        ),
      );

      let diblokir = true;
      if (waTab && !waTab.closed) {
        waTab.location.href = waUrl;
        diblokir = false;
      }

      // ── Langkah 4: tab ini berganti ke layar konfirmasi ──────────────────
      setHasil({
        orderCode: orderCode ?? "—",
        reviewToken,
        waUrl,
        waDiblokir: diblokir,
        produk: daftarProduk,
      });
      clear();
      idemRef.current = null;

      // Angka "terjual" di database baru saja bertambah. Beri tahu kartu menu
      // supaya ikut berubah sekarang juga, bukan menunggu halaman dimuat ulang.
      if (orderCode) beritahu("menu");
    } catch (err) {
      // Tab kosong yang terlanjur dibuka harus ditutup, jangan ditinggal
      // menganga tanpa isi — itu terlihat seperti situs yang rusak.
      try {
        waTab?.close();
      } catch {
        /* sebagian peramban menolak menutup tab yang dibuka skrip */
      }
      console.error("[CartModal] gagal membuat pesanan:", err);
      setGalat(readableError(err));
    } finally {
      setMengirim(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-end justify-center sm:items-stretch sm:justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Overlay */}
            <button
              type="button"
              aria-label="Tutup keranjang"
              onClick={hasil ? tutupSemua : close}
              className="absolute inset-0 bg-cocoa-900/50 backdrop-blur-sm"
            />

            {/* Panel — bottom sheet di mobile, side drawer di desktop.
                Arah animasi ikut viewport: naik dari bawah (HP) / geser dari
                kanan (desktop). */}
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label={hasil ? "Pesanan berhasil" : "Keranjang belanja"}
              initial={isMobile ? { y: "100%" } : { x: "100%" }}
              animate={isMobile ? { y: 0 } : { x: 0 }}
              exit={isMobile ? { y: "100%" } : { x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="relative flex max-h-[92vh] w-full flex-col rounded-t-3xl bg-paper-100 shadow-cocoa-lg sm:h-full sm:max-h-none sm:max-w-md sm:rounded-t-none"
            >
              {/* Pegangan geser — hanya di mobile (bottom sheet) */}
              <div className="flex justify-center pt-2.5 sm:hidden" aria-hidden>
                <span className="h-1.5 w-10 rounded-full bg-cocoa-700/20" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between border-b border-cocoa-700/10 px-5 py-3.5 sm:py-4">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="h-5 w-5 text-cocoa-800" aria-hidden />
                  <h2 className="font-heading text-xl text-cocoa-800">
                    {hasil ? "Pesanan Terkirim" : "Keranjang"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={hasil ? tutupSemua : close}
                  aria-label="Tutup"
                  className="rounded-full p-2 text-cocoa-700/70 transition-colors hover:bg-paper-200 hover:text-cocoa-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* ── Layar konfirmasi setelah checkout ────────────────────── */}
              {hasil ? (
                <OrderSuccess
                  orderCode={hasil.orderCode}
                  waUrl={hasil.waUrl}
                  waDiblokir={hasil.waDiblokir}
                  onBukaUlasan={() => setUlasanTerbuka(true)}
                  onSelesai={tutupSemua}
                />
              ) : items.length === 0 ? (
                /* Keranjang kosong */
                <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-paper-200 text-cocoa-700/50">
                    <ShoppingBag className="h-7 w-7" aria-hidden />
                  </span>
                  <p className="font-heading text-lg text-cocoa-800">
                    Keranjang masih kosong
                  </p>
                  <p className="font-text text-sm text-cocoa-700/70">
                    Pilih roti favoritmu, lalu tekan “Tambah”.
                  </p>
                  <button
                    type="button"
                    onClick={close}
                    className="btn-cocoa mt-2"
                  >
                    Lihat menu
                  </button>
                </div>
              ) : (
                <>
                  {/* Isi keranjang + form (scroll) */}
                  <div className="flex-1 overflow-y-auto px-5 py-4">
                    {/* Daftar item */}
                    <ul className="flex flex-col gap-3">
                      {items.map(({ product, qty }: CartItem) => (
                        <li
                          key={product.id}
                          className="flex gap-3 rounded-2xl bg-paper-50 p-3 ring-1 ring-cocoa-700/10"
                        >
                          <img
                            src={product.image}
                            alt=""
                            aria-hidden
                            onError={(e) => {
                              e.currentTarget.style.visibility = "hidden";
                            }}
                            className="h-16 w-16 shrink-0 rounded-xl bg-paper-200 object-cover"
                          />
                          <div className="flex min-w-0 flex-1 flex-col">
                            <p className="truncate font-heading text-sm text-cocoa-800">
                              {product.name}
                            </p>
                            <p className="font-text text-xs font-bold text-caramel">
                              {formatPrice(product.price)}
                            </p>

                            <div className="mt-auto flex items-center justify-between pt-2">
                              {/* Stepper jumlah */}
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setQty(product.id, qty - 1)}
                                  aria-label={`Kurangi ${product.name}`}
                                  className="flex h-7 w-7 items-center justify-center rounded-full bg-paper-200 text-cocoa-800 transition-colors hover:bg-cocoa-800 hover:text-paper-50"
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="w-6 text-center font-text text-sm font-bold text-cocoa-800">
                                  {qty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setQty(product.id, Math.min(999, qty + 1))
                                  }
                                  aria-label={`Tambah ${product.name}`}
                                  className="flex h-7 w-7 items-center justify-center rounded-full bg-paper-200 text-cocoa-800 transition-colors hover:bg-cocoa-800 hover:text-paper-50"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => remove(product.id)}
                                aria-label={`Hapus ${product.name}`}
                                className="rounded-full p-1.5 text-cocoa-700/50 transition-colors hover:bg-red-50 hover:text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>

                    {/* ── Form data diri ─────────────────────────────── */}
                    <div className="mt-6 border-t border-cocoa-700/10 pt-5">
                      <h3 className="font-heading text-base text-cocoa-800">
                        Data pemesan
                      </h3>

                      {/* Toggle metode */}
                      <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl bg-paper-200 p-1">
                        <button
                          type="button"
                          onClick={() => setMethod("antar")}
                          aria-pressed={method === "antar"}
                          className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 font-text text-sm font-bold transition-colors ${
                            method === "antar"
                              ? "bg-cocoa-800 text-paper-50 shadow-cocoa"
                              : "text-cocoa-700/70 hover:text-cocoa-900"
                          }`}
                        >
                          <Bike className="h-4 w-4" aria-hidden /> Diantar
                        </button>
                        <button
                          type="button"
                          onClick={() => setMethod("ambil")}
                          aria-pressed={method === "ambil"}
                          className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 font-text text-sm font-bold transition-colors ${
                            method === "ambil"
                              ? "bg-cocoa-800 text-paper-50 shadow-cocoa"
                              : "text-cocoa-700/70 hover:text-cocoa-900"
                          }`}
                        >
                          <Store className="h-4 w-4" aria-hidden /> Ambil
                          sendiri
                        </button>
                      </div>

                      <div className="mt-4 flex flex-col gap-3">
                        <Field
                          label="Nama"
                          required
                          error={
                            touched && !nameOk
                              ? "Nama wajib diisi (2–60 huruf)"
                              : undefined
                          }
                        >
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nama lengkap"
                            maxLength={60}
                            autoComplete="name"
                            className={inputCls}
                          />
                        </Field>

                        <Field
                          label="No. WhatsApp / HP"
                          required
                          error={
                            touched && !phoneOk
                              ? "Masukkan nomor Indonesia yang benar, mis. 081234567890"
                              : undefined
                          }
                        >
                          <input
                            type="tel"
                            inputMode="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="08xx-xxxx-xxxx"
                            maxLength={20}
                            autoComplete="tel"
                            className={inputCls}
                          />
                        </Field>

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
                                  touched && !addressOk
                                    ? "Alamat wajib diisi untuk pengantaran"
                                    : undefined
                                }
                              >
                                <textarea
                                  value={address}
                                  onChange={(e) => setAddress(e.target.value)}
                                  rows={2}
                                  maxLength={300}
                                  placeholder="Jalan, No. rumah, kelurahan, patokan…"
                                  className={inputCls}
                                />
                              </Field>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <Field
                          label="Catatan (opsional)"
                          hint={`${note.length}/300`}
                        >
                          <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={2}
                            maxLength={300}
                            placeholder="Mis. tanpa keju, waktu pengantaran, dll."
                            className={inputCls}
                          />
                        </Field>

                        <Field label="Foto (opsional)">
                          {fotoUrl ? (
                            <div className="flex items-center gap-3">
                              <img
                                src={fotoUrl}
                                alt="Pratinjau foto pesanan"
                                className="h-16 w-16 rounded-xl object-cover ring-1 ring-cocoa-700/15"
                              />
                              <button
                                type="button"
                                onClick={() => setFotoUrl("")}
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
                        </Field>
                      </div>
                    </div>
                  </div>

                  {/* Footer — total + checkout */}
                  <div className="border-t border-cocoa-700/10 bg-paper-50 px-5 py-4">
                    {galat && (
                      <div
                        role="alert"
                        className="mb-3 flex items-start gap-2.5 rounded-2xl bg-red-50 px-4 py-3 ring-1 ring-red-200"
                      >
                        <AlertCircle
                          className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
                          aria-hidden
                        />
                        <p className="font-text text-sm text-red-700">
                          {galat}
                        </p>
                      </div>
                    )}

                    {kepanjangan && (
                      <p className="mb-3 font-text text-xs text-amber-700">
                        Catatan/alamatmu cukup panjang — sebagian mungkin
                        dipotong di WhatsApp. Pertimbangkan meringkasnya.
                      </p>
                    )}

                    <div className="mb-3 flex items-center justify-between">
                      <span className="font-text text-sm text-cocoa-700/80">
                        Total
                      </span>
                      <span className="font-heading text-2xl text-cocoa-800">
                        {formatPrice(total)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={checkout}
                      disabled={!canCheckout}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-cocoa-800 px-6 py-3.5 font-text text-base font-bold text-paper-50 shadow-cocoa transition-all hover:-translate-y-0.5 hover:bg-cocoa-900 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                      {mengirim ? (
                        <>
                          <Loader2
                            className="h-5 w-5 animate-spin"
                            aria-hidden
                          />
                          Menyimpan pesanan…
                        </>
                      ) : (
                        <>
                          <MessageCircle className="h-5 w-5" aria-hidden />
                          Pesan via WhatsApp
                        </>
                      )}
                    </button>
                    <p className="mt-2 text-center font-text text-xs text-cocoa-700/60">
                      Pesanan diteruskan ke WhatsApp owner untuk dikonfirmasi.
                    </p>
                  </div>
                </>
              )}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Formulir ulasan — dibuka dari layar konfirmasi. Token pesanan ikut
          dikirim supaya ulasannya bertanda "Pembeli terverifikasi". */}
      <ReviewModal
        open={ulasanTerbuka}
        onClose={() => setUlasanTerbuka(false)}
        reviewToken={hasil?.reviewToken ?? null}
        produkDipesan={hasil?.produk}
        tabAwal="menu"
      />
    </>
  );
}

const inputCls =
  "w-full rounded-xl bg-paper-50 px-4 py-2.5 font-text text-sm text-cocoa-800 ring-1 ring-cocoa-700/15 transition-shadow placeholder:text-cocoa-700/40 focus:outline-none focus:ring-2 focus:ring-caramel";

/**
 * Deteksi viewport mobile (< breakpoint `sm` Tailwind = 640px) untuk memilih
 * arah animasi panel. Dengarkan perubahan agar tetap benar saat layar diputar
 * atau jendela di-resize.
 */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isMobile;
}

/** Pembungkus label + pesan error untuk tiap kolom form. */
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
        <span className="font-text text-xs font-bold text-cocoa-700/80">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </span>
        {hint && (
          <span className="font-text text-[11px] text-cocoa-700/50">
            {hint}
          </span>
        )}
      </span>
      {children}
      {error && (
        <span className="mt-1 block font-text text-xs text-red-500">
          {error}
        </span>
      )}
    </label>
  );
}
