import { useEffect, useState } from 'react'
import { countdown } from '@/lib/anniversary'

export function useCountdown() {
  const [value, setValue] = useState(() => countdown())
  useEffect(() => {
    const t = setInterval(() => setValue(countdown()), 1000)
    return () => clearInterval(t)
  }, [])
  return value
}
