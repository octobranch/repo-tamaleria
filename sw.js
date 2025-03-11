const CACHE_NAME = 'latamaleria-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/src/styles/styles.css',
  '/src/scripts/script.js',
  '/public/icons/logo.webp'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request)
      .then(res => res || fetch(e.request))
  );
});
