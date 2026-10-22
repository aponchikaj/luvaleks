import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Window } from '@/components/ui/Window'
import { Loading, ErrorState, Empty } from '@/components/ui/States'
import { HeartButton } from '@/components/ui/HeartButton'
import { useLoadReactions } from '@/hooks/useLoadReactions'
import { usePhotosStore } from '@/stores/photosStore'
import { useRealtime } from '@/hooks/useRealtime'
import { cldUrl } from '@/lib/cloudinary'

export default function GalleryApp() {
  const { photos, loading, error, fetch, applyChange } = usePhotosStore()
  const [open, setOpen] = useState(null)

  useEffect(() => {
    fetch()
  }, [fetch])
  useRealtime('photos', applyChange)
  useLoadReactions('photo', photos.map((p) => p.id))

  if (loading && !photos.length) return <Loading />
  if (error) return <ErrorState error={error} onRetry={() => fetch({ force: true })} />
  if (!photos.length) return <Empty>No photos yet.</Empty>

  return (
    <>
      <div className="@container">
      <div className="columns-2 gap-3 @xl:columns-3 @4xl:columns-4">
        {photos.map((p) => (
          <figure
            key={p.id}
            className="mb-3 break-inside-avoid overflow-hidden rounded-[12px] bg-white shadow-card"
          >
            <button type="button" onClick={() => setOpen(p)} className="block w-full">
              <img
                src={cldUrl(p.public_id, 'w_600,c_limit')}
                width={p.width}
                height={p.height}
                alt={p.caption ?? ''}
                loading="lazy"
                className="h-auto w-full transition hover:brightness-95"
              />
            </button>
            <figcaption className="flex items-start justify-between gap-2 px-2.5 pt-2 pb-2.5">
              <div className="min-w-0">
                {p.caption && <p className="font-serif text-base leading-tight">{p.caption}</p>}
                {p.taken_on && <p className="text-[10px] text-chrome-dark">{p.taken_on}</p>}
              </div>
              <HeartButton type="photo" id={p.id} />
            </figcaption>
          </figure>
        ))}
      </div>
      </div>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[1000] grid place-items-center bg-ink/70 p-4" onClick={() => setOpen(null)}>
            <Window
              title={open.caption || 'photo.jpg'}
              onClose={() => setOpen(null)}
              className="max-w-4xl"
              onClick={(e) => e.stopPropagation()}
              actions={<HeartButton type="photo" id={open.id} />}
            >
              <img src={cldUrl(open.public_id, 'w_1600,c_limit')} alt={open.caption ?? ''} className="max-h-[80dvh]" />
            </Window>
          </div>,
          document.body,
        )}
    </>
  )
}
