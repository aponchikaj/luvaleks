import { Suspense, useRef } from 'react'
import clsx from 'clsx'
import { Window } from '@/components/ui/Window'
import { Loading } from '@/components/ui/States'
import { useDesktopStore } from '@/stores/desktopStore'
import { play } from '@/lib/sound'

/**
 * A draggable, resizable, minimizable window on the desktop.
 * Minimized windows stay mounted (hidden) so e.g. music keeps playing.
 */
export function DesktopWindow({ app, bounds }) {
  const win = useDesktopStore((s) => s.windows[app.id])
  const isActive = useDesktopStore((s) => s.activeId() === app.id)
  const { focus, close, minimize, toggleMaximize, setGeometry } = useDesktopStore.getState()
  const gesture = useRef(null)

  if (!win?.open) return null

  const startGesture = (e, kind) => {
    if (win.maximized || e.button !== 0) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    gesture.current = { kind, sx: e.clientX, sy: e.clientY, x: win.x, y: win.y, w: win.w, h: win.h }
  }

  const onMove = (e) => {
    const g = gesture.current
    if (!g) return
    const dx = e.clientX - g.sx
    const dy = e.clientY - g.sy
    const b = bounds.current?.getBoundingClientRect()
    if (g.kind === 'move') {
      const maxX = (b?.width ?? window.innerWidth) - 80
      const maxY = (b?.height ?? window.innerHeight) - 32
      setGeometry(app.id, {
        x: Math.min(maxX, Math.max(-g.w + 80, g.x + dx)),
        y: Math.min(maxY, Math.max(0, g.y + dy)),
      })
    } else {
      setGeometry(app.id, { w: g.w + dx, h: g.h + dy })
    }
  }

  const endGesture = () => {
    gesture.current = null
  }

  const style = win.maximized
    ? { left: 0, top: 0, width: '100%', height: '100%', zIndex: win.z }
    : { left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z }

  const Component = app.component

  return (
    <Window
      title={app.title}
      inactive={!isActive}
      style={style}
      className={clsx('absolute', win.minimized && 'hidden', win.maximized && 'rounded-none')}
      bodyClassName={clsx('overflow-auto', app.bodyClassName)}
      onPointerDownCapture={() => focus(app.id)}
      onClose={() => {
        play('close')
        close(app.id)
      }}
      onMinimize={() => {
        play('minimize')
        minimize(app.id)
      }}
      onMaximize={() => toggleMaximize(app.id)}
      headerProps={{
        className: clsx('touch-none select-none', !win.maximized && 'cursor-grab active:cursor-grabbing'),
        onPointerDown: (e) => startGesture(e, 'move'),
        onPointerMove: onMove,
        onPointerUp: endGesture,
        onPointerCancel: endGesture,
        onDoubleClick: () => toggleMaximize(app.id),
      }}
    >
      <Suspense fallback={<Loading />}>
        <Component inWindow />
      </Suspense>
      {!win.maximized && (
        <div
          aria-hidden="true"
          onPointerDown={(e) => startGesture(e, 'resize')}
          onPointerMove={onMove}
          onPointerUp={endGesture}
          onPointerCancel={endGesture}
          className="absolute right-0 bottom-0 size-4 cursor-nwse-resize touch-none bg-[linear-gradient(135deg,transparent_50%,var(--color-chrome-dark)_50%,var(--color-chrome-dark)_60%,transparent_60%,transparent_70%,var(--color-chrome-dark)_70%,var(--color-chrome-dark)_80%,transparent_80%)]"
        />
      )}
    </Window>
  )
}
