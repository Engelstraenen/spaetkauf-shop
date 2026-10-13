import { Children, useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'

// Native Scroll-Snap übernimmt Wischen und Trägheit; JS nur für Punkte, Pfeile und Autoplay.
export default function Slider({ label, children, autoplay = 0, className = '', dotsClassName = '', thumbs }) {
  const track = useRef(null)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = Children.count(children)

  const go = (i) => {
    const el = track.current
    const target = (i + count) % count
    el.scrollTo({ left: target * el.clientWidth, behavior: 'smooth' })
  }

  const onScroll = () => {
    const el = track.current
    setIndex(Math.round(el.scrollLeft / el.clientWidth))
  }

  useEffect(() => {
    if (!autoplay || paused || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setTimeout(() => go(index + 1), autoplay)
    return () => clearTimeout(t)
  }, [autoplay, paused, index])

  return (
    <section
      aria-roledescription="Karussell"
      aria-label={label}
      className="group"
      onPointerDown={() => setPaused(true)}
      onFocus={() => setPaused(true)}
    >
      <div className={`relative ${className}`}>
      <div ref={track} onScroll={onScroll} className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain">
        {Children.map(children, (child, i) => (
          <div
            role="group"
            aria-roledescription="Slide"
            aria-label={`${i + 1} von ${count}`}
            className="relative h-full w-full shrink-0 snap-start snap-always"
          >
            {child}
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button onClick={() => go(index - 1)} aria-label="Vorheriges Bild" className="absolute left-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center bg-black/40 text-white opacity-0 transition group-hover:opacity-100 sm:grid">
            <Icon name="back" />
          </button>
          <button onClick={() => go(index + 1)} aria-label="Nächstes Bild" className="absolute right-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center bg-black/40 text-white opacity-0 transition group-hover:opacity-100 sm:grid">
            <Icon name="back" className="rotate-180" />
          </button>
          <div className={`absolute inset-x-0 bottom-3 flex justify-center gap-1.5 ${dotsClassName}`}>
            {Array.from({ length: count }, (_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={`Zu Bild ${i + 1}`}
                aria-current={i === index}
                className="grid h-6 place-items-center px-0.5"
              >
                <span className={`block h-[3px] transition-all ${i === index ? 'w-7 bg-white' : 'w-3.5 bg-white/50'}`} />
              </button>
            ))}
          </div>
        </>
      )}
      </div>

      {thumbs && (
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 pt-2">
          {thumbs.map((src, i) => (
            <button key={src} onClick={() => go(i)} aria-label={`Zu Bild ${i + 1}`} className={`shrink-0 border-2 ${i === index ? 'border-fg' : 'border-transparent opacity-70'}`}>
              <img src={src} alt="" className="aspect-[4/5] w-14 object-cover" />
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
