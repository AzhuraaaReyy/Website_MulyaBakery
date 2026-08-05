/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        /* ── PALET BARU: Soft Pink (#FFE4E9) + Hot Pink (#FF69B4) ────────── */
        paper: {
          50: "#FFF5F7", // Serat/Highlight paling terang
          100: "#FFE4E9", // Background utama (Sekunder Soft Pink)
          200: "#FCD0D9", // Background kartu / alternatif
          300: "#F8B5C3", // Border halus
        },
        primary: {
          300: "#FF9EC6",
          400: "#FF80BD",
          500: "#FF69B4", // Hot Pink Utama (Primer)
          600: "#E64D9B", // Hover state
          700: "#C73480",
        },
        /* Warna Cocoa disesuaikan ke Deep Berry/Plum pekat untuk KONTRAS TEKS & HEADING */
        cocoa: {
          400: "#D65A8E",
          500: "#B83B72",
          600: "#8C2252",
          700: "#611339", // Sub-heading
          800: "#3B1219", // Deep Plum — Teks utama & Footer (Kontras Maksimal!)
          900: "#23080F", // Paling gelap
        },
        caramel: "#FF69B4", // Aksen eyebrow & penyorot
        butter: "#FFF0F3", // Highlight lembut gradasi hero
      },
      fontFamily: {
        heading: ["Caprasimo", "Georgia", "serif"],
        script: ["Caveat", "cursive"],
        text: ['"Nunito Sans"', "system-ui", "sans-serif"],
      },
      fontSize: {
        hero: [
          "clamp(2.75rem, 7vw, 5.5rem)",
          { lineHeight: "0.98", letterSpacing: "-0.02em" },
        ],
        h1: [
          "clamp(2rem, 4.5vw, 3.25rem)",
          { lineHeight: "1.08", letterSpacing: "-0.015em" },
        ],
        h2: [
          "clamp(1.6rem, 3vw, 2.4rem)",
          { lineHeight: "1.15", letterSpacing: "-0.01em" },
        ],
      },
      backgroundImage: {
        /* Gradasi Kiri -> Tengah -> Kanan */
        "gradient-pink-soft":
          "linear-gradient(90deg, #FFE4E9 0%, #FFC1CC 50%, #FFE4E9 100%)",
        "gradient-pink-hot":
          "linear-gradient(90deg, #FF69B4 0%, #FF3385 50%, #FF69B4 100%)",
        "gradient-pink-full":
          "linear-gradient(90deg, #FFE4E9 0%, #FF69B4 50%, #FFE4E9 100%)",
      },
      keyframes: {
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "float-slow": "float-slow 6s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
      boxShadow: {
        pink: "0 20px 45px -20px rgba(255, 105, 180, 0.45)",
        "pink-lg": "0 34px 70px -26px rgba(255, 105, 180, 0.6)",
        cocoa: "0 20px 45px -20px rgba(59, 18, 25, 0.25)",
        "cocoa-lg": "0 34px 70px -26px rgba(59, 18, 25, 0.35)",
        lift: "0 10px 24px -12px rgba(255, 105, 180, 0.35)",
      },
    },
  },
  plugins: [],
};
