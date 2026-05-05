const CACHE = 'sm-timer-v8';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './apple-touch-icon.png',
  './background.jpg',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        if (
          response &&
          response.status === 200 &&
          e.request.url.startsWith(self.location.origin)
        ) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => {
            cache.put(e.request, copy);
          });
        }

        return response;
      })
      .catch(() => {
        return caches.match(e.request, { ignoreSearch: true });
      })
  );
});
