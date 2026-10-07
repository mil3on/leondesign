const CACHE_NAME = 'leonid-portfolio-v21';
const SHELL = [
  './',
  './index.html',
  './src/style.css?v=62',
  './src/main.js?v=49',
  './src/audio.js?v=15',
  './src/typography.js?v=1',
  './src/loader.js?v=3',
  './public/sky-reference.webp',
  './public/fonts/PPNeueMachina-Ultrabold.otf',
  './public/fonts/UraBumBumSP.otf',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || request.headers.has('range')) return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('./index.html'))),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
        return response;
      });
    }),
  );
});
