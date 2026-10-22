import { useEffect } from 'react'
import { useReactionsStore } from '@/stores/reactionsStore'

/** Loads hearts for a list of items in one request. Call from the list owner. */
export function useLoadReactions(type, ids) {
  const load = useReactionsStore((s) => s.load)
  const idsKey = ids.join(',')
  useEffect(() => {
    if (idsKey) load(type, idsKey.split(',').map(Number))
  }, [type, idsKey, load])
}
