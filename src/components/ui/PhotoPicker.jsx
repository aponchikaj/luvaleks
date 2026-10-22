import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import { Window } from './Window'
import { Button } from './Button'
import { usePhotosStore } from '@/stores/photosStore'
import { cldUrl } from '@/lib/cloudinary'

/** Pick one photo from the library (or none). value = photo id | null. */
export function PhotoPicker({ value, onChange }) {
  const { photos, fetch } = usePhotosStore()
  const [open, setOpen] = useState(false)
  const selected = photos.find((p) => p.id === value)

  useEffect(() => {
    fetch()
  }, [fetch])

  return (
    <div className="flex items-center gap-3">
      {selected ? (
        <img src={cldUrl(selected.public_id, 'w_96,h_96,c_fill')} alt="" className="size-12 border border-black/10 object-cover" />
      ) : (
        <span className="grid size-12 place-items-center border border-dashed border-black/10 text-xs text-chrome-dark">none</span>
      )}
      <Button type="button" variant="secondary" onClick={() => setOpen(true)}>choose photo</Button>
      {selected && (
        <button type="button" className="text-xs underline" onClick={() => onChange(null)}>clear</button>
      )}

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[1000] grid place-items-center bg-ink/50 p-4" onClick={() => setOpen(false)}>
            <Window title="Choose a photo" className="max-h-[80dvh] w-full max-w-2xl" bodyClassName="overflow-auto" onClose={() => setOpen(false)} onClick={(e) => e.stopPropagation()}>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                {photos.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onChange(p.id)
                      setOpen(false)
                    }}
                    className={clsx('border border-black/10', p.id === value && 'ring-2 ring-clicky ring-offset-1')}
                  >
                    <img src={cldUrl(p.public_id, 'w_160,h_160,c_fill')} alt={p.caption ?? ''} className="aspect-square w-full object-cover" />
                  </button>
                ))}
              </div>
            </Window>
          </div>,
          document.body,
        )}
    </div>
  )
}
