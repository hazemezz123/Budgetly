import { useState, useEffect } from "react";
import { useAuth } from "../../../shared/context/AuthContext";
import { useExpenses } from "../hooks";
import {
  ExpenseDetailsModal,
  ExpensesFiltersPanel,
  ExpensesHeader,
  ExpensesList,
  ExpensesPagination,
  ExpensesResultsSummary,
} from "../components";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Expenses = () => {
  const { user } = useAuth();
  const {
    expenses,
    allExpenses,
    loading,
    page,
    setPage,
    totalPages,
    deleteExpense,
    users,
    selectedUserId,
    setSelectedUserId,
    minAmount,
    setMinAmount,
    maxAmount,
    setMaxAmount,
    status,
    setStatus,
    clearFilters,
    hasActiveFilters,
    deepLinkedExpenseId,
    setDeepLinkedExpenseId,
  } = useExpenses();

  const [deletingExpenseId, setDeletingExpenseId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleDeleteClick = (id) => {
    setDeletingExpenseId(id);
  };

  const confirmDelete = async () => {
    const success = await deleteExpense(deletingExpenseId);
    if (success) {
      setDeletingExpenseId(null);
    }
  };

  const handleViewDetails = (expense) => {
    setSelectedExpense(expense);
    setShowDetailsModal(true);
  };

  useEffect(() => {
    if (!deepLinkedExpenseId || loading) return;
    const list = allExpenses.length ? allExpenses : expenses;
    const matched = list.find((e) => String(e._id) === String(deepLinkedExpenseId));
    if (matched) {
      handleViewDetails(matched);
      setDeepLinkedExpenseId(null);
    } else if (page < totalPages) {
      setPage((p) => p + 1);
    }
  }, [deepLinkedExpenseId, loading, allExpenses, expenses, page, totalPages]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="pb-8 px-4 max-w-6xl mx-auto font-primary">
      <ExpensesHeader
        showFilters={showFilters}
        hasActiveFilters={hasActiveFilters}
        onToggleFilters={() => setShowFilters((prev) => !prev)}
        isAdmin={user.role === "admin"}
      />

      {showFilters && (
        <ExpensesFiltersPanel
          users={users}
          selectedUserId={selectedUserId}
          onUserChange={setSelectedUserId}
          minAmount={minAmount}
          onMinAmountChange={setMinAmount}
          maxAmount={maxAmount}
          onMaxAmountChange={setMaxAmount}
          status={status}
          onStatusChange={setStatus}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />
      )}

      {hasActiveFilters && !loading && (
        <ExpensesResultsSummary count={expenses.length} />
      )}

      {/* Expenses Grid */}
      <ExpensesList
        expenses={expenses}
        loading={loading}
        onDelete={handleDeleteClick}
        onViewDetails={handleViewDetails}
        isAdmin={user.role === "admin"}
        highlightedExpenseId={deepLinkedExpenseId}
      />

      {!loading && (
        <ExpensesPagination
          page={page}
          totalPages={totalPages}
          onPrev={() => setPage((prev) => Math.max(prev - 1, 1))}
          onNext={() => setPage((prev) => Math.min(prev + 1, totalPages))}
        />
      )}

      {/* Confirm Delete AlertDialog */}
      <AlertDialog
        open={!!deletingExpenseId}
        onOpenChange={(open) => {
          if (!open) setDeletingExpenseId(null);
        }}
      >
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف المصروف</AlertDialogTitle>
            <AlertDialogDescription>
              متأكد تمسح المصروف ده؟ لا يمكن التراجع.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingExpenseId(null)}>
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-(--color-error) text-white hover:bg-(--color-error)/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Expense Details Modal */}
      <ExpenseDetailsModal
        expense={selectedExpense}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedExpense(null);
        }}
      />
    </div>
  );
};

export default Expenses;
