import { ChevronLeft, ChevronRight } from "lucide-react";

export default function MyInvoicesPagination({
  currentPage,
  totalPages,
  onPageChange,
  onPrevious,
  onNext,
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <button
        onClick={onPrevious}
        disabled={currentPage === 1}
        className="min-w-[44px] min-h-[44px] p-2 rounded-xl border border-(--color-border) disabled:opacity-50 disabled:cursor-not-allowed hover:bg-(--color-hover) transition-colors flex items-center justify-center"
      >
        <ChevronRight size={20} className="text-(--color-dark)" />
      </button>

      <div className="flex items-center gap-1.5 overflow-x-auto">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl font-medium transition-colors flex items-center justify-center shrink-0 ${
              currentPage === page
                ? "bg-(--color-primary) text-white"
                : "bg-(--color-surface) text-(--color-dark) hover:bg-(--color-hover) border border-(--color-border)"
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={currentPage === totalPages}
        className="min-w-[44px] min-h-[44px] p-2 rounded-xl border border-(--color-border) disabled:opacity-50 disabled:cursor-not-allowed hover:bg-(--color-hover) transition-colors flex items-center justify-center"
      >
        <ChevronLeft size={20} className="text-(--color-dark)" />
      </button>
    </div>
  );
}
