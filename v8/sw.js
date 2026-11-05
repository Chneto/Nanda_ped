// Finanças Pediatria v8 Service Worker - Offline Resilience - Criado por FChNeto
const CACHE_NAME = 'financas-pediatria-v8-static-v1';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/app.js',
  './js/icons.js',
  './js/storage.js',
  './js/store.js',
  './js/ui.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/favicon.png'
];

// Install: Cache core application shell safely
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of STATIC_ASSETS) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn(`[v8 SW] Cache skip for asset (${asset}):`, err);
        }
      }
    }).then(() => self.skipWaiting())
  );
});

// Activate: Purge older cache versions and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME && (
          key.startsWith('nanda-') || 
          key.startsWith('financas-pediatria-')
        )).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: 100% offline network resilience with local cache fallback
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Strictly ignore cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    (async () => {
      const cachedResponse = await caches.match(event.request);

      try {
        const networkResponse = await fetch(event.request);
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache)).catch(() => {});
        }
        return networkResponse;
      } catch (fetchError) {
        // When network fails (offline hospital basement):
        if (cachedResponse) {
          return cachedResponse;
        }

        // If navigation fails, fallback to index.html SPA entrypoint
        if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
          const fallbackHtml = await caches.match('./index.html') || await caches.match('/index.html') || await caches.match('./');
          if (fallbackHtml) return fallbackHtml;
        }
        throw fetchError;
      }
    })()
  );
});
