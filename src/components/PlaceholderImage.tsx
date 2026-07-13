import { useMemo, useState } from 'react'
import { Croissant } from 'lucide-react'

interface PlaceholderImageProps {
  /** Alt text — wajib untuk aksesibilitas. */
  alt: string
  /** Foto asli (mis. "/images/roti-coklat-keju.jpg"). Bila kosong / gagal dimuat,
   *  otomatis fallback ke placeholder gradient. */
  src?: string
  /** Label opsional ditampilkan di tengah placeholder (mode fallback). */
  label?: string
  /** Seed untuk variasi warna gradient antar placeholder. */
  seed?: string
  className?: string
  rounded?: string
}

// Palet gradient hangat coklat-krem untuk placeholder foto produk.
const GRADIENTS: [string, string][] = [
  ['#EFE0C9', '#D9B892'],
  ['#E7CBA9', '#C08A5B'],
  ['#F0D9B8', '#D97A46'],
  ['#E3C9A6', '#8B5E3C'],
  ['#F5EDE1', '#C99B6E'],
  ['#EAD3AE', '#A9713F'],
]

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

/**
 * Menampilkan foto asli (`src`) bila tersedia & berhasil dimuat.
 * Jika `src` kosong atau file 404/gagal, otomatis menampilkan placeholder
 * gradient bertema bakery — jadi halaman tetap rapi tanpa foto.
 */
export default function PlaceholderImage({
  alt,
  src,
  label,
  seed = 'roti',
  className = '',
  rounded = 'rounded-2xl',
}: PlaceholderImageProps) {
  const [errored, setErrored] = useState(false)
  const [from, to] = useMemo(() => GRADIENTS[hashString(seed) % GRADIENTS.length], [seed])

  const showImage = Boolean(src) && !errored

  if (showImage) {
    return (
      <div className={`relative overflow-hidden ${rounded} ${className}`}>
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setErrored(true)}
          className="h-full w-full object-cover"
        />
      </div>
    )
  }

  // Fallback: placeholder gradient bertema.
  return (
    <div
      role="img"
      aria-label={alt}
      className={`relative flex items-center justify-center overflow-hidden ${rounded} ${className}`}
      style={{ background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}
    >
      {/* Tekstur titik-titik halus menyerupai taburan tepung */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1.5px)',
          backgroundSize: '18px 18px',
        }}
        aria-hidden
      />
      <div className="relative flex flex-col items-center gap-2 px-4 text-center text-brown-deep/70">
        <Croissant className="h-8 w-8" strokeWidth={1.6} aria-hidden />
        {label && <span className="text-sm font-semibold tracking-wide">{label}</span>}
      </div>
    </div>
  )
}
