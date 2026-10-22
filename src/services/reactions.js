import { supabase } from '@/lib/supabase'
import { getClientId } from '@/lib/clientId'

export async function fetchReactionCounts(type, ids) {
  if (!ids.length) return []
  const { data, error } = await supabase.rpc('reaction_counts', {
    p_type: type,
    p_ids: ids,
    p_client: getClientId(),
  })
  if (error) throw error
  return data
}

export async function toggleReaction(type, id) {
  const { data, error } = await supabase.rpc('toggle_reaction', {
    p_type: type,
    p_id: id,
    p_client: getClientId(),
  })
  if (error) throw error
  return data[0]
}
