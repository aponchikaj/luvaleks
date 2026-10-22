import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Field, Input, Textarea } from '@/components/ui/Field'
import { Loading, ErrorState, Empty } from '@/components/ui/States'
import { HeartButton } from '@/components/ui/HeartButton'
import { useLoadReactions } from '@/hooks/useLoadReactions'
import { useGuestbookStore } from '@/stores/collections'
import { useRealtime } from '@/hooks/useRealtime'
import { signGuestbook } from '@/services/guestbook'
import { errorMessage } from '@/lib/errors'
import { play } from '@/lib/sound'
import { Glyph } from '@/components/icons/Symbol'

const empty = { name: '', message: '', website: '' }

export default function GuestbookApp() {
  const { items, loading, error, fetch, applyChange } = useGuestbookStore()
  const [form, setForm] = useState(empty)
  const [busy, setBusy] = useState(false)
  const [signed, setSigned] = useState(false)
  // Admins can read unapproved rows too; the public book only ever shows approved ones.
  const entries = useMemo(() => items.filter((e) => e.is_approved), [items])

  useEffect(() => {
    fetch()
  }, [fetch])
  useRealtime('guestbook_entries', applyChange)
  useLoadReactions('guestbook', entries.map((e) => e.id))

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function onSubmit(e) {
    e.preventDefault()
    if (form.website) return setSigned(true) // honeypot
    setBusy(true)
    try {
      await signGuestbook(form)
      play('heart')
      setSigned(true)
      setForm(empty)
    } catch (err) {
      play('error')
      toast.error(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      {signed ? (
        <div className="rounded-md border border-dashed border-clicky p-4 text-center">
          <p className="font-serif text-2xl">Thank you</p>
          <p className="text-xs text-chrome-dark">Your wish will appear once we've read it.</p>
          <button className="mt-2 text-xs underline" onClick={() => setSigned(false)}>
            Sign again
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          <Field label="Your name">
            <Input required maxLength={60} value={form.name} onChange={set('name')} />
          </Field>
          <Field label="Leave a wish" hint={`${form.message.length}/500`}>
            <Textarea required maxLength={500} value={form.message} onChange={set('message')} className="min-h-20" />
          </Field>
          <input type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} className="hidden" aria-hidden="true" />
          <Button type="submit" disabled={busy}><Glyph name="pencil" size={14} />
            {busy ? 'Signing…' : 'Sign the guestbook'}</Button>
        </form>
      )}

      {loading && !entries.length ? (
        <Loading />
      ) : error ? (
        <ErrorState error={error} onRetry={() => fetch({ force: true })} />
      ) : !entries.length ? (
        <Empty>Be the first to sign.</Empty>
      ) : (
        <ul className="space-y-3">
          {entries.map((e) => (
            <li key={e.id} className="border border-black/10 bg-paper p-3 shadow-card">
              <p className="font-serif text-lg leading-snug whitespace-pre-wrap break-words">{e.message}</p>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-[10px] text-chrome-dark">
                  — {e.name} · {new Date(e.created_at).toLocaleDateString()}
                </p>
                <HeartButton type="guestbook" id={e.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
