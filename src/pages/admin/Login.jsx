import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Window } from '@/components/ui/Window'
import { Wallpaper } from '@/components/desktop/Wallpaper'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { useAuthStore } from '@/stores/authStore'
import { errorMessage } from '@/lib/errors'

export default function Login() {
  const { signIn, isAdmin } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  if (isAdmin) return <Navigate to="/admin" replace />

  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await signIn(username, password)
      navigate(location.state?.from?.pathname ?? '/admin', { replace: true })
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center p-4">
      <Wallpaper />
      <Window title="Log In" className="w-full max-w-sm">
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Username">
            <Input required autoComplete="username" autoCapitalize="none" value={username} onChange={(e) => setUsername(e.target.value)} />
          </Field>
          <Field label="Password">
            <Input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          <Button type="submit" disabled={busy} className="w-full">{busy ? 'Logging in…' : 'Log In'}</Button>
        </form>
      </Window>
    </div>
  )
}
