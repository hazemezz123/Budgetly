export default function ExpensesPagination({ page, totalPages, onPrev, onNext }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mt-8">
      <button
        onClick={onPrev}
        disabled={page === 1}
        className={`w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl transition-all font-medium ${
          page === 1
            ? "bg-(--color-light) text-(--color-muted) cursor-not-allowed"
            : "bg-(--color-surface) text-(--color-dark) hover:bg-(--color-hover) shadow-sm"
        }`}
      >
        السابق
      </button>
      <span className="text-(--color-secondary) font-bold text-sm">
        صفحة {page} من {totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={page === totalPages}
        className={`w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl transition-all font-medium ${
          page === totalPages
            ? "bg-(--color-light) text-(--color-muted) cursor-not-allowed"
            : "bg-(--color-surface) text-(--color-dark) hover:bg-(--color-hover) shadow-sm"
        }`}
      >
        التالي
      </button>
    </div>
  );
}
