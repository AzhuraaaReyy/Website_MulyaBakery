import { useEffect, useState } from "react";
import {
  AlertCircle,
  Check,
  Loader2,
  Lock,
  Pencil,
  Save,
  Settings2,
  X,
} from "lucide-react";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import { readableError } from "../lib/supabase";
import {
  useFeatureFlags,
  type FeatureKey,
  type FeatureFlagRow,
} from "../context/FeatureFlagsContext";

/**
 * PANEL SUPER ADMIN — "Pengaturan Fitur" (Feature Gating).
 *
 * Menampilkan seluruh fitur situs (section publik, fitur interaktif, & panel
 * admin) dalam bentuk daftar dengan:
 *   - toggle on/off (langsung tersimpan ke tabel `feature_flags`),
 *   - tombol edit untuk mengubah judul & keterangan "Coming Soon".
 *
 * Tab ini HANYA tampil untuk email super admin (lihat AdminDashboard).
 */
export default function FeaturePanel() {
  const { all, loading } = useFeatureFlags();

  // Salinan lokal sebagai "sumber kebenaran tampilan" agar toggle terasa instan.
  const [flags, setFlags] = useState<Record<FeatureKey, FeatureFlagRow>>(all);
  const [menyimpan, setMenyimpan] = useState<FeatureKey | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [sukses, setSukses] = useState<string | null>(null);

  // Edit judul & keterangan
  const [editKey, setEditKey] = useState<FeatureKey | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  // Sinkronkan salinan lokal bila data server baru selesai dimuat.
  useEffect(() => {
    setFlags(all);
  }, [all]);

  const baris = Object.values(flags);

  function mulaiEdit(key: FeatureKey) {
    const r = flags[key];
    setEditKey(key);
    setEditTitle(r.title);
    setEditDesc(r.description);
    setGalat(null);
    setSukses(null);
  }

  async function simpanUbah(key: FeatureKey, ubah: Partial<FeatureFlagRow>) {
    if (!supabaseAdmin) {
      setGalat("Supabase belum dikonfigurasi di .env.");
      return;
    }
    setMenyimpan(key);
    setGalat(null);
    setSukses(null);
    const sebelum = flags[key];
    setFlags((prev) => ({ ...prev, [key]: { ...prev[key], ...ubah } }));

    const { error } = await supabaseAdmin
      .from("feature_flags")
      .update({ ...ubah, updated_at: new Date().toISOString() })
      .eq("key", key);

    if (error) {
      setFlags((prev) => ({ ...prev, [key]: sebelum }));
      setGalat(readableError(error));
    } else {
      setSukses(`Perubahan "${flags[key].title}" tersimpan.`);
    }
    setMenyimpan(null);
  }

  function batalEdit() {
    setEditKey(null);
    setGalat(null);
  }

  return (
    <div className="space-y-5">
      {/* Info */}
      <div className="flex items-start gap-3 rounded-2xl bg-caramel/15 p-4 ring-1 ring-caramel/30">
        <Settings2 className="mt-0.5 h-5 w-5 shrink-0 text-cocoa-800" />
        <div>
          <p className="font-text text-sm font-bold text-cocoa-800">
            Pengaturan Fitur (Super Admin)
          </p>
          <p className="mt-0.5 font-text text-xs leading-relaxed text-cocoa-700/80">
            Matikan fitur untuk menampilkan pola blur + "Coming Soon!" di situs.
            Perubahan langsung berlaku untuk semua pengunjung.
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-10 text-cocoa-700/70">
          <Loader2 className="h-5 w-5 animate-spin" /> Memuat pengaturan…
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {baris.map((row) => {
            const aktif = row.enabled;
            const sedangEdit = editKey === row.key;
            const sedangSimpan = menyimpan === row.key;
            return (
              <div
                key={row.key}
                className={`flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 transition-all ${
                  aktif ? "ring-cocoa-700/10" : "ring-pink-300/60 bg-pink-50/40"
                }`}
              >
                {/* Baris utama: judul + toggle */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-text text-sm font-bold text-cocoa-800">
                      {row.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 font-text text-xs text-cocoa-700/70">
                      {row.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={aktif}
                    aria-label={`Nyalakan/matikan ${row.title}`}
                    disabled={menyimpan === row.key}
                    onClick={() => simpanUbah(row.key, { enabled: !aktif })}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
                      aktif ? "bg-emerald-500" : "bg-cocoa-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow transition-all ${
                        aktif ? "left-[22px]" : "left-0.5"
                      }`}
                    >
                      {sedangSimpan ? (
                        <Loader2 className="h-3 w-3 animate-spin text-cocoa-400" />
                      ) : aktif ? (
                        <Check className="h-3 w-3 text-emerald-500" strokeWidth={3} />
                      ) : (
                        <Lock className="h-3 w-3 text-cocoa-400" />
                      )}
                    </span>
                  </button>
                </div>

                {/* Tindakan */}
                <div className="flex items-center gap-2">
                  {sedangEdit ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          simpanUbah(row.key, {
                            title: editTitle.trim() || row.title,
                            description: editDesc.trim(),
                          })
                        }
                        disabled={menyimpan === row.key}
                        className="inline-flex items-center gap-1.5 rounded-full bg-cocoa-800 px-3.5 py-1.5 font-text text-xs font-bold text-paper-50 transition-colors hover:bg-cocoa-900 disabled:opacity-60"
                      >
                        {menyimpan === row.key ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Save className="h-3.5 w-3.5" />
                        )}
                        Simpan
                      </button>
                      <button
                        type="button"
                        onClick={batalEdit}
                        className="inline-flex items-center gap-1.5 rounded-full bg-paper-200 px-3.5 py-1.5 font-text text-xs font-bold text-cocoa-800 transition-colors hover:bg-paper-300"
                      >
                        <X className="h-3.5 w-3.5" /> Batal
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => mulaiEdit(row.key)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-paper-200 px-3.5 py-1.5 font-text text-xs font-bold text-cocoa-800 transition-colors hover:bg-paper-300"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit Keterangan
                    </button>
                  )}
                  {!aktif && (
                    <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-pink-100 px-2.5 py-1 font-text text-[10px] font-extrabold uppercase tracking-wider text-pink-600">
                      <Lock className="h-3 w-3" /> Off
                    </span>
                  )}
                </div>

                {/* Form edit judul & keterangan */}
                {sedangEdit && (
                  <div className="flex flex-col gap-2.5 border-t border-cocoa-700/10 pt-3">
                    <label className="block">
                      <span className="mb-1 block font-text text-xs font-bold text-cocoa-700/80">
                        Judul
                      </span>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        maxLength={60}
                        className="w-full rounded-xl bg-paper-50 px-3 py-2 font-text text-sm text-cocoa-800 ring-1 ring-cocoa-700/15 focus:outline-none focus:ring-2 focus:ring-caramel"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block font-text text-xs font-bold text-cocoa-700/80">
                        Keterangan "Coming Soon!"
                      </span>
                      <textarea
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        rows={3}
                        maxLength={200}
                        className="w-full resize-none rounded-xl bg-paper-50 px-3 py-2 font-text text-sm text-cocoa-800 ring-1 ring-cocoa-700/15 focus:outline-none focus:ring-2 focus:ring-caramel"
                      />
                    </label>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pesan galat / sukses */}
      {(galat || sukses) && (
        <div
          role="status"
          className={`flex items-start gap-2 rounded-xl px-3.5 py-2.5 text-sm ${
            galat
              ? "bg-red-50 text-red-700 ring-1 ring-red-200"
              : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          }`}
        >
          {galat ? (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <Check className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <span className="font-text text-xs sm:text-sm">{galat ?? sukses}</span>
        </div>
      )}
    </div>
  );
}