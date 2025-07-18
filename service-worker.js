const CACHE_NAME = 'mi-planificador-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // Agrega todas las URLs de tus archivos estáticos aquí
  // Esto incluye tus archivos JS, CSS, iconos, etc.
  'https://cdn.tailwindcss.com', // Tailwind CSS CDN
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap', // Fuente Inter CSS
  'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMwLtVKi7fApXh-1Dzg.woff2', // Ejemplo de archivo de fuente (ajusta según las URLs reales de tus fuentes)
  // Asegúrate de incluir todos los iconos que definiste en manifest.json
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html'
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
          return caches.match('/offline.html');
        });
      })
  );
});


// Evento 'activate': se dispara cuando el Service Worker se activa
self.addEventListener('activate', (event) => {
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
