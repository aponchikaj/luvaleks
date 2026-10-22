# Lazare & Aleksa — aleks OS

A macOS-styled site (iPhone-styled on phones) for our monthiversaries (every 23rd). React + Vite + Tailwind v4 + Zustand, Supabase (DB/auth/realtime), Cloudinary (images), hosted on Vercel. No custom backend: one Vercel Function (`api/cloudinary.js`) signs Cloudinary uploads.

## Setup

1. `npm install` and `cp .env.example .env`, then fill it in.
2. **Supabase**: create a project, then run every file in `supabase/migrations/` **in order** in the SQL editor
   (or `supabase link` + `supabase db push`).
3. **Admins** log in with a username (`Lazare`, `Aleksa`); the site turns it into `<username>@aleksos.app`.
   Authentication → Users → Add user → create `lazare@aleksos.app` and `aleksa@aleksos.app`
   with their passwords and **Auto confirm** on. Then run `supabase/seed.sql`.
   Then **disable public sign-ups** (Authentication → Sign In / Providers → Email).
4. **Vercel**: import the repo, then add every variable from `.env.example` under
   Project → Settings → Environment Variables (the `CLOUDINARY_*` ones without `VITE_` stay server-side).
   `vercel.json` rewrites all routes to `index.html` so `/admin` survives a refresh.
5. `npm run dev` for the UI only (`/` and `/admin`). Photo upload/delete needs the function, so use `vercel dev` to test those locally.

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
api/
  cloudinary.js         Vercel Function: signed upload / delete (admin-only)
supabase/
  migrations/           schema + RLS + realtime
  seed.sql              promote the two admin accounts
```

## Security model

- Visitors: read photos & notes, insert messages (rate-limited, honeypot).
- Admins (`profiles.is_admin`): everything else. Enforced by RLS, not the UI.
- `is_admin` can't be self-granted (column-level grants).
- Cloudinary API secret lives only in Vercel's server-side env (no `VITE_` prefix), never in the bundle.
