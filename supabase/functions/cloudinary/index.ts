// Supabase Edge Function: signs Cloudinary uploads and deletes assets.
// Keeps CLOUDINARY_API_SECRET off the client. Admin-only.
//
// Secrets (set once):
//   supabase secrets set CLOUDINARY_CLOUD_NAME=... CLOUDINARY_API_KEY=... CLOUDINARY_API_SECRET=...
// Deploy:
//   supabase functions deploy cloudinary
//
// Body: { action: "sign", folder?: string }       -> { signature, timestamp, apiKey, cloudName, folder }
//       { action: "delete", publicId: string }    -> { result }

import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const CLOUD_NAME = Deno.env.get('CLOUDINARY_CLOUD_NAME')!
const API_KEY = Deno.env.get('CLOUDINARY_API_KEY')!
const API_SECRET = Deno.env.get('CLOUDINARY_API_SECRET')!

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// Cloudinary signature: sha1 of "k1=v1&k2=v2" (keys sorted) + api_secret.
async function sign(params: Record<string, string | number>) {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&')
  const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(toSign + API_SECRET))
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  // Verify the caller is a signed-in admin, using their own JWT so RLS applies.
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  })
  const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin')
  if (adminError || !isAdmin) return json({ error: 'Forbidden' }, 403)

  let body: { action?: string; folder?: string; publicId?: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  const timestamp = Math.round(Date.now() / 1000)

  if (body.action === 'sign') {
    const folder = (body.folder ?? 'luvaleks').replace(/[^\w/-]/g, '')
    const signature = await sign({ folder, timestamp })
    return json({ signature, timestamp, apiKey: API_KEY, cloudName: CLOUD_NAME, folder })
  }

  if (body.action === 'delete') {
    if (!body.publicId) return json({ error: 'publicId required' }, 400)
    const signature = await sign({ public_id: body.publicId, timestamp })
    const form = new FormData()
    form.append('public_id', body.publicId)
    form.append('timestamp', String(timestamp))
    form.append('api_key', API_KEY)
    form.append('signature', signature)
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`, {
      method: 'POST',
      body: form,
    })
    const data = await res.json()
    return json(data, res.ok ? 200 : 502)
  }

  return json({ error: 'Unknown action' }, 400)
})
