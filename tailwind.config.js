/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        /* ── SISTEM BARU: cokelat + cream (redesign) ───────────────────────
         * Cream dinaikkan kehangatannya, cokelat dibuat lebih pekat & kaya
         * dibanding palet lama supaya karakternya ekspresif, bukan kalem. */
        paper: {
          50: '#FCF8F0', // paling terang — serat kertas di tepi robek
          100: '#F7F0E1', // background utama
          200: '#EFE3CD', // background alternatif / kartu
          300: '#E2D0B4', // border halus / sand
        },
        cocoa: {
          400: '#B07A4A', // caramel terang
          500: '#96603A', // cokelat medium
          600: '#7A4A2B', // cokelat
          700: '#5C3520', // cokelat tua — heading
          800: '#412415', // espresso — band & footer
          900: '#2C170D', // paling gelap
        },
        caramel: '#C8873F', // aksen hangat (eyebrow, harga, highlight)
        butter: '#E9C07A', // highlight lembut untuk gradasi hero
      },
      fontFamily: {
        heading: ['Caprasimo', 'Georgia', 'serif'], // display playful
        script: ['Caveat', 'cursive'], // eyebrow tulisan tangan
        text: ['"Nunito Sans"', 'system-ui', 'sans-serif'], // body netral hangat
      },
      fontSize: {
        hero: ['clamp(2.75rem, 7vw, 5.5rem)', { lineHeight: '0.98', letterSpacing: '-0.02em' }],
        h1: ['clamp(2rem, 4.5vw, 3.25rem)', { lineHeight: '1.08', letterSpacing: '-0.015em' }],
        h2: ['clamp(1.6rem, 3vw, 2.4rem)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
      },
      keyframes: {
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'float-slow': 'float-slow 6s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
      },
      boxShadow: {
        cocoa: '0 20px 45px -20px rgba(65, 36, 21, 0.5)',
        'cocoa-lg': '0 34px 70px -26px rgba(65, 36, 21, 0.55)',
        lift: '0 10px 24px -12px rgba(65, 36, 21, 0.45)',
      },
    },
  },
  plugins: [],
}
