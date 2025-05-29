self.addEventListener("push", (event) => {
  let payload = {
    title: "New Story Available",
    body: "Check out the latest story on our app!",
    icon: "/icons/icon-192x192.png",
  };

  if (event.data) {
    try {
      // Coba parse sebagai JSON
      const data = event.data.json();
      payload.title = data.title || payload.title;
      payload.body = data.body || payload.body;
      payload.icon = data.icon || payload.icon;
    } catch (error) {
      console.warn("Push data bukan JSON valid, fallback ke text:", error);
      // .text() adalah sinkron, langsung ambil stringnya
      const text = event.data.text();
      payload.body = text;
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon,
      badge: "/icons/badge-72x72.png",
      vibrate: [200, 100, 200],
    })
  );
});
