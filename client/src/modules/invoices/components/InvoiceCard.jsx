import { ArrowLeftRight, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const money = (value) => Number(value || 0).toFixed(2);

export default function InvoiceCard({ invoice }) {
  const statusClasses = {
    pending:
      "bg-(--color-status-pending-bg) text-(--color-status-pending) border-(--color-status-pending-border)",
    awaiting_approval:
      "bg-(--color-primary-bg) text-(--color-info) border-(--color-primary-border)",
    partially_paid:
      "bg-(--color-info-bg) text-(--color-info) border-(--color-info-border)",
    paid: "bg-(--color-status-approved-bg) text-(--color-status-approved) border-(--color-status-approved-border)",
    offset:
      "bg-(--color-primary-bg) text-(--color-primary-text) border-(--color-primary-border)",
  };

  const statusLabels = {
    pending: "مطلوب سداده",
    awaiting_approval: "في انتظار الموافقة",
    partially_paid: "مدفوع جزئيًا",
    paid: "تم الدفع",
    offset: "مقاصة",
  };

  const categoryTranslations = {
    General: "عام",
    Food: "أكل وشرب",
    Transport: "مواصلات",
    Utilities: "فواتير",
    Entertainment: "ترفيه",
    CashOut: "سحب كاش",
    Housing: "سكن",
    Other: "حاجات تانية",
  };

  const paidAmount = Number(invoice.paidAmount || 0);
  const offsetAmount = Number(invoice.offsetAmount || 0);
  const remainingAmount =
    invoice.remainingAmount != null
      ? Number(invoice.remainingAmount)
      : Math.max(0, Number(invoice.amount || 0) - paidAmount - offsetAmount);
  const creditor = invoice.expense?.paidBy;

  return (
    <Card className="rounded-2xl border-(--color-border) bg-(--color-surface) shadow-sm hover:shadow-md transition-all py-0 gap-0 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-(--color-dark)">{invoice.description}</h3>
            <p className="text-sm text-(--color-secondary)">
              {categoryTranslations[invoice.expense?.category] || "عام"} •{" "}
              {new Date(invoice.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            {creditor?.name && (
              <p className="text-xs text-(--color-secondary) mt-1">
                لصالح: {creditor.name}
              </p>
            )}
          </div>
          <Badge
            variant="outline"
            className={`px-3 py-1 rounded-full text-xs font-medium border ${statusClasses[invoice.status] || "bg-(--color-light) text-(--color-secondary) border-(--color-border)"}`}
          >
            {statusLabels[invoice.status] || invoice.status}
          </Badge>
        </div>

        <div className="mt-4 space-y-1">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm text-(--color-secondary)">قيمة الفاتورة</span>
            <span className="text-lg font-bold text-(--color-dark) font-numbers">
              {money(invoice.amount)} جنيه
            </span>
          </div>
          {remainingAmount > 0 && remainingAmount !== Number(invoice.amount) && (
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm text-(--color-secondary)">المتبقي</span>
              <span className="text-lg font-bold text-(--color-primary-text) font-numbers">
                {money(remainingAmount)} جنيه
              </span>
            </div>
          )}
          {(paidAmount > 0 || offsetAmount > 0) && (
            <p className="text-xs text-(--color-secondary) pt-1">
              {paidAmount > 0 ? `مدفوع: ${money(paidAmount)}` : ""}
              {paidAmount > 0 && offsetAmount > 0 ? " • " : ""}
              {offsetAmount > 0 ? `مقاصة: ${money(offsetAmount)}` : ""}
            </p>
          )}
        </div>

        <div className="flex justify-between items-center mt-4 pt-3 border-t border-(--color-border)">
          {invoice.status === "pending" && (
            <div className="flex items-center gap-2 text-(--color-info) text-sm font-medium">
              <ArrowLeftRight size={18} />
              ادفع من خلال التسويات
            </div>
          )}
          {invoice.status === "awaiting_approval" && (
            <div className="flex items-center gap-2 text-(--color-info) text-sm font-medium">
              <Clock size={18} />
              جاري المعالجة
            </div>
          )}
          {invoice.status === "partially_paid" && (
            <div className="flex items-center gap-2 text-(--color-info) text-sm font-medium">
              <Clock size={18} />
              باقي {money(remainingAmount)} جنيه
            </div>
          )}
          {invoice.status === "paid" && (
            <div className="flex items-center gap-2 text-(--color-success-text) text-sm font-medium">
              <CheckCircle size={18} />
              تم الدفع
            </div>
          )}
          {invoice.status === "offset" && (
            <div className="flex items-center gap-2 text-(--color-primary-text) text-sm font-medium">
              <ArrowLeftRight size={18} />
              تمت المقاصة بالكامل
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
