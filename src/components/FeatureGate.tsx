import { Lock } from "lucide-react";
import { useFeatureFlags, type FeatureKey } from "../context/FeatureFlagsContext";

/**
 * PAGAR FITUR (Feature Gate) — pola "Blurred Content Gate".
 *
 * Bila fitur AKTIF  -> anak dirender normal.
 * Bila fitur MATI   -> anak diblur (tidak bisa diklik) + kartu teaser
 *                      "Coming Soon!" di tengah berisi judul & keterangan.
 *
 * Dipakai untuk memagari SELURUH BAGIAN (section) halaman publik & panel admin.
 * Untuk tombol/aksi kecil pakai <LockedCta> (lihat LockedCta.tsx).
 */
export default function FeatureGate({
  feature,
  children,
  className,
}: {
  feature: FeatureKey;
  children: React.ReactNode;
  /** Kelas tambahan untuk pembungkus (mis. rounded, height). */
  className?: string;
}) {
  const { isOn, meta } = useFeatureFlags();

  if (isOn(feature)) return <>{children}</>;

  const info = meta(feature);

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      {/* Isi asli — diblur & tidak interaktif */}
      <div
        className="pointer-events-none select-none blur-[6px]"
        aria-hidden
        tabIndex={-1}
      >
        {children}
      </div>

      {/* Lapisan peredup lembut agar kontras kartu tetap baik */}
      <div className="pointer-events-none absolute inset-0 bg-paper-100/30" />

      {/* Kartu teaser "Coming Soon!" */}
      <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6">
        <div
          role="status"
          className="mx-auto flex max-w-sm flex-col items-center gap-2.5 rounded-3xl border border-cocoa-700/10 bg-white/95 px-6 py-6 text-center shadow-cocoa-lg backdrop-blur-sm sm:px-8 sm:py-7"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-caramel/20 text-cocoa-800 ring-1 ring-caramel/40">
            <Lock className="h-6 w-6" aria-hidden />
          </span>
          <span className="inline-flex items-center rounded-full bg-pink-100 px-3 py-1 font-text text-[11px] font-extrabold uppercase tracking-wider text-pink-600">
            Coming Soon!
          </span>
          <h3 className="font-heading text-xl text-cocoa-800">{info.title}</h3>
          <p className="font-section3-p text-sm leading-relaxed text-cocoa-700/80 text-justify">
            {info.description}
          </p>
        </div>
      </div>
    </div>
  );
}