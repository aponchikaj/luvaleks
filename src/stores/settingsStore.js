import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { safeStorage } from '@/lib/storage'

export const useSettingsStore = create(
  persist(
    (set) => ({
      sound: true,
      cursor: 'mac', // 'mac' | 'heart'
      toggleSound: () => set((s) => ({ sound: !s.sound })),
      setCursor: (cursor) => set({ cursor }),
    }),
    {
      name: 'luvaleks:settings',
      version: 2,
      storage: createJSONStorage(() => safeStorage),
      // v1 stored heartCursor: true by default — everyone starts on the macOS cursor now.
      migrate: (old) => ({ sound: old?.sound ?? true, cursor: 'mac' }),
    },
  ),
)
