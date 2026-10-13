import { createContext, useContext, useEffect, useState } from 'react'
import products from './data/products.json'
import { lineKey } from './lib/cart.js'

const StoreContext = createContext(null)

function usePersisted(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : initial
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {}
  }, [key, value])
  return [value, setValue]
}

export function StoreProvider({ children }) {
  const [cart, setCart] = usePersisted('sk-cart', [])
  const [wishlist, setWishlist] = usePersisted('sk-wishlist', [])
  const [gender, setGender] = usePersisted('sk-gender', 'alle')
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  const [toast, setToast] = useState(null)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', dark ? '#0e0e0f' : '#ffffff')
  }, [dark])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2200)
    return () => clearTimeout(t)
  }, [toast])

  const toggleTheme = () => {
    setDark((d) => {
      try {
        localStorage.setItem('sk-theme', d ? 'light' : 'dark')
      } catch {}
      return !d
    })
  }

  const addToCart = (id, color, size) => {
    const key = lineKey(id, color, size)
    setCart((c) =>
      c.some((it) => it.key === key)
        ? c.map((it) => (it.key === key ? { ...it, qty: Math.min(10, it.qty + 1) } : it))
        : [...c, { key, id, color, size, qty: 1 }],
    )
    setToast('Zum Warenkorb hinzugefügt')
  }

  const setQty = (key, qty) =>
    setCart((c) => (qty <= 0 ? c.filter((it) => it.key !== key) : c.map((it) => (it.key === key ? { ...it, qty: Math.min(10, qty) } : it))))

  const clearCart = () => setCart([])

  const toggleWishlist = (id) => {
    const has = wishlist.includes(id)
    setWishlist((w) => (has ? w.filter((x) => x !== id) : [...w, id]))
    setToast(has ? 'Von der Merkliste entfernt' : 'Auf die Merkliste gesetzt')
  }

  // Unisex erscheint bei Herren und Damen.
  const matchesGender = (p, g = gender) => g === 'alle' || p.gender === g || p.gender === 'unisex'

  const value = {
    products,
    cart, addToCart, setQty, clearCart,
    wishlist, toggleWishlist,
    gender, setGender, matchesGender,
    dark, toggleTheme,
    toast, setToast,
  }
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export const useStore = () => useContext(StoreContext)
export const getProduct = (id) => products.find((p) => p.id === id)
