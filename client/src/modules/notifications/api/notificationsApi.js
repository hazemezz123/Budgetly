import api from "../../../utils/api";

export const notificationsApi = {
  list: async ({ page = 1, limit = 10, unreadOnly = false } = {}) => {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", String(limit));
    if (unreadOnly) params.append("unreadOnly", "true");
    const { data } = await api.get(`/notifications?${params.toString()}`);
    return data;
  },

  getUnreadCount: async () => {
    const { data } = await api.get("/notifications/unread-count");
    return data;
  },

  markRead: async (id) => {
    const { data } = await api.patch(`/notifications/${id}/read`);
    return data;
  },

  markAllRead: async () => {
    const { data } = await api.patch("/notifications/read-all");
    return data;
  },

  deleteOne: async (id) => {
    const { data } = await api.delete(`/notifications/${id}`);
    return data;
  },
};

export default notificationsApi;
