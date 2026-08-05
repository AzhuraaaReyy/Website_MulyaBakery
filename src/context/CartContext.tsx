import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react'
import type { Product } from '../data/products'

/**
 * State keranjang belanja — murni di sisi klien (tanpa server/DB).
 * Pelanggan menumpuk produk di sini, lalu checkout-nya diarahkan ke WhatsApp
 * lewat `cartOrderUrl` (lihat lib/whatsapp.ts). Tidak ada data yang disimpan
 * atau dikirim ke mana pun selain ke chat WA milik owner.
 */
export interface CartItem {
  product: Product
  qty: number
}

type Action =
  | { type: 'add'; product: Product; qty: number }
  | { type: 'remove'; id: string }
  | { type: 'setQty'; id: string; qty: number }
  | { type: 'clear' }

// Reducer sengaja dibuat murni & kecil biar gampang ditest dan gak ada efek
// samping tersembunyi — semua perubahan keranjang lewat sini.
function reducer(state: CartItem[], action: Action): CartItem[] {
  switch (action.type) {
    case 'add': {
      const existing = state.find((it) => it.product.id === action.product.id)
      // Produk yang sama tidak digandakan jadi baris baru — jumlahnya ditambah.
      if (existing) {
        return state.map((it) =>
          it.product.id === action.product.id
            ? { ...it, qty: it.qty + action.qty }
            : it,
        )
      }
      return [...state, { product: action.product, qty: action.qty }]
    }
    case 'remove':
      return state.filter((it) => it.product.id !== action.id)
    case 'setQty': {
      // Turun ke 0 (atau minus) sama dengan menghapus item.
      if (action.qty <= 0) return state.filter((it) => it.product.id !== action.id)
      return state.map((it) =>
        it.product.id === action.id ? { ...it, qty: action.qty } : it,
      )
    }
    case 'clear':
      return []
    default:
      return state
  }
}

interface CartContextValue {
  items: CartItem[]
  /** Total jumlah unit (untuk badge di tombol keranjang). */
  count: number
  /** Total harga (Rupiah, angka mentah). */
  total: number
  isOpen: boolean
  open: () => void
  close: () => void
  add: (product: Product, qty?: number) => void
  remove: (id: string) => void
  setQty: (id: string, qty: number) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(reducer, [])
  const [isOpen, setIsOpen] = useState(false)

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((n, it) => n + it.qty, 0)
    const total = items.reduce((n, it) => n + it.qty * it.product.price, 0)
    return {
      items,
      count,
      total,
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      add: (product, qty = 1) => dispatch({ type: 'add', product, qty }),
      remove: (id) => dispatch({ type: 'remove', id }),
      setQty: (id, qty) => dispatch({ type: 'setQty', id, qty }),
      clear: () => dispatch({ type: 'clear' }),
    }
  }, [items, isOpen])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// Hook konsumen — sengaja melempar bila dipakai di luar provider, biar salah
// pasang ketahuan langsung saat dev, bukan jadi bug diam-diam.
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart harus dipakai di dalam <CartProvider>')
  return ctx
}
