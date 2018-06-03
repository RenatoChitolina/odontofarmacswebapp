//TODO: (R) Verificar se essa versão importada no template está incorreta de fato
// importScripts('workbox-v3.0.0-alpha.6/workbox-sw.js')
importScripts('workbox-v3.1.0/workbox-sw.js');

self.workbox.skipWaiting();
self.workbox.clientsClaim();

/* This is our code to handle push events. */
//TODO: (R) Push notifications fica desabilitado no momento, até ser feita uma implementação efetiva do recurso
// self.addEventListener('push', (event) => {
//   console.log('[Service Worker] Push Received.');
//   console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

//   const title = 'Push Notification';
//   const options = {
//     body: `${event.data.text()}`,
//     icon: 'images/icon.png',
//     badge: 'images/badge.png'
//   };

//   event.waitUntil(self.registration.showNotification(title, options));
// });

self.workbox.precaching.precacheAndRoute([]);
