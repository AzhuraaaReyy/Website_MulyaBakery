import { useState } from 'react'

/**
 * Foto bahan cut-out sebagai aksen sudut section (jeruk, daun, beri, dll) —
 * elemen kolase khas referensi.
 *
 * Bila file belum ada / gagal dimuat, komponen ini merender NOTHING (bukan
 * placeholder), sehingga halaman tetap bersih selama aset belum disiapkan.
 *
 * Taruh file PNG transparan di `public/images/decor/`.
 */
export default function Decor({
  src,
  className = '',
  rotate = 0,
  parallax,
  style,
}: {
  /** mis. "/images/decor/lemon.png" */
  src: string
  className?: string
  /** Rotasi derajat — bikin komposisi terasa "ditempel tangan". */
  rotate?: number
  /** Kecepatan parallax; diteruskan ke useScrolly milik section induk. */
  parallax?: number
  style?: React.CSSProperties
}) {
  const [failed, setFailed] = useState(false)
  if (failed) return null

  return (
    <img
      src={src}
      alt=""
      aria-hidden
      loading="lazy"
      onError={() => setFailed(true)}
      data-parallax={parallax}
      className={`pointer-events-none absolute select-none drop-shadow-[0_14px_22px_rgba(65,36,21,0.28)] ${className}`}
      style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined, ...style }}
    />
  )
}
