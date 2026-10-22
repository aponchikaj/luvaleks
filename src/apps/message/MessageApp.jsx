import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Field, Input, Textarea } from '@/components/ui/Field'
import { sendMessage } from '@/services/messages'
import { errorMessage } from '@/lib/errors'
import { LIMITS } from '@/config/site'
import { Glyph } from '@/components/icons/Symbol'

const empty = { name: '', email: '', content: '', website: '' }

export default function MessageApp() {
  const [form, setForm] = useState(empty)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function onSubmit(e) {
    e.preventDefault()
    if (form.website) return setSent(true) // honeypot: bots fill hidden fields
    setSending(true)
    try {
      await sendMessage(form)
      setSent(true)
      setForm(empty)
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      {sent ? (
        <div className="space-y-3 py-6 text-center">
          <p className="font-serif text-3xl">Sent!</p>
          <p className="text-sm text-chrome-dark">Lazare & Aleksa will read it soon.</p>
          <Button variant="secondary" onClick={() => setSent(false)}>Write another</Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Your name">
            <Input required maxLength={LIMITS.messageName} value={form.name} onChange={set('name')} />
          </Field>
          <Field label="Email (optional)" hint="Only if you want us to write back.">
            <Input type="email" maxLength={254} value={form.email} onChange={set('email')} />
          </Field>
          <Field label="Message" hint={`${form.content.length}/${LIMITS.messageLength}`}>
            <Textarea required maxLength={LIMITS.messageLength} value={form.content} onChange={set('content')} />
          </Field>
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={set('website')}
            className="hidden"
            aria-hidden="true"
          />
          <Button type="submit" disabled={sending}><Glyph name="envelope" size={14} />
            {sending ? 'Sending…' : 'Send'}</Button>
        </form>
      )}
    </div>
  )
}
