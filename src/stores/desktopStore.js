import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { safeStorage } from '@/lib/storage'

const MIN_W = 280
const MIN_H = 180

/**
 * Window manager state. Each window: { x, y, w, h, z, open, minimized, maximized }.
 * Geometry is remembered across visits; open/minimized state is not.
 */
export const useDesktopStore = create(
  persist(
    (set, get) => ({
      windows: {},
      topZ: 10,

      open: (id, defaults) => {
        const w = get().windows[id]
        const z = get().topZ + 1
        set((s) => ({
          topZ: z,
          windows: {
            ...s.windows,
            [id]: { ...defaults, ...w, z, open: true, minimized: false },
          },
        }))
      },

      close: (id) =>
        set((s) => ({ windows: { ...s.windows, [id]: { ...s.windows[id], open: false, maximized: false } } })),

      focus: (id) => {
        const { windows, topZ } = get()
        if (!windows[id] || windows[id].z === topZ) return
        set({ topZ: topZ + 1, windows: { ...windows, [id]: { ...windows[id], z: topZ + 1 } } })
      },

      minimize: (id) => set((s) => ({ windows: { ...s.windows, [id]: { ...s.windows[id], minimized: true } } })),

      toggleMaximize: (id) =>
        set((s) => ({ windows: { ...s.windows, [id]: { ...s.windows[id], maximized: !s.windows[id].maximized } } })),

      setGeometry: (id, geo) =>
        set((s) => {
          const w = { ...s.windows[id], ...geo }
          w.w = Math.max(MIN_W, w.w)
          w.h = Math.max(MIN_H, w.h)
          return { windows: { ...s.windows, [id]: w } }
        }),

      /** Topmost visible window id, for the "active" title bar style. */
      activeId: () => {
        let best = null
        for (const [id, w] of Object.entries(get().windows)) {
          if (w.open && !w.minimized && (!best || w.z > get().windows[best].z)) best = id
        }
        return best
      },
    }),
    {
      name: 'luvaleks:desktop',
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({
        windows: Object.fromEntries(
          Object.entries(s.windows).map(([id, { x, y, w, h }]) => [id, { x, y, w, h, open: false }]),
        ),
      }),
    },
  ),
)
