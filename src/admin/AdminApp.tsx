import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Loader2, Lock, LogIn, AlertCircle } from "lucide-react";
import { supabaseAdmin, isAdminConfigured } from "../lib/supabaseAdmin";
import AdminDashboard from "./AdminDashboard";

/**
 * Akar panel admin (dirender hanya di path /admin, lihat main.tsx).
 *
 * Alur: cek sesi -> kalau belum login tampilkan form -> kalau sudah, tampilkan
 * dashboard CRUD. Keamanan sesungguhnya ada di RLS database; halaman ini hanya
 * gerbang UI. Tanpa login, semua tulisan ke database ditolak server.
 */
export default function AdminApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [memuat, setMemuat] = useState(true);

  useEffect(() => {
    if (!supabaseAdmin) {
      setMemuat(false);
      return;
    }
    supabaseAdmin.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setMemuat(false);
    });
    const { data: sub } = supabaseAdmin.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!isAdminConfigured) {
    return (
      <Bingkai>
        <div className="flex items-start gap-3 rounded-2xl bg-red-50 p-5 ring-1 ring-red-200">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <p className="font-text text-sm text-red-700">
            Supabase belum dikonfigurasi. Isi <code>VITE_SUPABASE_URL</code> dan{" "}
            <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> di file <code>.env</code>,
            lalu jalankan ulang.
          </p>
        </div>
      </Bingkai>
    );
  }

  if (memuat) {
    return (
      <Bingkai>
        <div className="flex items-center justify-center gap-2 py-16 text-cocoa-700/70">
          <Loader2 className="h-5 w-5 animate-spin" /> Memuat…
        </div>
      </Bingkai>
    );
  }

  if (!session) return <Login />;

  return <AdminDashboard email={session.user.email ?? ""} />;
}

/* ── Kerangka layar (dipakai login & pesan status) ───────────────────────── */
function Bingkai({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper-100 px-4 py-10">
      <div className="mx-auto w-full max-w-md">{children}</div>
    </div>
  );
}

/* ── Form login ──────────────────────────────────────────────────────────── */
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [kirim, setKirim] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  const masuk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseAdmin) return;
    setKirim(true);
    setGalat(null);
    const { error } = await supabaseAdmin.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      setGalat(
        error.message.toLowerCase().includes("invalid")
          ? "Email atau password salah."
          : "Gagal masuk. Coba lagi.",
      );
    }
    setKirim(false);
  };

  return (
    <Bingkai>
      <div className="rounded-3xl bg-paper-50 p-8 shadow-cocoa-lg ring-1 ring-cocoa-700/10">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cocoa-800 text-paper-50">
          <Lock className="h-6 w-6" />
        </span>
        <h1 className="mt-4 font-heading text-2xl text-cocoa-800">Panel Admin</h1>
        <p className="mt-1 font-text text-sm text-cocoa-700/70">
          Masuk untuk mengelola menu.
        </p>

        <form onSubmit={masuk} className="mt-6 flex flex-col gap-4">
          <label className="block">
            <span className="mb-1.5 block font-text text-xs font-bold text-cocoa-700/80">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block font-text text-xs font-bold text-cocoa-700/80">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className={inputCls}
            />
          </label>

          {galat && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 px-3.5 py-2.5 ring-1 ring-red-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <p className="font-text text-sm text-red-700">{galat}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={kirim}
            className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-full bg-cocoa-800 px-6 py-3.5 font-text text-base font-bold text-paper-50 shadow-cocoa transition-all hover:-translate-y-0.5 hover:bg-cocoa-900 disabled:opacity-50"
          >
            {kirim ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <LogIn className="h-5 w-5" />
            )}
            Masuk
          </button>
        </form>
      </div>
    </Bingkai>
  );
}

const inputCls =
  "w-full rounded-xl bg-paper-50 px-4 py-2.5 font-text text-sm text-cocoa-800 ring-1 ring-cocoa-700/15 transition-shadow placeholder:text-cocoa-700/40 focus:outline-none focus:ring-2 focus:ring-caramel";
