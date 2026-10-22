import { errorMessage } from '@/lib/errors'

export const Loading = ({ label = 'Loading…' }) => (
  <p className="py-8 text-center text-sm text-chrome-dark">{label}</p>
)

export const ErrorState = ({ error, onRetry }) => (
  <div className="py-8 text-center text-sm text-red-600">
    <p>{errorMessage(error)}</p>
    {onRetry && (
      <button className="mt-2 underline" onClick={onRetry}>
        try again
      </button>
    )}
  </div>
)

export const Empty = ({ children }) => (
  <p className="py-8 text-center text-sm text-chrome-dark">{children}</p>
)
