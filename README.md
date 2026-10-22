# Lazare & Aleksa — aleks OS

A macOS-styled site (iPhone-styled on phones) for our monthiversaries (every 23rd). React + Vite + Tailwind v4 + Zustand, Supabase (DB/auth/realtime), Cloudinary (images). No custom backend: one Supabase Edge Function signs Cloudinary uploads.

## Setup

1. `npm install` and `cp .env.example .env`, then fill it in.
2. **Supabase**: create a project, then run every file in `supabase/migrations/` **in order** in the SQL editor
   (or `supabase link` + `supabase db push`).
3. **Admins** log in with a username (`Lazare`, `Aleksa`); the site turns it into `<username>@aleksos.app`.
   Authentication → Users → Add user → create `lazare@aleksos.app` and `aleksa@aleksos.app`
   with their passwords and **Auto confirm** on. Then run `supabase/seed.sql`.
   Then **disable public sign-ups** (Authentication → Sign In / Providers → Email).
4. **Cloudinary edge function**:
   ```sh
   supabase secrets set CLOUDINARY_CLOUD_NAME=... CLOUDINARY_API_KEY=... CLOUDINARY_API_SECRET=...
   supabase functions deploy cloudinary
   ```
5. `npm run dev` → site at `/`, admin at `/admin`.

## Structure

```
src/
  config/site.js        start date, limits, note colors
  lib/                  supabase client, cloudinary helpers, anniversary math, error mapping
  services/             all Supabase queries (auth, photos, notes, messages, profiles)
  stores/               Zustand stores (auth, photos, notes, messages) + realtime handlers
  hooks/                useRealtime, useCountdown
  components/ui/        Window (retro frame), Button, Field, StickyNote, States
  pages/                Home, Gallery, Notes, Message, NotFound
  pages/admin/          Login, AdminLayout, Overview, PhotosAdmin, NotesAdmin, MessagesAdmin
supabase/
  migrations/           schema + RLS + realtime
  functions/cloudinary  signed upload / delete
  seed.sql              promote the two admin accounts
```

## Security model

- Visitors: read photos & notes, insert messages (rate-limited, honeypot).
- Admins (`profiles.is_admin`): everything else. Enforced by RLS, not the UI.
- `is_admin` can't be self-granted (column-level grants).
- Cloudinary API secret lives only in Edge Function secrets.
