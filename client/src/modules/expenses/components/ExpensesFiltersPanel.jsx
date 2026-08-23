import { Filter, X, User, DollarSign } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ExpensesFiltersPanel({
  users,
  selectedUserId,
  onUserChange,
  minAmount,
  onMinAmountChange,
  maxAmount,
  onMaxAmountChange,
  hasActiveFilters,
  onClearFilters,
}) {
  return (
    <div
      className="mb-6 p-5 rounded-2xl shadow-sm animate-in slide-in-from-top-2 duration-200"
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className="font-semibold flex items-center gap-2"
          style={{ color: "var(--color-dark)" }}
        >
          <Filter size={18} style={{ color: "var(--color-primary)" }} />
          خيارات الفلترة
        </h3>
        {hasActiveFilters && (
          <Button
            onClick={onClearFilters}
            variant="ghost"
            size="sm"
            className="gap-1 rounded-xl text-sm font-medium bg-(--color-status-rejected-bg) text-(--color-error) hover:bg-(--color-status-rejected-bg)/80 hover:text-(--color-error)"
          >
            <X size={14} />
            مسح الكل
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="filter-user"
            className="flex items-center gap-1.5 text-sm font-medium text-(--color-secondary)"
          >
            <User size={14} />
            المستخدم
          </Label>
          <select
            id="filter-user"
            value={selectedUserId}
            onChange={(e) => onUserChange(e.target.value)}
            className="h-11 w-full rounded-xl border border-(--color-border) bg-(--color-bg) px-3 text-sm sm:text-base text-(--color-dark) [color-scheme:light] dark:[color-scheme:dark] outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary)"
          >
            <option value="">كل المستخدمين</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="filter-min"
            className="flex items-center gap-1.5 text-sm font-medium text-(--color-secondary)"
          >
            <DollarSign size={14} />
            الحد الأدنى (جنيه)
          </Label>
          <Input
            id="filter-min"
            type="number"
            value={minAmount}
            onChange={(e) => onMinAmountChange(e.target.value)}
            placeholder="0"
            min="0"
            className="h-11 rounded-xl bg-(--color-bg) border-(--color-border) text-sm sm:text-base"
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2 md:col-span-1">
          <Label
            htmlFor="filter-max"
            className="flex items-center gap-1.5 text-sm font-medium text-(--color-secondary)"
          >
            <DollarSign size={14} />
            الحد الأقصى (جنيه)
          </Label>
          <Input
            id="filter-max"
            type="number"
            value={maxAmount}
            onChange={(e) => onMaxAmountChange(e.target.value)}
            placeholder="∞"
            min="0"
            className="h-11 rounded-xl bg-(--color-bg) border-(--color-border) text-sm sm:text-base"
          />
        </div>
      </div>
    </div>
  );
}
