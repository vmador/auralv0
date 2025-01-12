const CACHE_NAME = 'auralv0-pwa-cache-v2';
const urlsToCache = [
    '/auralv0/',
    '/auralv0/index.html',
    '/auralv0/manifest.json',
    '/auralv0/icon-192x192.png',
    '/auralv0/icon-512x512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);})
    );
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.url.startsWith('chrome-extension://')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then(
                    (response) => {
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                if (!event.request.url.startsWith('chrome-extension://')) {
                                    cache.put(event.request, responseToCache);
                                }
                            });
                        return response;
                    }
                );
            }).catch(() => {
                // Si tanto la caché como la red fallan, podrías devolver una página de error offline
                // return caches.match('/auralv0/offline.html');
            })
    );
});