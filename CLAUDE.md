# SPÄTKAUF – Fashion-Shop-Demo

Mobil optimierte Fashion-Shop-Web-App als Portfolio-Demo für eine Agentur-Website. SPÄTKAUF ist eine **fiktive** Streetwear-Marke aus Berlin. Aufbau angelehnt an minimalistische Streetwear-Shops (Damen/Herren-Split, Versalien, Sale-Preise, Merkliste als Lesezeichen), aber eigenständig: keine Logos, Fotos, Namen oder Texte echter Marken.

Stack: React + Vite + Tailwind CSS v4 (`@tailwindcss/vite`) + React Router. Deploy auf Vercel (`vercel.json` leitet alle Pfade auf `index.html`).

## Regeln für Inhalte

- Alles fiktiv: Marke, Produkte, Texte, Adressen, Figuren.
- Alle Bilder sind selbst gezeichnete Vektor-Illustrationen aus `scripts/draw.mjs`. Keine Stockfotos.
- Checkout ist eine Demo: keine echte Zahlung, keine Felder für Zahlungsdaten, keine Daten verlassen den Browser. Hinweis „Demo – keine echte Bestellung“ bleibt sichtbar (USP-Leiste, Checkout, Bestätigung). Newsletter-Formular sendet nichts.

## Design-Regeln

- Farben: Weiß, Schwarz, Grautöne. Ein Signal: Neon-Rot (`--signal`) nur für Sale, Neon in der Kampagne und Fehler. Primäre Buttons schwarz (im Dunkelmodus hell).
- Farben nur über Tokens in `src/index.css` (`bg-bg`, `bg-surface`, `text-fg`, `text-muted`, `border-line`, `bg-accent`, `text-signal`, `bg-img`, `text-ink`). Keine Hex-Werte in Komponenten (Ausnahme: Produktfarben aus den Daten).
- `bg-img` und `text-ink` bleiben in beiden Modi gleich: Illustrationen haben immer hellen Grund, Badges und Icons darauf sind schwarz.
- Hell- und Dunkelmodus: Klasse `.dark` auf `<html>`. Standard folgt dem System, Umschalter im Header, Wahl in localStorage.
- Typo: Archivo (Google Fonts), Wortmarke und Überschriften schmal (`font-stretch: 62%`). Labels und Buttons in Versalien mit Letterspacing. Kanten eckig; nur Chips und Bottom Sheet gerundet.
- Mobile first, max. Inhaltsbreite 480px zentriert auf Desktop. Bottom-Tab-Navigation (Start, Shop, Suche, Merkliste, Warenkorb). Touch-Ziele mindestens 44px. Inhalt endet über der Tab-Leiste und respektiert `env(safe-area-inset-bottom)`.
- Karussells und Slider: native horizontale Scrollleiste mit `snap-x`. `Slider` ergänzt nur Punkte, Pfeile, Thumbnails und Autoplay (pausiert bei Berührung und `prefers-reduced-motion`).
- Akkordeon: natives `<details>`.

## Illustrationen (`npm run draw`)

`scripts/draw.mjs` zeichnet alles im selben Stil: schwarze Kontur, flache Farbe mit leichtem Licht von links, Stofftextur, Grund `#ececea`.

- Pro Produkt und Farbe 5 Bilder in `public/products/<id>-<farbe>-1…5.svg`: Produkt vorne, Look vorne, Look hinten, Produkt hinten, Detail.
- Zwei feste Figuren: **Kalle** (Model A, Herren) und **Mira** (Model B, Damen). Unisex-Produkte wechseln ab.
- Kampagne in `public/campaign/`: `nacht.svg` (animierte Späti-Szene mit Neon und Regen, ersetzt ein Video), `offen.svg`, `nachtschicht.svg`, `damen.svg`, `herren.svg`.
- Das Skript schreibt `images`, `colorImages` und `model` in `products.json`. Diese Felder nicht von Hand pflegen.
- Neues Produkt: Eintrag in `products.json` und Zeichen-Spezifikation in `SPECS` (Schnitt-Typ, Prints, Detail-Ausschnitt), dann `npm run draw`.

## Daten

- Produkte: `src/data/products.json`. Felder: `id`, `name`, `category`, `gender` (`herren` | `damen` | `unisex`), `price`, optional `oldPrice` (Sale), `colors` [{`name`, `hex`}], `isNew`, `bestseller`, `description`, `material`, `fit`, generiert: `model`, `images`, `colorImages`.
- Kategorien und Labels: `src/data/categories.js`.
- Warenkorb, Merkliste, Geschlechtsfilter, Theme und Toast: `src/store.jsx` (React Context, localStorage-Schlüssel `sk-*`).
- Preis- und Versandlogik: `src/lib/cart.js`, Test: `npm test`.
- End-to-End-Tests: `tests/shop.spec.js` (Playwright). Laufen auf Pixel 7, iPhone 14, Firefox in Handy-Größe und Desktop Chrome. Startet den Dev-Server auf Port 5174 selbst.

## Ordnerstruktur

```
scripts/draw.mjs        Zeichnet alle Produkt- und Kampagnenbilder
public/products/        Generierte Produktbilder (nicht von Hand ändern)
public/campaign/        Generierte Kampagnenbilder
tests/                  Playwright-Tests
src/
  main.jsx              Einstieg, Router, Provider
  App.jsx               Routen + Layout
  index.css             Tailwind, Farb-Tokens, Hell/Dunkel
  store.jsx             Context: Warenkorb, Merkliste, Filter, Theme, Toast
  lib/cart.js           Summen, Versand, Formatierung
  data/                 products.json, categories.js
  components/           Header, BottomNav, ProductCard, Price, Carousel, Slider, BottomSheet, ...
  pages/                Home, Shop, Product, Search, Wishlist, Cart, Checkout, Confirmation
```

## Befehle

```bash
npm install
npx playwright install   # einmal pro Rechner, für npm run e2e
npm run draw
npm run dev
npm test
npm run e2e
npm run build
```
