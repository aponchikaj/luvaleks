import { useEffect } from 'react'
import { useSettingsStore } from '@/stores/settingsStore'
import { installCursors } from '@/lib/cursor'
import { play } from '@/lib/sound'

/** Global touches: custom cursor + click sound on interactive elements. */
export function useUiEffects() {
  const cursor = useSettingsStore((s) => s.cursor)

  useEffect(() => {
    installCursors(cursor)
  }, [cursor])

  useEffect(() => {
    const onDown = (e) => {
      if (e.target.closest?.('a, button, [role="button"], summary, select')) play('click')
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [])
}
