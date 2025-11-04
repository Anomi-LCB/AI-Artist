// This is a robust service worker for caching and offline functionality.

const CACHE_NAME = 'ai-artist-cache-v2'; // Bumped version for update
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // The JS and CSS are loaded from CDN via importmap or inline,
  // so we can't cache them here directly due to cross-origin restrictions.
  // The browser may cache them, but our service worker will focus on the app shell.
];

// Install a service worker: pre-cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event: serve from cache, fall back to network, then cache the new resource.
self.addEventListener('fetch', event => {
  // We only want to handle GET requests.
  if (event.request.method !== 'GET') {
    return;
  }
  
  // URL for an external resource, pass through.
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== location.origin) {
      return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request)
        .then(response => {
          // Cache hit - return response
          if (response) {
            return response;
          }

          // Not in cache - fetch from network
          return fetch(event.request).then(
            networkResponse => {
              // Check if we received a valid response
              if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                return networkResponse;
              }
              
              // Clone the response because it's a stream and can only be consumed once.
              const responseToCache = networkResponse.clone();
              
              cache.put(event.request, responseToCache);
              
              return networkResponse;
            }
          ).catch(error => {
            // Network request failed, and it's not in the cache.
            console.error('Fetch failed:', error);
            // Optional: return a fallback offline page if you have one.
            // return caches.match('/offline.html');
          });
        });
    })
  );
});

// Activate a service worker: clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});