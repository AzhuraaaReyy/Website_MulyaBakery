/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Palet dasar coklat & krem — warm & homey bakery
        cream: {
          DEFAULT: '#F5EDE1', // krem lembut (background utama)
          dark: '#EFE0C9', // krem gelap (background section alternatif)
        },
        brown: {
          medium: '#8B5E3C', // coklat medium (aksen, tombol, ikon)
          dark: '#5C3A21', // coklat tua (teks heading, elemen kuat)
          deep: '#3A2317', // coklat sangat gelap (teks body, footer)
        },
        terracotta: '#D97A46', // terracotta hangat (aksen CTA/highlight)
      },
      fontFamily: {
        display: ['Fraunces', 'Playfair Display', 'Georgia', 'serif'],
        body: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Skala tipografi dengan hierarki tegas
        'display-xl': ['clamp(2.75rem, 6vw, 5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2.25rem, 4.5vw, 3.5rem)', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
        'display-md': ['clamp(1.75rem, 3vw, 2.5rem)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
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
        warm: '0 18px 40px -18px rgba(92, 58, 33, 0.45)',
        'warm-lg': '0 30px 60px -24px rgba(92, 58, 33, 0.5)',
      },
    },
  },
  plugins: [],
}
