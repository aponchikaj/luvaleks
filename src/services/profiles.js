import { supabase } from '@/lib/supabase'

/** The two of us — used for "note to …" pickers. */
export async function listAdmins() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url')
    .eq('is_admin', true)
    .order('display_name')
  if (error) throw error
  return data
}
