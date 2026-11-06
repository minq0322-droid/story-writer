
const PREFIX = 'story-app-' + encodeURIComponent(self.registration.scope) + '-';
const CACHE = PREFIX + '92ad92a6d358';
const FILES = ["index.html","manifest.webmanifest","icon.svg","apple-touch-icon.png","icon-192.png","icon-512.png","assets/index-BCXj1MyN.css","assets/index-C9N1mim3.js","assets/browser-D8sCB9ug.js","assets/worker-CCKHxx7i.js","assets/worker-Bw4R22-v.js"].map(path => new URL(path, self.registration.scope).href);
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const home = new URL(self.registration.scope);
  // Only the entry document may have a query, including demo mode.
  const entry = url.origin === home.origin && (url.pathname === home.pathname || url.pathname === home.pathname + 'index.html');
  const target = entry ? new URL('index.html', home).href : url.href;
  if (!FILES.includes(target)) return;
  if (entry) {
    event.respondWith(fetch(event.request).then(response => {
      if (!response.ok) throw new Error('Entry unavailable');
      const copy = response.clone();
      event.waitUntil(caches.open(CACHE).then(cache => cache.put(target, copy)));
      return response;
    }).catch(() => caches.open(CACHE).then(cache => cache.match(target))));
    return;
  }
  event.respondWith(caches.open(CACHE).then(cache => cache.match(target)).then(response => response || fetch(event.request)));
});