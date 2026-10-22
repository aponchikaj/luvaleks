import { toast } from 'sonner'
import clsx from 'clsx'
import { Window } from '@/components/ui/Window'
import { Button } from '@/components/ui/Button'
import { Loading, ErrorState, Empty } from '@/components/ui/States'
import { useMessagesStore } from '@/stores/messagesStore'
import { errorMessage } from '@/lib/errors'

export default function MessagesAdmin() {
  const { messages, loading, error, fetch, setRead, remove } = useMessagesStore()

  const del = (id) => {
    if (window.confirm('Delete this message?')) remove(id).catch((e) => toast.error(errorMessage(e)))
  }

  return (
    <Window title={`Inbox — ${messages.filter((m) => !m.is_read).length} unread`}>
      {loading && !messages.length ? (
        <Loading />
      ) : error ? (
        <ErrorState error={error} onRetry={fetch} />
      ) : !messages.length ? (
        <Empty>No messages yet.</Empty>
      ) : (
        <ul className="divide-y divide-chrome">
          {messages.map((m) => (
            <li key={m.id} className={clsx('flex gap-4 py-3', !m.is_read && 'font-semibold')}>
              <span className={clsx('mt-1.5 size-2 shrink-0 rounded-full', m.is_read ? 'bg-transparent' : 'bg-clicky')} />
              <div className="min-w-0 flex-1">
                <p className="text-xs">
                  {m.name}
                  {m.email && (
                    <a href={`mailto:${m.email}`} className="ml-2 text-clicky underline">{m.email}</a>
                  )}
                  <span className="ml-2 font-normal text-chrome-dark">{new Date(m.created_at).toLocaleString()}</span>
                </p>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm font-normal">{m.content}</p>
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                <Button variant="secondary" onClick={() => setRead(m.id, !m.is_read).catch((e) => toast.error(errorMessage(e)))}>
                  {m.is_read ? 'mark unread' : 'mark read'}
                </Button>
                <Button variant="danger" onClick={() => del(m.id)}>delete</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Window>
  )
}
