import { useEffect } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import clsx from 'clsx'
import { useAuthStore } from '@/stores/authStore'
import { useMessagesStore } from '@/stores/messagesStore'
import { useRealtime } from '@/hooks/useRealtime'
import { Glyph } from '@/components/icons/Symbol'

const tabs = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/photos', label: 'Photos' },
  { to: '/admin/notes', label: 'Notes' },
  { to: '/admin/timeline', label: 'Timeline' },
  { to: '/admin/places', label: 'Places' },
  { to: '/admin/music', label: 'Music' },
  { to: '/admin/guestbook', label: 'Guestbook' },
  { to: '/admin/messages', label: 'Messages' },
  { to: '/admin/wallpaper', label: 'Wallpaper' },
]

export default function AdminLayout() {
  const { profile, signOut } = useAuthStore()
  const { fetch, applyChange, messages } = useMessagesStore()
  const unread = messages.filter((m) => !m.is_read).length

  useEffect(() => {
    fetch()
  }, [fetch])
  useRealtime('messages', applyChange)

  return (
    <div className="min-h-dvh bg-chrome-light">
      <nav className="sticky top-0 z-40 flex flex-wrap items-center gap-1 border-b border-black/10 bg-white/85 px-4 py-2 text-[13px] backdrop-blur-xl">
        <span className="mr-2 font-bold">Admin · Hi, {profile?.display_name}</span>
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) => clsx('rounded px-2 py-0.5', isActive ? 'bg-clicky text-white' : 'hover:bg-chrome')}
          >
            {t.label}
            {t.label === 'Messages' && unread > 0 && (
              <span className="ml-1 rounded-full bg-red-500 px-1.5 text-white">{unread}</span>
            )}
          </NavLink>
        ))}
        <span className="flex-1" />
        <Link to="/" className="inline-flex items-center gap-1 hover:underline">View site <Glyph name="arrow.up.right" size={11} /></Link>
        <button onClick={signOut} className="hover:underline">Log out</button>
      </nav>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
