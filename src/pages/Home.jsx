import { Desktop } from '@/components/desktop/Desktop'
import { PhoneHome } from '@/components/phone/PhoneHome'
import { useMediaQuery, WIDE } from '@/hooks/useMediaQuery'

export default function Home() {
  return useMediaQuery(WIDE) ? <Desktop /> : <PhoneHome />
}
