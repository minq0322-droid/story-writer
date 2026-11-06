
const PREFIX = 'story-app-' + encodeURIComponent(self.registration.scope) + '-';
const CACHE = PREFIX + '5979a600507f';
const FILES = ["index.html","manifest.webmanifest","icon.svg","assets/index-D7W4R2Wh.css","assets/index-Bl5YtePR.js","assets/browser-30URg3Bj.js","assets/worker-sYvNOcMT.js"].map(path => new URL(path, self.registration.scope).href);
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