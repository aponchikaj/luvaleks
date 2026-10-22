import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { SITE } from '@/config/site'
import { daysTogether, monthsTogether } from '@/lib/anniversary'
import { sessionFlag } from '@/lib/storage'
import { play } from '@/lib/sound'
import { Glyph } from '@/components/icons/Symbol'
import { Wallpaper } from './Wallpaper'

const BOOT_KEY = 'luvaleks:booted'
const BOOT_MS = 2200

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return now
}

/** Lock screen: big clock over the wallpaper, our names, click/tap to enter. */
function LockScreen() {
  const now = useClock()
  const touch = window.matchMedia('(pointer: coarse)').matches
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="absolute inset-0 flex flex-col items-center text-white"
    >
      <Wallpaper className="absolute inset-0 -z-10 scale-110 blur-[2px] brightness-90" />
      <p className="mt-[12dvh] text-[19px] font-semibold text-white/90 sm:text-[22px]">
        {now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
      </p>
      <p className="text-[88px] leading-none font-semibold tracking-tight tabular-nums [text-shadow:0_2px_20px_rgb(0_0_0/0.15)] sm:text-[124px]">
        {now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M/i, '')}
      </p>
      <p className="mt-3 text-[15px] text-white/75">
        {monthsTogether()} months · {daysTogether()} days together
      </p>

      <div className="mt-auto mb-[9dvh] flex flex-col items-center gap-2">
        <div className="grid size-[72px] place-items-center rounded-full bg-gradient-to-b from-white/40 to-white/15 shadow-[0_6px_24px_-6px_rgb(0_0_0/0.4)] ring-1 ring-white/40 backdrop-blur-xl">
          <Glyph name="heart" size={32} className="text-white drop-shadow" />
        </div>
        <p className="text-[17px] font-semibold">{SITE.title}</p>
        <p className="animate-pulse text-[13px] text-white/70">{touch ? 'Tap' : 'Click'} anywhere to enter</p>
      </div>
      <p className="absolute bottom-3 text-[11px] text-white/45">
        {SITE.osName} {monthsTogether()}.0
      </p>
    </motion.div>
  )
}

/**
 * Startup: black screen + heart + progress bar (like a Mac booting), then the lock screen.
 * Plays once per browser session. Any key or click skips ahead.
 */
export function BootScreen() {
  const [visible, setVisible] = useState(() => !sessionFlag(BOOT_KEY))
  const [phase, setPhase] = useState('boot') // 'boot' | 'lock'
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    if (!visible || phase !== 'boot') return
    const t = setTimeout(() => setPhase('lock'), reduced ? 300 : BOOT_MS)
    return () => clearTimeout(t)
  }, [visible, phase, reduced])

  useEffect(() => {
    if (!visible) return
    const advance = () => {
      if (phase === 'boot') return setPhase('lock')
      sessionFlag(BOOT_KEY, true)
      play('boot') // first user gesture — audio is allowed now
      setVisible(false)
    }
    window.addEventListener('keydown', advance)
    window.addEventListener('pointerdown', advance)
    return () => {
      window.removeEventListener('keydown', advance)
      window.removeEventListener('pointerdown', advance)
    }
  }, [visible, phase])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="boot"
          role="dialog"
          aria-label={`${SITE.osName} is starting`}
          exit={{ opacity: 0, scale: 1.03, filter: 'blur(6px)' }}
          transition={{ duration: 0.45 }}
          className="fixed inset-0 z-[2000] overflow-hidden bg-black"
        >
          {phase === 'boot' ? (
            <div className="grid h-full place-items-center">
              <div className="flex flex-col items-center gap-14">
                <Glyph name="heart" size={84} className="text-white" />
                <div className="h-[5px] w-[180px] overflow-hidden rounded-full bg-white/25">
                  <motion.div
                    className="h-full rounded-full bg-white"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: (reduced ? 300 : BOOT_MS) / 1000, ease: [0.4, 0, 0.6, 1] }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <LockScreen />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
