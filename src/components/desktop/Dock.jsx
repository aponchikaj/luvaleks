import { useRef } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { APPS } from '@/apps/registry'
import { AppIcon } from '@/components/icons/AppIcon'
import { useDesktopStore } from '@/stores/desktopStore'

const BASE = 50
const PEAK = 78
const REACH = 140 // px from the cursor where magnification fades out

function DockItem({ app, mouseX, running, onLaunch, still }) {
  const ref = useRef(null)
  const distance = useTransform(mouseX, (x) => {
    const b = ref.current?.getBoundingClientRect()
    return b ? x - b.x - b.width / 2 : Infinity
  })
  const target = useTransform(distance, [-REACH, 0, REACH], [BASE, still ? BASE : PEAK, BASE])
  const size = useSpring(target, { mass: 0.1, stiffness: 170, damping: 14 })

  return (
    <div className="group relative flex flex-col items-center">
      <span className="pointer-events-none absolute -top-11 rounded-md border border-black/10 bg-[#ececec]/90 px-2.5 py-0.5 text-[13px] whitespace-nowrap text-black/85 opacity-0 shadow-md backdrop-blur transition-opacity group-hover:opacity-100">
        {app.label}
      </span>
      <motion.button
        ref={ref}
        type="button"
        aria-label={app.label}
        onClick={() => onLaunch(app)}
        style={{ width: size, height: size }}
        className="origin-bottom active:brightness-75"
      >
        <AppIcon id={app.id} size="100%" />
      </motion.button>
      <span className={running ? 'mt-[3px] size-1 rounded-full bg-black/60' : 'mt-[3px] size-1'} />
    </div>
  )
}

/** macOS Dock: frosted shelf with fish-eye magnification and running-app dots. */
export function Dock({ onLaunch }) {
  const windows = useDesktopStore((s) => s.windows)
  const mouseX = useMotionValue(Infinity)
  const still = useReducedMotion()

  return (
    <nav
      aria-label="Dock"
      onMouseMove={(e) => mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className="absolute bottom-1.5 left-1/2 z-[900] flex h-[66px] -translate-x-1/2 items-end gap-1.5 rounded-[20px] border border-white/30 bg-white/25 px-2 pb-[3px] shadow-[0_0_0_0.5px_rgb(0_0_0/0.15),0_10px_30px_-8px_rgb(0_0_0/0.35)] backdrop-blur-2xl backdrop-saturate-150"
    >
      {APPS.map((app) => (
        <DockItem
          key={app.id}
          app={app}
          mouseX={mouseX}
          still={still}
          running={!!windows[app.id]?.open}
          onLaunch={onLaunch}
        />
      ))}
    </nav>
  )
}
