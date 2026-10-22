// Built-in gradient wallpapers (ids must match the check constraint on site_settings).
export const WALLPAPERS = {
  blue: {
    label: 'Clicky Blue',
    css: 'radial-gradient(120% 80% at 85% 110%, #0a1f7a 0%, transparent 60%), radial-gradient(90% 70% at 10% 100%, #2c8bff 0%, transparent 55%), radial-gradient(70% 60% at 100% 0%, #6fb6ff 0%, transparent 60%), radial-gradient(80% 90% at 0% 0%, #1d6ee5 0%, transparent 70%), linear-gradient(160deg, #1d6ee5 0%, #221898 100%)',
  },
  midnight: {
    label: 'Midnight',
    css: 'radial-gradient(90% 70% at 20% 100%, #1d6ee5 0%, transparent 60%), radial-gradient(70% 60% at 90% 10%, #3a2a9e 0%, transparent 60%), linear-gradient(170deg, #0b0f2a 0%, #050508 100%)',
  },
  dawn: {
    label: 'Dawn',
    css: 'radial-gradient(90% 70% at 0% 100%, #ff7aa2 0%, transparent 60%), radial-gradient(80% 70% at 100% 0%, #9ec5ff 0%, transparent 60%), linear-gradient(160deg, #6b5bff 0%, #1d6ee5 100%)',
  },
  aqua: {
    label: 'Aqua',
    css: 'radial-gradient(90% 80% at 100% 100%, #0a5bd1 0%, transparent 60%), radial-gradient(80% 70% at 0% 0%, #7fe3ff 0%, transparent 60%), linear-gradient(160deg, #2bb3ff 0%, #1d6ee5 100%)',
  },
  graphite: {
    label: 'Graphite',
    css: 'radial-gradient(90% 70% at 80% 100%, #1d6ee5 0%, transparent 55%), linear-gradient(160deg, #3a3a3e 0%, #121214 100%)',
  },
}

export const DEFAULT_WALLPAPER = 'blue'
