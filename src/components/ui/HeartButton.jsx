import clsx from 'clsx'
import { toast } from 'sonner'
import { useReactionsStore } from '@/stores/reactionsStore'
import { errorMessage } from '@/lib/errors'
import { play } from '@/lib/sound'
import { Glyph } from '@/components/icons/Symbol'

export function HeartButton({ type, id, className }) {
  const state = useReactionsStore((s) => s.byKey[`${type}:${id}`])
  const toggle = useReactionsStore((s) => s.toggle)
  const reacted = !!state?.reacted

  const onClick = (e) => {
    e.stopPropagation()
    if (!reacted) play('heart')
    toggle(type, id).catch((err) => toast.error(errorMessage(err)))
  }

  return (
    <button
      type="button"
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}
      aria-pressed={reacted}
      aria-label={reacted ? 'Remove heart' : 'Send a heart'}
      className={clsx(
        'inline-flex items-center gap-1 rounded-full bg-black/[0.05] px-2.5 py-1 text-[12px] font-medium transition hover:bg-black/[0.08] active:scale-90',
        reacted ? 'text-[#ff2d55]' : 'text-black/50 hover:text-[#ff2d55]',
        className,
      )}
    >
      <Glyph name={reacted ? 'heart' : 'heart.outline'} size={13} className={clsx('transition', reacted && 'scale-110')} />
      <span className="tabular-nums">{state?.count ?? 0}</span>
    </button>
  )
}
