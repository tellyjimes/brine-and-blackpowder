// Brine & Blackpowder 3.4.0: keeps the game on the phone, so it plays offline. A new version of
// this file (each release) fetches the new game in the background; it plays from the next opening.
const CACHE = 'brine-3.4.0';
const FILES = ['index.html', 'manifest.json', 'icon-180.png', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('brine-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== self.location.origin) return;
  // caches.match, not caches.open: an outgoing version must not recreate the cache its successor cleared.
  e.respondWith((async () => {
    const hit = (await caches.match(r, { ignoreSearch: true, cacheName: CACHE })) || (await caches.match(r, { ignoreSearch: true }))
      || (r.mode === 'navigate' ? (await caches.match('index.html', { cacheName: CACHE })) || (await caches.match('index.html')) : null);
    return hit || fetch(r);
  })());
});
