import { crud } from './crud'

export const milestonesApi = crud(
  'milestones',
  'id, title, description, happened_on, emoji, photo_id, place_id, created_at, ' +
    'photo:photos!milestones_photo_id_fkey(id, public_id, width, height, caption), ' +
    'place:places!milestones_place_id_fkey(id, name)',
  { order: [['happened_on', { ascending: true }], ['created_at', { ascending: true }]] },
)
