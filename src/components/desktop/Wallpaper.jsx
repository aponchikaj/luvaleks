import { useEffect } from 'react'
import { useSiteStore } from '@/stores/siteStore'
import { useRealtime } from '@/hooks/useRealtime'
import { cldUrl } from '@/lib/cloudinary'
import { DEFAULT_WALLPAPER, WALLPAPERS } from '@/config/wallpapers'

/** The desktop picture, chosen in Admin → Wallpaper. Fixed behind everything. */
export function Wallpaper({ className = 'fixed inset-0 -z-10' }) {
  const { settings, fetch, applyChange } = useSiteStore()
  useEffect(() => {
    fetch()
  }, [fetch])
  useRealtime('site_settings', applyChange)

  const preset = WALLPAPERS[settings?.wallpaper_preset] ?? WALLPAPERS[DEFAULT_WALLPAPER]
  const image = settings?.wallpaper_public_id

  return (
    <div aria-hidden="true" className={className} style={{ background: preset.css }}>
      {image && (
        <img
          key={image}
          src={cldUrl(image, 'w_2560,c_limit,q_auto,f_auto')}
          alt=""
          className="size-full animate-[fade_0.6s_ease-out] object-cover"
        />
      )}
    </div>
  )
}
