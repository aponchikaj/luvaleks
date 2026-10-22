import { create } from 'zustand'
import { getSiteSettings, updateSiteSettings } from '@/services/siteSettings'

/** Site-wide settings the two of us control (currently: the desktop wallpaper). */
export const useSiteStore = create((set, get) => ({
  settings: null,
  loading: false,

  fetch: async () => {
    if (get().loading || get().settings) return
    set({ loading: true })
    try {
      set({ settings: await getSiteSettings() })
    } catch {
      // Not fatal: the default wallpaper shows until settings load.
    } finally {
      set({ loading: false })
    }
  },

  update: async (patch) => set({ settings: await updateSiteSettings(patch) }),

  /** Realtime handler: the table has a single row, so any change replaces it. */
  applyChange: ({ eventType, new: row }) => {
    if (eventType !== 'DELETE' && row) set({ settings: row })
  },
}))
