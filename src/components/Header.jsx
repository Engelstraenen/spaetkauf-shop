import { Link, useNavigate } from 'react-router-dom'
import Icon from './Icon.jsx'
import { useStore } from '../store.jsx'

export default function Header({ title, back = false }) {
  const { dark, toggleTheme } = useStore()
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
      <div className="label overflow-hidden whitespace-nowrap bg-fg py-1.5 text-center text-[10px] text-bg">
        Demo-Shop · Keine echte Bestellung · Versandkostenfrei ab 99 €
      </div>
      <div className="flex h-14 items-center justify-between px-2">
        <div className="w-11">
          {back && (
            <button onClick={() => navigate(-1)} aria-label="Zurück" className="grid h-11 w-11 place-items-center">
              <Icon name="back" />
            </button>
          )}
        </div>
        {title ? (
          <h1 className="label truncate text-sm">{title}</h1>
        ) : (
          <Link to="/" className="display text-[28px] tracking-normal" aria-label="SPÄTKAUF Startseite">
            Spätkauf
          </Link>
        )}
        <button onClick={toggleTheme} aria-label={dark ? 'Hellen Modus aktivieren' : 'Dunklen Modus aktivieren'} className="grid h-11 w-11 place-items-center">
          <Icon name={dark ? 'sun' : 'moon'} size={20} />
        </button>
      </div>
    </header>
  )
}
