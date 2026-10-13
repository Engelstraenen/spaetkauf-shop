import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cartTotals, lineKey } from './cart.js'

const products = [{ id: 'a', price: 35 }, { id: 'b', price: 89 }]

test('leerer Warenkorb kostet nichts', () => {
  const t = cartTotals([], products)
  assert.deepEqual([t.subtotal, t.shipping, t.total, t.count], [0, 0, 0, 0])
})

test('unter 99 € fällt Standardversand an', () => {
  const t = cartTotals([{ id: 'a', qty: 2 }], products)
  assert.equal(t.subtotal, 70)
  assert.equal(t.shipping, 4.95)
  assert.equal(t.missingForFree, 29)
})

test('ab 99 € ist Standard kostenlos, Express nicht', () => {
  const items = [{ id: 'a', qty: 1 }, { id: 'b', qty: 1 }]
  assert.equal(cartTotals(items, products).shipping, 0)
  assert.equal(cartTotals(items, products, 'express').shipping, 9.95)
  assert.equal(cartTotals(items, products).progress, 1)
})

test('unbekannte Produkte werden ignoriert', () => {
  assert.equal(cartTotals([{ id: 'x', qty: 3 }], products).subtotal, 0)
})

test('lineKey trennt Farbe und Größe', () => {
  assert.notEqual(lineKey('a', 'Beton', 'M'), lineKey('a', 'Beton', 'L'))
})
