import { useEffect, useState, useCallback, useRef } from "react";
import {
  getVapidPublicKey,
  subscribeToPush,
  unsubscribeFromPush,
} from "../../modules/auth/api/pushApi.js";

const urlB64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData =
    typeof atob === "function" ? atob(base64) : "";
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const swPushSupported = () =>
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  "PushManager" in window;

export const usePushNotifications = (enabledCondition = true) => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState("default");
  const [subscription, setSubscription] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | subscribed | unsubscribed | error
  const [error, setError] = useState(null);

  const registrationRef = useRef(null);
  const initializedRef = useRef(false);

  const setSwRegistration = useCallback(async () => {
    if (!swPushSupported()) return null;
    if (registrationRef.current) return registrationRef.current;
    try {
      const reg = await navigator.serviceWorker.ready;
      registrationRef.current = reg;
      return reg;
    } catch {
      return null;
    }
  }, []);

  const getExistingSubscription = useCallback(async () => {
    const reg = await setSwRegistration();
    if (!reg?.pushManager) return null;
    return reg.pushManager.getSubscription();
  }, [setSwRegistration]);

  const init = useCallback(async () => {
    if (!enabledCondition) return;
    if (!swPushSupported()) {
      setIsSupported(false);
      return;
    }
    setIsSupported(true);

    if ("Notification" in window) {
      setPermission(Notification.permission);
    }

    const sub = await getExistingSubscription();
    setSubscription(sub);
    if (sub) setStatus("subscribed");
  }, [enabledCondition, getExistingSubscription]);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    init();
  }, [init]);

  useEffect(() => {
    if (!("Notification" in window)) return;
    let cancelled = false;
    const handler = () => {
      if (!cancelled) setPermission(Notification.permission);
    };
    if (typeof Notification.addEventListener === "function") {
      Notification.addEventListener("permissionchange", handler);
    }
    return () => {
      cancelled = true;
      if (typeof Notification.removeEventListener === "function") {
        Notification.removeEventListener("permissionchange", handler);
      }
    };
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      throw new Error("Notifications not supported");
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  };

  const subscribe = async () => {
    if (!swPushSupported()) {
      const err = new Error("Push notifications are not supported in this browser");
      setError(err);
      setStatus("error");
      throw err;
    }

    setStatus("loading");
    setError(null);
    try {
      let perm = permission;
      if (perm === "default") perm = await requestPermission();
      if (perm !== "granted") {
        const err = new Error("Notification permission not granted");
        setError(err);
        setStatus("error");
        throw err;
      }

      const reg = await setSwRegistration();
      if (!reg?.pushManager) {
        throw new Error("Push manager not available");
      }

      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        try {
          await subscribeToPush(existing.toJSON());
        } catch {
          // ignore 409/already-registered — we still consider it subscribed
        }
        setSubscription(existing);
        setStatus("subscribed");
        return existing;
      }

      const publicKey = await getVapidPublicKey();
      if (!publicKey) {
        throw new Error("Unable to retrieve VAPID public key from server");
      }
      const applicationServerKey = urlB64ToUint8Array(publicKey);

      const newSub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      await subscribeToPush(newSub.toJSON());
      setSubscription(newSub);
      setStatus("subscribed");
      return newSub;
    } catch (err) {
      console.error("Subscribe error:", err);
      setError(err);
      setStatus("error");
      throw err;
    }
  };

  const unsubscribe = async () => {
    setStatus("loading");
    setError(null);
    try {
      const currentSub = subscription || (await getExistingSubscription());
      if (currentSub) {
        await Promise.allSettled([
          currentSub.unsubscribe(),
          unsubscribeFromPush(currentSub.endpoint).catch(() => null),
        ]);
      }
      setSubscription(null);
      setStatus("unsubscribed");
      return true;
    } catch (err) {
      console.error("Unsubscribe error:", err);
      setError(err);
      setStatus("error");
      throw err;
    }
  };

  const toggle = async () => {
    if (subscription || status === "subscribed") {
      return unsubscribe();
    }
    return subscribe();
  };

  return {
    isSupported,
    permission,
    subscription,
    status,
    error,
    subscribe,
    unsubscribe,
    toggle,
    requestPermission,
    isSubscribed: status === "subscribed" || !!subscription,
  };
};

export default usePushNotifications;
