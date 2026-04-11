const CACHE_NAME = 'Longoi-Kristian-v22';
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
  './asset/icon/alkitab-active.png',
  './asset/icon/alkitab-dim.png', 
  './asset/icon/zabur-dim.png',
  './data/hymns.json',
  './data/psalms.json',
  './data/prayers.json',
  './data/others.json',
  './data/liturgies.json',
  './data/sqlite_sequence.json',
  './data/bible.json',
  './data/bible/Lukas.json',
  './data/bible/Matius.json',
  './data/bible/Kisah Para Rasul.json',
  './data/bible/Yohanes.json',
  './data/bible/Markus.json',
  './data/bible/Roma.json',
  './data/bible/Wahyu.json',
  './data/bible/1 Korintus.json',
  './data/bible/Ibrani.json',
  './data/bible/2 Korintus.json',
  './data/bible/Galatia.json',
  './data/bible/Efesus.json',
  './data/bible/1 Timotius.json',
  './data/bible/1 Petrus.json',
  './data/bible/1 Yohanes.json',
  './data/bible/Yakobus.json',
  './data/bible/Filipi.json',
  './data/bible/Kolose.json',
  './data/bible/1 Tesalonika.json',
  './data/bible/2 Timotius.json',
  './data/bible/2 Petrus.json',
  './data/bible/2 Tesalonika.json',
  './data/bible/Titus.json',
  './data/bible/Yudas.json',
  './data/bible/Filemon.json',
  './data/bible/3 Yohanes.json',
  './data/bible/2 Yohanes.json'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
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
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
