import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/api/queryKeys";
import { notificationsApi } from "../api/notificationsApi";
import { useEffect } from "react";

export const useNotifications = ({ page = 1, limit = 10, unreadOnly = false } = {}) => {
  return useQuery({
    queryKey: queryKeys.notifications.list(page, unreadOnly),
    queryFn: () => notificationsApi.list({ page, limit, unreadOnly }),
    placeholderData: (prev) => prev,
  });
};

export const useUnreadCount = (enabled = true) => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: notificationsApi.getUnreadCount,
    enabled,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const handler = () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount });
    window.addEventListener("focus", handler);
    document.addEventListener("visibilitychange", handler);
    return () => {
      window.removeEventListener("focus", handler);
      document.removeEventListener("visibilitychange", handler);
    };
  }, [queryClient]);

  return query;
};

export const useMarkRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount });
    },
  });
};

export const useMarkAllRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => notificationsApi.deleteOne(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount });
    },
  });
};
