import { useAuth } from "../../../shared/context/AuthContext";
import { useToast } from "../../../shared/context/ToastContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/api/queryKeys";
import { settlementsApi } from "../api/settlementsApi";

const invalidateSettlementData = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.settlements.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.myInvoices.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.allInvoices.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
  queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
  queryClient.invalidateQueries({ queryKey: ["profileStats"] });
  queryClient.invalidateQueries({ queryKey: queryKeys.expenses.pendingRequests });
};

export function useSettlements() {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const userId = user?.id || user?._id;

  const { data, isLoading: loading, error } = useQuery({
    queryKey: queryKeys.settlements.byUser(userId),
    queryFn: settlementsApi.getSettlements,
    enabled: !!user?.house && !!userId,
  });

  const requestMutation = useMutation({
    mutationFn: settlementsApi.createSettlement,
    onSuccess: (response) => {
      toast.success(response?.message || "تم إرسال طلب التسوية");
      invalidateSettlementData(queryClient);
    },
    onError: (requestError) => {
      toast.error(
        requestError.response?.data?.message || "فشل إرسال طلب التسوية"
      );
    },
  });

  const approveMutation = useMutation({
    mutationFn: settlementsApi.approveSettlement,
    onSuccess: (response) => {
      toast.success(response?.message || "تم اعتماد التسوية");
      invalidateSettlementData(queryClient);
    },
    onError: (approvalError) => {
      toast.error(
        approvalError.response?.data?.message || "فشل اعتماد التسوية"
      );
    },
  });

  const rejectMutation = useMutation({
    mutationFn: settlementsApi.rejectSettlement,
    onSuccess: (response) => {
      toast.info(response?.message || "تم رفض التسوية");
      invalidateSettlementData(queryClient);
    },
    onError: (rejectError) => {
      toast.error(rejectError.response?.data?.message || "فشل رفض التسوية");
    },
  });

  return {
    settlement: data,
    loading,
    error,
    netBalance: data?.netBalance ?? 0,
    payables: data?.payables ?? [],
    receivables: data?.receivables ?? [],
    pendingRequests: data?.pendingRequests ?? [],
    history: data?.history ?? [],
    requestSettlement: requestMutation.mutate,
    approveSettlement: approveMutation.mutate,
    rejectSettlement: rejectMutation.mutate,
    isRequesting: requestMutation.isPending,
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
  };
}
