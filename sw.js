const CACHE_NAME = 'Longoi-Kristian-v9';
const ASSETS = [
  './',
  './index.html',
  './README.md',
  './style.css',
  './sw.js',
  './asset/icon/doa-active.png',
  './asset/icon/doa-dim.png',
  './asset/icon/header.png',
  './asset/icon/hoturan-active.png',
  './asset/icon/hoturan-dim.png',
  './asset/icon/icon.png',
  './asset/icon/longoi-active.png',
  './asset/icon/longoi-dim.png',
  './asset/icon/more-active.png',
  './asset/icon/more-dim.png',
  './asset/icon/zabur-active.png',
  './asset/icon/zabur-dim.png',
  './data/hymns.json',
  './data/psalms.json',
  './data/prayers.json',
  './data/others.json',
  './data/liturgies.json',
  './data/sqlite_sequence.json',
];

// Install: Save files to cache
// ... existing ASSETS array ...

// Install: Save files to cache
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
