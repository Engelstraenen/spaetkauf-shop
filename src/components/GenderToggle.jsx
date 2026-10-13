import { genders } from '../data/categories.js'
import { useStore } from '../store.jsx'

export default function GenderToggle({ className = '' }) {
  const { gender, setGender } = useStore()
  return (
    <div role="radiogroup" aria-label="Geschlecht" className={`grid grid-cols-3 border border-fg ${className}`}>
      {genders.map((g) => (
        <button
          key={g.id}
          role="radio"
          aria-checked={gender === g.id}
          onClick={() => setGender(g.id)}
          className={`label h-11 ${gender === g.id ? 'bg-fg text-bg' : ''}`}
        >
          {g.label}
        </button>
      ))}
    </div>
  )
}
