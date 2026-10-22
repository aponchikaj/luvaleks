import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { APPS, APPS_BY_ID, STARTUP_APPS } from '@/apps/registry'
import { useDesktopStore } from '@/stores/desktopStore'
import { play } from '@/lib/sound'
import { DesktopIcon } from './DesktopIcon'
import { DesktopWindow } from './DesktopWindow'
import { Dock } from './Dock'

/** Default spot for a window: cascade from the top-left, clamped to the desktop. */
function defaultGeometry(app, index, bounds) {
  const bw = bounds?.width ?? window.innerWidth
  const bh = bounds?.height ?? window.innerHeight
  const w = Math.min(app.size.w, bw - 140)
  const h = Math.min(app.size.h, bh - 110)
  return {
    w,
    h,
    x: Math.min(40 + index * 36, Math.max(0, bw - w - 120)),
    y: Math.min(24 + index * 30, Math.max(0, bh - h - 90)),
  }
}

export function Desktop() {
  const area = useRef(null)
  const [params, setParams] = useSearchParams()
  const [selected, setSelected] = useState(null)
  const { windows, open, minimize, focus, activeId } = useDesktopStore()

  const launch = (app) => {
    const w = windows[app.id]
    if (w?.open && !w.minimized && activeId() === app.id) {
      play('minimize')
      return minimize(app.id)
    }
    if (w?.open && !w.minimized) return focus(app.id)
    play('open')
    const openCount = Object.values(windows).filter((x) => x.open).length
    open(app.id, w?.w ? {} : defaultGeometry(app, openCount, area.current?.getBoundingClientRect()))
  }

  // Greet visitors with a couple of windows already open.
  useEffect(() => {
    const state = useDesktopStore.getState()
    if (Object.values(state.windows).some((w) => w.open)) return
    const bounds = area.current?.getBoundingClientRect()
    STARTUP_APPS.forEach((id, i) => {
      const app = APPS_BY_ID[id]
      const geo = state.windows[id]?.w ? {} : defaultGeometry(app, i, bounds)
      if (id === 'countdown' && !state.windows[id]?.w && bounds) {
        geo.x = Math.max(0, bounds.width - geo.w - 120)
        geo.y = 32
      }
      state.open(id, geo)
    })
  }, [])

  // Menu bar links arrive as /?open=<appId>.
  const toOpen = params.get('open')
  useEffect(() => {
    if (!toOpen) return
    const app = APPS_BY_ID[toOpen]
    const { windows: ws, open: openWin, focus: focusWin } = useDesktopStore.getState()
    if (app) {
      const w = ws[app.id]
      if (w?.open && !w.minimized) focusWin(app.id)
      else {
        play('open')
        const count = Object.values(ws).filter((x) => x.open).length
        openWin(app.id, w?.w ? {} : defaultGeometry(app, count, area.current?.getBoundingClientRect()))
      }
    }
    setParams({}, { replace: true })
  }, [toOpen, setParams])

  return (
    <div
      ref={area}
      onClick={() => setSelected(null)}
      className="relative flex-1 overflow-hidden"
    >
      <div className="absolute top-2 right-2 bottom-2 z-0 flex flex-col flex-wrap-reverse content-start items-end gap-1">
        {APPS.map((app) => (
          <DesktopIcon
            key={app.id}
            app={app}
            selected={selected === app.id}
            onSelect={() => setSelected(app.id)}
            onOpen={() => launch(app)}
          />
        ))}
      </div>

      {APPS.map((app) => (
        <DesktopWindow key={app.id} app={app} bounds={area} />
      ))}
      <Dock onLaunch={launch} />
    </div>
  )
}
