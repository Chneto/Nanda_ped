// Finanças Pediatria v6 Service Worker - Offline Resilience - Criado por FChNeto
const CACHE_NAME = 'financas-pediatria-v6-static-v2';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/config.js',
  './js/app.js',
  './js/cloudState.js',
  './js/db.js',
  './js/icons.js',
  './js/store.js',
  './js/supabaseClient.js',
  './js/sync.js',
  './js/ui.js',
  './js/pwa.js',
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
          console.warn(`[v6 SW] Cache skip for asset (${asset}):`, err);
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
        keys.filter((key) => key !== CACHE_NAME && (key.startsWith('nanda-v4-cloud') || key.startsWith('financas-pediatria-cloud') || key.startsWith('financas-pediatria-v6'))).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Network resilience with local cache fallback
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Strictly ignore cross-origin requests (Supabase REST, Auth, Realtime, Google OAuth)
  // Let client SDK and IndexedDB sync engine handle cross-origin network operations
  if (url.origin !== self.location.origin) {
    return;
  }

  // Same-origin asset handling
  event.respondWith(
    (async () => {
      const isRuntimeConfig = url.pathname.endsWith('/api/config');
      if (isRuntimeConfig) {
        // /api/config is never served from cache and never cached
        return fetch(event.request, { cache: 'no-store' });
      }

      const cachedResponse = await caches.match(event.request);

      try {
        const networkResponse = await fetch(event.request);
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache)).catch(() => {});
        }
        return networkResponse;
      } catch (fetchError) {
        // When network fails (offline / hospital Wi-Fi drop):
        if (cachedResponse) {
          return cachedResponse;
        }

        // If navigation fails (user is offline), fallback to index.html SPA entrypoint
        if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
          const fallbackHtml = await caches.match('./index.html') || await caches.match('/index.html') || await caches.match('./');
          if (fallbackHtml) return fallbackHtml;
        }
        throw fetchError;
      }
    })()
  );
});
