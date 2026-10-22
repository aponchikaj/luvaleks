import { create } from 'zustand'
import { fetchReactionCounts, toggleReaction } from '@/services/reactions'

const key = (type, id) => `${type}:${id}`

export const useReactionsStore = create((set, get) => ({
  byKey: {}, // "photo:12" -> { count, reacted }

  load: async (type, ids) => {
    const missing = ids.filter((id) => !(key(type, id) in get().byKey))
    if (!missing.length) return
    const rows = await fetchReactionCounts(type, missing).catch(() => [])
    const found = Object.fromEntries(rows.map((r) => [key(type, r.target_id), { count: r.count, reacted: r.reacted }]))
    set((s) => ({
      byKey: {
        ...s.byKey,
        ...Object.fromEntries(missing.map((id) => [key(type, id), { count: 0, reacted: false }])),
        ...found,
      },
    }))
  },

  toggle: async (type, id) => {
    const k = key(type, id)
    const prev = get().byKey[k] ?? { count: 0, reacted: false }
    const optimistic = { reacted: !prev.reacted, count: Math.max(0, prev.count + (prev.reacted ? -1 : 1)) }
    set((s) => ({ byKey: { ...s.byKey, [k]: optimistic } }))
    try {
      const res = await toggleReaction(type, id)
      set((s) => ({ byKey: { ...s.byKey, [k]: res } }))
      return res
    } catch (e) {
      set((s) => ({ byKey: { ...s.byKey, [k]: prev } }))
      throw e
    }
  },
}))
