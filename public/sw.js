// Service Worker para KoquiFI Lottery PWA
const CACHE_NAME = 'koquifi-lottery-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/.well-known/manifest.json',
    '/api/frame/image/main',
    '/api/frame/image/status',
    '/api/frame/image/results',
    '/api/frame/image/info',
    '/api/frame/image/success',
    '/api/frame/image/error',
    '/api/frame/image/buy',
    '/api/frame/image/my-tickets'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Cache abierto');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('✅ Service Worker instalado');
                return self.skipWaiting();
            })
    );
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker activando...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Eliminando cache antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('✅ Service Worker activado');
            return self.clients.claim();
        })
    );
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
    // Solo interceptar requests GET
    if (event.request.method !== 'GET') {
        return;
    }

    // Estrategia: Cache First para imágenes, Network First para API
    if (event.request.url.includes('/api/frame/image/')) {
        // Cache First para imágenes
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    if (response) {
                        console.log('🖼️ Imagen desde cache:', event.request.url);
                        return response;
                    }
                    return fetch(event.request).then((response) => {
                        // Verificar que la respuesta sea válida
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        // Clonar la respuesta
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        return response;
                    });
                })
        );
    } else if (event.request.url.includes('/api/')) {
        // Network First para API
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Verificar que la respuesta sea válida
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    // Clonar la respuesta
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    return response;
                })
                .catch(() => {
                    // Si falla la red, intentar desde cache
                    return caches.match(event.request);
                })
        );
    } else {
        // Cache First para otros recursos
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    if (response) {
                        return response;
                    }
                    return fetch(event.request);
                })
        );
    }
});

// Manejar notificaciones push (futuro)
self.addEventListener('push', (event) => {
    console.log('📱 Push notification recibida');
    
    const options = {
        body: event.data ? event.data.text() : 'Nueva notificación de KoquiFI Lottery',
        icon: '/api/frame/image/main?w=192&h=192',
        badge: '/api/frame/image/main?w=96&h=96',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Ver Lotería',
                icon: '/api/frame/image/main?w=96&h=96'
            },
            {
                action: 'close',
                title: 'Cerrar',
                icon: '/api/frame/image/main?w=96&h=96'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('KoquiFI Lottery', options)
    );
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', (event) => {
    console.log('🔔 Notificación clickeada');
    
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('https://koquifi-farcaster-frame-815l.vercel.app')
        );
    } else if (event.action === 'close') {
        // Solo cerrar la notificación
        return;
    } else {
        // Acción por defecto
        event.waitUntil(
            clients.openWindow('https://koquifi-farcaster-frame-815l.vercel.app')
        );
    }
});

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('🎰 KoquiFI Lottery Service Worker cargado');
