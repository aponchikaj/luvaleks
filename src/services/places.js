import { crud } from './crud'

export const placesApi = crud(
  'places',
  'id, name, description, lat, lng, visited_on, emoji, created_at, ' +
    'photos!photos_place_id_fkey(id, public_id, width, height, caption)',
  { order: [['visited_on', { ascending: true, nullsFirst: false }], ['created_at', { ascending: true }]] },
)

/** Free-text place search via OpenStreetMap Nominatim (admin-only, low volume). */
export async function geocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}`
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } })
  if (!res.ok) throw new Error('Place search failed')
  const data = await res.json()
  return data.map((r) => ({ label: r.display_name, lat: Number(r.lat), lng: Number(r.lon) }))
}
