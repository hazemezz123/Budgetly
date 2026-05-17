import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../../shared/context/ToastContext";
import { queryKeys } from "../../../shared/api/queryKeys";
import { houseApi } from "../api";

const useRoleRotation = (houseId) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const {
    data: settings,
    isLoading: loadingSettings,
    error: settingsError,
    refetch: refetchSettings,
  } = useQuery({
    queryKey: queryKeys.roleRotation.settings(houseId),
    queryFn: async () => houseApi.getRoleRotation(houseId),
    enabled: Boolean(houseId),
  });

  const updateRotationMutation = useMutation({
    mutationFn: (payload) => houseApi.updateRoleRotation({ houseId, payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roleRotation.all(houseId) });
      toast.success("تم حفظ إعدادات التدوير");
    },
    onError: (error) => {
      console.error("Update rotation settings error:", error);
      toast.error(error.response?.data?.message || "فشل حفظ إعدادات التدوير");
    },
  });

  const startCycleMutation = useMutation({
    mutationFn: () => houseApi.startRoleRotationCycle(houseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roleRotation.all(houseId) });
      toast.success("تم بدء دورة جديدة");
    },
    onError: (error) => {
      console.error("Start rotation cycle error:", error);
      toast.error(error.response?.data?.message || "فشل بدء الدورة الجديدة");
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => houseApi.resetRoleRotation(houseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roleRotation.all(houseId) });
      toast.success("تمت إعادة ضبط التدوير");
    },
    onError: (error) => {
      console.error("Reset rotation error:", error);
      toast.error(error.response?.data?.message || "فشل إعادة ضبط التدوير");
    },
  });

  return {
    settings,
    currentCycle: settings?.currentCycle || null,
    history: settings?.history || [],
    loadingSettings,
    settingsError,
    refetchSettings,
    updateRotation: updateRotationMutation.mutateAsync,
    startRotationCycle: startCycleMutation.mutateAsync,
    resetRotation: resetMutation.mutateAsync,
    deleteRotation: resetMutation.mutateAsync,
    isUpdatingRotation: updateRotationMutation.isPending,
    isStartingCycle: startCycleMutation.isPending,
    isResettingRotation: resetMutation.isPending,
  };
};

export default useRoleRotation;
