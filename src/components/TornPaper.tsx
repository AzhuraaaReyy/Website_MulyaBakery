import { useId, useMemo } from 'react'

/** PRNG deterministik — bentuk sobekan tetap sama tiap render (bukan Math.random). */
function mulberry32(a: number) {
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashSeed(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

const VW = 1440 // lebar viewBox
const OVER = 40 // lebihkan ke luar kiri/kanan agar tak pernah ada celah

/**
 * Rangkaian titik tepi sobekan.
 *
 * Sengaja memakai segmen LURUS (bukan kurva) — kertas robek itu bersudut,
 * bukan bergelombang. Jitter kecil di sepanjang tepi + sesekali "takik" dalam
 * meniru serat yang tercabik lebih jauh.
 */
function tearPoints(seed: string, baseline: number) {
  const rnd = mulberry32(hashSeed(seed))
  const pts: [number, number][] = [[-OVER, baseline + (rnd() - 0.5) * 6]]
  let x = -OVER
  while (x < VW + OVER) {
    x += 12 + rnd() * 26
    const jitter = (rnd() - 0.5) * 11
    const notch = rnd() > 0.9 ? (rnd() - 0.5) * 22 : 0
    pts.push([Math.min(x, VW + OVER), baseline + jitter + notch])
  }
  return pts
}

function toPath(pts: [number, number][], closeAt: number) {
  const d = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`)
  d.push(`L${VW + OVER} ${closeAt}`, `L${-OVER} ${closeAt}`, 'Z')
  return d.join(' ')
}

/**
 * Pemisah antar-section bergaya KERTAS SOBEK — teknik signature dari referensi.
 *
 * Cara kerja: ditempel di tepi bawah (atau atas) sebuah section, lalu diisi warna
 * section BERIKUTNYA — seolah kertas section ini disobek dan memperlihatkan
 * lapisan di bawahnya. Sebuah strip tipis berwarna lebih terang (`core`) mengintip
 * di garis sobekan, meniru serat kertas yang terekspos.
 *
 * Filter feTurbulence memberi kekasaran serat di tepinya. Nonaktifkan lewat
 * `fiber={false}` bila ingin tepi yang lebih bersih.
 */
export default function TornPaper({
  fill,
  core = '#FCF8F0',
  position = 'bottom',
  height = 78,
  seed = 'tear',
  fiber = true,
  className = '',
}: {
  /** Warna section di baliknya (yang "terungkap" oleh sobekan). */
  fill: string
  /** Warna serat kertas di garis sobekan. */
  core?: string
  position?: 'top' | 'bottom'
  height?: number
  seed?: string
  fiber?: boolean
  className?: string
}) {
  const uid = useId().replace(/:/g, '')
  const filterId = `tear-${uid}`

  const { mainD, coreD } = useMemo(() => {
    const baseline = height * 0.52
    const pts = tearPoints(seed, baseline)
    // Strip serat = tepi yang sama, digeser sedikit ke atas.
    const lifted = pts.map(([x, y]) => [x, y - 6] as [number, number])
    return { mainD: toPath(pts, height + 60), coreD: toPath(lifted, height + 60) }
  }, [seed, height])

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 ${
        position === 'top' ? 'top-0' : 'bottom-0'
      } leading-[0] ${className}`}
    >
      <svg
        viewBox={`0 0 ${VW} ${height}`}
        preserveAspectRatio="none"
        className="block w-full"
        style={{
          height,
          // Versi atas = cermin vertikal, agar sobekan menghadap ke dalam section.
          transform: position === 'top' ? 'scaleY(-1)' : undefined,
        }}
      >
        {fiber && (
          <filter id={filterId} x="-5%" y="-25%" width="110%" height="150%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9 0.45" numOctaves={3} seed={7} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={5} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        )}
        <g filter={fiber ? `url(#${filterId})` : undefined}>
          {/* Serat kertas yang terekspos — mengintip tipis di atas garis sobekan */}
          <path d={coreD} fill={core} />
          {/* Lapisan section berikutnya */}
          <path d={mainD} fill={fill} />
        </g>
      </svg>
    </div>
  )
}
