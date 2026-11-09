import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MyInvoicesHeader({ activeTab, onCreateRequest }) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-(--color-dark) relative inline-block">
          {activeTab === "invoices" ? "فواتيري" : "طلباتي"}
        </h1>
        <p className="text-(--color-secondary) mt-1">
          {activeTab === "invoices"
            ? "سجل المصاريف والأرصدة بعد المقاصة"
            : "متابعة المصاريف التي قمت بإنشائها"}
        </p>
      </div>

      <Button
        onClick={onCreateRequest}
        className="flex items-center gap-2 bg-(--color-primary) text-white hover:bg-(--color-primary)/90 rounded-xl font-medium shadow-sm self-start md:self-auto"
      >
        <Plus size={20} />
        <span className="sm:inline hidden">طلب جديد</span>
      </Button>
    </header>
  );
}
