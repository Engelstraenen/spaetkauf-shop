import { NavLink } from 'react-router-dom'
import Icon from './Icon.jsx'
import { useStore } from '../store.jsx'

const tabs = [
  { to: '/', icon: 'home', label: 'Start', end: true },
  { to: '/shop', icon: 'grid', label: 'Shop' },
  { to: '/suche', icon: 'search', label: 'Suche' },
  { to: '/merkliste', icon: 'bookmark', label: 'Merkliste' },
  { to: '/warenkorb', icon: 'bag', label: 'Warenkorb' },
]

export default function BottomNav() {
  const { cart, wishlist } = useStore()
  const badges = { '/warenkorb': cart.reduce((n, it) => n + it.qty, 0), '/merkliste': wishlist.length }
  return (
    <nav
      aria-label="Hauptnavigation"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[480px] border-t border-line bg-bg/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="grid grid-cols-5">
        {tabs.map((t) => (
          <li key={t.to}>
            <NavLink
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                `relative flex h-16 flex-col items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wider ${isActive ? 'text-accent' : 'text-muted'}`
              }
            >
              <span className="relative">
                <Icon name={t.icon} />
                {badges[t.to] > 0 && (
                  <span className="absolute -right-2.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] text-accent-fg">
                    {badges[t.to]}
                  </span>
                )}
              </span>
              {t.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
