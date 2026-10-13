import { useEffect } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Icon from '../components/Icon.jsx'
import { Row } from './Cart.jsx'
import { formatPrice } from '../lib/cart.js'
import { getProduct, useStore } from '../store.jsx'

export default function Confirmation() {
  const order = useLocation().state?.order
  const { clearCart } = useStore()
  useEffect(() => {
    if (order) clearCart()
  }, [order])
  if (!order) return <Navigate to="/" replace />
  const { address: a, totals: t } = order

  return (
    <>
      <Header title="Bestätigung" />
      <div className="px-4 py-10 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center bg-accent text-accent-fg">
          <Icon name="check" size={32} />
        </div>
        <h1 className="display mt-5 text-5xl">Danke, {a.firstName}!</h1>
        <p className="mt-3 text-sm text-muted">Demo-Bestellung <strong className="text-fg">{order.number}</strong></p>
        <p className="mx-auto mt-4 max-w-[34ch] border border-accent px-3 py-2 text-xs">
          Dies war eine Demo. Es wurde nichts bestellt, nichts bezahlt und keine Daten wurden gesendet.
        </p>
      </div>

      <section className="mx-4 border-t border-line py-5 text-sm">
        <h2 className="label mb-3">Lieferung an</h2>
        <p>{a.firstName} {a.lastName}<br />{a.street}<br />{a.zip} {a.city}</p>
        <p className="mt-2 text-muted">{order.shipping.label} · {order.shipping.note} · {order.payment}</p>
      </section>

      <section className="mx-4 border-t border-line py-5 text-sm">
        <h2 className="label mb-3">Artikel</h2>
        <ul className="space-y-2">
          {order.items.map((it) => {
            const p = getProduct(it.id)
            return p && (
              <li key={it.key} className="flex justify-between gap-3">
                <span>{it.qty} × {p.name} <span className="text-muted">({it.color}, {it.size})</span></span>
                <span className="shrink-0">{formatPrice(p.price * it.qty)}</span>
              </li>
            )
          })}
        </ul>
        <div className="mt-4 space-y-2 border-t border-line pt-4">
          <Row label="Versand" value={t.shipping ? formatPrice(t.shipping) : 'Kostenlos'} />
          <Row label="Gesamt" value={formatPrice(t.total)} strong />
        </div>
      </section>

      <div className="px-4 pb-8">
        <Link to="/" className="btn-ghost">Weiter shoppen</Link>
      </div>
    </>
  )
}
