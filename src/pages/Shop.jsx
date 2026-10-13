import { useSearchParams } from 'react-router-dom'
import Header from '../components/Header.jsx'
import GenderToggle from '../components/GenderToggle.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { categories } from '../data/categories.js'
import { useStore } from '../store.jsx'

const sorts = [
  { id: 'empfohlen', label: 'Empfohlen' },
  { id: 'neu', label: 'Neuheiten' },
  { id: 'preis-auf', label: 'Preis aufsteigend' },
  { id: 'preis-ab', label: 'Preis absteigend' },
]

export default function Shop() {
  const { products, matchesGender } = useStore()
  const [params, setParams] = useSearchParams()
  const category = params.get('kategorie')
  const sort = params.get('sort') ?? 'empfohlen'

  const set = (key, value) => {
    const next = new URLSearchParams(params)
    value ? next.set(key, value) : next.delete(key)
    setParams(next, { replace: true })
  }

  const list = products
    .filter((p) => matchesGender(p) && (!category || p.category === category))
    .sort((a, b) =>
      sort === 'preis-auf' ? a.price - b.price
      : sort === 'preis-ab' ? b.price - a.price
      : sort === 'neu' ? b.isNew - a.isNew
      : b.bestseller - a.bestseller,
    )

  const chip = (active) => `label shrink-0 rounded-full border px-4 py-3 ${active ? 'border-fg bg-fg text-bg' : 'border-line bg-surface'}`

  return (
    <>
      <Header title="Shop" />
      <div className="space-y-3 px-4 pt-4">
        <GenderToggle />
      </div>
      <nav aria-label="Kategorien" className="no-scrollbar flex gap-2 overflow-x-auto px-4 pt-3">
        <button className={chip(!category)} onClick={() => set('kategorie', null)} aria-pressed={!category}>Alle</button>
        {categories.map((c) => (
          <button key={c.id} className={chip(category === c.id)} onClick={() => set('kategorie', c.id)} aria-pressed={category === c.id}>
            {c.label}
          </button>
        ))}
      </nav>
      <div className="flex items-center justify-between px-4 pt-4">
        <p className="text-sm text-muted">{list.length} Artikel</p>
        <label className="label flex items-center gap-2">
          <span className="sr-only">Sortieren</span>
          <select value={sort} onChange={(e) => set('sort', e.target.value)} className="h-11 border border-line bg-surface px-2 uppercase">
            {sorts.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-6 px-4 py-4">
        {list.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
      {!list.length && <p className="px-4 py-10 text-center text-muted">Keine Artikel in dieser Auswahl.</p>}
    </>
  )
}
