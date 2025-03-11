const CACHE_NAME = 'latamaleria-v2';
const DYNAMIC_CACHE = 'runtime-cache';

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll([
                '/',
                '/index.html',
                '/src/styles/styles.css'
            ]))
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request)
            .then(response => response || fetch(e.request))
);
