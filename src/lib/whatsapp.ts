import { WHATSAPP_NUMBER, BRAND } from '../config/contact'

/**
 * Membangun URL wa.me secara dinamis dengan pesan otomatis.
 * Semua tombol "pesan" di halaman memakai helper ini.
 */
export function buildWhatsAppUrl(message: string, number: string = WHATSAPP_NUMBER): string {
  const text = encodeURIComponent(message)
  return `https://wa.me/${number}?text=${text}`
}

/** Pesan umum untuk CTA di Hero & Footer (tanpa produk spesifik). */
export function generalOrderUrl(): string {
  return buildWhatsAppUrl(
    `Halo ${BRAND.name}! 👋 Saya tertarik dengan roti-nya dan ingin memesan. Boleh info menu & ketersediaannya?`,
  )
}

/** Pesan spesifik untuk kartu produk — nama produk sudah terisi otomatis. */
export function productOrderUrl(productName: string): string {
  return buildWhatsAppUrl(
    `Halo ${BRAND.name}! 👋 Saya mau pesan *${productName}*. Apakah tersedia hari ini?`,
  )
}

/** Pesan untuk pesanan custom / acara. */
export function customOrderUrl(): string {
  return buildWhatsAppUrl(
    `Halo ${BRAND.name}! 👋 Saya ingin memesan roti/kue custom untuk acara. Boleh dibantu info-nya?`,
  )
}
