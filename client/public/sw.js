import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { NetworkOnly, CacheFirst } from "workbox-strategies";
import { NavigationRoute } from "workbox-routing";
import { createHandlerBoundToURL } from "workbox-precaching";

precacheAndRoute(self.__WB_MANIFEST);

try {
  const handler = createHandlerBoundToURL("/index.html");
  const navigationRoute = new NavigationRoute(handler, {
    denylist: [/^\/api/],
  });
  registerRoute(navigationRoute);
} catch (e) {
  console.warn("Navigation route registration skipped:", e?.message);
}

try {
  registerRoute(
    ({ url }) => url.pathname.startsWith("/api"),
    new NetworkOnly()
  );
} catch (e) {
  console.warn("API NetworkOnly route skipped:", e?.message);
}

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data?.json?.() || {};
  } catch {
    try {
      const text = event.data?.text?.();
      payload = text ? JSON.parse(text) : {};
    } catch {
      payload = {};
    }
  }

  const notification = payload.notification || payload;
  const title = notification.title || "Budgetly";
  const options = {
    body: notification.body || "تحديث جديد",
    icon: notification.icon || "/assets/logo.png",
    badge: notification.badge || "/favicon-96x96.png",
    tag: notification.tag || `budgetly-${Date.now()}`,
    requireInteraction: notification.requireInteraction || false,
    silent: notification.silent || false,
    data: notification.data || payload.data || {},
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  const url = data.url || "/";

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        includeUncontrolled: true,
        type: "window",
      });

      const sameOriginUrl = new URL(url, self.location.origin).href;

      for (const client of allClients) {
        if (client.url && "focus" in client) {
          try {
            const clientUrl = new URL(client.url, self.location.origin).href;
            if (clientUrl === sameOriginUrl) {
              await client.focus();
              client.postMessage({
                type: "budgetly:notification-click",
                data,
              });
              return;
            }
          } catch {
            // ignore
          }
        }
      }

      if (self.clients.openWindow) {
        try {
          const client = await self.clients.openWindow(url);
          if (client) {
            setTimeout(() => {
              client.postMessage({
                type: "budgetly:notification-click",
                data,
              });
            }, 1500);
          }
        } catch {
          // ignore
        }
      }
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
