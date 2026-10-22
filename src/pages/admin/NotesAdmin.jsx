import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import clsx from 'clsx'
import { Window } from '@/components/ui/Window'
import { Button } from '@/components/ui/Button'
import { Field, Select, Textarea } from '@/components/ui/Field'
import { StickyNote } from '@/components/ui/StickyNote'
import { Loading, ErrorState } from '@/components/ui/States'
import { useNotesStore } from '@/stores/notesStore'
import { useAuthStore } from '@/stores/authStore'
import { useRealtime } from '@/hooks/useRealtime'
import { listAdmins } from '@/services/profiles'
import { errorMessage } from '@/lib/errors'
import { LIMITS, NOTE_COLORS } from '@/config/site'

const swatch = {
  blue: 'bg-note-blue', sky: 'bg-note-sky', yellow: 'bg-note-yellow',
  pink: 'bg-note-pink', mint: 'bg-note-mint', white: 'bg-note-white',
}

/** Create or edit a note. `note` = null means create. */
function NoteEditor({ note, admins, onDone }) {
  const { create, update } = useNotesStore()
  const me = useAuthStore((s) => s.profile)
  const [content, setContent] = useState(note?.content ?? '')
  const [color, setColor] = useState(note?.color ?? 'blue')
  const [toId, setToId] = useState(note?.to_id ?? admins.find((a) => a.id !== me?.id)?.id ?? '')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      if (note) await update(note.id, { content: content.trim(), color, to_id: toId || null })
      else await create({ content, color, toId: toId || null })
      onDone()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Field label="Note" hint={`${content.length}/${LIMITS.noteLength}`}>
        <Textarea required autoFocus maxLength={LIMITS.noteLength} value={content} onChange={(e) => setContent(e.target.value)} />
      </Field>
      <div className="flex flex-wrap items-end gap-4">
        <Field label="For">
          <Select value={toId} onChange={(e) => setToId(e.target.value)}>
            <option value="">both of us</option>
            {admins.map((a) => (
              <option key={a.id} value={a.id}>{a.display_name}</option>
            ))}
          </Select>
        </Field>
        <div className="flex gap-1.5 pb-2">
          {NOTE_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={c}
              onClick={() => setColor(c)}
              className={clsx('size-6 border border-black/10', swatch[c], color === c && 'ring-2 ring-clicky ring-offset-1')}
            />
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={busy}>{note ? 'save' : 'stick it'}</Button>
        <Button type="button" variant="secondary" onClick={onDone}>cancel</Button>
      </div>
    </form>
  )
}

/** Board where notes can be dragged; positions are saved as 0..1 of the board size. */
function Board({ notes, onEdit }) {
  const { move, remove, update } = useNotesStore()
  const board = useRef(null)
  const [drag, setDrag] = useState(null) // { id, dx, dy, x, y }

  function onPointerDown(e, note) {
    if (e.target.closest('button')) return
    const rect = board.current.getBoundingClientRect()
    e.currentTarget.setPointerCapture(e.pointerId)
    setDrag({
      id: note.id,
      dx: e.clientX - (rect.left + note.pos_x * rect.width),
      dy: e.clientY - (rect.top + note.pos_y * rect.height),
      x: note.pos_x,
      y: note.pos_y,
    })
  }

  function onPointerMove(e) {
    if (!drag) return
    const rect = board.current.getBoundingClientRect()
    setDrag((d) => ({
      ...d,
      x: Math.min(1, Math.max(0, (e.clientX - d.dx - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (e.clientY - d.dy - rect.top) / rect.height)),
    }))
  }

  function onPointerUp() {
    if (!drag) return
    const note = notes.find((n) => n.id === drag.id)
    if (note && (note.pos_x !== drag.x || note.pos_y !== drag.y)) {
      move(drag.id, drag.x, drag.y).catch((e) => toast.error(errorMessage(e)))
    }
    setDrag(null)
  }

  const del = (id) => {
    if (window.confirm('Delete this note?')) remove(id).catch((e) => toast.error(errorMessage(e)))
  }

  return (
    <div
      ref={board}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className="relative h-[70dvh] min-h-[480px] touch-none overflow-hidden bg-[radial-gradient(var(--color-chrome)_1px,transparent_1px)] [background-size:16px_16px]"
    >
      {notes.map((n) => {
        const dragging = drag?.id === n.id
        const x = dragging ? drag.x : n.pos_x
        const y = dragging ? drag.y : n.pos_y
        return (
          <StickyNote
            key={n.id}
            note={n}
            onPointerDown={(e) => onPointerDown(e, n)}
            className={clsx('group absolute -translate-x-1/2 -translate-y-1/2 cursor-grab select-none', dragging && 'cursor-grabbing')}
            style={{
              left: `${x * 100}%`,
              top: `${y * 100}%`,
              rotate: `${n.rotation}deg`,
              zIndex: dragging ? 50 : n.is_pinned ? 20 : 10,
            }}
          >
            <div className="mt-2 flex gap-2 text-[10px] opacity-0 transition group-hover:opacity-100">
              <button className="underline" onClick={() => onEdit(n)}>edit</button>
              <button className="underline" onClick={() => update(n.id, { is_pinned: !n.is_pinned })}>
                {n.is_pinned ? 'unpin' : 'pin'}
              </button>
              <button className="text-red-600 underline" onClick={() => del(n.id)}>delete</button>
            </div>
          </StickyNote>
        )
      })}
    </div>
  )
}

export default function NotesAdmin() {
  const { notes, loading, error, fetch, applyChange } = useNotesStore()
  const [admins, setAdmins] = useState([])
  const [editing, setEditing] = useState(undefined) // undefined = closed, null = new, note = edit

  useEffect(() => {
    fetch()
    listAdmins().then(setAdmins).catch((e) => toast.error(errorMessage(e)))
  }, [fetch])
  useRealtime('notes', applyChange)

  return (
    <div className="space-y-6">
      <Window
        title={`notes.board — ${notes.length} notes · drag to move`}
        bodyClassName="p-0"
        actions={<button className="text-xs underline" onClick={() => setEditing(null)}>+ new</button>}
      >
        {loading && !notes.length ? (
          <Loading />
        ) : error ? (
          <ErrorState error={error} onRetry={() => fetch({ force: true })} />
        ) : (
          <Board notes={notes} onEdit={setEditing} />
        )}
      </Window>

      {editing !== undefined && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4">
          <Window title={editing ? 'Edit note' : 'New note'} className="w-full max-w-md" onClose={() => setEditing(undefined)}>
            <NoteEditor key={editing?.id ?? 'new'} note={editing} admins={admins} onDone={() => setEditing(undefined)} />
          </Window>
        </div>
      )}
    </div>
  )
}
