import clsx from 'clsx'
import { AppIcon } from '@/components/icons/AppIcon'

/** Finder-style desktop icon: click selects, double-click (or Enter) opens. */
export function DesktopIcon({ app, selected, onSelect, onOpen }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
      onDoubleClick={onOpen}
      onKeyDown={(e) => e.key === 'Enter' && onOpen()}
      className="group flex w-[84px] flex-col items-center gap-0.5 rounded-md p-0.5 outline-none"
    >
      <span
        className={clsx(
          'grid place-items-center rounded-[8px] p-0.5',
          selected ? 'bg-black/25 ring-1 ring-white/30' : 'group-focus-visible:bg-black/20',
        )}
      >
        <AppIcon id={app.id} size={56} />
      </span>
      <span
        className={clsx(
          'rounded-[4px] px-1.5 text-[12px] leading-[16px] font-medium text-white',
          selected ? 'bg-clicky' : '[text-shadow:0_1px_2px_rgb(0_0_0/0.55)]',
        )}
      >
        {app.label}
      </span>
    </button>
  )
}
