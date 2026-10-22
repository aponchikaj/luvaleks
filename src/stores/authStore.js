import { create } from 'zustand'
import * as auth from '@/services/auth'

let unsubscribe = null

export const useAuthStore = create((set, get) => ({
  session: null,
  profile: null,
  isAdmin: false,
  initialized: false,

  /** Call once at app start. Restores the session and listens for changes. */
  init: async () => {
    if (unsubscribe) return
    const load = async (session) => {
      const profile = session ? await auth.getProfile(session.user.id).catch(() => null) : null
      set({ session, profile, isAdmin: !!profile?.is_admin, initialized: true })
    }
    unsubscribe = auth.onAuthChange((session) => {
      // Defer: supabase-js warns against awaiting other calls inside the callback.
      setTimeout(() => load(session), 0)
    })
    await load(await auth.getSession().catch(() => null))
  },

  signIn: async (email, password) => {
    const session = await auth.signIn(email, password)
    const profile = await auth.getProfile(session.user.id)
    if (!profile?.is_admin) {
      await auth.signOut()
      throw new Error('This account is not an admin')
    }
    set({ session, profile, isAdmin: true })
  },

  signOut: async () => {
    await auth.signOut()
    set({ session: null, profile: null, isAdmin: false })
  },

  displayName: () => get().profile?.display_name ?? null,
}))
