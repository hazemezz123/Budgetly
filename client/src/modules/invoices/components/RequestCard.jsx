import { Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function RequestCard({ request, onDelete }) {
  const statusClasses = {
    pending:
      "bg-(--color-status-pending-bg) text-(--color-status-pending) border-(--color-status-pending-border)",
    approved:
      "bg-(--color-status-approved-bg) text-(--color-status-approved) border-(--color-status-approved-border)",
    rejected:
      "bg-(--color-status-rejected-bg) text-(--color-status-rejected) border-(--color-status-rejected-border)",
  };

  const statusLabels = {
    pending: "قيد المراجعة",
    approved: "تمت الموافقة",
    rejected: "مرفوض",
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
            <h3 className="font-semibold text-(--color-dark)">{request.description}</h3>
            <p className="text-sm text-(--color-secondary)">
              {categoryTranslations[request.category] || "عام"} •{" "}
              {new Date(request.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <Badge
            variant="outline"
            className={`px-3 py-1 rounded-full text-xs font-medium border ${statusClasses[request.status] || "bg-(--color-light) text-(--color-secondary) border-(--color-border)"}`}
          >
            {statusLabels[request.status] || request.status}
          </Badge>
        </div>

        <div className="flex justify-between items-center mt-4">
          <span className="text-2xl font-bold text-(--color-dark) relative inline-block pl-1">
            {request.totalAmount.toFixed(2)}{" "}
            <span className="text-xs absolute top-0 -left-6 text-(--color-secondary)">جنيه</span>
          </span>
          <div className="flex items-center gap-2">
            {request.status === "pending" && (
              <Button
                onClick={() => onDelete(request._id)}
                variant="ghost"
                className="flex items-center gap-2 px-3 py-2 bg-(--color-status-rejected-bg) text-(--color-status-rejected) border border-(--color-status-rejected-border) rounded-lg hover:bg-(--color-status-rejected-bg)/80 text-sm font-medium"
              >
                <Trash2 size={16} />
                حذف
              </Button>
            )}
            {request.status === "rejected" && request.adminNotes && (
              <div className="text-xs text-(--color-status-rejected)">سبب الرفض: {request.adminNotes}</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
