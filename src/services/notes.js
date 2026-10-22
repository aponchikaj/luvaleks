import { supabase } from '@/lib/supabase'

const COLUMNS =
  'id, content, color, pos_x, pos_y, rotation, is_pinned, author_id, to_id, created_at, updated_at, ' +
  'author:profiles!notes_author_id_fkey(display_name), recipient:profiles!notes_to_id_fkey(display_name)'

export async function listNotes() {
  const { data, error } = await supabase
    .from('notes')
    .select(COLUMNS)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function getNote(id) {
  const { data, error } = await supabase.from('notes').select(COLUMNS).eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export async function createNote({ content, color = 'blue', toId = null, posX, posY, rotation }) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('notes')
    .insert({
      content: content.trim(),
      color,
      to_id: toId,
      author_id: user?.id ?? null,
      pos_x: posX ?? 0.1 + Math.random() * 0.8,
      pos_y: posY ?? 0.1 + Math.random() * 0.8,
      rotation: rotation ?? Math.round((Math.random() * 10 - 5) * 10) / 10,
    })
    .select(COLUMNS)
    .single()
  if (error) throw error
  return data
}

export async function updateNote(id, patch) {
  const { data, error } = await supabase
    .from('notes')
    .update(patch)
    .eq('id', id)
    .select(COLUMNS)
    .single()
  if (error) throw error
  return data
}

export async function deleteNote(id) {
  const { error } = await supabase.from('notes').delete().eq('id', id)
  if (error) throw error
}
