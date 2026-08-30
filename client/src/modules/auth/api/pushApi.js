import api from "../../../utils/api";

export const getVapidPublicKey = async () => {
  const { data } = await api.get("/notifications/vapid-public-key");
  return data.publicKey;
};

export const subscribeToPush = async (subscription) => {
  const { data } = await api.post("/notifications/subscribe", { subscription });
  return data;
};

export const unsubscribeFromPush = async (endpoint) => {
  const { data } = await api.post("/notifications/unsubscribe", { endpoint });
  return data;
};
