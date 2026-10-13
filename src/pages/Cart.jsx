import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Icon from '../components/Icon.jsx'
import { Empty } from './Wishlist.jsx'
import { cartTotals, formatPrice } from '../lib/cart.js'
import { getProduct, useStore } from '../store.jsx'

export default function Cart() {
  const { products, cart, setQty } = useStore()
  const t = cartTotals(cart, products)

  if (!cart.length)
    return (
      <>
        <Header title="Warenkorb" />
        <Empty title="Dein Warenkorb ist leer" text="Schau dich in der neuen Kollektion um." />
      </>
    )

  return (
    <>
      <Header title={`Warenkorb (${t.count})`} />
      <div className="border-b border-line px-4 py-4">
        <p className="text-sm">
          {t.missingForFree > 0
            ? <>Noch <strong>{formatPrice(t.missingForFree)}</strong> bis zum kostenlosen Versand.</>
            : <strong>Dein Standardversand ist kostenlos.</strong>}
        </p>
        <div
          role="progressbar"
          aria-label="Fortschritt bis zum kostenlosen Versand"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(t.progress * 100)}
          className="mt-2 h-1.5 bg-line"
        >
          <div className="h-full bg-accent transition-[width] duration-500" style={{ width: `${t.progress * 100}%` }} />
        </div>
      </div>

      <ul className="divide-y divide-line px-4">
        {cart.map((it) => {
          const p = getProduct(it.id)
          if (!p) return null
          return (
            <li key={it.key} className="flex gap-3 py-4">
              <Link to={`/produkt/${p.id}`} className="w-24 shrink-0 bg-img">
                <img src={p.colorImages[it.color]?.[0] ?? p.images[0]} alt={`${p.name} in ${it.color}`} className="aspect-[4/5] w-full object-cover" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <h3 className="label leading-snug">{p.name}</h3>
                <p className="mt-1 text-xs text-muted">{it.color} · {it.size}</p>
                <p className="mt-1 text-sm font-semibold">{formatPrice(p.price * it.qty)}</p>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="flex items-center border border-line">
                    <button onClick={() => setQty(it.key, it.qty - 1)} aria-label="Menge verringern" className="grid h-10 w-10 place-items-center">
                      <Icon name="minus" size={16} />
                    </button>
                    <span aria-live="polite" className="w-8 text-center text-sm font-semibold">{it.qty}</span>
                    <button onClick={() => setQty(it.key, it.qty + 1)} disabled={it.qty >= 10} aria-label="Menge erhöhen" className="grid h-10 w-10 place-items-center disabled:opacity-30">
                      <Icon name="plus" size={16} />
                    </button>
                  </div>
                  <button onClick={() => setQty(it.key, 0)} className="label h-10 text-muted underline underline-offset-4">Entfernen</button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      <section className="space-y-2 border-t border-line px-4 py-5 text-sm">
        <Row label="Zwischensumme" value={formatPrice(t.subtotal)} />
        <Row label="Versand (Standard)" value={t.shipping ? formatPrice(t.shipping) : 'Kostenlos'} />
        <Row label="Gesamt" value={formatPrice(t.total)} strong />
        <p className="text-xs text-muted">inkl. MwSt.</p>
        <Link to="/checkout" className="btn-primary mt-4">Zur Kasse</Link>
      </section>
    </>
  )
}

export function Row({ label, value, strong }) {
  return (
    <div className={`flex justify-between ${strong ? 'pt-2 text-base font-bold' : ''}`}>
      <span>{label}</span><span>{value}</span>
    </div>
  )
}
