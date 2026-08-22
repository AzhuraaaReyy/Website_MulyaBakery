import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LogOut,
  UtensilsCrossed,
  Tags,
  MessageSquareQuote,
  Croissant,
  Menu as MenuIcon,
  X,
  ReceiptText,
  CakeSlice,
  Settings2,
  BarChart3,
} from "lucide-react";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import ProdukPanel from "./ProdukPanel";
import KategoriPanel from "./KategoriPanel";
import TestimoniPanel from "./TestimoniPanel";
import PesananPanel from "./PesananPanel";
import LaporanPanel from "./LaporanPanel";
import CustomPanel from "./CustomPanel";
import FeaturePanel from "./FeaturePanel";
import FeatureGate from "../components/FeatureGate";

type Tab =
  | "produk"
  | "kategori"
  | "testimoni"
  | "pesanan"
  | "laporan"
  | "custom"
  | "fitur";

const NAV: { id: Tab; label: string; Icon: typeof UtensilsCrossed }[] = [
  { id: "produk", label: "Menu", Icon: UtensilsCrossed },
  { id: "kategori", label: "Kategori", Icon: Tags },
  { id: "pesanan", label: "Pesanan", Icon: ReceiptText },
  { id: "custom", label: "Pesanan Khusus", Icon: CakeSlice },
  { id: "laporan", label: "Laporan", Icon: BarChart3 },
  { id: "testimoni", label: "Testimoni", Icon: MessageSquareQuote },
];

/** Tab tambahan khusus super admin — dipakai menonaktifkan/menyalakan fitur. */
const NAV_SUPER_ADMIN: { id: Tab; label: string; Icon: typeof UtensilsCrossed } =
  { id: "fitur", label: "Pengaturan Fitur", Icon: Settings2 };

/**
 * Kerangka panel admin setelah login: sidebar kiri + area konten.
 *   - Desktop (lg): sidebar menetap di kiri.
 *   - HP/tablet: sidebar jadi drawer yang dibuka dari tombol hamburger.
 *
 * Tab "Menu" -> kelola produk; "Testimoni" -> CRUD data testimoni (termasuk
 * persetujuan ulasan berfoto).
 */
export default function AdminDashboard({
  email,
  isSuperAdmin,
}: {
  email: string;
  isSuperAdmin: boolean;
}) {
  const [tab, setTab] = useState<Tab>("produk");
  const [drawer, setDrawer] = useState(false);
  const keluar = () => supabaseAdmin?.auth.signOut();

  const nav = isSuperAdmin ? [...NAV, NAV_SUPER_ADMIN] : NAV;

  const pilih = (id: Tab) => {
    setTab(id);
    setDrawer(false);
  };

  return (
    <div className="min-h-dvh overflow-x-hidden bg-paper-100">
      {/* ── Sidebar desktop (menetap) ──────────────────────────────────────── */}
      <aside className="hidden border-r border-cocoa-700/10 bg-paper-50 lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64 lg:flex-col lg:p-5">
        <IsiSidebar
          nav={nav}
          tab={tab}
          pilih={pilih}
          email={email}
          keluar={keluar}
        />
      </aside>

      {/* ── Drawer mobile ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {drawer && (
          <>
            <motion.button
              type="button"
              aria-label="Tutup menu"
              onClick={() => setDrawer(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-cocoa-900/50 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[82%] flex-col bg-paper-50 p-5 shadow-cocoa-lg lg:hidden"
            >
              <button
                type="button"
                onClick={() => setDrawer(false)}
                aria-label="Tutup"
                className="absolute right-3 top-3 rounded-full p-2 text-cocoa-700/70 transition-colors hover:bg-paper-200"
              >
                <X className="h-5 w-5" />
              </button>
              <IsiSidebar
                nav={nav}
                tab={tab}
                pilih={pilih}
                email={email}
                keluar={keluar}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Area konten ────────────────────────────────────────────────────── */}
      <div className="lg:pl-64">
        {/* Bar atas — hanya HP/tablet, untuk membuka drawer */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-cocoa-700/10 bg-paper-50/90 px-4 py-3 backdrop-blur-md lg:hidden">
          <button
            type="button"
            onClick={() => setDrawer(true)}
            aria-label="Buka menu"
            className="rounded-full p-2 text-cocoa-800 transition-colors hover:bg-paper-200"
          >
            <MenuIcon className="h-6 w-6" />
          </button>
          <span className="font-heading text-lg text-cocoa-800">
            {nav.find((n) => n.id === tab)?.label}
          </span>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          {tab === "fitur" ? (
            <FeaturePanel />
          ) : tab === "produk" ? (
            <FeatureGate feature="panel_menu">
              <ProdukPanel />
            </FeatureGate>
          ) : tab === "kategori" ? (
            <FeatureGate feature="panel_kategori">
              <KategoriPanel />
            </FeatureGate>
          ) : tab === "pesanan" ? (
            <FeatureGate feature="panel_pesanan">
              <PesananPanel />
            </FeatureGate>
          ) : tab === "custom" ? (
            <FeatureGate feature="panel_pesanan_khusus">
              <CustomPanel />
            </FeatureGate>
          ) : tab === "laporan" ? (
            <FeatureGate feature="panel_laporan">
              <LaporanPanel />
            </FeatureGate>
          ) : (
            <FeatureGate feature="panel_testimoni">
              <TestimoniPanel />
            </FeatureGate>
          )}
        </main>
      </div>
    </div>
  );
}

/* ── Isi sidebar (dipakai versi desktop & drawer) ───────────────────────────── */
function IsiSidebar({
  nav,
  tab,
  pilih,
  email,
  keluar,
}: {
  nav: { id: Tab; label: string; Icon: typeof UtensilsCrossed }[];
  tab: Tab;
  pilih: (id: Tab) => void;
  email: string;
  keluar: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-1">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-white shadow-pink">
          <Croissant className="h-5 w-5" aria-hidden />
        </span>
        <span className="font-heading text-lg text-cocoa-800">Panel Admin</span>
      </div>

      {/* Navigasi */}
      <nav className="mt-8 flex flex-col gap-1.5">
        {nav.map(({ id, label, Icon }) => {
          const aktif = tab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => pilih(id)}
              aria-current={aktif ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 font-text text-sm font-bold transition-colors ${
                aktif
                  ? "bg-primary-500 text-white shadow-pink"
                  : "text-cocoa-700/70 hover:bg-pink-100/70 hover:text-primary-600"
              }`}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
              {label}
            </button>
          );
        })}
      </nav>

      {/* Bawah: email + keluar */}
      <div className="mt-auto border-t border-cocoa-700/10 pt-4">
        <p className="truncate px-1 font-text text-xs text-cocoa-700/60">
          {email}
        </p>
        <button
          type="button"
          onClick={keluar}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-pink-100 text-primary-600 px-4 py-2.5 font-text text-sm font-bold transition-colors hover:bg-primary-500 hover:text-white hover:shadow-pink"
        >
          <LogOut className="h-4 w-4" /> Keluar
        </button>
      </div>
    </div>
  );
}
