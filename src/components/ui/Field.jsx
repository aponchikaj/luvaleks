import clsx from 'clsx'

// macOS text fields: white well, hairline border, blue focus ring.
const inputClass =
  'w-full rounded-[7px] border border-black/15 bg-white px-3 py-2 text-[15px] shadow-[inset_0_0.5px_1px_rgb(0_0_0/0.06)] outline-none transition focus:border-clicky/70 focus:ring-[3px] focus:ring-clicky/30 sm:text-[13px]'

export function Field({ label, hint, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[13px] font-medium text-black/70">{label}</span>
      {children}
      {hint && <span className="block text-xs text-chrome-dark">{hint}</span>}
    </label>
  )
}

export const Input = ({ className, ...p }) => <input className={clsx(inputClass, className)} {...p} />
export const Textarea = ({ className, ...p }) => (
  <textarea className={clsx(inputClass, 'min-h-28 resize-y', className)} {...p} />
)
export const Select = ({ className, ...p }) => <select className={clsx(inputClass, className)} {...p} />
