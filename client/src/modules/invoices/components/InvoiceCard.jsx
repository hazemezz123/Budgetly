import { CreditCard, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function InvoiceCard({ invoice, onPay }) {
  const statusClasses = {
    pending:
      "bg-(--color-status-pending-bg) text-(--color-status-pending) border-(--color-status-pending-border)",
    awaiting_approval:
      "bg-(--color-primary-bg) text-(--color-info) border-(--color-primary-border)",
    paid: "bg-(--color-status-approved-bg) text-(--color-status-approved) border-(--color-status-approved-border)",
  };

  const statusLabels = {
    pending: "مطلوب سداده",
    awaiting_approval: "في انتظار الموافقة",
    paid: "تم الدفع",
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
          </div>
          <Badge
            variant="outline"
            className={`px-3 py-1 rounded-full text-xs font-medium border ${statusClasses[invoice.status] || "bg-(--color-light) text-(--color-secondary) border-(--color-border)"}`}
          >
            {statusLabels[invoice.status] || invoice.status}
          </Badge>
        </div>

        <div className="flex justify-between items-center mt-4">
          <span className="text-2xl font-bold text-(--color-dark) relative inline-block pl-1">
            {invoice.amount.toFixed(2)}{" "}
            <span className="text-xs absolute top-2 -left-6 text-(--color-secondary)">جنيه</span>
          </span>
          {invoice.status === "pending" && (
            <Button
              onClick={() => onPay(invoice._id)}
              className="flex items-center gap-2 px-4 py-2 bg-(--color-primary) text-white hover:bg-(--color-primary)/90 rounded-lg shadow-sm"
            >
              <CreditCard size={18} />
              ادفع الآن
            </Button>
          )}
          {invoice.status === "awaiting_approval" && (
            <div className="flex items-center gap-2 text-(--color-info) text-sm font-medium">
              <Clock size={18} />
              جاري المعالجة
            </div>
          )}
          {invoice.status === "paid" && (
            <div className="flex items-center gap-2 text-(--color-success-text) text-sm font-medium">
              <CheckCircle size={18} />
              تم الدفع
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
