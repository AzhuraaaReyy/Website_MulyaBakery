import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Pemecahan bundel.
 *
 * Tanpa pengaturan ini seluruh aplikasi menjadi satu berkas ~720 KB, dan
 * peramban tidak bisa menampilkan apa pun sebelum semuanya selesai diunduh —
 * termasuk pustaka yang baru dipakai jauh di bawah halaman.
 *
 * Dipecah menurut kapan sesuatu benar-benar dibutuhkan, bukan sekadar per
 * pustaka. Peramban mengunduh potongan-potongan ini secara paralel, dan
 * potongan yang tidak terpakai di kunjungan itu tidak pernah diminta.
 */
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("ogl")) return "galeri-webgl";
          if (id.includes("gsap")) return "animasi-scroll";
          if (id.includes("framer-motion")) return "animasi-ui";
          if (id.includes("@supabase")) return "database";
          if (id.includes("lucide-react")) return "ikon";
          if (
            id.includes("react-dom") ||
            id.includes("/react/") ||
            id.includes("scheduler")
          )
            return "react";
          return "vendor";
        },
      },
    },
    chunkSizeWarningLimit: 300,
  },
});
