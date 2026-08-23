import { Receipt } from "lucide-react";
import ExpenseCard from "./ExpenseCard";

export default function ExpensesList({
  expenses,
  loading,
  onDelete,
  onViewDetails,
  isAdmin,
}) {
  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="w-8 h-8 border-4 border-(--color-primary) border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-(--color-muted)">بنحمّل المصاريف...</p>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-20 bg-(--color-surface) rounded-3xl border-2 border-dashed border-(--color-border)">
        <Receipt
          size={48}
          className="mx-auto mb-3 text-(--color-border)"
        />
        <p className="text-(--color-muted) font-medium">مفيش مصاريف متسجلة لسه</p>
        <p className="text-(--color-secondary) text-sm mt-1">ابدأ سجّل أول مصروف</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {expenses.map((expense) => (
        <ExpenseCard
          key={expense._id}
          expense={expense}
          onDelete={onDelete}
          onViewDetails={onViewDetails}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  );
}
