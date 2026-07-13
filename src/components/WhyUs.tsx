import { useRef } from 'react'
import { Croissant, Leaf, Wallet, Truck } from 'lucide-react'
import { useScrolly } from '../hooks/useScrolly'

const reasons = [
  {
    icon: Croissant,
    title: 'Fresh Baked Daily',
    desc: 'Dipanggang setiap pagi, bukan stok kemarin. Selalu hangat dan wangi.',
  },
  {
    icon: Leaf,
    title: 'Bahan Berkualitas',
    desc: 'Butter asli, tepung pilihan, tanpa pengawet dan pewarna buatan.',
  },
  {
    icon: Wallet,
    title: 'Harga Terjangkau',
    desc: 'Roti enak tak harus mahal. Harga ramah untuk teman ngeteh harian.',
  },
  {
    icon: Truck,
    title: 'Pengiriman Cepat',
    desc: 'Pesan pagi, sampai masih hangat. Antar cepat ke area sekitar.',
  },
]

export default function WhyUs() {
  const sectionRef = useRef<HTMLElement>(null)
  useScrolly(sectionRef)

  return (
    <section id="keunggulan" ref={sectionRef} className="bg-cream-dark/70 py-20 lg:py-28">
      <div className="container-warm">
        <div className="mx-auto max-w-2xl text-center">
          <span data-reveal className="eyebrow mb-4">
            Kenapa Pilih Kami
          </span>
          <h2 data-reveal className="text-display-md">
            Alasan pelanggan kembali lagi &amp; lagi
          </h2>
        </div>

        <div data-stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((r) => (
            <div
              key={r.title}
              className="group px-4 text-center transition-transform duration-300 hover:-translate-y-2"
            >
              <span className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-cream text-terracotta shadow-warm ring-1 ring-brown-medium/10 transition-colors duration-300 group-hover:bg-terracotta group-hover:text-cream">
                <r.icon className="h-10 w-10" aria-hidden />
              </span>
              <h3 className="font-display text-xl text-brown-dark">{r.title}</h3>
              <p className="mt-2 text-sm text-brown-deep/75">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
