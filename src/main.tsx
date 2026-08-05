import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

/**
 * Routing minimalis tanpa pustaka router.
 *
 * Path yang diawali "/admin" merender panel admin (di-lazy-load, jadi kode &
 * ketergantungannya TIDAK ikut membebani bundle landing page publik). Selain
 * itu, tampilkan landing page seperti biasa.
 *
 * Catatan hosting: agar URL /admin bisa dibuka langsung (bukan lewat navigasi
 * dalam app), host statis perlu "SPA fallback" — arahkan semua rute ke
 * index.html. Vercel/Netlify melakukannya otomatis.
 */
const AdminApp = lazy(() => import('./admin/AdminApp'))

const diAdmin = window.location.pathname.replace(/\/+$/, '').startsWith('/admin')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {diAdmin ? (
      <Suspense fallback={null}>
        <AdminApp />
      </Suspense>
    ) : (
      <App />
    )}
  </React.StrictMode>,
)
