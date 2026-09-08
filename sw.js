/* 정시응시NEXT — 껍데기 전용 서비스워커
   캐시 이름은 다른 앱과 절대 겹치면 안 됩니다.
   껍데기 파일을 수정하면 아래 v1 → v2 로 올리고 다시 올리세요. */

const CACHE = 'ontime-next-shell-v1';

const SHELL = [
  '/ontime-next/',
  '/ontime-next/index.html',
  '/ontime-next/manifest.json',
  '/ontime-next/icon-192.png',
  '/ontime-next/icon-512.png',
  '/ontime-next/icon-maskable-512.png',
  '/ontime-next/apple-touch-icon.png',
  '/ontime-next/favicon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // 껍데기(같은 출처)만 다룬다. Apps Script 등 외부 요청은 절대 건드리지 않음.
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith('/ontime-next/')) return;
  if (e.request.method !== 'GET') return;

  // 화면 진입(navigate)은 네트워크 우선, 실패하면 캐시된 껍데기로.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('/ontime-next/index.html'))
    );
    return;
  }

  // 아이콘·매니페스트는 캐시 우선.
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request))
  );
});
