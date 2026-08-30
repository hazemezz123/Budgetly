import {
  Calendar,
  User as UserIcon,
  Users,
  DollarSign,
  Tag,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  translateCategory,
  getCategoryIcon,
  getCategoryStyles,
} from "../../../utils/expenseUtils.jsx";

const dialogClasses =
  "top-auto bottom-0 left-0 right-0 translate-x-0 translate-y-0 " +
  "max-w-none w-full rounded-t-3xl rounded-b-none border-0 p-0 gap-0 " +
  "sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:-translate-y-1/2 " +
  "sm:max-w-lg sm:w-full sm:rounded-3xl bg-(--color-surface) max-h-[85vh] sm:max-h-[90vh] flex flex-col overflow-hidden shadow-2xl";

export default function RequestDetailsModal({ isOpen, onClose, request, onApprove, onReject }) {
  if (!request) return null;

  const isPending = request.status === "pending";

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      calendar: "gregory",
    });
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: {
        bg: "var(--color-status-pending-bg)",
        color: "var(--color-status-pending)",
        label: "مستني موافقة",
        icon: Clock,
      },
      approved: {
        bg: "var(--color-status-approved-bg)",
        color: "var(--color-status-approved)",
        label: "تم الموافقة",
        icon: CheckCircle,
      },
      rejected: {
        bg: "var(--color-status-rejected-bg)",
        color: "var(--color-status-rejected)",
        label: "مرفوض",
        icon: XCircle,
      },
    };
    const s = map[status] || map.pending;
    const Icon = s.icon;
    return (
      <Badge
        variant="outline"
        className="rounded-full gap-1.5 px-3 py-1 text-xs font-bold border"
        style={{ backgroundColor: s.bg, color: s.color, borderColor: s.color + "30" }}
      >
        <Icon size={12} />
        {s.label}
      </Badge>
    );
  };

  const title = request.title || request.description || "طلب جديد";
  const description = request.title ? request.description : "";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={dialogClasses} dir="rtl">
        {/* Mobile drag handle */}
        <div className="sm:hidden absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1.5 rounded-full bg-(--color-border)" />

        <DialogTitle className="sr-only">تفاصيل الفاتورة</DialogTitle>
        <DialogDescription className="sr-only">تفاصيل الطلب {title}</DialogDescription>

        {/* Header: category tile + title + meta */}
        <div className="p-5 sm:p-6 border-b border-(--color-border) shrink-0 pt-6 sm:pt-6">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-xl shrink-0" style={getCategoryStyles(request.category)}>
              {getCategoryIcon(request.category)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 id="request-details-title" className="text-lg sm:text-xl font-bold text-(--color-dark) leading-tight break-words">
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-(--color-secondary) mt-1 flex items-center gap-1.5 flex-wrap">
                <span>{translateCategory(request.category) || "عام"}</span>
                <span className="opacity-40">•</span>
                <span className="inline-flex items-center gap-1">
                  <Calendar size={12} className="opacity-60" />
                  {formatDate(request.createdAt || request.date)}
                </span>
              </p>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                {getStatusBadge(request.status)}
                <span className="text-xs text-(--color-muted) flex items-center gap-1">
                  <UserIcon size={12} />
                  {request.createdBy?.name || "مستخدم محذوف"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-5 sm:p-6 space-y-5">
            {/* Main stats grid - amount + splits count */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl p-4 border border-(--color-border) bg-(--color-bg) flex flex-col gap-1">
                <span className="text-[11px] tracking-wider font-semibold text-(--color-muted)">المبلغ الإجمالي</span>
                <span className="font-bold text-lg sm:text-xl text-(--color-dark) font-numbers flex items-baseline gap-1">
                  {Number(request.totalAmount || 0).toFixed(2)} <span className="text-xs font-normal text-(--color-muted)">جنيه</span>
                </span>
              </div>
              <div className="rounded-2xl p-4 border border-(--color-border) bg-(--color-bg) flex flex-col gap-1">
                <span className="text-[11px] tracking-wider font-semibold text-(--color-muted)">المشاركون</span>
                <span className="font-bold text-lg sm:text-xl text-(--color-dark) font-numbers flex items-center gap-2">
                  <Users size={16} className="text-(--color-primary)" />
                  {request.splits?.length || 0}
                  <span className="text-xs font-normal text-(--color-muted)">{request.splitType === "equal" ? "بالتساوي" : request.splitType === "specific" ? "محددين" : "مخصص"}</span>
                </span>
              </div>
            </div>

            {/* Description */}
            {description && (
              <div className="flex items-start gap-3">
                <FileText size={18} className="text-(--color-secondary) mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-(--color-muted) mb-1">الوصف</p>
                  <p className="text-sm font-medium text-(--color-dark) leading-relaxed break-words whitespace-pre-wrap">{description}</p>
                </div>
              </div>
            )}

            {/* Category + PaidBy row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Tag size={18} className="text-(--color-primary) mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-(--color-muted) mb-1">الفئة</p>
                  <p className="text-sm font-medium text-(--color-dark)">{translateCategory(request.category) || request.category || "عام"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign size={18} className="text-(--color-success) mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-(--color-muted) mb-1">دفع بواسطة</p>
                  <p className="text-sm font-medium text-(--color-dark)">{request.paidBy?.name || request.createdBy?.name || "—"}</p>
                </div>
              </div>
            </div>

            {/* Splits */}
            {request.splits?.length > 0 && (
              <div className="rounded-2xl border border-(--color-border) bg-(--color-light) p-4">
                <h4 className="font-bold text-sm text-(--color-dark) mb-3 flex items-center gap-2">
                  <Users size={16} className="text-(--color-primary)" />
                  تفاصيل التقسيم
                  <span className="text-xs font-normal text-(--color-muted)">({request.splits.length} أشخاص)</span>
                </h4>
                <div className="space-y-2">
                  {request.splits.map((split, idx) => {
                    const user = split.user || {};
                    const payerId = request.paidBy?._id || request.createdBy?._id;
                    const isActualPayer = payerId && user._id && String(user._id) === String(payerId);
                    return (
                      <div
                        key={user._id || idx}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl bg-(--color-surface) border border-(--color-border)"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-(--color-primary-bg) text-(--color-primary-text) border border-(--color-primary-border) flex items-center justify-center text-sm font-bold shrink-0">
                            {(user.name || "?").charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-(--color-dark) truncate">{user.name || "مستخدم محذوف"}</p>
                            <p className="text-[11px] text-(--color-muted) truncate">@{user.username || "—"}</p>
                          </div>
                          {isActualPayer && (
                            <Badge variant="outline" className="rounded-full text-[10px] px-2 py-0 bg-(--color-status-approved-bg) text-(--color-status-approved) border-(--color-status-approved)/20 hidden sm:inline-flex">
                              الدافع
                            </Badge>
                          )}
                        </div>
                        <span className="font-bold text-sm text-(--color-dark) font-numbers shrink-0">
                          {Number(split.amount || 0).toFixed(2)} <span className="text-[11px] font-normal text-(--color-muted)">جنيه</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer: actions */}
        <div className="p-4 sm:p-5 border-t border-(--color-border) bg-(--color-bg) shrink-0 pb-safe">
          {isPending && onApprove && onReject ? (
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <Button
                onClick={() => onReject(request._id)}
                variant="outline"
                className="min-h-[44px] rounded-xl font-bold border-(--color-status-rejected-bg) bg-(--color-status-rejected-bg) text-(--color-status-rejected) hover:bg-(--color-status-rejected-bg)/80"
              >
                <XCircle size={16} />
                رفض
              </Button>
              <Button
                onClick={() => onApprove(request._id)}
                className="min-h-[44px] rounded-xl font-bold col-span-2 bg-(--color-status-approved) text-white hover:bg-(--color-status-approved)/90 border border-(--color-status-approved)"
              >
                <CheckCircle size={16} />
                موافقة
              </Button>
            </div>
          ) : (
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full min-h-[44px] py-3 rounded-xl font-medium bg-(--color-surface) text-(--color-secondary) border-(--color-border) hover:bg-(--color-hover) hover:text-(--color-dark)"
            >
              إغلاق
            </Button>
          )}
          {isPending && onApprove && onReject && (
            <button onClick={onClose} className="w-full mt-2 text-xs text-(--color-muted) hover:text-(--color-secondary) py-1">
              إغلاق بدون إجراء
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
