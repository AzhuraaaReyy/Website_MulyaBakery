import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'

/**
 * Latar animasi scroll-driven (storytelling) untuk seluruh halaman.
 * Beberapa "glow" hangat melayang di belakang semua section dan bergeser/berskala
 * mengikuti posisi scroll — menjadi benang merah yang menyatukan antar section.
 *
 * Dipasang fixed di belakang konten; section dibuat semi-transparan agar
 * pergerakan latar ini terlihat halus. Nonaktif saat prefers-reduced-motion.
 */
export default function ScrollStoryBackground() {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      const scroll = {
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
      }
      // Tiap glow bergerak & berskala berbeda sepanjang scroll → terasa "hidup".
      gsap.to('[data-blob="1"]', { yPercent: 70, xPercent: 18, scale: 1.35, ease: 'none', scrollTrigger: scroll })
      gsap.to('[data-blob="2"]', { yPercent: -55, xPercent: -18, scale: 1.2, ease: 'none', scrollTrigger: scroll })
      gsap.to('[data-blob="3"]', { yPercent: 95, xPercent: -22, scale: 1.15, ease: 'none', scrollTrigger: scroll })
      gsap.to('[data-blob="4"]', { yPercent: -80, xPercent: 24, scale: 1.45, ease: 'none', scrollTrigger: scroll })
    }, el)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        data-blob="1"
        className="absolute left-[4%] top-[8%] h-[45vh] w-[45vh] rounded-full bg-caramel/20 blur-[90px]"
      />
      <div
        data-blob="2"
        className="absolute right-[6%] top-[34%] h-[52vh] w-[52vh] rounded-full bg-cocoa-500/15 blur-[100px]"
      />
      <div
        data-blob="3"
        className="absolute left-[14%] top-[64%] h-[42vh] w-[42vh] rounded-full bg-butter/20 blur-[90px]"
      />
      <div
        data-blob="4"
        className="absolute right-[14%] top-[86%] h-[48vh] w-[48vh] rounded-full bg-caramel/15 blur-[100px]"
      />
    </div>
  )
}
