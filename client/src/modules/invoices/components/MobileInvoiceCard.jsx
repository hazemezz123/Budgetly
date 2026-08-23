import { Check, X } from "lucide-react";
import StatusBadge from "./StatusBadge";

export default function MobileInvoiceCard({
  invoice,
  onApprove,
  onReject,
  showUser,
}) {
  return (
    <div className="p-3.5 sm:p-4 bg-(--color-surface) border border-(--color-border) rounded-2xl shadow-sm space-y-3 min-w-0">
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {showUser && (
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-(--color-primary-bg) text-(--color-primary-text) flex items-center justify-center text-sm font-bold shrink-0">
              {invoice.user?.name?.charAt(0) || "?"}
            </div>
          )}
          <div className="min-w-0">
            {showUser && (
              <h4 className="font-bold text-sm sm:text-base text-(--color-dark) truncate">{invoice.user?.name}</h4>
            )}
            <p className="text-xs sm:text-sm text-(--color-secondary)">
              {new Date(invoice.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="shrink-0">
          <StatusBadge status={invoice.status} />
        </div>
      </div>

      <div>
        <p className="font-medium text-sm sm:text-base text-(--color-dark) break-words line-clamp-2">{invoice.description}</p>
        <p className="text-lg sm:text-xl font-bold text-(--color-primary-text) mt-1 font-numbers">
          {Number(invoice.amount).toFixed(2)} جنيه
        </p>
      </div>

      {invoice.status === "awaiting_approval" && (
        <div className="flex gap-2 pt-2.5 border-t border-(--color-border)">
          <button
            onClick={() => onApprove(invoice._id)}
            className="flex-1 min-h-[44px] py-2.5 bg-(--color-status-approved-bg) text-(--color-status-approved) rounded-xl hover:opacity-80 text-sm font-bold transition-colors flex items-center justify-center gap-2"
          >
            <Check size={16} /> موافقة
          </button>
          <button
            onClick={() => onReject(invoice._id)}
            className="flex-1 min-h-[44px] py-2.5 bg-(--color-status-rejected-bg) text-(--color-status-rejected) rounded-xl hover:opacity-80 text-sm font-bold transition-colors flex items-center justify-center gap-2"
          >
            <X size={16} /> رفض
          </button>
        </div>
      )}
    </div>
  );
}
