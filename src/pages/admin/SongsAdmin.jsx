import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Window } from '@/components/ui/Window'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { Loading, ErrorState, Empty } from '@/components/ui/States'
import { useSongsStore } from '@/stores/collections'
import { useConfirmDelete } from '@/hooks/useConfirmDelete'
import { parseSpotifyUrl, spotifyTitle } from '@/services/songs'
import { errorMessage } from '@/lib/errors'
import { Glyph } from '@/components/icons/Symbol'

const blank = { spotify_url: '', title: '', artist: '', note: '' }

export default function SongsAdmin() {
  const { items, loading, error, fetch, create, update, remove } = useSongsStore()
  const [form, setForm] = useState(blank)
  const [busy, setBusy] = useState(false)
  const del = useConfirmDelete(remove, 'this song')
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    fetch()
  }, [fetch])

  async function onUrlBlur() {
    const parsed = parseSpotifyUrl(form.spotify_url)
    if (!parsed || form.title) return
    const title = await spotifyTitle(parsed.url)
    if (title) setForm((f) => ({ ...f, title: f.title || title }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    const parsed = parseSpotifyUrl(form.spotify_url)
    if (!parsed) return toast.error('Paste a Spotify track, album or playlist link')
    setBusy(true)
    try {
      await create({
        spotify_url: parsed.url,
        title: form.title.trim(),
        artist: form.artist.trim() || null,
        note: form.note.trim() || null,
        sort_order: (items.at(-1)?.sort_order ?? 0) + 1,
      })
      setForm(blank)
    } catch (err) {
      toast.error(err.code === '23505' ? 'That song is already on the list' : errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  /** Swap sort_order with a neighbour. */
  async function moveSong(index, dir) {
    const a = items[index]
    const b = items[index + dir]
    if (!a || !b) return
    try {
      await Promise.all([update(a.id, { sort_order: b.sort_order }), update(b.id, { sort_order: a.sort_order })])
      if (a.sort_order === b.sort_order) await update(a.id, { sort_order: b.sort_order + dir })
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <Window title="Add a song">
        <form onSubmit={onSubmit} className="space-y-3">
          <Field label="Spotify link" hint="Share → Copy link to song">
            <Input required value={form.spotify_url} onChange={set('spotify_url')} onBlur={onUrlBlur} placeholder="https://open.spotify.com/track/…" />
          </Field>
          <Field label="Title">
            <Input required maxLength={200} value={form.title} onChange={set('title')} />
          </Field>
          <Field label="Artist">
            <Input maxLength={200} value={form.artist} onChange={set('artist')} />
          </Field>
          <Field label="Why it's ours" hint="optional, shown under now playing">
            <Input maxLength={280} value={form.note} onChange={set('note')} />
          </Field>
          <Button type="submit" disabled={busy}>Add song</Button>
        </form>
      </Window>

      <Window title={`Playlist — ${items.length}`}>
        {loading && !items.length ? (
          <Loading />
        ) : error ? (
          <ErrorState error={error} onRetry={() => fetch({ force: true })} />
        ) : !items.length ? (
          <Empty>No songs yet.</Empty>
        ) : (
          <ol className="divide-y divide-chrome">
            {items.map((s, i) => (
              <li key={s.id} className="flex items-center gap-2 py-2">
                <span className="w-6 text-xs text-chrome-dark">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate">{s.title}</p>
                  <p className="truncate text-[11px] text-chrome-dark">{s.artist}{s.note && ` · “${s.note}”`}</p>
                </div>
                <Button variant="ghost" disabled={i === 0} onClick={() => moveSong(i, -1)} aria-label="Move up"><Glyph name="arrow.up" size={14} /></Button>
                <Button variant="ghost" disabled={i === items.length - 1} onClick={() => moveSong(i, 1)} aria-label="Move down"><Glyph name="arrow.down" size={14} /></Button>
                <Button variant="danger" onClick={() => del(s.id)}>delete</Button>
              </li>
            ))}
          </ol>
        )}
      </Window>
    </div>
  )
}
