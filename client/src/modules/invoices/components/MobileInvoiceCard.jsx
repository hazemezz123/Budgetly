import { Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import StatusBadge from "./StatusBadge";

export default function MobileInvoiceCard({
  invoice,
  onApprove,
  onReject,
  showUser,
}) {
  const paidAmount = Number(invoice.paidAmount || 0);
  const offsetAmount = Number(invoice.offsetAmount || 0);
  const remainingAmount =
    invoice.remainingAmount != null
      ? Number(invoice.remainingAmount)
      : Math.max(0, Number(invoice.amount || 0) - paidAmount - offsetAmount);

  return (
    <Card className="rounded-2xl border-(--color-border) bg-(--color-surface) shadow-sm py-0 gap-0 overflow-hidden">
      <CardContent className="p-3.5 sm:p-4 space-y-3 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {showUser && (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-(--color-primary-bg) text-(--color-primary-text) flex items-center justify-center text-sm font-bold shrink-0">
                {invoice.user?.name?.charAt(0) || "?"}
              </div>
            )}
            <div className="min-w-0">
              {showUser && (
                <h4 className="font-bold text-sm sm:text-base text-(--color-dark) truncate">
                  {invoice.user?.name}
                </h4>
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
          <p className="font-medium text-sm sm:text-base text-(--color-dark) break-words line-clamp-2">
            {invoice.description}
          </p>
          {invoice.expense?.paidBy?.name && (
            <p className="text-xs text-(--color-secondary) mt-0.5">
              لصالح: {invoice.expense.paidBy.name}
            </p>
          )}
          <p className="text-lg sm:text-xl font-bold text-(--color-primary-text) mt-1 font-numbers">
            {Number(invoice.amount).toFixed(2)} جنيه
          </p>
          {remainingAmount > 0 &&
            remainingAmount !== Number(invoice.amount) && (
              <p className="text-xs text-(--color-info) font-medium">
                متبقي {remainingAmount.toFixed(2)} جنيه
              </p>
            )}
          {(paidAmount > 0 || offsetAmount > 0) && (
            <p className="text-xs text-(--color-secondary)">
              {paidAmount > 0 ? `مدفوع ${paidAmount.toFixed(2)}` : ""}
              {paidAmount > 0 && offsetAmount > 0 ? " • " : ""}
              {offsetAmount > 0 ? `مقاصة ${offsetAmount.toFixed(2)}` : ""}
            </p>
          )}
        </div>

        {invoice.status === "awaiting_approval" && (
          <div className="flex gap-2 pt-2.5 border-t border-(--color-border)">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="flex-1 min-h-[44px] py-2.5 bg-(--color-status-approved-bg) text-(--color-status-approved) hover:bg-(--color-status-approved-bg)/80 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                  <Check size={16} /> موافقة
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent dir="rtl">
                <AlertDialogHeader>
                  <AlertDialogTitle>تأكيد الموافقة</AlertDialogTitle>
                  <AlertDialogDescription>هل أنت متأكد من الموافقة على الدفع؟</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onApprove(invoice._id)}>تأكيد</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="flex-1 min-h-[44px] py-2.5 bg-(--color-status-rejected-bg) text-(--color-status-rejected) hover:bg-(--color-status-rejected-bg)/80 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                  <X size={16} /> رفض
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent dir="rtl">
                <AlertDialogHeader>
                  <AlertDialogTitle>تأكيد الرفض</AlertDialogTitle>
                  <AlertDialogDescription>هل أنت متأكد من رفض الدفع؟</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onReject(invoice._id)}
                    className="bg-(--color-error) text-white hover:bg-(--color-error)/90"
                  >
                    تأكيد
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
