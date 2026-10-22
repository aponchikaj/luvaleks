import { useEffect, useId, useRef } from 'react'
import { supabase } from '@/lib/supabase'

/** Subscribes to INSERT/UPDATE/DELETE on a public table for the component's lifetime. */
export function useRealtime(table, onChange, { enabled = true } = {}) {
  const handler = useRef(onChange)
  // Each subscriber needs its own channel: supabase-js reuses channels by name and
  // throws if a second component adds callbacks to one that's already subscribed.
  const uid = useId()
  useEffect(() => {
    handler.current = onChange
  })

  useEffect(() => {
    if (!enabled) return
    const channel = supabase
      .channel(`rt:${table}:${uid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) =>
        handler.current(payload),
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, enabled, uid])
}
