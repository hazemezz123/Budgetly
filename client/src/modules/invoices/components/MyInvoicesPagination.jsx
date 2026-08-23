import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      <Button
        onClick={onPrevious}
        disabled={currentPage === 1}
        variant="outline"
        size="icon"
        className="min-w-[44px] min-h-[44px] rounded-xl border-(--color-border) hover:bg-(--color-hover)"
        aria-label="السابق"
      >
        <ChevronRight size={20} className="text-(--color-dark)" />
      </Button>

      <div className="flex items-center gap-1.5 overflow-x-auto">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            onClick={() => onPageChange(page)}
            variant={currentPage === page ? "default" : "outline"}
            className={`min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl font-medium flex items-center justify-center shrink-0 ${currentPage === page ? "bg-(--color-primary) text-white hover:bg-(--color-primary)/90" : "bg-(--color-surface) text-(--color-dark) hover:bg-(--color-hover) border-(--color-border)"}`}
          >
            {page}
          </Button>
        ))}
      </div>

      <Button
        onClick={onNext}
        disabled={currentPage === totalPages}
        variant="outline"
        size="icon"
        className="min-w-[44px] min-h-[44px] rounded-xl border-(--color-border) hover:bg-(--color-hover)"
        aria-label="التالي"
      >
        <ChevronLeft size={20} className="text-(--color-dark)" />
      </Button>
    </div>
  );
}
