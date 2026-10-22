import clsx from 'clsx'
import { Glyph } from '@/components/icons/Symbol'
import { PICKABLE, symbolName } from '@/components/icons/symbols'

/** Grid of symbols to choose from (replaces the old free-text emoji field). */
export function SymbolPicker({ value, onChange }) {
  const current = symbolName(value)
  return (
    <div role="radiogroup" className="grid grid-cols-10 gap-1 max-sm:grid-cols-5">
      {PICKABLE.map((name) => (
        <button
          key={name}
          type="button"
          role="radio"
          aria-checked={current === name}
          aria-label={name}
          onClick={() => onChange(name)}
          className={clsx(
            'grid aspect-square place-items-center rounded-[7px] transition',
            current === name ? 'bg-clicky text-white' : 'text-black/60 hover:bg-black/5',
          )}
        >
          <Glyph name={name} size={18} />
        </button>
      ))}
    </div>
  )
}
