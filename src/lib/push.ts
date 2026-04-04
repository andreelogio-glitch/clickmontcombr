import { supabase } from "@/integrations/supabase/client";

const VAPID_PUBLIC_KEY_URL = 'https://mmfsgzsvhktcyflarlae.supabase.co/functions/v1/get-vapid-key';

let vapidKey: string | null = null;

async function getVapidPublicKey(): Promise<string> {
  if (vapidKey) return vapidKey;
  
  // Fetch from edge function
  const res = await fetch(VAPID_PUBLIC_KEY_URL);
  const data = await res.json();
  vapidKey = data.key;
  return vapidKey!;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeToPush(): Promise<boolean> {
  try {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.log("Push not supported");
      return false;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Notification permission denied");
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    const publicKey = await getVapidPublicKey();

    const subscription = await (registration as any).pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    const json = subscription.toJSON();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Save subscription to database
    await supabase.from("push_subscriptions").upsert(
      {
        user_id: user.id,
        endpoint: json.endpoint!,
        p256dh: json.keys!.p256dh,
        auth: json.keys!.auth,
      },
      { onConflict: "user_id,endpoint" }
    );

    console.log("Push subscription saved");
    return true;
  } catch (err) {
    console.error("Push subscription error:", err);
    return false;
  }
}

export async function isSubscribedToPush(): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;
  
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await (registration as any).pushManager.getSubscription();
    return !!subscription;
  } catch {
    return false;
  }
}
