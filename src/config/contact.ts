/**
 * Konfigurasi kontak global.
 * Ganti nilai di sini dengan data asli UMKM — dipakai di seluruh halaman.
 */

// Nomor WhatsApp tujuan (format internasional tanpa tanda "+", tanpa spasi).
// Contoh untuk Indonesia: 62 + nomor tanpa angka 0 di depan.
export const WHATSAPP_NUMBER = '6281234567890'

export const BRAND = {
  name: 'Roti Bahagia',
  tagline: 'Roti rumahan, dibuat dengan cinta setiap hari.',
  established: 2021,
}

export const CONTACT = {
  whatsapp: WHATSAPP_NUMBER,
  whatsappDisplay: '+62 812-3456-7890',
  phone: '+62 812-3456-7890',
  instagram: 'rotibahagia.id',
  instagramUrl: 'https://instagram.com/rotibahagia.id',
  email: 'halo@rotibahagia.id',
}

export const LOCATION = {
  addressLine: 'Jl. Melati Indah No. 12, Kel. Sukamaju',
  city: 'Bandung, Jawa Barat 40123',
  mapsQuery: 'Jl. Melati Indah No. 12 Bandung',
  /**
   * (Opsional) Tempel URL embed dari Google Maps untuk menampilkan lokasi PERSIS.
   * Cara: buka Google Maps → cari lokasi → Share/Bagikan → "Embed a map" →
   * salin isi atribut src="..." pada iframe, tempel di sini.
   * Bila dibiarkan kosong, peta otomatis dibuat dari `mapsQuery` di atas.
   */
  mapEmbedSrc: '',
  hours: [
    { day: 'Senin – Jumat', time: '07.00 – 20.00' },
    { day: 'Sabtu – Minggu', time: '08.00 – 21.00' },
    { day: 'Hari libur nasional', time: '08.00 – 15.00' },
  ],
}
