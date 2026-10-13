export const FREE_SHIPPING_FROM = 99

export const SHIPPING_OPTIONS = [
  { id: 'standard', label: 'Standard', note: '2–4 Werktage', price: 4.95 },
  { id: 'express', label: 'Express', note: 'Morgen da, bei Bestellung bis 14 Uhr', price: 9.95 },
]

export const formatPrice = (n) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n)

export const lineKey = (id, color, size) => `${id}|${color}|${size}`

// items: [{ id, color, size, qty }], products: Array mit { id, price }
export function cartTotals(items, products, shippingId = 'standard') {
  const subtotal = items.reduce((sum, it) => {
    const p = products.find((x) => x.id === it.id)
    return p ? sum + p.price * it.qty : sum
  }, 0)
  const count = items.reduce((n, it) => n + it.qty, 0)
  const option = SHIPPING_OPTIONS.find((o) => o.id === shippingId) ?? SHIPPING_OPTIONS[0]
  const freeStandard = subtotal >= FREE_SHIPPING_FROM
  // Kostenlos gilt nur für Standard; Express kostet immer.
  const shipping = count === 0 ? 0 : option.id === 'standard' && freeStandard ? 0 : option.price
  return {
    subtotal,
    count,
    shipping,
    total: subtotal + shipping,
    missingForFree: Math.max(0, FREE_SHIPPING_FROM - subtotal),
    progress: Math.min(1, subtotal / FREE_SHIPPING_FROM),
  }
}
