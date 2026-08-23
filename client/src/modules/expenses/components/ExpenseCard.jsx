import { Calendar, User, Trash2, Eye } from "lucide-react";
import {
  getCategoryIcon,
  getCategoryStyles,
  translateCategory,
} from "../../../utils/expenseUtils.jsx";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ExpenseCard({
  expense,
  onDelete,
  onViewDetails,
  isAdmin,
}) {
  return (
    <Card className="rounded-2xl border-(--color-border) bg-(--color-surface) shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden h-full flex flex-col py-0 gap-0">
      <CardContent className="p-4 sm:p-5 flex flex-col h-full min-w-0">
        <div className="flex justify-between items-start gap-2 mb-3">
          {/* Icon */}
          <div
            className="p-2.5 rounded-xl"
            style={getCategoryStyles(expense.category)}
          >
            {getCategoryIcon(expense.category)}
          </div>

          {/* Amount */}
          <div className="text-right">
            <span
              className="block text-xl font-bold"
              style={{ color: "var(--color-dark)" }}
            >
              {expense.totalAmount.toFixed(2)}
              <span
                className="text-xs font-normal mr-1"
                style={{ color: "var(--color-muted)" }}
              >
                جنيه
              </span>
            </span>
          </div>
        </div>

        {/* Title */}
        <h3
          className="font-semibold mb-2 line-clamp-1"
          style={{ color: "var(--color-secondary)" }}
          title={expense.title}
        >
          {expense.title}
        </h3>

        {/* Description */}
        {expense.description && (
          <p
            className="text-sm mb-2 line-clamp-1"
            style={{ color: "var(--color-muted)" }}
          >
            {expense.description}
          </p>
        )}

        {/* Category Tag */}
        <span
          className="inline-block px-2.5 py-1 text-xs font-medium rounded-full mb-4 w-fit"
          style={{
            backgroundColor: "var(--color-light)",
            color: "var(--color-secondary)",
          }}
        >
          {translateCategory(expense.category)}
        </span>

        {/* Info Footer */}
        <div
          className="flex items-center justify-between pt-4 mt-auto"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
          <div
            className="flex flex-col gap-1 text-xs"
            style={{ color: "var(--color-muted)" }}
          >
            <div className="flex items-center gap-1.5">
              <Calendar size={12} />
              <span>
                {new Date(expense.date).toLocaleDateString("ar-EG", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  calendar: "gregory",
                })}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <User size={12} />
              <span>
                {expense.paidBy ? expense.paidBy.name : "مستخدم محذوف"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            {/* View Details Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onViewDetails && onViewDetails(expense)}
              className="min-w-[40px] min-h-[40px] rounded-xl text-(--color-muted) hover:text-(--color-primary) hover:bg-(--color-light)"
              aria-label="عرض التفاصيل"
              title="عرض التفاصيل"
            >
              <Eye size={18} />
            </Button>

            {/* Delete Button */}
            {isAdmin && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(expense._id)}
                className="min-w-[40px] min-h-[40px] rounded-xl text-(--color-muted) hover:text-(--color-error) hover:bg-(--color-status-rejected-bg)"
                aria-label="حذف المصروف"
                title="امسح"
              >
                <Trash2 size={18} />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
