import { useEffect } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

/** Keeps Leaflet sized correctly inside resizable windows. */
function AutoResize() {
  const map = useMap()
  useEffect(() => {
    const ro = new ResizeObserver(() => map.invalidateSize())
    ro.observe(map.getContainer())
    return () => ro.disconnect()
  }, [map])
  return null
}

/** Fits the view to the given points once they're known. */
export function FitBounds({ points }) {
  const map = useMap()
  const key = points.map((p) => p.join(',')).join('|')
  useEffect(() => {
    if (!key) return
    const pts = key.split('|').map((p) => p.split(',').map(Number))
    if (pts.length === 1) map.setView(pts[0], 12)
    else map.fitBounds(pts, { padding: [40, 40], maxZoom: 13 })
  }, [key, map])
  return null
}

export function BaseMap({ children, className, center = [41.7151, 44.8271], zoom = 6 }) {
  return (
    <MapContainer center={center} zoom={zoom} className={className} scrollWheelZoom worldCopyJump>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
        className="luv-tiles"
      />
      <AutoResize />
      {children}
    </MapContainer>
  )
}
