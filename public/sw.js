/* AirBleu AI — service worker : notifications push de veille concurrentielle */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "AirBleu AI", body: event.data ? event.data.text() : "" };
  }

  const titre = data.title || "AirBleu AI — veille concurrentielle";
  const options = {
    body: data.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: data.tag || "airbleu-veille",
    data: { url: data.url || null, interne: data.interne || "/concurrence" },
    actions: data.url
      ? [
          {
            action: "source",
            title: data.sourceLabel ? `Voir : ${data.sourceLabel}` : "Voir la source",
          },
          { action: "app", title: "Ouvrir AirBleu AI" },
        ]
      : [{ action: "app", title: "Ouvrir AirBleu AI" }],
  };

  event.waitUntil(self.registration.showNotification(titre, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const { url, interne } = event.notification.data || {};
  const cible =
    event.action === "app" ? interne || "/concurrence" : url || interne || "/concurrence";

  event.waitUntil(
    (async () => {
      const liste = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const externe = /^https?:\/\//.test(cible) && !cible.startsWith(self.location.origin);
      if (!externe) {
        for (const client of liste) {
          if ("focus" in client) {
            await client.focus();
            if ("navigate" in client) await client.navigate(cible);
            return;
          }
        }
      }
      await self.clients.openWindow(cible);
    })(),
  );
});
