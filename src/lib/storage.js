/** localStorage that never throws (private mode, blocked storage, etc.). */
const memory = new Map()

export const safeStorage = {
  getItem(key) {
    try {
      return window.localStorage.getItem(key)
    } catch {
      return memory.get(key) ?? null
    }
  },
  setItem(key, value) {
    try {
      window.localStorage.setItem(key, value)
    } catch {
      memory.set(key, value)
    }
  },
  removeItem(key) {
    try {
      window.localStorage.removeItem(key)
    } catch {
      memory.delete(key)
    }
  },
}

export function sessionFlag(key, value) {
  try {
    if (value === undefined) return window.sessionStorage.getItem(key) === '1'
    window.sessionStorage.setItem(key, value ? '1' : '0')
  } catch {
    return false
  }
}
