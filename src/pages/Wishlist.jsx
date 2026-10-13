import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { useStore } from '../store.jsx'

export default function Wishlist() {
  const { products, wishlist } = useStore()
  const list = products.filter((p) => wishlist.includes(p.id))
  return (
    <>
      <Header title="Merkliste" />
      {list.length ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 px-4 py-4">
          {list.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <Empty title="Noch nichts gemerkt" text="Tippe auf das Lesezeichen, um Teile für später zu speichern." />
      )}
    </>
  )
}

export function Empty({ title, text }) {
  return (
    <div className="px-6 py-20 text-center">
      <h2 className="display text-4xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-[28ch] text-sm text-muted">{text}</p>
      <Link to="/shop" className="btn-primary mx-auto mt-6 max-w-60">Zum Shop</Link>
    </div>
  )
}
