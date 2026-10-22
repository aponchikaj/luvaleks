import { supabase } from '@/lib/supabase'

/** Public. No .select() afterwards — visitors can insert but not read messages. */
export async function sendMessage({ name, email, content }) {
  const { error } = await supabase.from('messages').insert({
    name: name.trim(),
    email: email?.trim() || null,
    content: content.trim(),
  })
  if (error) throw error
}

export async function listMessages() {
  const { data, error } = await supabase
    .from('messages')
    .select('id, name, email, content, is_read, created_at')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function setMessageRead(id, isRead = true) {
  const { error } = await supabase.from('messages').update({ is_read: isRead }).eq('id', id)
  if (error) throw error
}

export async function deleteMessage(id) {
  const { error } = await supabase.from('messages').delete().eq('id', id)
  if (error) throw error
}
