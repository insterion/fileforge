// FileForge 0.5.0 — cache the application shell, PDF Studio and a local ZIP library.
// User files are never fetched, intercepted, or cached by this Service Worker.
const CACHE = 'fileforge-shell-0.5.0';
const FILES = [
  './', './index.html', './styles.css', './app.js', './pdf-studio.js',
  './archive-studio.js', './jszip.min.js', './library.js', './batch-studio.js', './manifest.webmanifest', './icon-192.png', './icon-512.png'
];
const PDF_LIB = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(FILES);
    // The optional PDF library is downloaded only when PDF Studio is used.
    // This keeps PWA installation independent from external CDN availability.
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('fileforge-shell-') && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.href === PDF_LIB) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const hit=await cache.match(PDF_LIB);
      if (hit) return hit;
      try {
        const response=await fetch(request);
        if(response)await cache.put(PDF_LIB,response.clone());
        return response;
      }catch(e){return Response.error();}
    })());
    return;
  }
  if (url.origin !== self.location.origin || !url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const response = await fetch(request);
      if (response.ok && response.type === 'basic') await cache.put(request, response.clone());
      return response;
    } catch (err) {
      const cached = await cache.match(request, {ignoreSearch: true});
      if (cached) return cached;
      if (request.mode === 'navigate') return (await cache.match('./index.html')) || Response.error();
      return Response.error();
    }
  })());
});
