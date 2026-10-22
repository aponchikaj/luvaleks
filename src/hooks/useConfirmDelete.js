import { toast } from 'sonner'
import { errorMessage } from '@/lib/errors'

/** Returns (id) => confirm + remove (with error toast). Resolves to whether it was confirmed. */
export function useConfirmDelete(remove, what = 'this') {
  return (id) => {
    if (!window.confirm(`Delete ${what}?`)) return false
    remove(id).catch((e) => toast.error(errorMessage(e)))
    return true
  }
}
