import { supabase } from '@/lib/supabase'

/** Standard list/get/create/update/remove for a table. */
export function crud(table, columns, { order = [['created_at', { ascending: true }]] } = {}) {
  const one = async (query) => {
    const { data, error } = await query.select(columns).single()
    if (error) throw error
    return data
  }
  return {
    async list() {
      let q = supabase.from(table).select(columns)
      for (const [col, opts] of order) q = q.order(col, opts)
      const { data, error } = await q
      if (error) throw error
      return data
    },
    async get(id) {
      const { data, error } = await supabase.from(table).select(columns).eq('id', id).maybeSingle()
      if (error) throw error
      return data
    },
    create: (row) => one(supabase.from(table).insert(row)),
    update: (id, patch) => one(supabase.from(table).update(patch).eq('id', id)),
    async remove(id) {
      const { error } = await supabase.from(table).delete().eq('id', id)
      if (error) throw error
    },
  }
}
