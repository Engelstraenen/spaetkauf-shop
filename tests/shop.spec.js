// @ts-check
import { test, expect } from '@playwright/test'

const euro = (v) => new RegExp(`${v}\\s€`)

// Bild ist geladen und hat echte Pixel (prüft, dass jeder Browser die SVG-Illustrationen rendert).
async function expectLoaded(img) {
  await expect(img).toBeVisible()
  await expect.poll(() => img.evaluate((el) => el.complete && el.naturalWidth > 0)).toBe(true)
}

test('Startseite: Kampagne lädt, Damen-Kachel filtert den Shop', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: 'SPÄTKAUF Startseite' })).toBeVisible()
  await expectLoaded(page.locator('img[src="/campaign/nacht.svg"]'))

  await page.getByRole('button', { name: 'Damen', exact: true }).click()
  await expect(page).toHaveURL(/\/shop$/)
  await expect(page.getByRole('radio', { name: 'Damen' })).toHaveAttribute('aria-checked', 'true')
  await expect(page.getByText('13 Artikel')).toBeVisible() // 5 Damen + 8 Unisex
})

test('Kauf: Produkt, Farbe, Größe, Warenkorb, Demo-Checkout', async ({ page }) => {
  await page.goto('/produkt/sp-14')
  await expectLoaded(page.getByRole('img', { name: 'Baggy Denim in Washed Blue, Produkt vorne' }))
  await expect(page.getByText('Sale', { exact: true }).first()).toBeVisible()

  await page.getByRole('button', { name: 'Washed Black' }).click()
  const black = page.getByRole('img', { name: 'Baggy Denim in Washed Black, Produkt vorne' })
  await expectLoaded(black)
  await expect(black).toHaveAttribute('src', /washed-black-1\.svg$/)

  await page.getByRole('button', { name: 'In den Warenkorb' }).click()
  await expect(page.getByRole('alert')).toHaveText('Bitte wähle eine Größe.')

  await page.getByRole('button', { name: 'M', exact: true }).click()
  await page.getByRole('button', { name: 'In den Warenkorb' }).click()
  await expect(page.getByText('Zum Warenkorb hinzugefügt')).toBeVisible()

  const cartTab = page.getByRole('navigation', { name: 'Hauptnavigation' }).getByRole('link', { name: /Warenkorb/ })
  await expect(cartTab).toContainText('1')
  await cartTab.click()

  await expect(page.getByText('Washed Black · M')).toBeVisible()
  await expect(page.getByText('Dein Standardversand ist kostenlos.')).toBeVisible()
  await page.getByRole('button', { name: 'Menge erhöhen' }).click()
  await expect(page.getByText('Zwischensumme').locator('..')).toContainText(euro('298,00'))

  await page.getByRole('link', { name: 'Zur Kasse' }).click()
  await expect(page.getByText(/Dies ist ein fiktiver Shop/)).toBeVisible()
  await page.getByRole('button', { name: 'Demo-Bestellung abschließen' }).click()

  await expect(page.getByRole('heading', { name: 'Danke, Kim!' })).toBeVisible()
  await expect(page.getByText(/2 × Baggy Denim \(Washed Black, M\)/)).toBeVisible()
  await expect(cartTab).not.toContainText(/\d/)
})

test('Suche findet Produkte live', async ({ page }) => {
  await page.goto('/suche')
  await page.getByRole('searchbox', { name: 'Produkte suchen' }).fill('puffer')
  await expect(page.getByText('1 Treffer')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Kühlregal Puffer' })).toBeVisible()
})

test('Merkliste bleibt nach Neuladen erhalten', async ({ page }) => {
  await page.goto('/produkt/sp-01')
  await page.getByRole('button', { name: 'Merken', exact: true }).click()
  await page.reload()
  await expect(page.getByRole('button', { name: 'Von Merkliste entfernen', exact: true })).toBeVisible()
  await page.goto('/merkliste')
  await expect(page.getByRole('heading', { name: 'Nachtschicht Heavy Hoodie' })).toBeVisible()
})
