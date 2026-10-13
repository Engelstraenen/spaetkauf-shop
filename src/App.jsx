import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import BottomNav from './components/BottomNav.jsx'
import Toast from './components/Toast.jsx'
import Home from './pages/Home.jsx'
import Shop from './pages/Shop.jsx'
import Product from './pages/Product.jsx'
import Search from './pages/Search.jsx'
import Wishlist from './pages/Wishlist.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import Confirmation from './pages/Confirmation.jsx'

export default function App() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  return (
    <div className="mx-auto min-h-dvh max-w-[480px] bg-bg sm:border-x sm:border-line">
      <main style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/produkt/:id" element={<Product />} />
          <Route path="/suche" element={<Search />} />
          <Route path="/merkliste" element={<Wishlist />} />
          <Route path="/warenkorb" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/bestaetigung" element={<Confirmation />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Toast />
      <BottomNav />
    </div>
  )
}
