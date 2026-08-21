const CACHE_NAME = "keralammatch-cache-v2";
const OFFLINE_URL = "/offline.html";

const ASSETS_TO_CACHE = [
  "/",
  "/manifest.json",
  "/assets/icon-192.png",
  "/assets/icon-512.png",
  "/globals.css",
  OFFLINE_URL
];

// Install Service Worker and cache core static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Clean old caches on activation
self.addEventListener("activate", (event) => {
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
  self.clients.claim();
});

// Serve cached assets
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Network-First for HTML/JS/CSS/API to guarantee fresh code
  if (
    url.origin === self.location.origin &&
    (event.request.mode === "navigate" ||
      url.pathname.endsWith(".js") ||
      url.pathname.endsWith(".json") ||
      url.pathname.includes("/_next/"))
  ) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === "basic") {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // Cache-First for static assets (images, fonts, icons)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          if (event.request.destination === "image") {
            return caches.match("/assets/icon-192.png");
          }
          return caches.match(OFFLINE_URL);
        });
    })
  );
});

// Handle incoming server push notifications
self.addEventListener("push", (event) => {
  let data = { title: "KeralamMatch", body: "You have a new update." };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: "KeralamMatch", body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: "/assets/icon-192.png",
    badge: "/assets/icon-192.png",
    data: {
      url: data.url || "/dashboard",
    },
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Open link when notification is clicked
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientList) => {
      const targetUrl = event.notification.data.url;
      for (const client of clientList) {
        if (client.url === targetUrl && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
