/** Turns Supabase/Postgres/network errors into something a human can read. */
export function errorMessage(err) {
  if (!err) return 'Something went wrong'
  if (typeof err === 'string') return err
  if (err.code === '42501') return "You don't have permission to do that"
  if (err.code === '23514') return 'That input is not allowed (too long or invalid)'
  if (err.message === 'Invalid login credentials') return 'Wrong username or password'
  // Non-JSON reply or no reply at all: Supabase is unreachable or VITE_SUPABASE_URL is wrong.
  if (/JSON|Failed to fetch|NetworkError|Load failed/i.test(err.message ?? '')) {
    return "Can't reach the server. Check your connection, or the Supabase URL in .env."
  }
  return err.message || 'Something went wrong'
}
