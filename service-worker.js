const CACHE_NAME = 'mi-planificador-v1';
const urlsToCache = [
  './', // Ruta relativa a la raíz del Service Worker (tu repositorio en GitHub Pages)
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com', // URLs externas no necesitan ajuste
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap', // URLs externas no necesitan ajuste
  'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMwLtVKi7fApXh-1Dzg.woff2', // URLs externas no necesitan ajuste
  './icons/icon-192x192.png', // Ruta relativa
  './icons/icon-512x512.png', // Ruta relativa
  './offline.html' // Ruta relativa
];

// Evento 'install': se dispara cuando el Service Worker se instala
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cacheando archivos');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Service Worker: Fallo al cachear', error);
      })
  );
});

// Evento 'fetch': se dispara cada vez que el navegador hace una solicitud de red
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse.ok) {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          }
          return networkResponse;
        }).catch(() => {
          // Si la red falla, devuelve la página offline
          return caches.match('./offline.html'); // Ruta corregida aquí también
        });
      })
  );
});

// Evento 'activate': se dispara cuando el Service Worker se activa
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Eliminando caché antigua', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
