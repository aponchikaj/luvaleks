import { supabase } from '@/lib/supabase'

const COLUMNS = 'wallpaper_preset, wallpaper_public_id, updated_at'

export async function getSiteSettings() {
  const { data, error } = await supabase.from('site_settings').select(COLUMNS).eq('id', true).maybeSingle()
  if (error) throw error
  return data
}

export async function updateSiteSettings(patch) {
  const { data, error } = await supabase.from('site_settings').update(patch).eq('id', true).select(COLUMNS).single()
  if (error) throw error
  return data
}
