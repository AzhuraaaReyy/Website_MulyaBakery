/* ─────────────────────────────────────────────────────────────────────────────
 * HITUNGAN JARAK & ESTIMASI PENGANTARAN
 *
 * Dipakai panel admin (PesananPanel) untuk mengisi estimasi pengantaran
 * otomatis dari jarak toko → lokasi pelanggan:
 *   1. Alamat pelanggan di-geocode (Nominatim, gratis, tanpa API key).
 *   2. Jarak garis lurus dihitung dengan rumus haversine.
 *   3. Estimasi waktu = jarak / kecepatan rata-rata + waktu persiapan.
 *
 * Angka ini hanya perkiraan (jalur lurus, bukan rute jalan). Admin bisa melihat
 * rute asli di Google Maps (termasuk lalu lintas) lalu menyesuaikan, karena
 * estimasi di kolom pesanan tetap bisa diedit manual.
 * ─────────────────────────────────────────────────────────────────────────── */

import { LOCATION } from "../config/contact";

/** Kecepatan rata-rata kurir di area perkotaan (km/jam). */
export const KECEPATAN_KMH = 25;
/** Waktu persiapan pesanan di toko (menit). */
export const BUFFER_MENIT = 10;
/** Estimasi terendah yang ditampilkan (menit). */
export const MIN_MENIT = 15;

/** Jarak garis lurus dua titik koordinat (km) — rumus haversine. */
export function hitungJarakKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const keRadian = (d: number) => (d * Math.PI) / 180;
  const dLat = keRadian(lat2 - lat1);
  const dLng = keRadian(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(keRadian(lat1)) *
      Math.cos(keRadian(lat2)) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Jarak garis lurus dari toko (koordinat di LOCATION) ke titik pelanggan. */
export function jarakDariToko(lat: number, lng: number): number {
  return hitungJarakKm(LOCATION.lat, LOCATION.lng, lat, lng);
}

/**
 * Estimasi waktu pengantaran (menit) dari jarak.
 * Dibulatkan naik ke kelipatan 5 dengan batas bawah MIN_MENIT.
 */
export function estimasiMenit(jarakKm: number): number {
  if (!Number.isFinite(jarakKm) || jarakKm < 0) return MIN_MENIT;
  const menit = (jarakKm / KECEPATAN_KMH) * 60 + BUFFER_MENIT;
  return Math.max(MIN_MENIT, Math.ceil(menit / 5) * 5);
}

/** "3,2 km" — format jarak untuk ditampilkan. */
export function formatJarakKm(km: number): string {
  return `${km.toLocaleString("id-ID", { maximumFractionDigits: 1 })} km`;
}

/** "±20 menit" — format estimasi untuk kolom pesanan & pesan WA. */
export function formatEstimasiMenit(menit: number): string {
  return `±${menit} menit`;
}

/** Titik koordinat hasil geocode. */
export interface TitikGeocode {
  lat: number;
  lng: number;
}

/**
 * Forward-geocode alamat via Nominatim (OpenStreetMap).
 * Mengembalikan titik pelanggan, atau `undefined` bila alamat kosong / tidak
 * dikenali. Dipanggil manual (lewat tombol), bukan otomatis, karena Nominatim
 * membatasi ±1 permintaan/detik.
 */
export async function geocodeAlamat(
  alamat: string,
): Promise<TitikGeocode | undefined> {
  const q = alamat.trim();
  if (!q) return undefined;

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    q,
  )}&format=jsonv2&limit=1&accept-language=id`;

  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return undefined;
    const data = (await res.json()) as { lat?: string; lon?: string }[];
    const hasil = data[0];
    if (!hasil || !hasil.lat || !hasil.lon) return undefined;
    return { lat: Number(hasil.lat), lng: Number(hasil.lon) };
  } catch {
    return undefined;
  }
}

/** Tautan rute toko → titik pelanggan di Google Maps (termasuk info lalu lintas). */
export function urlRuteMaps(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${LOCATION.lat},${LOCATION.lng}&destination=${lat},${lng}&travelmode=driving`;
}