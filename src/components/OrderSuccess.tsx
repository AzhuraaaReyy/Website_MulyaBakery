import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Copy,
  Check,
  MessageCircle,
  Star,
  ShoppingBag,
  AlertTriangle,
} from "lucide-react";
import LockedCta from "./LockedCta";
import { useFeatureFlags } from "../context/FeatureFlagsContext";

interface Props {
  orderCode: string;
  /** URL wa.me lengkap — dipakai untuk tombol cadangan. */
  waUrl: string;
  /** true bila tab WhatsApp gagal dibuka (diblokir peramban). */
  waDiblokir: boolean;
  onBukaUlasan: () => void;
  onSelesai: () => void;
}

/**
 * Layar setelah pesanan tersimpan.
 *
 * Alurnya begini: tab WhatsApp dibuka terpisah, sementara tab situs ini TETAP
 * hidup dan langsung berganti ke layar ini. Jadi saat pelanggan selesai
 * mengirim pesan lalu kembali ke peramban, ajakan menulis ulasan sudah
 * menunggu — tanpa pernah mengeluarkan mereka dari situs.
 */
export default function OrderSuccess({
  orderCode,
  waUrl,
  waDiblokir,
  onBukaUlasan,
  onSelesai,
}: Props) {
  const [disalin, setDisalin] = useState(false);
  const { isOn } = useFeatureFlags();

  const salinKode = async () => {
    try {
      await navigator.clipboard.writeText(orderCode);
      setDisalin(true);
      window.setTimeout(() => setDisalin(false), 1600);
    } catch {
      // Clipboard bisa ditolak (halaman non-HTTPS atau izin dicabut).
      // Kode pesanan tetap terlihat di layar, jadi tidak ada yang hilang.
      setDisalin(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-5 py-8 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex flex-col items-center text-center"
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle2 className="h-9 w-9" aria-hidden />
        </span>

        <span className="mt-4 font-script text-2xl text-caramel">
          Pesanan tercatat
        </span>
        <h2 className="mt-1 font-heading text-2xl text-cocoa-800">
          Terima kasih sudah memesan!
        </h2>

        <p className="mt-3 max-w-sm font-text text-sm leading-relaxed text-cocoa-700/75 text-justify">
          Pesananmu sudah kami simpan. Kirim pesan WhatsApp yang sudah terbuka
          agar owner bisa langsung mengonfirmasi ketersediaan dan ongkos kirim.
        </p>

        {/* Kode pesanan */}
        <div className="mt-6 w-full rounded-2xl bg-paper-50 p-4 ring-1 ring-cocoa-700/10">
          <p className="font-text text-xs font-bold uppercase tracking-wide text-cocoa-700/60">
            Kode pesanan
          </p>
          <div className="mt-1.5 flex items-center justify-center gap-2">
            <span className="font-heading text-2xl tracking-wide text-cocoa-800">
              {orderCode}
            </span>
            <button
              type="button"
              onClick={salinKode}
              aria-label="Salin kode pesanan"
              className="rounded-full p-2 text-cocoa-700/60 transition-colors hover:bg-paper-200 hover:text-cocoa-900"
            >
              {disalin ? (
                <Check className="h-4 w-4 text-green-600" aria-hidden />
              ) : (
                <Copy className="h-4 w-4" aria-hidden />
              )}
            </button>
          </div>
          <p className="mt-1 font-text text-xs text-cocoa-700/55">
            Sebutkan kode ini kalau kamu menanyakan pesanan.
          </p>
        </div>

        {/* Peringatan bila tab WhatsApp gagal dibuka */}
        {waDiblokir && (
          <div
            role="alert"
            className="mt-4 flex w-full items-start gap-2.5 rounded-2xl bg-amber-50 px-4 py-3 text-left ring-1 ring-amber-200"
          >
            <AlertTriangle
              className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
              aria-hidden
            />
            <p className="font-text text-sm text-amber-800 text-justify">
              Peramban memblokir jendela WhatsApp. Tekan tombol di bawah untuk
              membukanya — pesananmu sudah aman tersimpan.
            </p>
          </div>
        )}

        {/* Tombol WhatsApp — selalu ada, bukan hanya saat diblokir.
            Pelanggan sering tanpa sengaja menutup tab WhatsApp sebelum
            mengirim; tanpa tombol ini mereka harus mengulang dari awal. */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-green-600 px-6 py-3.5 font-text text-base font-bold text-white shadow-cocoa transition-transform hover:-translate-y-0.5"
        >
          <MessageCircle className="h-5 w-5" aria-hidden />
          {waDiblokir ? "Buka WhatsApp" : "Buka WhatsApp lagi"}
        </a>
      </motion.div>

      {/* Ajakan menulis ulasan */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.12, ease: "easeOut" }}
        className="mt-8 rounded-2xl bg-gradient-to-br from-cocoa-700 to-cocoa-900 p-5 text-center shadow-cocoa"
      >
        <span className="font-script text-xl text-butter">
          Sudah pernah coba sebelumnya?
        </span>
        <h3 className="mt-1 font-heading text-lg text-paper-50">
          Bagikan ulasanmu
        </h3>
        <p className="mt-2 font-text text-sm leading-relaxed text-paper-200/85 text-justify">
          Bintang yang kamu beri akan langsung tampil di kartu menu dan membantu
          pembeli lain memilih.
        </p>
        {isOn("ulasan") ? (
          <button
            type="button"
            onClick={onBukaUlasan}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-butter px-6 py-3 font-text text-sm font-bold text-cocoa-900 shadow-cocoa transition-transform hover:-translate-y-0.5"
          >
            <Star className="h-4 w-4 fill-cocoa-900" aria-hidden />
            Tulis ulasan
          </button>
        ) : (
          <LockedCta feature="ulasan" className="mt-4" />
        )}
      </motion.div>

      <button
        type="button"
        onClick={onSelesai}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-text text-sm font-bold text-cocoa-700/70 transition-colors hover:text-cocoa-900"
      >
        <ShoppingBag className="h-4 w-4" aria-hidden />
        Lanjut lihat menu
      </button>
    </div>
  );
}
