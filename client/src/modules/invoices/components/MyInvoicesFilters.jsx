import { Search, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const statusFilterLabelsByTab = {
  invoices: {
    all: "الكل",
    pending: "مطلوب سداده",
    awaiting_approval: "في انتظار الموافقة",
    paid: "تم الدفع",
  },
  requests: {
    all: "الكل",
    pending: "قيد المراجعة",
    approved: "تمت الموافقة",
    rejected: "مرفوض",
  },
};

const filterOptionsByTab = {
  invoices: ["all", "pending", "awaiting_approval", "paid"],
  requests: ["all", "pending", "approved", "rejected"],
};

export default function MyInvoicesFilters({
  activeTab,
  onTabChange,
  filterStatus,
  onFilterChange,
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
}) {
  const statusFilterLabels = statusFilterLabelsByTab[activeTab];
  const filterOptions = filterOptionsByTab[activeTab];

  return (
    <>
      <div className="flex bg-(--color-surface) p-1 rounded-xl border border-(--color-border) w-full sm:w-fit">
        <Button
          onClick={() => onTabChange("invoices")}
          variant={activeTab === "invoices" ? "default" : "ghost"}
          className={`flex-1 sm:flex-none min-h-[44px] px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "invoices" ? "bg-(--color-primary) text-white shadow-sm hover:bg-(--color-primary)/90" : "text-(--color-secondary) hover:bg-(--color-hover)"}`}
        >
          فواتيري
        </Button>
        <Button
          onClick={() => onTabChange("requests")}
          variant={activeTab === "requests" ? "default" : "ghost"}
          className={`flex-1 sm:flex-none min-h-[44px] px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "requests" ? "bg-(--color-primary) text-white shadow-sm hover:bg-(--color-primary)/90" : "text-(--color-secondary) hover:bg-(--color-hover)"}`}
        >
          طلباتي
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 bg-(--color-surface) p-3 sm:p-4 rounded-xl shadow-sm border border-(--color-border)">
        <div className="relative flex-1">
          <Label htmlFor="search-invoices" className="sr-only">
            بحث
          </Label>
          <Input
            id="search-invoices"
            type="text"
            placeholder={activeTab === "invoices" ? "ابحث في الفواتير..." : "ابحث في الطلبات..."}
            className="w-full pr-10 h-11 bg-(--color-bg) border-(--color-border) rounded-xl text-base sm:text-sm text-(--color-dark)"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <Search
            className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-secondary) pointer-events-none"
            size={18}
          />
        </div>

        <div className="relative w-full sm:w-auto space-y-1.5">
          <Label htmlFor="sort-invoices" className="sr-only">
            ترتيب
          </Label>
          <select
            id="sort-invoices"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="h-11 w-full sm:min-w-[160px] rounded-xl border border-(--color-border) bg-(--color-bg) px-3 text-sm sm:text-base text-(--color-dark) [color-scheme:light] dark:[color-scheme:dark] outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary) appearance-none pl-8"
          >
            <option value="date_desc">الأحدث أولاً</option>
            <option value="date_asc">الأقدم أولاً</option>
            <option value="amount_desc">المبلغ: الأعلى</option>
            <option value="amount_asc">المبلغ: الأقل</option>
            <option value="status">الحالة</option>
          </select>
          <ArrowUpDown
            className="absolute left-2 top-1/2 -translate-y-1/2 text-(--color-secondary) pointer-events-none"
            size={16}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 -mx-1 px-1">
          {filterOptions.map((status) => (
            <Button
              key={status}
              onClick={() => onFilterChange(status)}
              variant={filterStatus === status ? "default" : "secondary"}
              className={`min-h-[40px] px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap shrink-0 ${filterStatus === status ? "bg-(--color-primary) text-white hover:bg-(--color-primary)/90" : "bg-(--color-bg) text-(--color-secondary) hover:bg-(--color-hover) border border-(--color-border)"}`}
            >
              {statusFilterLabels[status]}
            </Button>
          ))}
        </div>
      </div>
    </>
  );
}
