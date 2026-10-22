import clsx from 'clsx'

// Glyphs shown inside the traffic lights while the group is hovered, like macOS.
const GLYPHS = {
  Close: <path d="M3.5 3.5l5 5m0-5-5 5" />,
  Minimize: <path d="M2.8 6h6.4" />,
  Zoom: <path d="M3.3 3.3h3.6L3.3 6.9Zm5.4 5.4H5.1l3.6-3.6Z" fill="currentColor" stroke="none" />,
}

const LIGHTS = [
  { label: 'Close', color: 'bg-[#ff5f57] border-[#e0443e]', hover: 'group-hover/lights:bg-[#ff5f57]', glyph: 'text-[#4d0000]' },
  { label: 'Minimize', color: 'bg-[#febc2e] border-[#dea123]', hover: 'group-hover/lights:bg-[#febc2e]', glyph: 'text-[#5a3c00]' },
  { label: 'Zoom', color: 'bg-[#28c840] border-[#1aab29]', hover: 'group-hover/lights:bg-[#28c840]', glyph: 'text-[#003a00]' },
]

/** macOS window: traffic lights, centered title, hairline titlebar, deep soft shadow. */
export function Window({
  title,
  children,
  className,
  bodyClassName,
  style,
  onClose,
  onMinimize,
  onMaximize,
  actions,
  headerProps,
  inactive = false,
  ...props
}) {
  const handlers = { Close: onClose, Minimize: onMinimize, Zoom: onMaximize }

  return (
    <section
      style={style}
      className={clsx(
        'flex flex-col overflow-hidden rounded-[12px] bg-white',
        inactive ? 'shadow-window-inactive' : 'shadow-window',
        className,
      )}
      {...props}
    >
      <header
        {...headerProps}
        className={clsx(
          'relative flex h-[30px] shrink-0 items-center gap-2 border-b border-black/[0.09] px-3',
          inactive ? 'bg-[#f6f6f6]' : 'bg-[#ececec]',
          headerProps?.className,
        )}
      >
        <div className="group/lights flex gap-2">
          {LIGHTS.map(({ label, color, hover, glyph }) => {
            const onClick = handlers[label]
            const cls = clsx(
              'grid size-3 place-items-center rounded-full border-[0.5px]',
              inactive ? 'border-black/10 bg-[#dcdcdc] group-hover/lights:border-transparent' : color,
              inactive && onClick && hover,
            )
            const icon = (
              <svg
                viewBox="0 0 12 12"
                className={clsx('size-2 opacity-0 transition-opacity group-hover/lights:opacity-100', glyph)}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              >
                {GLYPHS[label]}
              </svg>
            )
            return onClick ? (
              <button
                key={label}
                type="button"
                aria-label={label}
                onClick={onClick}
                onPointerDown={(e) => e.stopPropagation()}
                className={cls}
              >
                {icon}
              </button>
            ) : (
              <span key={label} className={cls} />
            )
          })}
        </div>
        <h2
          className={clsx(
            'pointer-events-none absolute inset-x-24 truncate text-center text-[13px] font-semibold',
            inactive ? 'text-black/35' : 'text-black/80',
          )}
        >
          {title}
        </h2>
        <div className="ml-auto flex min-w-12 justify-end gap-2">{actions}</div>
      </header>
      <div className={clsx('min-h-0 flex-1 p-4', bodyClassName)}>{children}</div>
    </section>
  )
}
