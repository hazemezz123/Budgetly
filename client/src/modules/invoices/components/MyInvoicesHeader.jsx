import { Clock, Plus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function MyInvoicesHeader({
  activeTab,
  pendingInvoicesCount,
  pendingInvoicesTotal,
  onBulkPay,
  onCreateRequest,
  totalPending,
}) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-(--color-dark) relative inline-block">
          {activeTab === "invoices" ? "فواتيري" : "طلباتي"}
        </h1>
        <p className="text-(--color-secondary) mt-1">
          {activeTab === "invoices" ? "إدارة المصاريف المستحقة عليك" : "متابعة المصاريف التي قمت بإنشائها"}
        </p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {activeTab === "invoices" && pendingInvoicesCount > 0 && (
          <Button
            onClick={onBulkPay}
            className="flex items-center gap-2 bg-(--color-success) text-white hover:bg-(--color-success)/90 rounded-xl font-medium shadow-sm"
          >
            <CheckCircle2 size={20} />
            <span className="hidden sm:inline">دفع الكل ({pendingInvoicesTotal.toLocaleString()} ج.م)</span>
            <span className="sm:hidden">دفع الكل</span>
          </Button>
        )}

        <Button
          onClick={onCreateRequest}
          className="flex items-center gap-2 bg-(--color-primary) text-white hover:bg-(--color-primary)/90 rounded-xl font-medium shadow-sm"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">طلب جديد</span>
          <span className="sm:inline hidden">طلب جديد</span>
        </Button>

        {activeTab === "invoices" && (
          <Card className="rounded-xl border-(--color-border) bg-(--color-surface) shadow-sm py-0 gap-0">
            <CardContent className="px-4 py-2 flex items-center gap-3">
              <div className="bg-(--color-status-pending-bg) p-2 rounded-full text-(--color-status-pending)">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs text-(--color-secondary) uppercase font-semibold">المبلغ المستحق</p>
                <p className="text-xl font-bold text-(--color-dark) font-numbers">
                  {totalPending.toFixed(2)} جنيه
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </header>
  );
}
