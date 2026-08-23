import {
  Calendar,
  User,
  Users,
  DollarSign,
  Tag,
  FileText,
} from "lucide-react";
import {
  translateCategory,
  getCategoryIcon,
  getCategoryStyles,
} from "../../../utils/expenseUtils.jsx";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const dialogClasses =
  "top-auto bottom-0 left-0 right-0 translate-x-0 translate-y-0 " +
  "max-w-none w-full rounded-t-3xl rounded-b-none border-b-0 sm:border-b p-0 gap-0 " +
  "sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:-translate-y-1/2 " +
  "sm:max-w-lg sm:w-full sm:rounded-3xl bg-(--color-surface) max-h-[85vh] sm:max-h-[90vh] flex flex-col overflow-hidden";

export default function ExpenseDetailsModal({ expense, isOpen, onClose }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      calendar: "gregory",
    });
  };

  const getSplitTypeLabel = (type) => {
    switch (type) {
      case "equal":
        return "تقسيم بالتساوي";
      case "specific":
        return "مستخدمين محددين";
      case "custom":
        return "تقسيم مخصص";
      default:
        return type;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: {
        bg: "var(--color-status-pending-bg)",
        color: "var(--color-status-pending)",
      },
      approved: {
        bg: "var(--color-status-approved-bg)",
        color: "var(--color-status-approved)",
      },
      rejected: {
        bg: "var(--color-status-rejected-bg)",
        color: "var(--color-status-rejected)",
      },
    };
    const style = styles[status] || styles.pending;
    const labels = {
      pending: "قيد الانتظار",
      approved: "موافق عليه",
      rejected: "مرفوض",
    };

    return (
      <span
        className="px-3 py-1 rounded-full text-sm font-medium"
        style={{ backgroundColor: style.bg, color: style.color }}
      >
        {labels[status] || status}
      </span>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={dialogClasses} dir="rtl">
        {/* Mobile handle */}
        <div className="sm:hidden absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1.5 rounded-full bg-(--color-border)" />

        {/* a11y titles */}
        <DialogTitle id="expense-details-title" className="sr-only">
          تفاصيل المصروف
        </DialogTitle>
        <DialogDescription className="sr-only">
          تفاصيل المصروف {expense?.title}
        </DialogDescription>

        {/* Header */}
        <div
          className="p-5 sm:p-6 border-b shrink-0 pt-6 sm:pt-6"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="p-3 rounded-xl"
                style={expense ? getCategoryStyles(expense.category) : undefined}
              >
                {expense && getCategoryIcon(expense.category)}
              </div>
              <div>
                <h2
                  id="expense-details-title-visible"
                  className="text-xl font-bold"
                  style={{ color: "var(--color-dark)" }}
                >
                  تفاصيل المصروف
                </h2>
                <span
                  className="text-sm"
                  style={{ color: "var(--color-muted)" }}
                >
                  {expense && translateCategory(expense.category)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-5 sm:p-6 space-y-5">
            {expense && (
              <>
                {/* Title */}
                <div className="flex items-start gap-3">
                  <FileText size={20} style={{ color: "var(--color-primary)" }} />
                  <div>
                    <p
                      className="text-sm mb-1"
                      style={{ color: "var(--color-muted)" }}
                    >
                      العنوان
                    </p>
                    <p className="font-medium" style={{ color: "var(--color-dark)" }}>
                      {expense.title}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {expense.description && (
                  <div className="flex items-start gap-3">
                    <FileText size={20} style={{ color: "var(--color-secondary)" }} />
                    <div>
                      <p
                        className="text-sm mb-1"
                        style={{ color: "var(--color-muted)" }}
                      >
                        الوصف
                      </p>
                      <p className="font-medium" style={{ color: "var(--color-dark)" }}>
                        {expense.description}
                      </p>
                    </div>
                  </div>
                )}

                {/* Amount */}
                <div className="flex items-start gap-3">
                  <DollarSign size={20} style={{ color: "var(--color-success)" }} />
                  <div>
                    <p
                      className="text-sm mb-1"
                      style={{ color: "var(--color-muted)" }}
                    >
                      المبلغ الإجمالي
                    </p>
                    <p
                      className="font-bold text-xl"
                      style={{ color: "var(--color-dark)" }}
                    >
                      {expense.totalAmount.toFixed(2)}{" "}
                      <span className="text-sm font-normal">جنيه</span>
                    </p>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-start gap-3">
                  <Calendar size={20} style={{ color: "var(--color-info)" }} />
                  <div>
                    <p
                      className="text-sm mb-1"
                      style={{ color: "var(--color-muted)" }}
                    >
                      التاريخ
                    </p>
                    <p className="font-medium" style={{ color: "var(--color-dark)" }}>
                      {formatDate(expense.date)}
                    </p>
                  </div>
                </div>

                {/* Created By */}
                <div className="flex items-start gap-3">
                  <User size={20} style={{ color: "var(--color-warning)" }} />
                  <div>
                    <p
                      className="text-sm mb-1"
                      style={{ color: "var(--color-muted)" }}
                    >
                      أُنشئ بواسطة
                    </p>
                    <p className="font-medium" style={{ color: "var(--color-dark)" }}>
                      {expense.createdBy?.name || "مستخدم محذوف"}
                    </p>
                  </div>
                </div>

                {/* Paid By */}
                <div className="flex items-start gap-3">
                  <DollarSign size={20} style={{ color: "var(--color-success)" }} />
                  <div>
                    <p
                      className="text-sm mb-1"
                      style={{ color: "var(--color-muted)" }}
                    >
                      دفع بواسطة
                    </p>
                    <p className="font-medium" style={{ color: "var(--color-dark)" }}>
                      {expense.paidBy?.name || "مستخدم محذوف"}
                    </p>
                  </div>
                </div>

                {/* Split Type */}
                <div className="flex items-start gap-3">
                  <Tag size={20} style={{ color: "var(--color-secondary)" }} />
                  <div>
                    <p
                      className="text-sm mb-1"
                      style={{ color: "var(--color-muted)" }}
                    >
                      نوع التقسيم
                    </p>
                    <p className="font-medium" style={{ color: "var(--color-dark)" }}>
                      {getSplitTypeLabel(expense.splitType)}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-start gap-3">
                  <div
                    className="w-5 h-5 rounded-full"
                    style={{ backgroundColor: "var(--color-light)" }}
                  />
                  <div>
                    <p
                      className="text-sm mb-1"
                      style={{ color: "var(--color-muted)" }}
                    >
                      الحالة
                    </p>
                    {getStatusBadge(expense.status)}
                  </div>
                </div>

                {/* Splits Section */}
                {expense.splits && expense.splits.length > 0 && (
                  <div
                    className="p-4 rounded-2xl"
                    style={{ backgroundColor: "var(--color-light)" }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Users size={18} style={{ color: "var(--color-primary)" }} />
                      <h3
                        className="font-semibold"
                        style={{ color: "var(--color-dark)" }}
                      >
                        تفاصيل التقسيم ({expense.splits.length} أشخاص)
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {expense.splits.map((split, index) => (
                        <div
                          key={split.user?._id || index}
                          className="flex items-center justify-between p-3 rounded-xl"
                          style={{ backgroundColor: "var(--color-surface)" }}
                        >
                          <span
                            className="font-medium"
                            style={{ color: "var(--color-secondary)" }}
                          >
                            {split.user?.name || "مستخدم محذوف"}
                          </span>
                          <span
                            className="font-bold"
                            style={{ color: "var(--color-primary)" }}
                          >
                            {split.amount.toFixed(2)} جنيه
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="p-4 border-t shrink-0 pb-safe"
          style={{ borderColor: "var(--color-border)" }}
        >
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full min-h-[44px] py-3 rounded-xl font-medium bg-(--color-light) text-(--color-secondary) border-(--color-border) hover:bg-(--color-border)"
          >
            إغلاق
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
