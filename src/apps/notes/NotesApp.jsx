import { useEffect } from 'react'
import clsx from 'clsx'
import { StickyNote } from '@/components/ui/StickyNote'
import { Loading, ErrorState, Empty } from '@/components/ui/States'
import { HeartButton } from '@/components/ui/HeartButton'
import { useLoadReactions } from '@/hooks/useLoadReactions'
import { useNotesStore } from '@/stores/notesStore'
import { useRealtime } from '@/hooks/useRealtime'

/** Public, read-only board. Notes sit where admins placed them (relative coords). */
export default function NotesApp({ inWindow }) {
  const { notes, loading, error, fetch, applyChange } = useNotesStore()

  useEffect(() => {
    fetch()
  }, [fetch])
  useRealtime('notes', applyChange)
  useLoadReactions('note', notes.map((n) => n.id))

  if (loading && !notes.length) return <Loading />
  if (error) return <ErrorState error={error} onRetry={() => fetch({ force: true })} />
  if (!notes.length) return <Empty>No notes yet.</Empty>

  return (
    <div
      className={clsx(
        'relative overflow-hidden bg-[radial-gradient(var(--color-chrome)_1px,transparent_1px)] [background-size:16px_16px]',
        inWindow ? 'h-full min-h-[360px]' : 'h-[calc(100dvh-90px-env(safe-area-inset-top))] min-h-[420px] md:h-[70dvh]',
      )}
    >
      {notes.map((n) => (
        <StickyNote
          key={n.id}
          note={n}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${n.pos_x * 100}%`,
            top: `${n.pos_y * 100}%`,
            rotate: `${n.rotation}deg`,
            zIndex: n.is_pinned ? 20 : 10,
          }}
        >
          <HeartButton type="note" id={n.id} className="mt-2" />
        </StickyNote>
      ))}
    </div>
  )
}
