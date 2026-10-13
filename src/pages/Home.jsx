import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Carousel from '../components/Carousel.jsx'
import GenderToggle from '../components/GenderToggle.jsx'
import Icon from '../components/Icon.jsx'
import Slider from '../components/Slider.jsx'
import { categories } from '../data/categories.js'
import { useStore } from '../store.jsx'

const services = [
  { icon: 'truck', title: 'Versandkostenfrei ab 99 €', text: 'Standardversand in 2–4 Werktagen.' },
  { icon: 'return', title: '30 Tage Rückgabe', text: 'Kostenloses Retourenlabel liegt bei.' },
  { icon: 'shield', title: 'Sicher bezahlen', text: 'PayPal, Karte oder Rechnung.' },
]

// Bilder aus scripts/draw.mjs. Poster tragen ihre Schrift selbst, deshalb dort kein Titel.
const slides = [
  { image: '/campaign/nacht.svg', kicker: 'AW26 · Nachtschicht', title: 'Offen bis spät', cta: 'Kollektion ansehen', to: '/shop' },
  { image: '/campaign/offen.svg', kicker: 'Neu: Heavy Hoodies', cta: 'Hoodies entdecken', to: '/shop?kategorie=hoodies' },
  { image: '/campaign/nachtschicht.svg', kicker: 'Jacken für die Nacht', cta: 'Jacken entdecken', to: '/shop?kategorie=jacken' },
]

export default function Home() {
  const { products, matchesGender, setGender, setToast } = useStore()
  const navigate = useNavigate()
  const list = products.filter((p) => matchesGender(p))

  const openShop = (g) => {
    setGender(g)
    navigate('/shop')
  }

  return (
    <>
      <Header />
      <Slider label="Kampagne Nachtschicht" autoplay={7000} className="h-[72svh] min-h-[460px] bg-ink">
        {slides.map((s) => (
          <div key={s.image} className="h-full">
            <img src={s.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 px-4 pb-14 text-white">
              <p className="label text-[11px] opacity-85">{s.kicker}</p>
              {s.title && <h2 className="display mt-2 max-w-[8ch] text-[60px]">{s.title}</h2>}
              <Link to={s.to} className="btn mt-5 w-auto max-w-60 bg-white text-ink">{s.cta}</Link>
            </div>
          </div>
        ))}
      </Slider>

      <section aria-label="Damen und Herren" className="grid grid-cols-2 gap-px bg-line">
        {[['damen', 'Damen'], ['herren', 'Herren']].map(([g, label]) => (
          <button key={g} onClick={() => openShop(g)} className="relative aspect-[4/5] bg-img">
            <img src={`/campaign/${g}.svg`} alt="" className="h-full w-full object-cover" />
            <span className="label absolute bottom-4 left-1/2 -translate-x-1/2 border border-ink bg-white px-4 py-2.5 text-ink">{label}</span>
          </button>
        ))}
      </section>

      <div className="px-4 pt-5">
        <GenderToggle />
      </div>

      <nav aria-label="Kategorien" className="no-scrollbar flex gap-2 overflow-x-auto px-4 pt-4">
        {categories.map((c) => (
          <Link key={c.id} to={`/shop?kategorie=${c.id}`} className="label shrink-0 rounded-full border border-line bg-surface px-4 py-3">
            {c.label}
          </Link>
        ))}
      </nav>

      <Carousel title="Neu eingetroffen" products={list.filter((p) => p.isNew)} to="/shop?sort=neu" />
      <Carousel title="Bestseller" products={list.filter((p) => p.bestseller)} to="/shop" />
      <Carousel title="Sale" products={list.filter((p) => p.oldPrice)} to="/shop" />

      <section className="mx-4 my-6 bg-surface px-5 py-8 text-center">
        <h2 className="display text-4xl">Letzte Runde</h2>
        <p className="mx-auto mt-2 max-w-[30ch] text-sm text-muted">Newsletter abonnieren und 15 % auf die erste Bestellung sichern.</p>
        <form
          className="mt-5 flex"
          onSubmit={(e) => {
            e.preventDefault()
            e.currentTarget.reset()
            setToast('Demo: Es wurde nichts gesendet')
          }}
        >
          <label className="flex-1">
            <span className="sr-only">E-Mail</span>
            <input type="email" required placeholder="E-Mail" className="h-12 w-full border border-line bg-bg px-3 text-base outline-none focus:border-fg" />
          </label>
          <button className="btn-primary w-auto">Anmelden</button>
        </form>
      </section>

      <section className="mx-4 mb-6 divide-y divide-line border-y border-line">
        {services.map((s) => (
          <div key={s.title} className="flex items-start gap-3 py-4">
            <Icon name={s.icon} className="mt-0.5 shrink-0" />
            <div>
              <h3 className="label">{s.title}</h3>
              <p className="mt-1 text-sm text-muted">{s.text}</p>
            </div>
          </div>
        ))}
      </section>

      <p className="px-4 pb-4 text-center text-xs text-muted">SPÄTKAUF ist eine fiktive Marke. Portfolio-Demo.<br />Alle Illustrationen sind für diesen Shop gezeichnet.</p>
    </>
  )
}
