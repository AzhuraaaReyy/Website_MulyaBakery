import { AnimatePresence, motion } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useFeatureFlags } from '../context/FeatureFlagsContext'

/**
 * Tombol keranjang mengambang. Sengaja hanya muncul saat keranjang terisi —
 * kalau kosong tidak ada gunanya, jadi tidak menutupi konten.
 * Bila fitur keranjang dimatikan super admin, tombol ini disembunyikan total.
 */
export default function CartButton() {
  const { count, open } = useCart()
  const { isOn } = useFeatureFlags()
  if (!isOn('keranjang')) return null

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.button
          type="button"
          onClick={open}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          aria-label={`Buka keranjang, ${count} item`}
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-cocoa-800 text-paper-50 shadow-cocoa-lg transition-colors hover:bg-cocoa-900"
        >
          <ShoppingBag className="h-6 w-6" aria-hidden />
          {/* Badge jumlah — `key={count}` memicu animasi kecil tiap berubah. */}
          <motion.span
            key={count}
            initial={{ scale: 0.4 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 18 }}
            className="absolute -right-1 -top-1 flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-caramel px-1.5 font-text text-xs font-extrabold text-cocoa-900 ring-2 ring-paper-100"
          >
            {count}
          </motion.span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
