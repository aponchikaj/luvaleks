// Single source of truth for the relationship + site constants.
export const SITE = {
  title: 'Lazare & Aleksa',
  osName: 'aleks OS',
  // Day we started — every 23rd is a monthiversary.
  startDate: '2026-04-23',
  anniversaryDay: 23,
  admins: ['Lazare', 'Aleksa'],
  // Admins log in with a username; Supabase needs an email, so "Lazare" → lazare@aleksos.app.
  // Nothing is ever sent to these addresses.
  adminEmailDomain: 'aleksos.app',
}

export const NOTE_COLORS = ['blue', 'sky', 'yellow', 'pink', 'mint', 'white']

export const LIMITS = {
  noteLength: 500,
  captionLength: 280,
  messageName: 80,
  messageLength: 2000,
  maxUploadMB: 15,
}
