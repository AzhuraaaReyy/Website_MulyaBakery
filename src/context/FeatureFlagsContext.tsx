import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  FEATURE_KEYS,
  FEATURE_DEFAULTS,
  semuaFiturAktif,
  type FeatureFlagRow,
  type FeatureKey,
  type FeatureMeta,
} from "../config/featureFlags";
import { supabase } from "../lib/supabase";

interface FeatureFlagsValue {
  /** Status fitur (AKTIF = boleh dipakai pengunjung). */
  isOn: (key: FeatureKey) => boolean;
  /** Judul + keterangan fitur (dipakai kartu "Coming Soon"). */
  meta: (key: FeatureKey) => FeatureMeta;
  /** Map lengkap — dipakai panel admin untuk toggle & edit. */
  all: Record<FeatureKey, FeatureFlagRow>;
  /** Sedang memuat dari database (untuk skeleton / tombol panel). */
  loading: boolean;
}

const FeatureFlagsContext = createContext<FeatureFlagsValue | null>(null);

/** Berapa lama jeda sebelum muat ulang saat pengguna kembali ke tab. */
const JEDA_KEMBALI = 15_000;

export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<Record<FeatureKey, FeatureFlagRow>>(
    () => semuaFiturAktif(),
  );
  const [loading, setLoading] = useState(true);
  const dibongkar = useRef(false);
  const terakhirMuat = useRef(0);

  useEffect(() => {
    dibongkar.current = false;
    return () => {
      dibongkar.current = true;
    };
  }, []);

  const muat = useCallback(async () => {
    if (!supabase) {
      setFlags(semuaFiturAktif());
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("feature_flags")
        .select("key, enabled, title, description");
      if (error) throw error;

      // Fail-open: kalau ada baris hilang (mis. fitur baru), anggap AKTIF.
      const peta = semuaFiturAktif();
      for (const baris of (data ?? []) as FeatureFlagRow[]) {
        const key = baris.key as FeatureKey;
        if (key in peta) {
          peta[key] = {
            ...peta[key],
            enabled: Boolean(baris.enabled),
            title: baris.title || peta[key].title,
            description: baris.description || peta[key].description,
          };
        }
      }
      if (!dibongkar.current) setFlags(peta);
    } catch (err) {
      // Gagal muat ≠ fitur mati. Lebih baik situs tetap normal (fail-open).
      console.error("[FeatureFlags] gagal memuat flag:", err);
      if (!dibongkar.current) setFlags(semuaFiturAktif());
    } finally {
      terakhirMuat.current = Date.now();
      if (!dibongkar.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void muat();
  }, [muat]);

  // Segarkan saat kembali ke tab (perubahan toggle super admin langsung terlihat).
  useEffect(() => {
    const onKembali = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - terakhirMuat.current < JEDA_KEMBALI) return;
      void muat();
    };
    document.addEventListener("visibilitychange", onKembali);
    return () => document.removeEventListener("visibilitychange", onKembali);
  }, [muat]);

  const value = useMemo<FeatureFlagsValue>(() => {
    const isOn = (key: FeatureKey) => flags[key]?.enabled ?? true;
    const meta = (key: FeatureKey): FeatureMeta => ({
      title: flags[key]?.title ?? FEATURE_DEFAULTS[key].title,
      description:
        flags[key]?.description ?? FEATURE_DEFAULTS[key].description,
    });
    return { isOn, meta, all: flags, loading };
  }, [flags, loading]);

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

/** Hook konsumen — melempar bila dipakai di luar provider agar salah pasang
 *  ketahuan di dev, bukan jadi bug diam-diam. */
export function useFeatureFlags(): FeatureFlagsValue {
  const ctx = useContext(FeatureFlagsContext);
  if (!ctx) {
    throw new Error(
      "useFeatureFlags harus dipakai di dalam <FeatureFlagsProvider>",
    );
  }
  return ctx;
}

export { FEATURE_KEYS, FEATURE_DEFAULTS };
export type { FeatureKey, FeatureFlagRow, FeatureMeta };