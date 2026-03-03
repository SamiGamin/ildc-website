/* ILDC Service Worker — Offline caching */
const CACHE_NAME = 'ildc-v1';
const ASSETS = [
  '/ildc-website/',
  '/ildc-website/index.html',
  '/ildc-website/servidor.html',
  '/ildc-website/mods.html',
  '/ildc-website/reglas.html',
  '/ildc-website/galeria.html',
  '/ildc-website/links.html',
  '/ildc-website/equipo.html',
  '/ildc-website/style.css',
  '/ildc-website/nav.js',
  '/ildc-website/status.js',
  '/ildc-website/img/logo.png'
];

// Install: cache core assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

// Fetch: network first, fallback to cache
self.addEventListener('fetch', (e) => {
  // Skip non-GET and external requests
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Cache successful responses
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        // Offline: serve from cache
        return caches.match(e.request);
      })
  );
});
