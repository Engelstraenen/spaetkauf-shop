import { useState } from 'react'
import { useParams } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Icon from '../components/Icon.jsx'
import BottomSheet from '../components/BottomSheet.jsx'
import Slider from '../components/Slider.jsx'
import ProductCard from '../components/ProductCard.jsx'
import Price from '../components/Price.jsx'
import { SIZES, categoryLabel } from '../data/categories.js'
import { FREE_SHIPPING_FROM } from '../lib/cart.js'
import { getProduct, useStore } from '../store.jsx'

const sizeChart = [
  ['XS', 48, 66, 58], ['S', 52, 68, 60], ['M', 56, 70, 62],
  ['L', 60, 72, 64], ['XL', 64, 74, 66], ['XXL', 68, 76, 68],
]

// Reihenfolge der Bilder aus scripts/draw.mjs
const SHOTS = ['Produkt vorne', 'Look vorne', 'Look hinten', 'Produkt hinten', 'Detail']
const MODELS = { A: 'Kalle ist 1,84 m groß und trägt Größe M', B: 'Mira ist 1,72 m groß und trägt Größe S' }

export default function Product() {
  const { id } = useParams()
  const product = getProduct(id)
  // key setzt den Auswahl-State zurück, wenn man über "Passt dazu" weiternavigiert.
  return product ? <ProductView key={id} product={product} /> : (
    <>
      <Header title="Nicht gefunden" back />
      <p className="p-8 text-center text-muted">Dieses Produkt gibt es nicht.</p>
    </>
  )
}

function ProductView({ product }) {
  const { products, addToCart, wishlist, toggleWishlist } = useStore()
  const oneSize = product.category === 'accessoires'
  const [color, setColor] = useState(product.colors[0].name)
  const [size, setSize] = useState(oneSize ? 'One Size' : null)
  const [sheet, setSheet] = useState(false)
  const [error, setError] = useState(false)
  const saved = wishlist.includes(product.id)
  const images = product.colorImages[color]

  const matching = products
    .filter((p) => p.id !== product.id && p.category !== product.category &&
      (product.gender === 'unisex' || p.gender === 'unisex' || p.gender === product.gender))
    .slice(0, 6)

  const add = () => {
    if (!size) return setError(true)
    addToCart(product.id, color, size)
  }

  const accordion = [
    ['Material & Pflege', `${product.material}. Bei 30 °C auf links waschen, nicht in den Trockner.`],
    ['Passform', `${product.fit}. ${MODELS[product.model]}.`],
    ['Versand & Rückgabe', `Versandkostenfrei ab ${FREE_SHIPPING_FROM} €, sonst 4,95 €. 30 Tage kostenlose Rückgabe.`],
  ]

  return (
    <>
      <Header title={categoryLabel(product.category)} back />
      <div className="relative">
        <Slider key={color} label={`Bilder: ${product.name}`} className="aspect-[4/5] bg-img" thumbs={images}>
          {images.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={`${product.name} in ${color}, ${SHOTS[i]}`}
              decoding="async"
              className="h-full w-full object-cover"
            />
          ))}
        </Slider>
        {product.isNew && <span className="label absolute left-0 top-0 bg-ink px-2 py-1 text-[10px] text-white">Neu</span>}
      </div>

      <div className="px-4 pt-4">
        <div className="flex items-start justify-between gap-3">
          <h1 className="display text-4xl">{product.name}</h1>
          <button
            onClick={() => toggleWishlist(product.id)}
            aria-pressed={saved}
            aria-label={saved ? 'Von Merkliste entfernen' : 'Merken'}
            className="grid h-11 w-11 shrink-0 place-items-center border border-line"
          >
            <Icon name="bookmark" fill={saved} />
          </button>
        </div>
        <Price product={product} className="mt-2 text-lg font-semibold" />
        <p className="text-xs text-muted">inkl. MwSt., zzgl. Versand</p>
        <p className="mt-3 text-sm leading-relaxed">{product.description}</p>

        <fieldset className="mt-6">
          <legend className="label">Farbe: <span className="text-muted">{color}</span></legend>
          <div className="mt-2 flex gap-2">
            {product.colors.map((c) => (
              <button
                key={c.name}
                onClick={() => setColor(c.name)}
                aria-label={c.name}
                aria-pressed={color === c.name}
                className={`grid h-11 w-11 place-items-center rounded-full border-2 ${color === c.name ? 'border-fg' : 'border-transparent'}`}
              >
                <span className="h-8 w-8 rounded-full border border-line" style={{ background: c.hex }} />
              </button>
            ))}
          </div>
        </fieldset>

        {!oneSize && (
          <fieldset className="mt-6">
            <div className="flex items-center justify-between">
              <legend className="label">Größe</legend>
              <button onClick={() => setSheet(true)} className="label flex h-11 items-center gap-1 text-muted underline underline-offset-4">
                <Icon name="ruler" size={16} /> Größentabelle
              </button>
            </div>
            <div className="mt-1 grid grid-cols-6 gap-1.5">
              {SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => { setSize(s); setError(false) }}
                  aria-pressed={size === s}
                  className={`h-12 border text-sm font-semibold ${size === s ? 'border-fg bg-fg text-bg' : 'border-line bg-surface'}`}
                >
                  {s}
                </button>
              ))}
            </div>
            {error && <p role="alert" className="mt-2 text-sm font-semibold text-accent">Bitte wähle eine Größe.</p>}
          </fieldset>
        )}

        <button onClick={add} className="btn-primary mt-6">
          <Icon name="bag" size={18} /> In den Warenkorb
        </button>

        <div className="mt-8 divide-y divide-line border-y border-line">
          {accordion.map(([title, text]) => (
            <details key={title} className="group">
              <summary className="label flex h-14 cursor-pointer items-center justify-between">
                {title}
                <Icon name="chevron" size={18} className="chev transition-transform" />
              </summary>
              <p className="pb-4 text-sm leading-relaxed text-muted">{text}</p>
            </details>
          ))}
        </div>
      </div>

      {matching.length > 0 && (
        <section className="py-8">
          <h2 className="display mb-3 px-4 text-3xl">Passt dazu</h2>
          <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4">
            {matching.map((p) => <ProductCard key={p.id} product={p} className="w-[44%] shrink-0 snap-start" />)}
          </div>
        </section>
      )}

      <BottomSheet open={sheet} onClose={() => setSheet(false)} title="Größentabelle">
        <table className="w-full text-left text-sm">
          <caption className="mb-3 text-left text-xs text-muted">Maße in cm, am liegenden Kleidungsstück gemessen.</caption>
          <thead>
            <tr className="label border-b border-line">
              <th className="py-2">Größe</th><th>Brust ½</th><th>Länge</th><th>Ärmel</th>
            </tr>
          </thead>
          <tbody>
            {sizeChart.map(([s, ...m]) => (
              <tr key={s} className={`border-b border-line ${size === s ? 'font-semibold text-accent' : ''}`}>
                <td className="py-2.5">{s}</td>{m.map((v, i) => <td key={i}>{v}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </BottomSheet>
    </>
  )
}
