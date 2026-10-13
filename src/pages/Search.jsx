import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Icon from '../components/Icon.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { categories, categoryLabel } from '../data/categories.js'
import { useStore } from '../store.jsx'

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export default function Search() {
  const { products } = useStore()
  const [q, setQ] = useState('')
  const terms = norm(q).split(/\s+/).filter(Boolean)
  const results = terms.length
    ? products.filter((p) => {
        const hay = norm(`${p.name} ${categoryLabel(p.category)} ${p.description} ${p.colors.map((c) => c.name).join(' ')}`)
        return terms.every((t) => hay.includes(t))
      })
    : []

  return (
    <>
      <Header title="Suche" />
      <div className="px-4 py-3">
        <label className="flex h-12 items-center gap-2 border border-fg bg-surface px-3">
          <Icon name="search" size={18} className="text-muted" />
          <span className="sr-only">Produkte suchen</span>
          <input
            type="search"
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Hoodie, Kobalt, Strick …"
            className="h-full w-full bg-transparent text-base outline-none placeholder:text-muted"
          />
          {q && (
            <button onClick={() => setQ('')} aria-label="Eingabe löschen" className="grid h-11 w-8 place-items-center">
              <Icon name="close" size={18} />
            </button>
          )}
        </label>
      </div>

      {!terms.length && (
        <div className="px-4">
          <h2 className="label mb-3 text-muted">Kategorien</h2>
          <ul className="divide-y divide-line border-y border-line">
            {categories.map((c) => (
              <li key={c.id}>
                <Link to={`/shop?kategorie=${c.id}`} className="label flex h-14 items-center justify-between">
                  {c.label} <Icon name="chevron" size={18} className="-rotate-90" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {terms.length > 0 && (
        <>
          <p aria-live="polite" className="px-4 text-sm text-muted">
            {results.length} Treffer für „{q.trim()}“
          </p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 px-4 py-4">
            {results.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </>
      )}
    </>
  )
}
