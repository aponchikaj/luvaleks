import { create } from 'zustand'
import * as api from '@/services/messages'
import { upsertById, removeById } from './upsert'

export const useMessagesStore = create((set, get) => ({
  messages: [],
  loading: false,
  error: null,

  unreadCount: () => get().messages.filter((m) => !m.is_read).length,

  fetch: async () => {
    set({ loading: true, error: null })
    try {
      set({ messages: await api.listMessages() })
    } catch (error) {
      set({ error })
    } finally {
      set({ loading: false })
    }
  },

  setRead: async (id, isRead = true) => {
    set((s) => ({ messages: upsertById(s.messages, { id, is_read: isRead }) }))
    await api.setMessageRead(id, isRead)
  },

  remove: async (id) => {
    const prev = get().messages
    set({ messages: removeById(prev, id) })
    try {
      await api.deleteMessage(id)
    } catch (e) {
      set({ messages: prev })
      throw e
    }
  },

  applyChange: ({ eventType, new: row, old }) => {
    if (eventType === 'DELETE') set((s) => ({ messages: removeById(s.messages, old.id) }))
    else if (eventType === 'INSERT') set((s) => ({ messages: [row, ...removeById(s.messages, row.id)] }))
    else set((s) => ({ messages: upsertById(s.messages, row) }))
  },
}))
