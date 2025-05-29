import CONFIG from "../config";

function convertBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export function isNotificationAvailable() {
  return "Notification" in window;
}

export function isNotificationGranted() {
  return Notification.permission === "granted";
}

export async function requestNotificationPermission() {
  if (!isNotificationAvailable()) {
    console.error("Notification API unsupported.");
    return false;
  }

  if (isNotificationGranted()) {
    return true;
  }

  const status = await Notification.requestPermission();

  if (status === "denied") {
    alert("Izin notifikasi ditolak.");
    return false;
  }

  if (status === "default") {
    alert("Izin notifikasi ditutup atau diabaikan.");
    return false;
  }

  return true;
}

export async function getPushSubscription() {
  const registration = await navigator.serviceWorker.getRegistration();
  return await registration?.pushManager.getSubscription();
}

export async function isCurrentPushSubscriptionAvailable() {
  return !!(await getPushSubscription());
}

export async function subscribe() {
  if (!(await requestNotificationPermission())) {
    return;
  }

  if (await isCurrentPushSubscriptionAvailable()) {
    alert("You're already subscribed to push notifications.");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();

    if (!registration) {
      throw new Error("Service worker not registered");
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY),
    });

    await sendSubscriptionToServer(subscription);
    return subscription;
  } catch (error) {
    console.error("Subscription failed:", error);
    throw new Error("Failed to subscribe to push notifications");
  }
}

async function sendSubscriptionToServer(subscription) {
  try {
    const token = localStorage.getItem(CONFIG.ACCESS_TOKEN_KEY);

    const payload = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.toJSON().keys.p256dh,
        auth: subscription.toJSON().keys.auth,
      },
    };

    const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to save subscription to server");
    }

    const result = await response.json();
    console.log("Subscription success:", result.message);
  } catch (error) {
    console.error("Error sending subscription to server:", error);
  }
}

export async function unsubscribe() {
  const subscription = await getPushSubscription();
  if (!subscription) return;

  try {
    const token = localStorage.getItem(CONFIG.ACCESS_TOKEN_KEY);
    const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });

    if (!response.ok) {
      throw new Error("Failed to unsubscribe");
    }

    const result = await response.json();
    console.log("Unsubscribe success:", result.message);

    await subscription.unsubscribe();
  } catch (error) {
    console.error("Unsubscribe error:", error);
  }
}
