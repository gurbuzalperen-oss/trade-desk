// Desk PWA service worker (scope = its own directory). Shell: cache-first for hashed assets.
// data/*.json, /api, Binance: network-only / never served stale.
const C = 'desk-shell-v2', B = new URL('./', self.location).pathname
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll([B, B + 'manifest.webmanifest', B + 'icons/icon-192.png']))); self.skipWaiting() })
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k))))); self.clients.claim() })
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url)
  if (e.request.method !== 'GET' || u.origin !== location.origin) return
  if (u.pathname.startsWith(B + 'data/') || u.pathname.startsWith('/api') || u.pathname.startsWith('/login') || u.pathname.startsWith('/logout')) return
  if (e.request.mode === 'navigate') { e.respondWith(fetch(e.request).then(r => { if (r.ok && !r.redirected) { const cl = r.clone(); caches.open(C).then(c => c.put(B, cl)) } return r }).catch(() => caches.match(B))); return }
  e.respondWith(caches.match(e.request).then(m => m || fetch(e.request).then(r => { if (r.ok && u.pathname.includes('/assets/')) { const cl = r.clone(); caches.open(C).then(c => c.put(e.request, cl)) } return r })))
})
