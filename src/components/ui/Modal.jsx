import { createPortal } from 'react-dom'
import { Window } from './Window'

export function Modal({ title, onClose, children, className = 'w-full max-w-lg' }) {
  return createPortal(
    <div className="fixed inset-0 z-[1000] grid place-items-center overflow-auto bg-ink/50 p-4">
      <Window title={title} onClose={onClose} className={className} bodyClassName="max-h-[80dvh] overflow-auto">
        {children}
      </Window>
    </div>,
    document.body,
  )
}
