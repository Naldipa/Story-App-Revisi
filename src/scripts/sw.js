import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import {
  NetworkFirst,
  CacheFirst,
  StaleWhileRevalidate,
} from "workbox-strategies";
import CONFIG from "./config";

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ url }) => {
    return (
      url.origin === "https://fonts.googleapis.com" ||
      url.origin === "https://fonts.gstatic.com"
    );
  },
  new CacheFirst({
    cacheName: "google-fonts",
  })
);

registerRoute(
  ({ url }) => {
    return (
      url.origin === "https://cdnjs.cloudflare.com" ||
      url.origin.includes("fontawesome")
    );
  },
  new CacheFirst({
    cacheName: "fontawesome",
  })
);

registerRoute(
  ({ url }) => {
    return url.origin === "https://ui-avatars.com";
  },
  new CacheFirst({
    cacheName: "avatars-api",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(CONFIG.BASE_URL);
    return baseUrl.origin === url.origin && request.destination !== "image";
  },
  new NetworkFirst({
    cacheName: "storyapp-api",
  })
);

registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(CONFIG.BASE_URL);
    return baseUrl.origin === url.origin && request.destination === "image";
  },
  new StaleWhileRevalidate({
    cacheName: "storyapp-api-images",
  })
);

registerRoute(
  ({ url }) => {
    return url.origin.includes("maptiler");
  },
  new CacheFirst({
    cacheName: "maptiler-api",
  })
);

self.addEventListener('push', (event) => {
  console.log('Push Notification Received');
  
  let notificationData;
  try {
    // Coba parse sebagai JSON
    notificationData = event.data.json();
  } catch (e) {
    // Jika gagal, gunakan sebagai plain text
    notificationData = {
      title: 'New Notification',
      body: event.data.text() || 'You have a new message',
      icon: '/images/icons/icon-192.png'
    };
  }

  const showNotification = async () => {
    await self.registration.showNotification(
      notificationData.title || 'Story App',
      {
        body: notificationData.body,
        icon: notificationData.icon || '/images/icons/icon-192.png',
        badge: '/images/icons/icon-96.png',
        vibrate: [200, 100, 200]
      }
    );
  };

  event.waitUntil(showNotification());
});