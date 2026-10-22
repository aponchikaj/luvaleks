import { createCollectionStore } from './createCollectionStore'
import { milestonesApi } from '@/services/milestones'
import { placesApi } from '@/services/places'
import { songsApi } from '@/services/songs'
import { guestbookApi } from '@/services/guestbook'

const byDate = (field) => (a, b) =>
  (a[field] ?? '9999').localeCompare(b[field] ?? '9999') || a.id - b.id

export const useMilestonesStore = createCollectionStore(milestonesApi, { sort: byDate('happened_on') })
export const usePlacesStore = createCollectionStore(placesApi, { sort: byDate('visited_on') })
export const useSongsStore = createCollectionStore(songsApi, {
  sort: (a, b) => a.sort_order - b.sort_order || a.id - b.id,
})
export const useGuestbookStore = createCollectionStore(guestbookApi, {
  sort: (a, b) => b.created_at.localeCompare(a.created_at),
})
