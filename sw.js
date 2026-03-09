// ==============================================================
// SERVICE WORKER — TuongTanDigital-AI
// Task: T-N10 — PWA Support đầy đủ
// Strategy: Cache First cho assets, Network First cho API
// ==============================================================

const CACHE_NAME = 'tuongtandigital-ai-v1.0.0';
const OFFLINE_URL = './offline.html';

// ==========================================
// Assets cần cache (Cache First)
// ==========================================
const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  // CDN dependencies
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
];

// URL patterns cho API (Network First)
const API_PATTERNS = [
  'generativelanguage.googleapis.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdn.jsdelivr.net',
];

// ==========================================
// INSTALL — Cache static assets
// ==========================================
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        // Cache each individually — don't fail all if one fails
        return Promise.allSettled(
          STATIC_ASSETS.map(url =>
            cache.add(url).catch(err => {
              console.warn(`[SW] Failed to cache: ${url}`, err);
            })
          )
        );
      })
      .then(() => {
        // Cache offline fallback page
        return caches.open(CACHE_NAME).then(cache => {
          return cache.put(
            new Request(OFFLINE_URL),
            new Response(generateOfflinePage(), {
              headers: { 'Content-Type': 'text/html; charset=utf-8' }
            })
          );
        });
      })
      .then(() => self.skipWaiting())
  );
});

// ==========================================
// ACTIVATE — Cleanup old caches
// ==========================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => {
              console.log(`[SW] Deleting old cache: ${name}`);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// ==========================================
// FETCH — Smart routing strategy
// ==========================================
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip chrome-extension, devtools, etc.
  if (!url.protocol.startsWith('http')) return;

  // ---- Strategy 1: Network First for API calls ----
  if (isAPIRequest(url)) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // ---- Strategy 2: Network First for Google Fonts (can update) ----
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }

  // ---- Strategy 3: Network First for CDN (can update) ----
  if (url.hostname === 'cdn.jsdelivr.net' || url.hostname === 'cdnjs.cloudflare.com') {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }

  // ---- Strategy 4: Cache First for local static assets ----
  event.respondWith(cacheFirst(event.request));
});

// ==========================================
// Fetch Strategies
// ==========================================

/**
 * Cache First — Local assets
 * Trả từ cache trước, nếu không có thì fetch từ network
 */
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Offline fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    // If HTML request, return offline page
    if (request.headers.get('Accept')?.includes('text/html')) {
      const offlinePage = await caches.match(OFFLINE_URL);
      if (offlinePage) return offlinePage;
    }

    return new Response('Offline — Không có kết nối mạng.', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}

/**
 * Network First — API calls
 * Fetch từ network trước, fallback cache nếu offline
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    // Don't cache API error responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] Serving API from cache (offline):', request.url);
      return cachedResponse;
    }

    return new Response(
      JSON.stringify({ error: 'Offline — Không có kết nối mạng.' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      }
    );
  }
}

/**
 * Stale While Revalidate — CDN, Fonts
 * Trả từ cache ngay, đồng thời fetch mới để cập nhật cache
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => cachedResponse);

  return cachedResponse || fetchPromise;
}

// ==========================================
// Helpers
// ==========================================

/**
 * Kiểm tra request có phải API không
 */
function isAPIRequest(url) {
  return API_PATTERNS.some(pattern => url.hostname.includes(pattern));
}

/**
 * Generate offline fallback HTML page
 */
function generateOfflinePage() {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline — TuongTanDigital-AI</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 50%, #ede9fe 100%);
      color: #334155;
      padding: 24px;
    }
    .offline-container {
      text-align: center;
      max-width: 480px;
      background: white;
      border-radius: 24px;
      padding: 48px 32px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.08);
    }
    .offline-logo {
      width: 80px;
      height: 80px;
      margin: 0 auto 24px;
      background: linear-gradient(135deg, #0891b2, #06b6d4, #67e8f9);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      font-weight: 800;
      color: white;
      font-family: system-ui, sans-serif;
    }
    h1 {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 12px;
      color: #0f172a;
    }
    p {
      font-size: 16px;
      line-height: 1.6;
      color: #64748b;
      margin-bottom: 24px;
    }
    .offline-icon {
      font-size: 64px;
      margin-bottom: 20px;
      display: block;
    }
    .btn-retry {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 32px;
      background: linear-gradient(135deg, #0891b2, #06b6d4);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn-retry:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(8,145,178,0.3);
    }
    .btn-retry:active { transform: translateY(0); }
    .features {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e2e8f0;
      text-align: left;
    }
    .features h3 {
      font-size: 14px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }
    .features ul {
      list-style: none;
      padding: 0;
    }
    .features li {
      padding: 6px 0;
      font-size: 14px;
      color: #64748b;
    }
    .features li::before {
      content: '✅ ';
    }
    .features li.offline::before {
      content: '⚡ ';
    }
  </style>
</head>
<body>
  <div class="offline-container">
    <div class="offline-logo">T</div>
    <span class="offline-icon">📡</span>
    <h1>Không có kết nối mạng</h1>
    <p>
      TuongTanDigital-AI cần kết nối Internet để sử dụng các tính năng AI.
      Vui lòng kiểm tra kết nối mạng và thử lại.
    </p>
    <button class="btn-retry" onclick="window.location.reload()">
      🔄 Thử lại
    </button>
    <div class="features">
      <h3>Khi có mạng trở lại</h3>
      <ul>
        <li>Notebook AI — Chat với tài liệu</li>
        <li>Speech-to-Text — Giọng nói → Văn bản</li>
        <li>Text-to-Speech — Đọc văn bản</li>
        <li>Ghi màn hình & Biên bản AI</li>
        <li>Chuyển đổi file thông minh</li>
        <li class="offline">Dữ liệu của bạn vẫn an toàn trong trình duyệt</li>
      </ul>
    </div>
  </div>
</body>
</html>`;
}

// ==========================================
// PUSH NOTIFICATION (placeholder cho tương lai)
// ==========================================
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'TuongTanDigital-AI có cập nhật mới!',
    icon: 'data:image/svg+xml,...', // sử dụng inline SVG icon
    badge: 'data:image/svg+xml,...',
    vibrate: [200, 100, 200],
    tag: 'tuongtandigital-notification',
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'TuongTanDigital-AI', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('./')
  );
});

console.log('[SW] TuongTanDigital-AI Service Worker loaded');