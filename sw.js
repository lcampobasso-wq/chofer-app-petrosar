// ════════════════════════════════════════════════════════
//  PETROSAR — Chofer App · Service Worker
//  Offline + actualización automática
// ════════════════════════════════════════════════════════
//
//  CÓMO ACTUALIZAR LA APP EN TODAS LAS TABLETS:
//  1) Subí el index.html nuevo a Vercel.
//  2) Subí la BARRA de versión de acá abajo (cambiá el número).
//     Ej: 'petrosar-chofer-v3'  ->  'petrosar-chofer-v7'
//  3) Listo. Las tablets, al tener señal, se actualizan solas.
//
//  ⚠️ El número TIENE que cambiar en cada actualización, si no las
//     tablets no se enteran de que hay versión nueva.
// ════════════════════════════════════════════════════════

const CACHE = 'petrosar-chofer-v7';      // ← cambiá este número en cada actualización

// Archivos base de la app (lo que se necesita para abrir sin señal)
const APP_FILES = [
  '/',
  '/index.html',
  '/manifest.json'
];

// ── INSTALL: guarda los archivos base de la app ──
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(APP_FILES)).catch(() => {})
  );
});

// ── ACTIVATE: borra cachés viejos de la app (NO toca los mapas) ──
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => {
      // Borra versiones viejas de la app, pero conserva el caché de mapas (chofer-tiles-*)
      if (k.startsWith('petrosar-chofer-') && k !== CACHE) return caches.delete(k);
      return null;
    }));
    await self.clients.claim(); // toma control de las pestañas abiertas
  })());
});

// ── MENSAJE desde la app: activarse ya (lo manda el index.html en momento seguro) ──
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// ── FETCH: cómo responde a cada pedido ──
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Los tiles de mapa los maneja el código de la app aparte: no nos metemos.
  if (url.hostname.includes('tile') || url.pathname.includes('/tiles/')) return;

  // APP (navegación / html / manifest): NETWORK-FIRST.
  // Si hay señal baja lo nuevo (y se actualiza sola); si no, usa lo cacheado.
  const esApp = req.mode === 'navigate'
    || url.pathname === '/'
    || url.pathname.endsWith('.html')
    || url.pathname.endsWith('manifest.json');

  if (esApp) {
    e.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const c = await caches.open(CACHE);
        c.put(req, fresh.clone()).catch(() => {});
        return fresh;
      } catch (_) {
        const cached = await caches.match(req);
        return cached || caches.match('/index.html');
      }
    })());
    return;
  }

  // RESTO (íconos, etc.): cache-first con respaldo a red.
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      return r;
    }).catch(() => hit))
  );
});
