import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import Price from './Price.jsx'
import { useStore } from '../store.jsx'

export default function ProductCard({ product, className = '' }) {
  const { wishlist, toggleWishlist } = useStore()
  const saved = wishlist.includes(product.id)
  return (
    <article className={`relative ${className}`}>
      <Link to={`/produkt/${product.id}`} className="block">
        <div className="group/img relative aspect-[4/5] overflow-hidden bg-img">
          <img src={product.images[0]} alt={product.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover/img:scale-[1.03]" />
          <img src={product.images[1]} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 [@media(hover:hover)]:group-hover/img:opacity-100" />
        </div>
        <div className="pt-2 pr-1">
          <h3 className="label leading-snug">{product.name}</h3>
          <Price product={product} className="mt-0.5 text-sm text-muted" />
          <div className="mt-1.5 flex gap-1">
            {product.colors.map((c) => (
              <span key={c.name} title={c.name} className="h-2.5 w-2.5 rounded-full border border-line" style={{ background: c.hex }} />
            ))}
          </div>
        </div>
      </Link>
      {product.isNew && <span className="label absolute left-0 top-0 bg-ink px-2 py-1 text-[10px] text-white">Neu</span>}
      <button
        onClick={() => toggleWishlist(product.id)}
        aria-label={saved ? `${product.name} von Merkliste entfernen` : `${product.name} merken`}
        aria-pressed={saved}
        className="absolute right-0 top-0 grid h-11 w-11 place-items-center text-ink"
      >
        <Icon name="bookmark" size={20} fill={saved} />
      </button>
    </article>
  )
}
