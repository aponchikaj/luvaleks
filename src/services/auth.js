import { supabase } from '@/lib/supabase'
import { SITE } from '@/config/site'

/** "Lazare" → "lazare@aleksos.app"; full emails pass through unchanged. */
export const usernameToEmail = (name) => {
  const n = name.trim().toLowerCase()
  return n.includes('@') ? n : `${n}@${SITE.adminEmailDomain}`
}

export async function signIn(username, password) {
  const email = usernameToEmail(username)
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data.session
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url, is_admin')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

export function onAuthChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session))
  return () => data.subscription.unsubscribe()
}
