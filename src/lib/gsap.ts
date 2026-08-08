import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function initGlobalAnimations() {
  if (typeof window === "undefined") {
    return () => {};
  }

  const ctx = gsap.context(() => {
    // 1. Fade Up dengan scrub (animasi terikat langsung dengan naik-turunnya scroll)
    gsap.utils
      .toArray<HTMLElement>("[data-animate='fade-up']")
      .forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 90%", // Mulai muncul saat elemen mendekati bawah layar
              end: "top 40%", // Selesai sepenuhnya saat elemen berada di tengah/atas layar
              scrub: true, // KUNCI UTAMA: Animasi mengikuti gerakan scroll naik & turun secara presisi
            },
          },
        );
      });

    // 2. Fade In dengan scrub
    gsap.utils
      .toArray<HTMLElement>("[data-animate='fade-in']")
      .forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0 },
          {
            opacity: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              end: "top 40%",
              scrub: true,
            },
          },
        );
      });

    // 3. Scale Up dengan scrub
    gsap.utils
      .toArray<HTMLElement>("[data-animate='scale-up']")
      .forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, scale: 0.85 },
          {
            opacity: 1,
            scale: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              end: "top 40%",
              scrub: true,
            },
          },
        );
      });

    // 4. Slide Left dengan scrub
    gsap.utils
      .toArray<HTMLElement>("[data-animate='slide-left']")
      .forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, x: -80 },
          {
            opacity: 1,
            x: 0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              end: "top 40%",
              scrub: true,
            },
          },
        );
      });

    // 5. Slide Right dengan scrub
    gsap.utils
      .toArray<HTMLElement>("[data-animate='slide-right']")
      .forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, x: 80 },
          {
            opacity: 1,
            x: 0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              end: "top 40%",
              scrub: true,
            },
          },
        );
      });
  });

  ScrollTrigger.refresh();

  return () => {
    ctx.revert();
    ScrollTrigger.getAll().forEach((st) => st.kill());
  };
}

export { gsap, ScrollTrigger };
