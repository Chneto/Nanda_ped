// Finanças Pediatria V4 Cloud Service Worker - Offline Resilience - Criado por FChNeto
const CACHE_NAME = 'financas-pediatria-cloud-v3';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/config.js',
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
          // Log warning and continue caching remaining assets
          console.warn(`[V4_Cloud SW] Cache skip for asset (${asset}):`, err);
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
        keys.filter((key) => key !== CACHE_NAME && key.startsWith('nanda-v4-cloud')).map((key) => caches.delete(key))
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
      const isFreshAsset = /\.(?:html|css|js)$/.test(url.pathname) || url.pathname.endsWith('/');
      const cachedResponse = isRuntimeConfig ? null : await caches.match(event.request);

      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          if (!isRuntimeConfig) caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      }).catch((fetchError) => {
        // If navigation fails (user is offline), fallback to index.html SPA entrypoint
        if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./index.html');
        }
        throw fetchError;
      });

      // Revalidate app code and HTML on every visit; serve cache first for static artwork.
      if (isRuntimeConfig || isFreshAsset) return fetchPromise;
      return cachedResponse || fetchPromise;
    })()
  );
});
