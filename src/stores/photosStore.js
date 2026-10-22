import { create } from 'zustand'
import * as api from '@/services/photos'
import { upsertById, removeById } from './upsert'

export const usePhotosStore = create((set, get) => ({
  photos: [],
  loading: false,
  error: null,
  loaded: false,

  fetch: async ({ force = false } = {}) => {
    if (get().loading || (get().loaded && !force)) return
    set({ loading: true, error: null })
    try {
      set({ photos: await api.listPhotos(), loaded: true })
    } catch (error) {
      set({ error })
    } finally {
      set({ loading: false })
    }
  },

  upload: async (file, meta, onProgress) => {
    const photo = await api.createPhoto(file, meta, onProgress)
    set((s) => ({ photos: [photo, ...removeById(s.photos, photo.id)] }))
    return photo
  },

  update: async (id, patch) => {
    const photo = await api.updatePhoto(id, patch)
    set((s) => ({ photos: upsertById(s.photos, photo) }))
  },

  remove: async (photo) => {
    const prev = get().photos
    set({ photos: removeById(prev, photo.id) })
    try {
      await api.removePhoto(photo)
    } catch (e) {
      set({ photos: prev })
      throw e
    }
  },

  /** Realtime payload handler. */
  applyChange: ({ eventType, new: row, old }) => {
    if (eventType === 'DELETE') set((s) => ({ photos: removeById(s.photos, old.id) }))
    else if (eventType === 'INSERT' && !get().photos.some((p) => p.id === row.id))
      set((s) => ({ photos: [row, ...s.photos] }))
    else set((s) => ({ photos: upsertById(s.photos, row) }))
  },
}))
