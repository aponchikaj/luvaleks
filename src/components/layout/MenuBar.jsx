import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { SITE } from '@/config/site'
import { APPS, APPS_BY_ID } from '@/apps/registry'
import { useSettingsStore } from '@/stores/settingsStore'
import { useDesktopStore } from '@/stores/desktopStore'
import { sessionFlag } from '@/lib/storage'
import { BatteryIcon, HeartGlyph, SignalIcon, WifiIcon } from './StatusIcons'
import { Glyph } from '@/components/icons/Symbol'

function useNow(ms = 15_000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), ms)
    return () => clearInterval(t)
  }, [ms])
  return now
}

const reboot = () => {
  sessionFlag('luvaleks:booted', false)
  window.location.reload()
}

function MenuItem({ onClick, checked, children }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-1.5 rounded-[5px] px-2 py-[3px] text-left hover:bg-clicky hover:text-white"
    >
      <span className="w-3">{checked && <Glyph name="check" size={11} />}</span>
      {children}
    </button>
  )
}

const MenuSeparator = () => <div className="mx-2 my-1 h-px bg-black/10" />

/** The heart menu — this site's stand-in for the Apple menu. */
function HeartMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()
  const { sound, cursor, toggleSound, setCursor } = useSettingsStore()

  useEffect(() => {
    if (!open) return
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false)
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  const run = (fn) => () => {
    setOpen(false)
    fn()
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${SITE.osName} menu`}
        onClick={() => setOpen((o) => !o)}
        className={clsx('grid h-[22px] place-items-center rounded-[5px] px-2.5', open ? 'bg-white/25' : 'hover:bg-white/15')}
      >
        <HeartGlyph />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute top-[26px] left-0 z-10 w-60 rounded-[10px] border border-black/10 bg-[#f4f4f6]/[0.97] p-[5px] text-[13px] text-black/85 shadow-window"
        >
          <MenuItem onClick={run(() => navigate('/?open=about'))}>About {SITE.osName}</MenuItem>
          <MenuSeparator />
          <MenuItem onClick={run(toggleSound)} checked={sound}>Sound effects</MenuItem>
          <MenuItem onClick={run(() => setCursor('mac'))} checked={cursor === 'mac'}>macOS pointer</MenuItem>
          <MenuItem onClick={run(() => setCursor('heart'))} checked={cursor === 'heart'}>Heart pointer</MenuItem>
          <MenuSeparator />
          <MenuItem onClick={run(() => navigate('/admin/login'))}>Log In…</MenuItem>
          <MenuItem onClick={run(reboot)}>Restart…</MenuItem>
        </div>
      )}
    </div>
  )
}

/** macOS menu bar (tablet/desktop). */
export function MenuBar() {
  const now = useNow()
  const { pathname } = useLocation()
  const activeId = useDesktopStore((s) => s.activeId())
  const routeApp = APPS.find((a) => a.route === pathname)
  const appName = pathname === '/' ? (APPS_BY_ID[activeId]?.label ?? 'Finder') : (routeApp?.label ?? SITE.osName)

  return (
    <nav className="relative z-[950] flex h-7 shrink-0 items-center gap-0.5 bg-black/15 px-2 text-[13px] text-white backdrop-blur-2xl [text-shadow:0_0_6px_rgb(0_0_0/0.15)]">
      <HeartMenu />
      <span className="px-2 font-bold">{appName}</span>
      {['gallery', 'notes', 'timeline', 'map', 'music', 'guestbook'].map((id) => (
        <Link
          key={id}
          to={`/?open=${id}`}
          className="rounded-[5px] px-2.5 py-[1px] hover:bg-white/15 max-lg:hidden"
        >
          {APPS_BY_ID[id].label}
        </Link>
      ))}
      <span className="flex-1" />
      <span className="flex items-center gap-3.5 pr-1.5">
        <BatteryIcon />
        <WifiIcon />
        <span className="tabular-nums">
          {now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          {'  '}
          {now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
        </span>
      </span>
    </nav>
  )
}

/** iPhone status bar (phones). tone = text color over what's behind it. */
export function StatusBar({ tone = 'light' }) {
  const now = useNow()
  return (
    <div
      className={clsx(
        'flex h-[calc(44px+env(safe-area-inset-top))] shrink-0 items-end justify-between px-7 pb-2.5 text-[15px] font-semibold',
        tone === 'light' ? 'text-white' : 'text-black',
      )}
    >
      <span className="tabular-nums">
        {now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M/i, '')}
      </span>
      <span className="flex items-center gap-1.5">
        <SignalIcon />
        <WifiIcon />
        <BatteryIcon />
      </span>
    </div>
  )
}
