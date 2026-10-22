import { create } from 'zustand'
import { upsertById, removeById } from './upsert'

/**
 * Generic CRUD store for an admin-managed table.
 * api: { list, create, update, remove, get? }  sort: (a, b) => number
 */
export function createCollectionStore(api, { sort } = {}) {
  const sorted = (items) => (sort ? items.slice().sort(sort) : items)

  return create((set, get) => ({
    items: [],
    loading: false,
    loaded: false,
    error: null,

    fetch: async ({ force = false } = {}) => {
      if (get().loading || (get().loaded && !force)) return
      set({ loading: true, error: null })
      try {
        set({ items: sorted(await api.list()), loaded: true })
      } catch (error) {
        set({ error })
      } finally {
        set({ loading: false })
      }
    },

    create: async (input) => {
      const item = await api.create(input)
      set((s) => ({ items: sorted(upsertById(s.items, item)) }))
      return item
    },

    update: async (id, patch) => {
      const item = await api.update(id, patch)
      set((s) => ({ items: sorted(upsertById(s.items, item)) }))
      return item
    },

    remove: async (id) => {
      const prev = get().items
      set({ items: removeById(prev, id) })
      try {
        await api.remove(id)
      } catch (e) {
        set({ items: prev })
        throw e
      }
    },

    applyChange: async ({ eventType, new: row, old }) => {
      if (eventType === 'DELETE') return set((s) => ({ items: removeById(s.items, old.id) }))
      const item = api.get ? await api.get(row.id).catch(() => null) : row
      if (item) set((s) => ({ items: sorted(upsertById(s.items, item)) }))
    },
  }))
}
