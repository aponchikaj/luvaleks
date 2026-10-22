import { safeStorage } from './storage'

const KEY = 'luvaleks:client-id'

/** Anonymous per-browser id — lets visitors heart things once without an account. */
export function getClientId() {
  let id = safeStorage.getItem(KEY)
  if (!id) {
    id = crypto.randomUUID()
    safeStorage.setItem(KEY, id)
  }
  return id
}
