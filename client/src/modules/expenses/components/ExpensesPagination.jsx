export default function ExpensesPagination({ page, totalPages, onPrev, onNext }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-4 mt-8">
      <button
        onClick={onPrev}
        disabled={page === 1}
        className={`px-4 py-2 rounded-xl transition-all ${
          page === 1
            ? "bg-(--color-light) text-(--color-muted) cursor-not-allowed"
            : "bg-(--color-surface) text-(--color-dark) hover:bg-(--color-hover) shadow-sm"
        }`}
      >
        السابق
      </button>
      <span className="text-(--color-secondary) font-bold">
        صفحة {page} من {totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={page === totalPages}
        className={`px-4 py-2 rounded-xl transition-all ${
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
