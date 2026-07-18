import { useLayoutEffect } from 'react'
import { gsap } from '../lib/gsap'

type ExtraBuilder = (ctx: { el: HTMLElement }) => void

/**
 * Hook scrollytelling GSAP per-section. Cukup:
 *  1. beri `ref` ke elemen <section>,
 *  2. tandai elemen dengan atribut data-*, lalu
 *  3. panggil `useScrolly(ref)`.
 *
 * Atribut yang didukung (otomatis, di-scope ke section):
 *  - `data-reveal`            → muncul (fade + naik) saat masuk viewport.
 *      `data-reveal-x="60"`   → geser dari samping (mis. dari kanan) alih-alih bawah.
 *  - `data-stagger`           → anak-anaknya muncul bergiliran (stagger).
 *  - `data-parallax="0.15"`   → parallax terikat scroll (scrub); nilai = kecepatan,
 *                               negatif = arah berlawanan. Bisa dikombinasi dengan:
 *      `data-parallax-x="20"`      → ikut menyamping (persen lebar elemen).
 *      `data-parallax-rotate="8"`  → ikut berputar (derajat).
 *      `data-parallax-scale="0.2"` → ikut mengecil→membesar.
 *
 * Gerakan parallax dibuat simetris terhadap posisi netral: elemen ada di posisi
 * aslinya saat section persis di tengah viewport, lalu menyimpang ke dua arah.
 *
 * `extra` opsional untuk animasi khusus section (mis. garis timeline scrub).
 * Semua dinonaktifkan bila pengguna memilih prefers-reduced-motion.
 */
export function useScrolly(scopeRef: React.RefObject<HTMLElement>, extra?: ExtraBuilder) {
  useLayoutEffect(() => {
    const el = scopeRef.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      // Reveal per elemen
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((t) => {
        const x = parseFloat(t.dataset.revealX || '0')
        const delay = parseFloat(t.dataset.revealDelay || '0')
        gsap.from(t, {
          x,
          y: x ? 0 : 44,
          opacity: 0,
          duration: 1,
          delay,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
          scrollTrigger: { trigger: t, start: 'top 84%' },
        })
      })

      // Stagger: anak-anak muncul bergiliran
      gsap.utils.toArray<HTMLElement>('[data-stagger]').forEach((group) => {
        gsap.from(group.children, {
          y: 48,
          opacity: 0,
          duration: 0.85,
          ease: 'power3.out',
          stagger: 0.12,
          clearProps: 'transform,opacity',
          scrollTrigger: { trigger: group, start: 'top 82%' },
        })
      })

      // Parallax terikat scroll
      gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((t) => {
        const speed = parseFloat(t.dataset.parallax || '0.15')
        const x = parseFloat(t.dataset.parallaxX || '0')
        const rotate = parseFloat(t.dataset.parallaxRotate || '0')
        const scale = parseFloat(t.dataset.parallaxScale || '0')
        const y = speed * 60

        gsap.fromTo(
          t,
          { yPercent: y, xPercent: -x / 2, rotate: -rotate / 2, scale: 1 - scale / 2 },
          {
            yPercent: -y,
            xPercent: x / 2,
            rotate: rotate / 2,
            scale: 1 + scale / 2,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.6,
            },
          },
        )
      })

      extra?.({ el })
    }, el)

    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
