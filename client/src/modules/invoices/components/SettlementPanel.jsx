import { useState } from "react";
import {
  ArrowLeftRight,
  Check,
  Clock,
  HandCoins,
  Loader2,
  X,
} from "lucide-react";
import { useAuth } from "../../../shared/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useSettlements } from "../hooks";

const money = (value) => Number(value || 0).toFixed(2);

export default function SettlementPanel({ showApprovals = false }) {
  const { user } = useAuth();
  const {
    loading,
    error,
    netBalance,
    payables,
    receivables,
    pendingRequests,
    requestSettlement,
    approveSettlement,
    rejectSettlement,
    isRequesting,
    isApproving,
    isRejecting,
  } = useSettlements();

  const [selectedPayable, setSelectedPayable] = useState(null);
  const [amount, setAmount] = useState("");

  const isAdmin = user?.role === "admin";
  const approvals = showApprovals && isAdmin ? pendingRequests : [];
  const myPending = pendingRequests.filter(
    (request) => request.direction === "outgoing"
  );

  const openSettlement = (payable) => {
    setSelectedPayable(payable);
    setAmount(money(payable.amount));
  };

  const confirmSettlement = () => {
    if (!selectedPayable) return;
    const value = Number(amount);
    if (
      !Number.isFinite(value) ||
      value <= 0 ||
      value > Number(selectedPayable.amount) + 0.005
    ) {
      return;
    }

    requestSettlement({
      creditorId: selectedPayable.userId,
      amount: value,
    });
    setSelectedPayable(null);
  };

  const balanceLabel =
    netBalance > 0 ? "ليك" : netBalance < 0 ? "عليك" : "متساوي";
  const balanceColor =
    netBalance > 0
      ? "text-(--color-success-text)"
      : netBalance < 0
      ? "text-(--color-error)"
      : "text-(--color-secondary)";

  if (loading) {
    return (
      <Card className="rounded-2xl border-(--color-border) bg-(--color-surface) shadow-sm py-0 gap-0">
        <CardContent className="p-5 flex items-center gap-3 text-(--color-secondary)">
          <Loader2 size={18} className="animate-spin" />
          جاري تحميل التسويات...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="rounded-2xl border-(--color-status-rejected-border) bg-(--color-status-rejected-bg) shadow-sm py-0 gap-0">
        <CardContent className="p-5 text-sm text-(--color-status-rejected)">
          تعذر تحميل التسويات. جرّب تحديث الصفحة.
        </CardContent>
      </Card>
    );
  }

  const isEmpty =
    payables.length === 0 &&
    receivables.length === 0 &&
    myPending.length === 0 &&
    approvals.length === 0;

  return (
    <Card className="rounded-2xl border-(--color-border) bg-(--color-surface) shadow-sm py-0 gap-0 overflow-hidden">
      <CardContent className="p-4 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-(--color-primary-bg) text-(--color-primary-text)">
              <ArrowLeftRight size={20} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-(--color-dark)">
                التسويات
              </h2>
              <p className="text-xs sm:text-sm text-(--color-secondary)">
                صافي الحساب بين كل الأعضاء بعد المقاصة
              </p>
            </div>
          </div>
          <div className="text-start sm:text-end">
            <p className="text-xs text-(--color-secondary)">{balanceLabel}</p>
            <p className={`text-xl font-bold font-numbers ${balanceColor}`}>
              {money(Math.abs(netBalance))} جنيه
            </p>
          </div>
        </div>

        {isEmpty ? (
          <p className="text-sm text-(--color-secondary) text-center py-3">
            كل الحسابات متساوية. مفيش تسويات مطلوبة.
          </p>
        ) : null}

        {payables.length > 0 && (
          <section aria-labelledby="payables-heading" className="space-y-2">
            <h3
              id="payables-heading"
              className="text-sm font-bold text-(--color-dark) flex items-center gap-2"
            >
              <HandCoins size={16} className="text-(--color-error)" />
              عليك
            </h3>
            <ul className="divide-y divide-(--color-border) rounded-xl border border-(--color-border)">
              {payables.map((payable) => (
                <li
                  key={`${payable.userId}-${payable.amount}`}
                  className="flex items-center justify-between gap-3 p-3"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-(--color-dark) truncate">
                      {payable.name || payable.username || "عضو"}
                    </p>
                    <p className="text-xs text-(--color-secondary)">
                      {money(payable.amount)} جنيه
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => openSettlement(payable)}
                    className="shrink-0 bg-(--color-primary) text-white hover:bg-(--color-primary)/90"
                  >
                    تسوية
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {receivables.length > 0 && (
          <section aria-labelledby="receivables-heading" className="space-y-2">
            <h3
              id="receivables-heading"
              className="text-sm font-bold text-(--color-dark) flex items-center gap-2"
            >
              <HandCoins size={16} className="text-(--color-success-text)" />
              ليك عند
            </h3>
            <ul className="divide-y divide-(--color-border) rounded-xl border border-(--color-border)">
              {receivables.map((receivable) => (
                <li
                  key={`${receivable.userId}-${receivable.amount}`}
                  className="flex items-center justify-between gap-3 p-3"
                >
                  <span className="font-semibold text-sm text-(--color-dark) truncate">
                    {receivable.name || receivable.username || "عضو"}
                  </span>
                  <span className="font-bold text-sm text-(--color-success-text) font-numbers shrink-0">
                    {money(receivable.amount)} جنيه
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {myPending.length > 0 && (
          <section aria-labelledby="my-pending-heading" className="space-y-2">
            <h3
              id="my-pending-heading"
              className="text-sm font-bold text-(--color-dark) flex items-center gap-2"
            >
              <Clock size={16} className="text-(--color-info)" />
              طلباتك المعلقة
            </h3>
            <ul className="space-y-2">
              {myPending.map((request) => (
                <li
                  key={request._id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-(--color-info-bg) px-3 py-2"
                >
                  <span className="text-sm text-(--color-info)">
                    إلى {request.recipient?.name || "عضو"}
                  </span>
                  <span className="text-sm font-bold text-(--color-info) font-numbers">
                    {money(request.amount)} جنيه
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {approvals.length > 0 && (
          <section aria-labelledby="admin-approvals-heading" className="space-y-2">
            <h3
              id="admin-approvals-heading"
              className="text-sm font-bold text-(--color-dark) flex items-center gap-2"
            >
              <Clock size={16} className="text-(--color-status-pending)" />
              تسويات في انتظار الاعتماد ({approvals.length})
            </h3>
            <ul className="divide-y divide-(--color-border) rounded-xl border border-(--color-border)">
              {approvals.map((request) => (
                <li key={request._id} className="p-3 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-(--color-dark) min-w-0 truncate">
                      <span className="font-semibold">
                        {request.user?.name || "عضو"}
                      </span>
                      <span className="text-(--color-secondary)"> ← </span>
                      <span className="font-semibold">
                        {request.recipient?.name || "عضو"}
                      </span>
                    </p>
                    <span className="text-sm font-bold text-(--color-dark) font-numbers shrink-0">
                      {money(request.amount)} جنيه
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={isApproving}
                      onClick={() => approveSettlement(request._id)}
                      className="flex-1 bg-(--color-status-approved-bg) text-(--color-status-approved) hover:bg-(--color-status-approved-bg)/80"
                    >
                      <Check size={15} className="ml-1" />
                      اعتماد
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isRejecting}
                      onClick={() => rejectSettlement({ id: request._id })}
                      className="flex-1 border-(--color-status-rejected-border) text-(--color-status-rejected) hover:bg-(--color-status-rejected-bg)"
                    >
                      <X size={15} className="ml-1" />
                      رفض
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </CardContent>

      <AlertDialog
        open={Boolean(selectedPayable)}
        onOpenChange={(open) => {
          if (!open) setSelectedPayable(null);
        }}
      >
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد التسوية</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم إرسال طلب تسوية إلى{" "}
              <strong>{selectedPayable?.name || "العضو"}</strong>. يمكنك دفع
              المبلغ كاملًا أو جزءًا منه.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2">
            <Label htmlFor="settlement-amount">المبلغ</Label>
            <Input
              id="settlement-amount"
              type="number"
              min="0.01"
              max={selectedPayable?.amount}
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              dir="ltr"
            />
            <p className="text-xs text-(--color-secondary)">
              أقصى مبلغ: {money(selectedPayable?.amount)} جنيه
            </p>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRequesting}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              disabled={
                isRequesting ||
                Number(amount) <= 0 ||
                Number(amount) > Number(selectedPayable?.amount) + 0.005
              }
              onClick={confirmSettlement}
              className="bg-(--color-primary) text-white hover:bg-(--color-primary)/90"
            >
              {isRequesting ? "جاري الإرسال..." : "إرسال الطلب"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
