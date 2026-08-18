import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Loader2, LocateFixed, MapPin, X } from "lucide-react";
import { LOCATION } from "../config/contact";

/* ─────────────────────────────────────────────────────────────────────────────
 * MODAL PILIH LOKASI PENGIRIMAN
 *
 * Membantu pelanggan menentukan alamat tanpa harus mengetik panjang:
 *   - "Gunakan lokasi saya saat ini"  -> navigator.geolocation
 *   - klik/geser pin di peta          -> pin bisa dipindah
 * Alamat diisi otomatis lewat reverse-geocode Nominatim (gratis, tanpa API
 * key), lalu dipakai mengisi textarea alamat di CartModal (tetap bisa diedit).
 * ─────────────────────────────────────────────────────────────────────────── */

/** Konversi koordinat -> alamat via Nominatim (OpenStreetMap). */
async function reverseGeocode(lng: number, lat: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2&accept-language=id`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("gagal reverse geocode");
  const data = (await res.json()) as { display_name?: string };
  return data.display_name ?? "";
}

/** Marker pin berwarna rose — konsisten dengan aksen peta di section lokasi. */
function bikinMarkerEl(): HTMLElement {
  const el = document.createElement("div");
  el.innerHTML = `
    <div style="background-color:#e11d48;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.3);border:2.5px solid #fff;cursor:grab;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
    </div>`;
  return el;
}

export default function LocationPickerModal({
  open,
  onClose,
  onPilih,
}: {
  open: boolean;
  onClose: () => void;
  onPilih: (alamat: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  const [alamat, setAlamat] = useState("");
  const [memuat, setMemuat] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  // Buat map saat modal terbuka; bersihkan saat tertutup.
  useEffect(() => {
    if (!open) return;
    const el = containerRef.current;
    if (!el) return;

    const map = new maplibregl.Map({
      container: el,
      style: {
        version: 8,
        sources: {
          "osm-tiles": {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          },
        },
        layers: [
          {
            id: "osm-tiles-layer",
            type: "raster",
            source: "osm-tiles",
            minzoom: 0,
            maxzoom: 17,
          },
        ],
      },
      center: [LOCATION.lng, LOCATION.lat],
      zoom: 13,
    });

    // Klik di peta -> letakkan pin & isi alamat.
    map.on("click", (e) => {
      void pindahPin(e.lngLat.lng, e.lngLat.lat);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      setAlamat("");
      setGalat(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /** Letakkan/pindah pin lalu isi alamat dari reverse-geocode. */
  const pindahPin = async (lng: number, lat: number, fly = false) => {
    const map = mapRef.current;
    if (!map) return;
    setMemuat(true);
    setGalat(null);

    if (markerRef.current) {
      markerRef.current.setLngLat([lng, lat]);
    } else {
      markerRef.current = new maplibregl.Marker({ element: bikinMarkerEl(), draggable: true })
        .setLngLat([lng, lat])
        .addTo(map);
      markerRef.current.on("dragend", () => {
        const ll = markerRef.current?.getLngLat();
        if (ll) void pindahPin(ll.lng, ll.lat);
      });
    }

    if (fly) {
      map.flyTo({ center: [lng, lat], zoom: 15, essential: true });
    }

    try {
      const hasil = await reverseGeocode(lng, lat);
      setAlamat(hasil);
    } catch {
      setAlamat("");
      setGalat(
        "Gagal membaca alamat dari peta. Anda tetap bisa mengetik alamat secara manual.",
      );
    } finally {
      setMemuat(false);
    }
  };

  /** Pakai posisi GPS perangkat untuk menaruh pin. */
  const lokasiSaatIni = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGalat("Browser ini tidak mendukung akses lokasi.");
      return;
    }
    setMemuat(true);
    setGalat(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        void pindahPin(pos.coords.longitude, pos.coords.latitude, true);
      },
      () => {
        setMemuat(false);
        setGalat(
          "Tidak dapat mengakses lokasi. Periksa izin lokasi pada browser/HP Anda.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Tutup pilih lokasi"
            onClick={onClose}
            className="absolute inset-0 bg-cocoa-900/50 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Pilih lokasi pengiriman"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="relative flex w-full max-w-md flex-col overflow-hidden rounded-3xl bg-paper-100 shadow-cocoa-lg ring-1 ring-cocoa-700/10"
            style={{ height: "min(75dvh, 560px)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-cocoa-700/10 px-4 py-3 sm:px-5">
              <h3 className="flex items-center gap-2 font-heading text-base text-cocoa-800">
                <MapPin className="h-5 w-5 text-rose-600" aria-hidden />
                Pilih Lokasi Pengiriman
              </h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup"
                className="rounded-full p-2 text-cocoa-700/70 transition-colors hover:bg-paper-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tombol lokasi saat ini */}
            <div className="px-4 pt-3 sm:px-5">
              <button
                type="button"
                onClick={lokasiSaatIni}
                disabled={memuat}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 font-section3-p text-sm font-bold text-white shadow-md shadow-rose-600/20 transition-all hover:-translate-y-0.5 hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {memuat ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <LocateFixed className="h-4 w-4" aria-hidden />
                )}
                Gunakan lokasi saya saat ini
              </button>
              <p className="mt-1.5 font-section3-p text-[11px] text-cocoa-700/60">
                Atau klik/tap peta lalu geser pin untuk menyesuaikan.
              </p>
            </div>

            {/* Peta */}
            <div className="relative flex-1 px-4 py-3 sm:px-5">
              <div ref={containerRef} className="h-full w-full overflow-hidden rounded-2xl ring-1 ring-cocoa-700/15" />
            </div>

            {/* Alamat hasil + aksi */}
            <div className="border-t border-cocoa-700/10 bg-paper-50 px-4 py-3 sm:px-5">
              <span className="mb-1 block font-section3-p text-xs font-bold text-cocoa-700/80">
                Alamat terpilih
              </span>
              <p className="min-h-[2.5rem] font-section3-p text-sm leading-relaxed text-cocoa-800">
                {alamat || (galat ? "—" : "Pilih lokasi di peta atau gunakan lokasi saat ini.")}
              </p>
              {galat && (
                <p className="mt-1 font-section3-p text-[11px] text-red-500">
                  {galat}
                </p>
              )}
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full px-4 py-2.5 font-section3-p text-sm font-bold text-cocoa-800 ring-1 ring-cocoa-700/20 transition-colors hover:bg-paper-200"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => alamat.trim() && onPilih(alamat.trim())}
                  disabled={!alamat.trim() || memuat}
                  className="rounded-full bg-cocoa-800 px-4 py-2.5 font-section3-p text-sm font-bold text-paper-50 shadow-cocoa transition-all hover:-translate-y-0.5 hover:bg-cocoa-900 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  Gunakan alamat ini
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
