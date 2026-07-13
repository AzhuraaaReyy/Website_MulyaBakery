/** Data dummy FAQ. Ganti dengan pertanyaan umum asli nanti. */

export interface FaqItem {
  question: string
  answer: string
}

export const faqs: FaqItem[] = [
  {
    question: 'Berapa minimal order untuk pemesanan?',
    answer:
      'Untuk roti satuan tidak ada minimal order. Untuk pesanan custom (kue acara/hampers) minimal pemesanan Rp100.000 dan dipesan minimal H-2 agar hasilnya maksimal.',
  },
  {
    question: 'Area pengiriman ke mana saja?',
    answer:
      'Kami melayani pengiriman ke seluruh area kota dengan ongkir menyesuaikan jarak. Untuk luar kota bisa via kurir ekspedisi (khusus produk tahan lama seperti kue kering).',
  },
  {
    question: 'Metode pembayaran apa saja yang diterima?',
    answer:
      'Kami menerima transfer bank, e-wallet (GoPay, OVO, DANA, ShopeePay), QRIS, dan bayar tunai saat pengambilan (COD di lokasi).',
  },
  {
    question: 'Bisa pesan custom untuk acara?',
    answer:
      'Tentu! Kami menerima pesanan custom untuk ulang tahun, arisan, hampers, dan acara kantor. Hubungi kami via WhatsApp untuk diskusi tema, rasa, dan jumlah.',
  },
  {
    question: 'Apakah roti menggunakan pengawet?',
    answer:
      'Tidak. Semua produk dibuat fresh harian tanpa bahan pengawet. Karena itu roti kami paling nikmat dinikmati di hari yang sama dan bisa disimpan di kulkas 2–3 hari.',
  },
  {
    question: 'Jam berapa pesanan bisa diambil/diantar?',
    answer:
      'Pesanan bisa diambil/diantar mengikuti jam operasional. Untuk roti fresh pagi, disarankan pesan H-1 agar kami siapkan sesuai jumlah yang diinginkan.',
  },
]
