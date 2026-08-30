import { createContext, useState, useEffect, useContext, useCallback } from "react";
import api from "../../utils/api";
import {
  subscribeToPush,
  getVapidPublicKey,
} from "../../modules/auth/api/pushApi.js";

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

const urlB64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = typeof atob === "function" ? atob(base64) : "";
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const syncPushSubscriptionIfNeeded = async () => {
  try {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const reg = await navigator.serviceWorker.ready;
    if (!reg?.pushManager) return;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await subscribeToPush(sub.toJSON());
    } catch {
      // Already registered or transient error — swallow
    }
  } catch (err) {
    console.debug("Sync push subscription skipped:", err?.message);
  }
};

const resubscribeIfStale = async () => {
  try {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    const reg = await navigator.serviceWorker.ready;
    if (!reg?.pushManager) return;
    const existing = await reg.pushManager.getSubscription();
    if (existing) return;
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    let publicKey;
    try {
      publicKey = await getVapidPublicKey();
    } catch {
      return;
    }
    if (!publicKey) return;

    try {
      const newSub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(publicKey),
      });
      await subscribeToPush(newSub.toJSON());
    } catch (err) {
      console.debug("Push resubscribe failed:", err?.message);
    }
  } catch (err) {
    console.debug("Push resubscribe skipped:", err?.message);
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const onSwMessage = useCallback((event) => {
    if (event?.data?.type === "budgetly:notification-click") {
      const payload = event.data.data || {};
      if (payload.type === "pending-expense" && payload.expenseId) {
        const target = `/all-invoices?requestId=${payload.expenseId}#pending-requests`;
        if (window.location.pathname !== "/all-invoices") {
          window.location.assign(target);
        } else {
          const params = new URLSearchParams(window.location.search);
          params.set("requestId", payload.expenseId);
          const newUrl = `/all-invoices?${params.toString()}#pending-requests`;
          window.history.replaceState({}, "", newUrl);
        }
        window.dispatchEvent(new CustomEvent("budgetly:pending-request-open", { detail: payload }));
        window.dispatchEvent(new CustomEvent("budgetly:pending-expense-open", { detail: payload }));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    const handler = (e) => onSwMessage(e);
    navigator.serviceWorker.addEventListener("message", handler);
    return () => navigator.serviceWorker.removeEventListener("message", handler);
  }, [onSwMessage]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const { data } = await api.get("/auth/me");
          setUser(data);
          if (data) {
            syncPushSubscriptionIfNeeded();
            resubscribeIfStale();
          }
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const register = async (username, password, name, email) => {
    const { data } = await api.post("/auth/register", {
      username,
      password,
      name,
      email,
    });
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data.user;
  };

  const login = async (username, password) => {
    const { data } = await api.post("/auth/login", { username, password });
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data.user;
  };

  const loginWithGoogle = async (idToken) => {
    const { data } = await api.post("/auth/google", { idToken });
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data.user;
  };

  const createHouse = async (name, password) => {
    const { data } = await api.post("/houses", { name, password });
    // Save the new token with admin role
    localStorage.setItem("token", data.token);
    setUser((prevUser) => ({
      ...prevUser,
      house: data.house,
      role: "admin",
    }));
    return data.house;
  };

  const joinHouse = async (houseId, password) => {
    const { data } = await api.post(`/houses/${houseId}/join`, { password });
    setUser((prevUser) => ({
      ...prevUser,
      house: data._id,
    }));
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  const updateUser = (userData) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithGoogle,
        logout,
        register,
        createHouse,
        joinHouse,
        updateUser,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
