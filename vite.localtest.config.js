// TEMPORARY local test harness — proxies supabase-js REST calls to a local PostgREST.
import base from './vite.config.js'
export default {
  ...base,
  server: {
    port: 5199,
    strictPort: true,
    proxy: { '/rest/v1': { target: 'http://localhost:54330', rewrite: (p) => p.replace(/^\/rest\/v1/, '') } },
  },
}
