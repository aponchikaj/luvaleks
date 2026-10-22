import { create } from 'zustand'
import * as api from '@/services/notes'
import { upsertById, removeById } from './upsert'

export const useNotesStore = create((set, get) => ({
  notes: [],
  loading: false,
  error: null,
  loaded: false,

  fetch: async ({ force = false } = {}) => {
    if (get().loading || (get().loaded && !force)) return
    set({ loading: true, error: null })
    try {
      set({ notes: await api.listNotes(), loaded: true })
    } catch (error) {
      set({ error })
    } finally {
      set({ loading: false })
    }
  },

  create: async (input) => {
    const note = await api.createNote(input)
    set((s) => ({ notes: upsertById(s.notes, note) }))
    return note
  },

  update: async (id, patch) => {
    const note = await api.updateNote(id, patch)
    set((s) => ({ notes: upsertById(s.notes, note) }))
  },

  /** Optimistic drag: move locally, persist, roll back on failure. */
  move: async (id, posX, posY) => {
    const clamp = (v) => Math.min(1, Math.max(0, v))
    const prev = get().notes.find((n) => n.id === id)
    set((s) => ({ notes: upsertById(s.notes, { id, pos_x: clamp(posX), pos_y: clamp(posY) }) }))
    try {
      await api.updateNote(id, { pos_x: clamp(posX), pos_y: clamp(posY) })
    } catch (e) {
      if (prev) set((s) => ({ notes: upsertById(s.notes, prev) }))
      throw e
    }
  },

  remove: async (id) => {
    const prev = get().notes
    set({ notes: removeById(prev, id) })
    try {
      await api.deleteNote(id)
    } catch (e) {
      set({ notes: prev })
      throw e
    }
  },

  /** Realtime rows lack the joined author names, so refetch the single note. */
  applyChange: async ({ eventType, new: row, old }) => {
    if (eventType === 'DELETE') return set((s) => ({ notes: removeById(s.notes, old.id) }))
    const note = await api.getNote(row.id).catch(() => null)
    if (note) set((s) => ({ notes: upsertById(s.notes, note) }))
  },
}))
