import clsx from 'clsx'

// macOS push buttons: accent-filled default button, white bezel for the rest.
const variants = {
  primary:
    'bg-gradient-to-b from-[#3d8bff] to-clicky text-white shadow-[0_0_0_0.5px_rgb(0_0_0/0.15),0_1px_1.5px_rgb(0_0_0/0.2),inset_0_0.5px_0_rgb(255_255_255/0.35)] hover:brightness-105',
  secondary:
    'bg-white text-black/85 shadow-[0_0_0_0.5px_rgb(0_0_0/0.18),0_1px_1.5px_rgb(0_0_0/0.12)] hover:bg-[#fafafa]',
  danger:
    'bg-white text-[#e0332b] shadow-[0_0_0_0.5px_rgb(0_0_0/0.18),0_1px_1.5px_rgb(0_0_0/0.12)] hover:bg-red-50',
  ghost: 'bg-transparent text-black/80 hover:bg-black/5',
}

export function Button({ variant = 'primary', className, ...props }) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-[7px] px-3.5 py-1.5 text-[13px] font-medium',
        'transition active:brightness-90 disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-clicky/40',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
