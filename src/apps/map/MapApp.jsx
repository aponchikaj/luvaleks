import { useEffect } from 'react'
import clsx from 'clsx'
import { Marker, Popup } from 'react-leaflet'
import { Loading, ErrorState } from '@/components/ui/States'
import { usePlacesStore } from '@/stores/collections'
import { useRealtime } from '@/hooks/useRealtime'
import { cldUrl } from '@/lib/cloudinary'
import { BaseMap, FitBounds } from './BaseMap'
import { heartIcon } from './HeartMarker'

export default function MapApp({ inWindow }) {
  const { items, loading, error, fetch, applyChange } = usePlacesStore()

  useEffect(() => {
    fetch()
  }, [fetch])
  useRealtime('places', applyChange)

  if (loading && !items.length) return <Loading />
  if (error) return <ErrorState error={error} onRetry={() => fetch({ force: true })} />

  return (
    <div className={clsx('relative', inWindow ? 'h-full min-h-[320px]' : 'h-[calc(100dvh-90px-env(safe-area-inset-top))] min-h-[420px] md:h-[70dvh]')}>
      <BaseMap className="absolute inset-0 z-0">
        <FitBounds points={items.map((p) => [p.lat, p.lng])} />
        {items.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={heartIcon(p.emoji)}>
            <Popup maxWidth={260}>
              <div className="font-sans">
                <p className="font-serif text-xl leading-tight">{p.name}</p>
                {p.visited_on && <p className="text-[10px] text-chrome-dark">{p.visited_on}</p>}
                {p.description && <p className="mt-1 text-sm">{p.description}</p>}
                {p.photos?.length > 0 && (
                  <div className="mt-2 grid grid-cols-3 gap-1">
                    {p.photos.slice(0, 6).map((ph) => (
                      <img
                        key={ph.id}
                        src={cldUrl(ph.public_id, 'w_160,h_160,c_fill')}
                        alt={ph.caption ?? ''}
                        className="aspect-square w-full border border-black/10 object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </BaseMap>
      {!items.length && (
        <p className="absolute top-3 left-1/2 z-[500] -translate-x-1/2 rounded border border-black/10 bg-white px-3 py-1 text-xs">
          no pins yet
        </p>
      )}
    </div>
  )
}
