import { useEffect, useRef } from 'react'
import Icon from './Icon.jsx'

// Natives <dialog>: Fokus-Falle, Escape und Backdrop gibt es vom Browser.
export default function BottomSheet({ open, onClose, title, children }) {
  const ref = useRef(null)
  useEffect(() => {
    const d = ref.current
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label={title}
      className="m-0 mt-auto w-full max-w-none bg-transparent p-0 backdrop:bg-black/50 sm:mx-auto sm:max-w-[480px]"
    >
      <div className="rounded-t-2xl bg-surface px-4 pb-8 pt-3 text-fg" style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}>
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />
        <div className="mb-4 flex items-center justify-between">
          <h2 className="label text-sm">{title}</h2>
          <button onClick={onClose} aria-label="Schließen" className="grid h-11 w-11 place-items-center">
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
