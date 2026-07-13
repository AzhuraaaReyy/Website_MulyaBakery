import { useRef } from 'react'
import { ClipboardList, MessageCircle, CreditCard, PackageCheck } from 'lucide-react'
import { generalOrderUrl } from '../lib/whatsapp'
import { useScrolly } from '../hooks/useScrolly'
import { gsap } from '../lib/gsap'

const steps = [
  {
    icon: ClipboardList,
    title: 'Pilih Menu',
    desc: 'Lihat menu & produk unggulan, tentukan roti favoritmu.',
  },
  {
    icon: MessageCircle,
    title: 'Hubungi via WhatsApp',
    desc: 'Klik tombol pesan — chat sudah terisi otomatis, tinggal kirim.',
  },
  {
    icon: CreditCard,
    title: 'Konfirmasi & Bayar',
    desc: 'Kami konfirmasi ketersediaan & total. Bayar transfer/e-wallet/COD.',
  },
  {
    icon: PackageCheck,
    title: 'Ambil / Diantar',
    desc: 'Roti hangat siap diambil di toko atau kami antar ke rumahmu.',
  },
]

export default function HowToOrder() {
  const sectionRef = useRef<HTMLElement>(null)

  // Scrollytelling khusus: garis timeline "menggambar" mengikuti scroll.
  useScrolly(sectionRef, () => {
    gsap.set('[data-timeline]', { scaleX: 0, transformOrigin: 'left center' })
    gsap.to('[data-timeline]', {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: '[data-timeline-track]',
        start: 'top 75%',
        end: 'bottom 75%',
        scrub: true,
      },
    })
  })

  return (
    <section id="cara-pesan" ref={sectionRef} className="bg-transparent py-20 lg:py-28">
      <div className="container-warm">
        <div className="mx-auto max-w-2xl text-center">
          <span data-reveal className="eyebrow mb-4">
            Cara Pemesanan
          </span>
          <h2 data-reveal className="text-display-md">
            Pesan roti semudah kirim pesan
          </h2>
          <p data-reveal className="mt-4 text-brown-deep/75">
            Empat langkah santai, tanpa ribet aplikasi.
          </p>
        </div>

        <div data-timeline-track className="relative mt-14">
          {/* Garis penghubung timeline (desktop) — di-scrub saat scroll */}
          <div
            data-timeline
            className="absolute left-0 right-0 top-8 hidden h-0.5 bg-gradient-to-r from-terracotta/40 via-terracotta to-terracotta/40 lg:block"
            aria-hidden
          />
          <ol data-stagger className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <li key={step.title} className="relative text-center">
                <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-terracotta text-cream shadow-warm">
                  <step.icon className="h-7 w-7" aria-hidden />
                  <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-brown-dark text-sm font-bold text-cream ring-2 ring-cream">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-display text-lg text-brown-dark">{step.title}</h3>
                <p className="mx-auto mt-2 max-w-[220px] text-sm text-brown-deep/75">{step.desc}</p>
              </li>
            ))}
          </ol>
        </div>

        <div data-reveal className="mt-12 text-center">
          <a href={generalOrderUrl()} target="_blank" rel="noopener noreferrer" className="btn-primary">
            <MessageCircle className="h-5 w-5" aria-hidden />
            Mulai Pesan Sekarang
          </a>
        </div>
      </div>
    </section>
  )
}
