const CACHE_NAME = 'Longoi-Kristian-v25';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './sw.js',
  './data/hymns.json',
  './data/psalms.json',
  './data/prayers.json',
  './data/others.json',
  './data/liturgies.json',
  './data/bible.json',
  './data/bible/Matius.json',
  './data/bible/Markus.json',
  './data/bible/Lukas.json',
  './data/bible/Yohanes.json',
  './data/bible/Kisah Para Rasul.json',
  './data/bible/Roma.json',
  './data/bible/1 Korintus.json',
  './data/bible/2 Korintus.json',
  './data/bible/Galatia.json',
  './data/bible/Efesus.json',
  './data/bible/Filipi.json',
  './data/bible/Kolose.json',
  './data/bible/1 Tesalonika.json',
  './data/bible/2 Tesalonika.json',
  './data/bible/1 Timotius.json',
  './data/bible/2 Timotius.json',
  './data/bible/Titus.json',
  './data/bible/Filemon.json',
  './data/bible/Ibrani.json',
  './data/bible/Yakobus.json',
  './data/bible/1 Petrus.json',
  './data/bible/2 Petrus.json',
  './data/bible/1 Yohanes.json',
  './data/bible/2 Yohanes.json',
  './data/bible/3 Yohanes.json',
  './data/bible/Yudas.json',
  './data/bible/Wahyu.json'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // addAll akan muat turun semua fail dalam senarai di atas serta-merta
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(keys.map((k) => {
                if (k !== CACHE_NAME) return caches.delete(k);
            }));
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((res) => {
            return res || fetch(event.request);
        })
    );
});
