import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import clsx from 'clsx'
import { Window } from '@/components/ui/Window'
import { Button } from '@/components/ui/Button'
import { Loading, ErrorState, Empty } from '@/components/ui/States'
import { useGuestbookStore } from '@/stores/collections'
import { useRealtime } from '@/hooks/useRealtime'
import { useConfirmDelete } from '@/hooks/useConfirmDelete'
import { errorMessage } from '@/lib/errors'

export default function GuestbookAdmin() {
  const { items, loading, error, fetch, update, remove, applyChange } = useGuestbookStore()
  const [tab, setTab] = useState('pending')
  const del = useConfirmDelete(remove, 'this entry')

  useEffect(() => {
    fetch({ force: true }) // admin sees unapproved rows the public cache didn't have
  }, [fetch])
  useRealtime('guestbook_entries', applyChange)

  const pending = items.filter((e) => !e.is_approved)
  const shown = tab === 'pending' ? pending : items.filter((e) => e.is_approved)

  const setApproved = (id, is_approved) =>
    update(id, { is_approved }).catch((e) => toast.error(errorMessage(e)))

  return (
    <Window
      title="Guestbook"
      actions={
        <div className="flex gap-1 text-xs">
          {['pending', 'approved'].map((t) => (
            <button key={t} onClick={() => setTab(t)} className={clsx('rounded px-2', tab === t ? 'bg-clicky text-white' : 'hover:bg-chrome')}>
              {t}{t === 'pending' && pending.length > 0 && ` (${pending.length})`}
            </button>
          ))}
        </div>
      }
    >
      {loading && !items.length ? (
        <Loading />
      ) : error ? (
        <ErrorState error={error} onRetry={() => fetch({ force: true })} />
      ) : !shown.length ? (
        <Empty>{tab === 'pending' ? 'Nothing waiting for approval.' : 'No approved entries yet.'}</Empty>
      ) : (
        <ul className="divide-y divide-chrome">
          {shown.map((e) => (
            <li key={e.id} className="flex gap-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs">
                  {e.name} <span className="text-chrome-dark">· {new Date(e.created_at).toLocaleString()}</span>
                </p>
                <p className="mt-1 text-sm whitespace-pre-wrap break-words">{e.message}</p>
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                {e.is_approved ? (
                  <Button variant="secondary" onClick={() => setApproved(e.id, false)}>hide</Button>
                ) : (
                  <Button onClick={() => setApproved(e.id, true)}>approve</Button>
                )}
                <Button variant="danger" onClick={() => del(e.id)}>delete</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Window>
  )
}
