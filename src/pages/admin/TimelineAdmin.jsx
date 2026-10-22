import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Window } from '@/components/ui/Window'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { PhotoPicker } from '@/components/ui/PhotoPicker'
import { Loading, ErrorState, Empty } from '@/components/ui/States'
import { useMilestonesStore, usePlacesStore } from '@/stores/collections'
import { useConfirmDelete } from '@/hooks/useConfirmDelete'
import { errorMessage } from '@/lib/errors'
import { Glyph } from '@/components/icons/Symbol'
import { SymbolPicker } from '@/components/ui/SymbolPicker'

function MilestoneForm({ milestone, onDone }) {
  const { create, update } = useMilestonesStore()
  const places = usePlacesStore()
  const [f, setF] = useState({
    title: milestone?.title ?? '',
    happened_on: milestone?.happened_on ?? '',
    emoji: milestone?.emoji ?? 'heart',
    description: milestone?.description ?? '',
    photo_id: milestone?.photo_id ?? null,
    place_id: milestone?.place_id ?? null,
  })
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))

  useEffect(() => {
    places.fetch()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true)
    const row = {
      ...f,
      title: f.title.trim(),
      emoji: f.emoji,
      description: f.description.trim() || null,
      place_id: f.place_id ? Number(f.place_id) : null,
    }
    try {
      if (milestone) await update(milestone.id, row)
      else await create(row)
      onDone()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Field label="Title">
        <Input required maxLength={120} value={f.title} onChange={set('title')} />
      </Field>
      <Field label="Symbol">
        <SymbolPicker value={f.emoji} onChange={(emoji) => setF((x) => ({ ...x, emoji }))} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date">
          <Input type="date" required value={f.happened_on} onChange={set('happened_on')} />
        </Field>
        <Field label="Place">
          <Select value={f.place_id ?? ''} onChange={set('place_id')}>
            <option value="">—</option>
            {places.items.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Story">
        <Textarea maxLength={2000} value={f.description} onChange={set('description')} />
      </Field>
      <Field label="Photo">
        <PhotoPicker value={f.photo_id} onChange={(id) => setF((s) => ({ ...s, photo_id: id }))} />
      </Field>
      <div className="flex gap-2">
        <Button type="submit" disabled={busy}>{milestone ? 'save' : 'add milestone'}</Button>
        <Button type="button" variant="secondary" onClick={onDone}>cancel</Button>
      </div>
    </form>
  )
}

export default function TimelineAdmin() {
  const { items, loading, error, fetch, remove } = useMilestonesStore()
  const [editing, setEditing] = useState(undefined)
  const del = useConfirmDelete(remove, 'this milestone')

  useEffect(() => {
    fetch()
  }, [fetch])

  return (
    <>
      <Window
        title={`Timeline — ${items.length} milestones`}
        actions={<button className="text-xs underline" onClick={() => setEditing(null)}>+ new</button>}
      >
        {loading && !items.length ? (
          <Loading />
        ) : error ? (
          <ErrorState error={error} onRetry={() => fetch({ force: true })} />
        ) : !items.length ? (
          <Empty>Add your first milestone — maybe the day you met?</Empty>
        ) : (
          <ul className="divide-y divide-chrome">
            {items.map((m) => (
              <li key={m.id} className="flex items-center gap-3 py-2">
                <Glyph name={m.emoji} size={20} className="shrink-0 text-clicky" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{m.title}</p>
                  <p className="text-[11px] text-chrome-dark">
                    {m.happened_on}{m.place && ` · ${m.place.name}`}{m.photo && ' · photo'}
                  </p>
                </div>
                <Button variant="secondary" onClick={() => setEditing(m)}>edit</Button>
                <Button variant="danger" onClick={() => del(m.id)}>delete</Button>
              </li>
            ))}
          </ul>
        )}
      </Window>
      {editing !== undefined && (
        <Modal title={editing ? 'Edit milestone' : 'New milestone'} onClose={() => setEditing(undefined)}>
          <MilestoneForm key={editing?.id ?? 'new'} milestone={editing} onDone={() => setEditing(undefined)} />
        </Modal>
      )}
    </>
  )
}
