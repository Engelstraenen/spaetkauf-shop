import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import { Row } from './Cart.jsx'
import { SHIPPING_OPTIONS, cartTotals, formatPrice } from '../lib/cart.js'
import { useStore } from '../store.jsx'

// Fiktive Beispieldaten, vorausgefüllt.
const sample = {
  firstName: 'Kim', lastName: 'Beispiel', email: 'kim@beispiel.test',
  street: 'Kastanienallee 12', zip: '10435', city: 'Berlin',
}

const fields = [
  ['firstName', 'Vorname', 'given-name'], ['lastName', 'Nachname', 'family-name'],
  ['email', 'E-Mail', 'email', 'email'], ['street', 'Straße und Hausnummer', 'street-address'],
  ['zip', 'PLZ', 'postal-code'], ['city', 'Ort', 'address-level2'],
]

const payments = [
  { id: 'paypal', label: 'PayPal' },
  { id: 'karte', label: 'Kreditkarte' },
  { id: 'rechnung', label: 'Kauf auf Rechnung' },
]

export default function Checkout() {
  const { products, cart } = useStore()
  const navigate = useNavigate()
  const [form, setForm] = useState(sample)
  const [shipping, setShipping] = useState('standard')
  const [payment, setPayment] = useState('paypal')
  const t = cartTotals(cart, products, shipping)

  if (!cart.length) return <Navigate to="/warenkorb" replace />

  const submit = (e) => {
    e.preventDefault()
    const order = {
      number: `SK-${Date.now().toString().slice(-6)}`,
      items: cart,
      address: form,
      shipping: SHIPPING_OPTIONS.find((o) => o.id === shipping),
      payment: payments.find((p) => p.id === payment).label,
      totals: t,
    }
    // Warenkorb leert die Bestätigungsseite; hier leeren würde oben <Navigate to="/warenkorb"> auslösen.
    navigate('/bestaetigung', { replace: true, state: { order } })
  }

  const radio = (active) => `flex min-h-14 cursor-pointer items-center gap-3 border px-3 ${active ? 'border-fg bg-surface' : 'border-line'}`

  return (
    <>
      <Header title="Kasse" back />
      <div className="mx-4 mt-4 border border-accent px-3 py-2 text-sm">
        <strong className="label text-accent">Demo</strong> · Dies ist ein fiktiver Shop. Es wird nichts bestellt und nichts bezahlt. Bitte keine echten Daten eingeben.
      </div>

      <form onSubmit={submit} className="space-y-8 px-4 py-6">
        <fieldset>
          <legend className="display mb-3 text-2xl">Lieferadresse</legend>
          <div className="grid grid-cols-2 gap-3">
            {fields.map(([name, label, autoComplete, type = 'text']) => (
              <label key={name} className={name === 'street' || name === 'email' ? 'col-span-2' : ''}>
                <span className="label text-muted">{label}</span>
                <input
                  required
                  name={name}
                  type={type}
                  autoComplete={autoComplete}
                  value={form[name]}
                  onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                  className="mt-1 h-12 w-full border border-line bg-surface px-3 text-base outline-none focus:border-fg"
                />
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="display mb-3 text-2xl">Versandart</legend>
          <div className="space-y-2">
            {SHIPPING_OPTIONS.map((o) => {
              const price = cartTotals(cart, products, o.id).shipping
              return (
                <label key={o.id} className={radio(shipping === o.id)}>
                  <input type="radio" name="shipping" value={o.id} checked={shipping === o.id} onChange={() => setShipping(o.id)} className="accent-[var(--accent)]" />
                  <span className="flex-1">
                    <span className="label block">{o.label}</span>
                    <span className="text-xs text-muted">{o.note}</span>
                  </span>
                  <span className="text-sm font-semibold">{price ? formatPrice(price) : 'Kostenlos'}</span>
                </label>
              )
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="display mb-3 text-2xl">Zahlart</legend>
          <div className="space-y-2">
            {payments.map((p) => (
              <label key={p.id} className={radio(payment === p.id)}>
                <input type="radio" name="payment" value={p.id} checked={payment === p.id} onChange={() => setPayment(p.id)} className="accent-[var(--accent)]" />
                <span className="label">{p.label}</span>
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">Demo: Es öffnet sich kein Zahlungsdienst und es werden keine Zahlungsdaten abgefragt.</p>
        </fieldset>

        <section className="space-y-2 border-t border-line pt-5 text-sm">
          <Row label={`Artikel (${t.count})`} value={formatPrice(t.subtotal)} />
          <Row label="Versand" value={t.shipping ? formatPrice(t.shipping) : 'Kostenlos'} />
          <Row label="Gesamt" value={formatPrice(t.total)} strong />
          <button type="submit" className="btn-primary mt-4">Demo-Bestellung abschließen</button>
        </section>
      </form>
    </>
  )
}
