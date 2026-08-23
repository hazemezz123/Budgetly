import { Button } from "@/components/ui/button";

export default function ExpensesPagination({ page, totalPages, onPrev, onNext }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mt-8">
      <Button
        onClick={onPrev}
        disabled={page === 1}
        variant="outline"
        className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl font-medium bg-(--color-surface) text-(--color-dark) border-(--color-border) hover:bg-(--color-hover) shadow-sm disabled:bg-(--color-light) disabled:text-(--color-muted)"
      >
        السابق
      </Button>
      <span className="text-(--color-secondary) font-bold text-sm">
        صفحة {page} من {totalPages}
      </span>
      <Button
        onClick={onNext}
        disabled={page === totalPages}
        variant="outline"
        className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl font-medium bg-(--color-surface) text-(--color-dark) border-(--color-border) hover:bg-(--color-hover) shadow-sm disabled:bg-(--color-light) disabled:text-(--color-muted)"
      >
        التالي
      </Button>
    </div>
  );
}
