/**
 * Finanças Pediatria v5.0 - Service Worker Silk & Rose Gold
 * Cache Estratégico com Atualização Imediata (Zero Cache-Lock)
 * Autor Imutável: FChNeto (APP_CREATOR = 'FChNeto')
 */

const CACHE_NAME = 'financas-ped-v5-silk-2.0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/styles.css',
  './css/styles.css?v=5.0.0',
  './js/bundle.js',
  './js/bundle.js?v=5.0.0',
  './manifest.json',
  './assets/icons/favicon.png',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

// Instalação do Service Worker com ativação forçada
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Falha parcial ao pré-armazenar assets no cache:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Ativação e limpeza imediata de todos os caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('Removendo cache antigo:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptação de requisições: Network First com fallback para cache
self.addEventListener('fetch', (event) => {
  // Ignora requisições não-GET ou esquemas não-HTTP
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
