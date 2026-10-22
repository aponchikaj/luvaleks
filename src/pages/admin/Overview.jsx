import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Window } from '@/components/ui/Window'
import { usePhotosStore } from '@/stores/photosStore'
import { useNotesStore } from '@/stores/notesStore'
import { useMessagesStore } from '@/stores/messagesStore'
import { useMilestonesStore, usePlacesStore, useSongsStore, useGuestbookStore } from '@/stores/collections'
import { monthsTogether, daysTogether } from '@/lib/anniversary'

export default function Overview() {
  const photos = usePhotosStore()
  const notes = useNotesStore()
  const { messages } = useMessagesStore()
  const milestones = useMilestonesStore()
  const places = usePlacesStore()
  const songs = useSongsStore()
  const guestbook = useGuestbookStore()

  useEffect(() => {
    photos.fetch()
    notes.fetch()
    milestones.fetch()
    places.fetch()
    songs.fetch()
    guestbook.fetch({ force: true })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const stats = [
    { label: 'photos', value: photos.photos.length, to: '/admin/photos' },
    { label: 'notes', value: notes.notes.length, to: '/admin/notes' },
    { label: 'milestones', value: milestones.items.length, to: '/admin/timeline' },
    { label: 'places', value: places.items.length, to: '/admin/places' },
    { label: 'songs', value: songs.items.length, to: '/admin/music' },
    { label: 'guestbook to approve', value: guestbook.items.filter((e) => !e.is_approved).length, to: '/admin/guestbook' },
    { label: 'unread messages', value: messages.filter((m) => !m.is_read).length, to: '/admin/messages' },
    { label: 'months together', value: monthsTogether() },
    { label: 'days together', value: daysTogether() },
  ]

  return (
    <Window title="System Info" bodyClassName="grid grid-cols-2 gap-4 md:grid-cols-5">
      {stats.map((s) => {
        const body = (
          <>
            <p className="text-3xl tabular-nums">{s.value}</p>
            <p className="text-xs text-chrome-dark">{s.label}</p>
          </>
        )
        return s.to ? (
          <Link key={s.label} to={s.to} className="rounded p-2 hover:bg-clicky-100">{body}</Link>
        ) : (
          <div key={s.label} className="p-2">{body}</div>
        )
      })}
    </Window>
  )
}
