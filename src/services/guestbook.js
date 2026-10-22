import { supabase } from '@/lib/supabase'
import { crud } from './crud'

export const guestbookApi = crud('guestbook_entries', 'id, name, message, is_approved, created_at', {
  order: [['created_at', { ascending: false }]],
})

/** Public. No .select() — visitors can't read unapproved rows (including their own). */
export async function signGuestbook({ name, message }) {
  const { error } = await supabase
    .from('guestbook_entries')
    .insert({ name: name.trim(), message: message.trim() })
  if (error) throw error
}
