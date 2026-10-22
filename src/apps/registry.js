import { lazy } from 'react'

/**
 * Every "app" on the site. Each one opens as a draggable window on the desktop
 * and also has its own route (used on phones and for direct links).
 * size = default window size; bodyClassName = window body overrides.
 */
export const APPS = [
  { id: 'about', title: 'About Us', label: 'About Us', route: '/about',
    size: { w: 520, h: 230 }, component: lazy(() => import('./about/AboutApp')) },
  { id: 'countdown', title: 'Countdown', label: 'Countdown', route: '/countdown',
    size: { w: 340, h: 170 }, component: lazy(() => import('./countdown/CountdownApp')) },
  { id: 'gallery', title: 'Gallery', label: 'Gallery', route: '/gallery',
    size: { w: 760, h: 520 }, component: lazy(() => import('./gallery/GalleryApp')) },
  { id: 'notes', title: 'Notes', label: 'Notes', route: '/notes',
    size: { w: 760, h: 520 }, bodyClassName: 'p-0', component: lazy(() => import('./notes/NotesApp')) },
  { id: 'timeline', title: 'Our Story', label: 'Timeline', route: '/timeline',
    size: { w: 520, h: 560 }, component: lazy(() => import('./timeline/TimelineApp')) },
  { id: 'map', title: 'Map of Us', label: 'Map', route: '/map',
    size: { w: 720, h: 500 }, bodyClassName: 'p-0', component: lazy(() => import('./map/MapApp')) },
  { id: 'music', title: 'Our Songs', label: 'Music', route: '/music',
    size: { w: 400, h: 560 }, component: lazy(() => import('./music/MusicApp')) },
  { id: 'guestbook', title: 'Guestbook', label: 'Guestbook', route: '/guestbook',
    size: { w: 480, h: 560 }, component: lazy(() => import('./guestbook/GuestbookApp')) },
  { id: 'message', title: 'New Message', label: 'Mail', route: '/message',
    size: { w: 480, h: 540 }, component: lazy(() => import('./message/MessageApp')) },
]

export const APPS_BY_ID = Object.fromEntries(APPS.map((a) => [a.id, a]))

/** Apps opened automatically when someone lands on the desktop. */
export const STARTUP_APPS = ['about', 'countdown']
