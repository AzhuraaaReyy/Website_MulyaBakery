/** Data dummy testimoni pelanggan. Ganti dengan ulasan asli nanti. */

export interface Testimonial {
  id: string
  name: string
  role: string
  avatar: string
  rating: number
  quote: string
}

export const testimonials: Testimonial[] = [
  {
    id: 't1',
    name: 'Dinda Pramesti',
    role: 'Ibu Rumah Tangga',
    avatar: '/images/avatar-dinda.jpg',
    rating: 5,
    quote:
      'Rotinya empuk banget dan masih hangat pas diantar. Anak-anak jadi doyan sarapan roti. Langganan tiap minggu!',
  },
  {
    id: 't2',
    name: 'Rangga Saputra',
    role: 'Karyawan Kantoran',
    avatar: '/images/avatar-rangga.jpg',
    rating: 5,
    quote:
      'Croissant-nya juara, renyah dan buttery. Pesan lewat WhatsApp gampang, responnya cepat dan ramah.',
  },
  {
    id: 't3',
    name: 'Sari Melati',
    role: 'Pemilik Kafe',
    avatar: '/images/avatar-sari.jpg',
    rating: 5,
    quote:
      'Sudah beberapa kali pesan roti tawar untuk kafe saya. Kualitas konsisten, fresh, dan harganya masuk. Recommended!',
  },
  {
    id: 't4',
    name: 'Bagas Wibowo',
    role: 'Mahasiswa',
    avatar: '/images/avatar-bagas.jpg',
    rating: 4,
    quote:
      'Nastar-nya lumer di mulut, nggak terlalu manis. Cocok buat oleh-oleh. Pengiriman juga tepat waktu.',
  },
]
