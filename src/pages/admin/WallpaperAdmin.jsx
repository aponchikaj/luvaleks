import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { toast } from 'sonner'
import { Window } from '@/components/ui/Window'
import { Button } from '@/components/ui/Button'
import { Glyph } from '@/components/icons/Symbol'
import { useSiteStore } from '@/stores/siteStore'
import { usePhotosStore } from '@/stores/photosStore'
import { cldUrl, uploadImage } from '@/lib/cloudinary'
import { errorMessage } from '@/lib/errors'
import { DEFAULT_WALLPAPER, WALLPAPERS } from '@/config/wallpapers'

/** Choose the desktop picture everyone sees: a built-in gradient, a library photo, or a fresh upload. */
export default function WallpaperAdmin() {
  const { settings, fetch, update } = useSiteStore()
  const { photos, fetch: fetchPhotos } = usePhotosStore()
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(null)

  useEffect(() => {
    fetch()
    fetchPhotos()
  }, [fetch, fetchPhotos])

  const preset = settings?.wallpaper_preset ?? DEFAULT_WALLPAPER
  const image = settings?.wallpaper_public_id ?? null

  async function save(patch, message) {
    setBusy(true)
    try {
      await update(patch)
      toast.success(message)
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function onUpload(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    try {
      const res = await uploadImage(file, setProgress)
      await update({ wallpaper_public_id: res.public_id })
      toast.success('Wallpaper uploaded')
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setProgress(null)
      setBusy(false)
    }
  }

  const tile = (active) =>
    clsx(
      'relative aspect-[16/10] overflow-hidden rounded-[10px] shadow-card transition',
      active ? 'ring-[3px] ring-clicky ring-offset-2' : 'hover:brightness-105',
    )

  return (
    <div className="space-y-6">
      <Window title="Current wallpaper">
        <div className="relative aspect-[16/9] max-h-[360px] w-full overflow-hidden rounded-[10px] shadow-card" style={{ background: (WALLPAPERS[preset] ?? WALLPAPERS[DEFAULT_WALLPAPER]).css }}>
          {image && <img src={cldUrl(image, 'w_1200,c_limit,q_auto,f_auto')} alt="" className="size-full object-cover" />}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <label className={clsx('inline-flex', busy && 'pointer-events-none opacity-50')}>
            <input type="file" accept="image/*" className="sr-only" onChange={onUpload} disabled={busy} />
            <span className="inline-flex cursor-pointer items-center gap-2 rounded-[7px] bg-gradient-to-b from-[#3d8bff] to-clicky px-3.5 py-1.5 text-[13px] font-medium text-white shadow-[0_0_0_0.5px_rgb(0_0_0/0.15),0_1px_1.5px_rgb(0_0_0/0.2)]">
              <Glyph name="camera" size={14} />
              {progress != null ? `Uploading… ${progress}%` : 'Upload a picture'}
            </span>
          </label>
          {image && (
            <Button variant="secondary" disabled={busy} onClick={() => save({ wallpaper_public_id: null }, 'Picture removed')}>
              Use a gradient instead
            </Button>
          )}
        </div>
        <p className="mt-2 text-xs text-chrome-dark">Landscape pictures work best, at least 1920 px wide.</p>
      </Window>

      <Window title="Gradients">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Object.entries(WALLPAPERS).map(([id, w]) => (
            <button
              key={id}
              type="button"
              disabled={busy}
              onClick={() => save({ wallpaper_preset: id, wallpaper_public_id: null }, `Wallpaper set to ${w.label}`)}
              className="space-y-1.5 text-left"
            >
              <span className={tile(!image && preset === id)} style={{ background: w.css, display: 'block' }} />
              <span className="block text-[13px]">{w.label}</span>
            </button>
          ))}
        </div>
      </Window>

      <Window title="From your photos">
        {photos.length ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {photos.map((p) => (
              <button
                key={p.id}
                type="button"
                disabled={busy}
                onClick={() => save({ wallpaper_public_id: p.public_id }, 'Wallpaper updated')}
                className={tile(image === p.public_id)}
              >
                <img src={cldUrl(p.public_id, 'w_320,h_200,c_fill')} alt={p.caption ?? ''} className="size-full object-cover" />
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-chrome-dark">Upload photos in the Photos tab and they'll show up here.</p>
        )}
      </Window>
    </div>
  )
}
