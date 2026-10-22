import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Marker, useMapEvents } from 'react-leaflet'
import { Window } from '@/components/ui/Window'
import { Button } from '@/components/ui/Button'
import { Field, Input, Textarea } from '@/components/ui/Field'
import { Loading, ErrorState } from '@/components/ui/States'
import { BaseMap, FitBounds } from '@/apps/map/BaseMap'
import { heartIcon } from '@/apps/map/HeartMarker'
import { usePlacesStore } from '@/stores/collections'
import { useConfirmDelete } from '@/hooks/useConfirmDelete'
import { geocode } from '@/services/places'
import { errorMessage } from '@/lib/errors'
import { Glyph } from '@/components/icons/Symbol'
import { SymbolPicker } from '@/components/ui/SymbolPicker'

const blank = { name: '', description: '', lat: '', lng: '', visited_on: '', emoji: 'heart' }

function ClickToPlace({ onPick }) {
  useMapEvents({ click: (e) => onPick(e.latlng) })
  return null
}

export default function PlacesAdmin() {
  const { items, loading, error, fetch, create, update, remove } = usePlacesStore()
  const [form, setForm] = useState(blank)
  const [editingId, setEditingId] = useState(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [busy, setBusy] = useState(false)
  const del = useConfirmDelete(remove, 'this place')
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    fetch()
  }, [fetch])

  const reset = () => {
    setForm(blank)
    setEditingId(null)
    setResults([])
  }

  const edit = (p) => {
    setEditingId(p.id)
    setForm({
      name: p.name, description: p.description ?? '', lat: p.lat, lng: p.lng,
      visited_on: p.visited_on ?? '', emoji: p.emoji,
    })
  }

  async function search(e) {
    e.preventDefault()
    if (!query.trim()) return
    try {
      setResults(await geocode(query))
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (form.lat === '' || form.lng === '') return toast.error('Click the map or search to set a location')
    setBusy(true)
    const row = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      lat: Number(form.lat),
      lng: Number(form.lng),
      visited_on: form.visited_on || null,
      emoji: form.emoji,
    }
    try {
      if (editingId) await update(editingId, row)
      else await create(row)
      toast.success(editingId ? 'Saved' : 'Pinned')
      reset()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const draft = form.lat !== '' && form.lng !== '' ? [Number(form.lat), Number(form.lng)] : null

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <Window title="Map — click to drop a pin" bodyClassName="p-0">
        {loading && !items.length ? (
          <Loading />
        ) : error ? (
          <ErrorState error={error} onRetry={() => fetch({ force: true })} />
        ) : (
          <div className="relative h-[60dvh] min-h-[400px]">
            <BaseMap className="absolute inset-0 z-0">
              <FitBounds points={items.map((p) => [p.lat, p.lng])} />
              <ClickToPlace onPick={({ lat, lng }) => setForm((f) => ({ ...f, lat: lat.toFixed(6), lng: lng.toFixed(6) }))} />
              {items.map((p) => (
                <Marker key={p.id} position={[p.lat, p.lng]} icon={heartIcon(p.emoji)} eventHandlers={{ click: () => edit(p) }} />
              ))}
              {draft && <Marker position={draft} icon={heartIcon('＋', true)} />}
            </BaseMap>
          </div>
        )}
      </Window>

      <div className="space-y-6">
        <Window title={editingId ? 'Edit place' : 'New place'}>
          <form onSubmit={search} className="mb-4 flex gap-2">
            <Input placeholder="search a place…" value={query} onChange={(e) => setQuery(e.target.value)} />
            <Button type="submit" variant="secondary">find</Button>
          </form>
          {results.length > 0 && (
            <ul className="mb-4 max-h-40 divide-y divide-chrome overflow-auto rounded border border-black/10 text-xs">
              {results.map((r) => (
                <li key={`${r.lat},${r.lng}`}>
                  <button
                    type="button"
                    className="w-full px-2 py-1.5 text-left hover:bg-clicky-100"
                    onClick={() => {
                      setForm((f) => ({ ...f, lat: r.lat, lng: r.lng, name: f.name || r.label.split(',')[0] }))
                      setResults([])
                    }}
                  >
                    {r.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <form onSubmit={onSubmit} className="space-y-3">
            <Field label="Name">
              <Input required maxLength={120} value={form.name} onChange={set('name')} />
            </Field>
            <Field label="Symbol">
              <SymbolPicker value={form.emoji} onChange={(emoji) => setForm((f) => ({ ...f, emoji }))} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Lat">
                <Input required type="number" step="any" min={-90} max={90} value={form.lat} onChange={set('lat')} />
              </Field>
              <Field label="Lng">
                <Input required type="number" step="any" min={-180} max={180} value={form.lng} onChange={set('lng')} />
              </Field>
            </div>
            <Field label="Visited on">
              <Input type="date" value={form.visited_on} onChange={set('visited_on')} />
            </Field>
            <Field label="Memory">
              <Textarea maxLength={1000} value={form.description} onChange={set('description')} className="min-h-20" />
            </Field>
            <p className="text-[10px] text-chrome-dark">Attach photos to a place from the Photos tab.</p>
            <div className="flex gap-2">
              <Button type="submit" disabled={busy}>{editingId ? 'save' : 'pin it'}</Button>
              {(editingId || draft) && <Button type="button" variant="secondary" onClick={reset}>cancel</Button>}
              {editingId && <Button type="button" variant="danger" onClick={() => del(editingId) && reset()}>delete</Button>}
            </div>
          </form>
        </Window>

        <Window title={`${items.length} places`}>
          <ul className="divide-y divide-chrome text-sm">
            {items.map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => edit(p)} className="flex w-full items-center gap-2 py-1.5 text-left hover:text-clicky">
                  <Glyph name={p.emoji} size={16} className="text-clicky" />
                  <span className="flex-1 truncate">{p.name}</span>
                  <span className="text-[11px] text-chrome-dark">{p.photos?.length ?? 0} <Glyph name="camera" size={12} className="inline align-[-1px]" /></span>
                </button>
              </li>
            ))}
          </ul>
        </Window>
      </div>
    </div>
  )
}
