import { useEffect } from 'react'
import { Loading, ErrorState, Empty } from '@/components/ui/States'
import { HeartButton } from '@/components/ui/HeartButton'
import { useLoadReactions } from '@/hooks/useLoadReactions'
import { useMilestonesStore } from '@/stores/collections'
import { useRealtime } from '@/hooks/useRealtime'
import { cldUrl } from '@/lib/cloudinary'
import { Glyph } from '@/components/icons/Symbol'

const fmt = (d) =>
  new Date(`${d}T00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })

export default function TimelineApp() {
  const { items, loading, error, fetch, applyChange } = useMilestonesStore()

  useEffect(() => {
    fetch()
  }, [fetch])
  useRealtime('milestones', applyChange)
  useLoadReactions('milestone', items.map((m) => m.id))

  if (loading && !items.length) return <Loading />
  if (error) return <ErrorState error={error} onRetry={() => fetch({ force: true })} />
  if (!items.length) return <Empty>Our story starts here…</Empty>

  return (
    <ol className="relative ml-3 border-l-2 border-dashed border-clicky">
      {items.map((m) => (
        <li key={m.id} className="relative mb-8 pl-8 last:mb-0">
          <span className="absolute top-0 -left-[15px] grid size-7 place-items-center rounded-full bg-white text-clicky shadow-card ring-2 ring-white text-sm">
            <Glyph name={m.emoji} size={14} />
          </span>
          <p className="text-xs text-clicky">{fmt(m.happened_on)}</p>
          <h3 className="font-serif text-2xl leading-tight">{m.title}</h3>
          {m.place && <p className="flex items-center gap-1 text-[12px] text-chrome-dark"><Glyph name="mappin" size={12} /> {m.place.name}</p>}
          {m.description && <p className="mt-1 max-w-prose whitespace-pre-wrap text-sm">{m.description}</p>}
          {m.photo && (
            <img
              src={cldUrl(m.photo.public_id, 'w_640,c_limit')}
              alt={m.photo.caption ?? m.title}
              loading="lazy"
              className="mt-2 max-h-72 w-auto rounded-[12px] shadow-card"
            />
          )}
          <HeartButton type="milestone" id={m.id} className="mt-2" />
        </li>
      ))}
    </ol>
  )
}
