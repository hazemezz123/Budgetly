import { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useToast } from "../../../shared/context/ToastContext";
import { queryKeys } from "../../../shared/api/queryKeys";
import { expensesApi } from "../api";

export function useExpenses() {
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [status, setStatus] = useState("");
  const [deepLinkedExpenseId, setDeepLinkedExpenseId] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const statusParam = searchParams.get("status");
    const expenseIdParam = searchParams.get("expenseId");
    if (statusParam && !status) setStatus(statusParam);
    if (expenseIdParam) setDeepLinkedExpenseId(expenseIdParam);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDeepLinkEvent = useCallback((event) => {
    const payload = event.detail || {};
    if (payload.expenseId) {
      setDeepLinkedExpenseId(payload.expenseId);
      if (payload.status === "pending" || payload.type === "pending-expense") {
        setStatus("pending");
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            next.set("status", "pending");
            next.set("expenseId", payload.expenseId);
            return next;
          },
          { replace: true }
        );
      }
    }
  }, [setSearchParams]);

  useEffect(() => {
    window.addEventListener("budgetly:pending-expense-open", handleDeepLinkEvent);
    return () =>
      window.removeEventListener("budgetly:pending-expense-open", handleDeepLinkEvent);
  }, [handleDeepLinkEvent]);

  const { data: users = [] } = useQuery({
    queryKey: queryKeys.users.all,
    queryFn: expensesApi.getUsers,
  });

  const { data, isLoading: loading, refetch } = useQuery({
    queryKey: queryKeys.expenses.list(page, selectedUserId, status),
    queryFn: () =>
      expensesApi.getExpenses({ page, limit: 10, createdBy: selectedUserId, status }),
    placeholderData: (previousData) => previousData,
  });

  const deleteMutation = useMutation({
    mutationFn: expensesApi.deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
      toast.success("تم مسح المصروف بنجاح");
    },
    onError: (error) => {
      console.error("Error deleting expense:", error);
      toast.error("فيه مشكلة في مسح المصروف");
    },
  });

  const filteredExpenses = useMemo(() => {
    let result = data?.expenses || [];

    if (minAmount !== "") {
      const min = parseFloat(minAmount);
      if (!isNaN(min)) {
        result = result.filter((exp) => exp.totalAmount >= min);
      }
    }

    if (maxAmount !== "") {
      const max = parseFloat(maxAmount);
      if (!isNaN(max)) {
        result = result.filter((exp) => exp.totalAmount <= max);
      }
    }

    return result;
  }, [data?.expenses, minAmount, maxAmount]);

  const handleUserFilterChange = (userId) => {
    setSelectedUserId(userId);
    setPage(1);
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setPage(1);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (newStatus) next.set("status", newStatus);
        else next.delete("status");
        if (!newStatus) next.delete("expenseId");
        return next;
      },
      { replace: true }
    );
  };

  const clearFilters = () => {
    setSelectedUserId("");
    setMinAmount("");
    setMaxAmount("");
    setStatus("");
    setDeepLinkedExpenseId(null);
    setPage(1);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("status");
        next.delete("expenseId");
        return next;
      },
      { replace: true }
    );
  };

  const hasActiveFilters = selectedUserId || minAmount || maxAmount || status;

  return {
    expenses: filteredExpenses,
    allExpenses: data?.expenses || [],
    loading,
    page,
    setPage,
    totalPages: data?.totalPages || 1,
    fetchExpenses: refetch,
    deleteExpense: deleteMutation.mutateAsync,
    users,
    selectedUserId,
    setSelectedUserId: handleUserFilterChange,
    minAmount,
    setMinAmount,
    maxAmount,
    setMaxAmount,
    status,
    setStatus: handleStatusChange,
    clearFilters,
    hasActiveFilters,
    deepLinkedExpenseId,
    setDeepLinkedExpenseId,
  };
}
