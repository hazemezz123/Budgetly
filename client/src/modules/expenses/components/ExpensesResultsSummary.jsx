export default function ExpensesResultsSummary({ count }) {
  return (
    <div className="mb-4 px-4 py-2 rounded-xl text-sm bg-(--color-light) text-(--color-secondary)">
      عدد النتائج: <strong>{count}</strong> مصروف
    </div>
  );
}
