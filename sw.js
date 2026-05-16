const CACHE_NAME = 'Longoi-Kristian-v29 Final';

const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './asset/icon/icon.png',
  './asset/icon/icon-192.png',
  './asset/icon/icon-512.png',
  './asset/icon/alkitab-active.png',
  './asset/icon/alkitab-dim.png',
  './asset/icon/doa-active.png',
  './asset/icon/doa-dim.png',
  './asset/icon/hoturan-active.png',
  './asset/icon/hoturan-dim.png',
  './asset/icon/longoi-active.png',
  './asset/icon/longoi-dim.png',
  './asset/icon/more-active.png',
  './asset/icon/more-dim.png',
  './asset/icon/zabur-active.png',
  './asset/icon/zabur-dim.png',
  './sys/sys_b.dat',
  './sys/sys_h.dat',
  './sys/sys_l.dat',
  './sys/sys_o.dat',
  './sys/sys_pr.dat',
  './sys/sys_p.dat',
  './sys/core/b01.dat',
  './sys/core/b02.dat',
  './sys/core/b03.dat',
  './sys/core/b04.dat',
  './sys/core/b05.dat',
  './sys/core/b06.dat',
  './sys/core/b07.dat',
  './sys/core/b08.dat',
  './sys/core/b09.dat',
  './sys/core/b10.dat',
  './sys/core/b11.dat',
  './sys/core/b12.dat',
  './sys/core/b13.dat',
  './sys/core/b14.dat',
  './sys/core/b15.dat',
  './sys/core/b16.dat',
  './sys/core/b17.dat',
  './sys/core/b18.dat',
  './sys/core/b19.dat',
  './sys/core/b20.dat',
  './sys/core/b21.dat',
  './sys/core/b22.dat',
  './sys/core/b23.dat',
  './sys/core/b24.dat',
  './sys/core/b25.dat',
  './sys/core/b26.dat',
  './sys/core/b27.dat',
  './sys/core/b28.dat',
  './sys/core/b29.dat',
  './sys/core/b30.dat',
  './sys/core/b31.dat',
  './sys/core/b32.dat',
  './sys/core/b33.dat',
  './sys/core/b34.dat',
  './sys/core/b35.dat',
  './sys/core/b36.dat',
  './sys/core/b37.dat',
  './sys/core/b38.dat',
  './sys/core/b39.dat',
  './sys/core/b40.dat',
  './sys/core/b41.dat',
  './sys/core/b42.dat',
  './sys/core/b43.dat',
  './sys/core/b44.dat',
  './sys/core/b45.dat',
  './sys/core/b46.dat',
  './sys/core/b47.dat',
  './sys/core/b48.dat',
  './sys/core/b49.dat',
  './sys/core/b50.dat',
  './sys/core/b51.dat',
  './sys/core/b52.dat',
  './sys/core/b53.dat',
  './sys/core/b54.dat',
  './sys/core/b55.dat',
  './sys/core/b56.dat',
  './sys/core/b57.dat',
  './sys/core/b58.dat',
  './sys/core/b59.dat',
  './sys/core/b60.dat',
  './sys/core/b61.dat',
  './sys/core/b62.dat',
  './sys/core/b63.dat',
  './sys/core/b64.dat',
  './sys/core/b65.dat',
  './sys/core/b66.dat'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes(self.location.origin + '/Longoi-Kristian/')) {
    e.respondWith(
      caches.match(e.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(e.request);
      })
    );
  }
});

