import { SITE } from '@/config/site'

const DAY = 24 * 60 * 60 * 1000

function parseLocal(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Whole months since we started (counted on the anniversary day). */
export function monthsTogether(now = new Date()) {
  const start = parseLocal(SITE.startDate)
  let months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
  if (now.getDate() < start.getDate()) months -= 1
  return Math.max(0, months)
}

export function daysTogether(now = new Date()) {
  const start = parseLocal(SITE.startDate)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.floor((today - start) / DAY)
}

/** Next monthiversary date (today counts if it's the 23rd). */
export function nextAnniversary(now = new Date()) {
  const day = SITE.anniversaryDay
  let next = new Date(now.getFullYear(), now.getMonth(), day)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (next < today) next = new Date(now.getFullYear(), now.getMonth() + 1, day)
  return next
}

export function isAnniversaryToday(now = new Date()) {
  return now.getDate() === SITE.anniversaryDay && monthsTogether(now) > 0
}

/** { days, hours, minutes, seconds } until the next monthiversary. */
export function countdown(now = new Date()) {
  const ms = Math.max(0, nextAnniversary(now) - now)
  return {
    days: Math.floor(ms / DAY),
    hours: Math.floor((ms / 3_600_000) % 24),
    minutes: Math.floor((ms / 60_000) % 60),
    seconds: Math.floor((ms / 1000) % 60),
    upcomingMonth: monthsTogether(now) + (isAnniversaryToday(now) ? 0 : 1),
  }
}
