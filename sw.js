const APP_CACHE  = 'chofer-app-v3';
const TILE_CACHE = 'chofer-tiles-v1';
const APP_ASSETS = ['/', '/index.html', '/manifest.json', '/icon.svg', '/sw.js'];

self.addEventListener('install',  e => { e.waitUntil(caches.open(APP_CACHE).then(c=>c.addAll(APP_ASSETS))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==APP_CACHE&&k!==TILE_CACHE).map(k=>caches.delete(k))))); self.clients.claim(); });

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // OSM tiles → cache-first (offline support)
  if (url.hostname.endsWith('tile.openstreetmap.org')) {
    e.respondWith(
      caches.open(TILE_CACHE).then(async cache => {
        const cached = await cache.match(e.request);
        if (cached) return cached;
        try {
          const resp = await fetch(e.request);
          if (resp.ok) cache.put(e.request, resp.clone());
          return resp;
        } catch(_) {
          return cached || new Response('', { status: 404 });
        }
      })
    );
    return;
  }

  // Same-origin app files → cache-first
  if (url.origin === self.location.origin) {
    e.respondWith(caches.match(e.request).then(c => c || fetch(e.request)));
    return;
  }

  // External APIs (OSRM, Nominatim) → network only
  e.respondWith(fetch(e.request).catch(() => new Response('', { status: 503 })));
});

// Pre-cache tiles sent from the app
self.addEventListener('message', e => {
  if (e.data?.type === 'CACHE_TILES') {
    caches.open(TILE_CACHE).then(async cache => {
      const urls = e.data.urls;
      let done = 0;
      for (const url of urls) {
        try {
          const r = await fetch(url, { mode: 'cors' });
          if (r.ok) await cache.put(url, r);
        } catch(_) {}
        done++;
        if (done % 20 === 0) {
          self.clients.matchAll().then(cls => cls.forEach(c =>
            c.postMessage({ type: 'TILE_PROGRESS', done, total: urls.length })
          ));
        }
      }
      self.clients.matchAll().then(cls => cls.forEach(c =>
        c.postMessage({ type: 'TILE_DONE', total: urls.length })
      ));
    });
  }
});
