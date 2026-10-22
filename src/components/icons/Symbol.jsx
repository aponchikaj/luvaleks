import { P, symbolName } from './symbols'

/** One of the site's symbols (see symbols.js), drawn in currentColor. */
export function Glyph({ name, size = 16, className, title, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      {...props}
    >
      <path d={P[symbolName(name)]} fillRule="evenodd" />
    </svg>
  )
}
