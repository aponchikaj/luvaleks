// Vercel Function: signs Cloudinary uploads and deletes assets.
// Keeps CLOUDINARY_API_SECRET off the client. Admin-only.
//
// Env (Vercel → Project → Settings → Environment Variables):
//   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
//   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (shared with the frontend)
//
// POST /api/cloudinary, Authorization: Bearer <supabase access token>
// Body: { action: "sign", folder?: string }    -> { signature, timestamp, apiKey, cloudName, folder }
//       { action: "delete", publicId: string } -> Cloudinary destroy result

import { createHash } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY

// Cloudinary signature: sha1 of "k1=v1&k2=v2" (keys sorted) + api_secret.
function sign(params) {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&')
  return createHash('sha1').update(toSign + CLOUDINARY_API_SECRET).digest('hex')
}

async function isAdmin(authorization) {
  if (!authorization?.startsWith('Bearer ')) return false
  // Use the caller's own JWT so RLS + is_admin() decide, not this function.
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await supabase.rpc('is_admin')
  return !error && data === true
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Server is missing Cloudinary or Supabase configuration' })
  }
  if (!(await isAdmin(req.headers.authorization))) return res.status(403).json({ error: 'Forbidden' })

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body
  if (!body) return res.status(400).json({ error: 'Invalid JSON' })

  const timestamp = Math.round(Date.now() / 1000)

  if (body.action === 'sign') {
    const folder = String(body.folder ?? 'luvaleks').replace(/[^\w/-]/g, '') || 'luvaleks'
    const signature = sign({ folder, timestamp })
    return res.json({ signature, timestamp, apiKey: CLOUDINARY_API_KEY, cloudName: CLOUDINARY_CLOUD_NAME, folder })
  }

  if (body.action === 'delete') {
    if (!body.publicId || typeof body.publicId !== 'string') return res.status(400).json({ error: 'publicId required' })
    const form = new FormData()
    form.append('public_id', body.publicId)
    form.append('timestamp', String(timestamp))
    form.append('api_key', CLOUDINARY_API_KEY)
    form.append('signature', sign({ public_id: body.publicId, timestamp }))
    const r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`, {
      method: 'POST',
      body: form,
    })
    return res.status(r.ok ? 200 : 502).json(await r.json())
  }

  return res.status(400).json({ error: 'Unknown action' })
}

function safeParse(s) {
  try {
    return JSON.parse(s)
  } catch {
    return null
  }
}
