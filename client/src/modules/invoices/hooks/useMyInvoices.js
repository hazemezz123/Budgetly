import { useState } from "react";
import { useAuth } from "../../../shared/context/AuthContext";
import { useToast } from "../../../shared/context/ToastContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/api/queryKeys";
import { invoicesApi } from "../api/invoicesApi";

export function useMyInvoices() {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const userId = user?.id || user?._id;
  const [activeTab, setActiveTab] = useState("invoices");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");

  const { data: invoices = [], isLoading: loadingInvoices } = useQuery({
    queryKey: queryKeys.myInvoices.byUser(userId),
    queryFn: invoicesApi.getMyInvoices,
    enabled: !!userId,
  });

  const { data: myRequests = [], isLoading: loadingRequests } = useQuery({
    queryKey: queryKeys.myRequests.byUser(userId),
    queryFn: () => invoicesApi.getMyRequests(userId),
    enabled: !!userId,
  });

  const loading = loadingInvoices || loadingRequests;

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  const deleteRequestMutation = useMutation({
    mutationFn: invoicesApi.deleteMyRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myRequests.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.settlements.all });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      toast.success("تم حذف الطلب بنجاح!");
      setIsDeleteModalOpen(false);
      setSelectedRequestId(null);
    },
    onError: (error) => {
      console.error("Delete request error:", error);
      const msg = error.response?.data?.message || "فشل حذف الطلب";
      toast.error(msg);
    },
  });

  const handleDeleteRequest = (requestId) => {
    setSelectedRequestId(requestId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteRequest = () => {
    if (selectedRequestId) {
      deleteRequestMutation.mutate(selectedRequestId);
    }
  };

  const sortData = (data) => {
    const sorted = [...data];
    switch (sortBy) {
      case "date_desc":
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case "date_asc":
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case "amount_desc":
        return sorted.sort((a, b) => (b.amount || b.totalAmount) - (a.amount || a.totalAmount));
      case "amount_asc":
        return sorted.sort((a, b) => (a.amount || a.totalAmount) - (b.amount || b.totalAmount));
      case "status":
        return sorted.sort((a, b) => a.status.localeCompare(b.status));
      default:
        return sorted;
    }
  };

  const filteredData = sortData(
    activeTab === "invoices"
      ? invoices.filter((inv) => {
          const matchesSearch = inv.description.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesStatus = filterStatus === "all" || inv.status === filterStatus;
          return matchesSearch && matchesStatus;
        })
      : myRequests.filter((req) => {
          const matchesSearch = req.description.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesStatus = filterStatus === "all" || req.status === filterStatus;
          return matchesSearch && matchesStatus;
        })
  );

  return {
    activeTab,
    setActiveTab,
    invoices,
    myRequests,
    loading,
    filterStatus,
    setFilterStatus,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    filteredData,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    handleDeleteRequest,
    confirmDeleteRequest,
    isDeleting: deleteRequestMutation.isPending,
  };
}
