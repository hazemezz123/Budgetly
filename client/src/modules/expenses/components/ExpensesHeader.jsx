import { Link } from "react-router-dom";
import { PlusCircle, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ExpensesHeader({
  showFilters,
  hasActiveFilters,
  onToggleFilters,
  isAdmin,
}) {
  return (
    <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
      <h1 className="text-2xl font-bold text-(--color-dark)">المصاريف</h1>
      <div className="flex items-center gap-3">
        <Button
          onClick={onToggleFilters}
          variant={showFilters || hasActiveFilters ? "default" : "outline"}
          className={`gap-2 rounded-2xl font-medium shadow-sm hover:shadow-md min-h-[44px] px-4 py-2.5 ${
            showFilters || hasActiveFilters
              ? "bg-(--color-primary) text-white hover:bg-(--color-primary)/90 border-transparent"
              : "bg-(--color-surface) text-(--color-dark) border-(--color-border) hover:bg-(--color-hover)"
          }`}
        >
          <Filter size={18} />
          <span>فلترة</span>
          {hasActiveFilters && (
            <span className="flex items-center justify-center w-5 h-5 bg-white/20 rounded-full text-xs">
              !
            </span>
          )}
        </Button>

        {isAdmin && (
          <Button
            asChild
            className="gap-2 rounded-2xl bg-(--color-primary) text-white hover:bg-(--color-primary)/80 font-medium shadow-sm hover:shadow-md min-h-[44px] px-4 py-2.5"
          >
            <Link to="/add-expense">
              <PlusCircle size={20} />
              <span>سجّل مصروف جديد</span>
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
