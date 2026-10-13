import { useStore } from '../store.jsx'

export default function Toast() {
  const { toast } = useStore()
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-50 mx-auto flex max-w-[480px] justify-center px-4">
      {toast && <div className="label bg-fg px-4 py-3 text-bg shadow-lg">{toast}</div>}
    </div>
  )
}
