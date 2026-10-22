import { Link } from 'react-router-dom'
import { Window } from '@/components/ui/Window'

export default function NotFound() {
  return (
    <Window title="Error" className="mx-auto max-w-md">
      <p className="text-sm">The file you're looking for could not be found.</p>
      <Link to="/" className="mt-3 inline-block text-sm text-clicky underline">go home</Link>
    </Window>
  )
}
