import { Link } from 'react-router-dom'
import ProductCard from './ProductCard.jsx'

export default function Carousel({ title, products, to }) {
  if (!products.length) return null
  return (
    <section className="py-6">
      <div className="mb-3 flex items-end justify-between px-4">
        <h2 className="display text-3xl">{title}</h2>
        {to && <Link to={to} className="label text-muted underline underline-offset-4">Alle</Link>}
      </div>
      <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} className="w-[44%] shrink-0 snap-start" />
        ))}
      </div>
    </section>
  )
}
