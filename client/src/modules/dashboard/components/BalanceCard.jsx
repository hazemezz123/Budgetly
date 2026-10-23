export default function BalanceCard({
  balance = 0,
  userName = "",
  houseName = "Budgetly",
  role = "user",
}) {
  const isPositive = balance > 0;
  const isNegative = balance < 0;

  // Number color expresses financial balance state in both light and dark modes:
  // Positive (owed money): Green | Negative (owe money): Red | Settled: Neutral
  const amountColor = isPositive
    ? "text-emerald-600 dark:text-emerald-400"
    : isNegative
    ? "text-rose-600 dark:text-rose-400"
    : "text-zinc-900 dark:text-white";

  const sign = isPositive ? "+" : isNegative ? "-" : "";
  const absAmount = Math.abs(balance).toFixed(2);

  return (
    <div
      className="relative overflow-hidden rounded-[22px] p-6 sm:p-7 shadow-xl shadow-zinc-950/5 dark:shadow-black/25 bg-gradient-to-b from-stone-50 via-zinc-100 to-slate-200 dark:from-[#202024] dark:via-[#161618] dark:to-[#0d0d0e] border border-zinc-200/90 dark:border-white/[0.09] transition-all"
      role="region"
      aria-label="بطاقة الرصيد"
      dir="rtl"
    >
      {/* Apple-style specular edge highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent pointer-events-none" />

      {/* Top row: Minimalist Chip + Brand / House */}
      <div className="relative z-10 flex items-center justify-between mb-6">
        {/* Apple Card minimal etched chip */}
        <div className="flex items-center gap-2.5">
          <svg
            className="w-10 h-7 shrink-0"
            viewBox="0 0 40 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect
              x="0.5"
              y="0.5"
              width="39"
              height="27"
              rx="4.5"
              className="stroke-amber-600/50 fill-amber-500/10 dark:stroke-amber-400/40 dark:fill-amber-500/10"
            />
            <path
              d="M1 10H14C16.2091 10 18 11.7909 18 14C18 16.2091 16.2091 18 14 18H1"
              className="stroke-amber-600/60 dark:stroke-amber-400/50"
              strokeWidth="1"
            />
            <path
              d="M39 10H26C23.7909 10 22 11.7909 22 14C22 16.2091 23.7909 18 26 18H39"
              className="stroke-amber-600/60 dark:stroke-amber-400/50"
              strokeWidth="1"
            />
            <line
              x1="20"
              y1="1"
              x2="20"
              y2="10"
              className="stroke-amber-600/60 dark:stroke-amber-400/50"
              strokeWidth="1"
            />
            <line
              x1="20"
              y1="18"
              x2="20"
              y2="27"
              className="stroke-amber-600/60 dark:stroke-amber-400/50"
              strokeWidth="1"
            />
          </svg>

          {/* Contactless waves icon */}
          <svg
            className="w-4 h-4 text-zinc-400 dark:text-white/40 -rotate-90"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12.55a11 11 0 0 1 14.08 0" />
            <path d="M1.42 9a16 16 0 0 1 21.16 0" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <line x1="12" y1="20" x2="12.01" y2="20" />
          </svg>
        </div>

        {/* House / Card Title & Role */}
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-semibold tracking-wide text-zinc-800 dark:text-white/90">
            {houseName || "Budgetly"}
          </span>
          <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-zinc-900/5 text-zinc-600 border border-zinc-900/10 dark:bg-white/[0.07] dark:text-white/70 dark:border-white/10">
            {role === "admin" ? "مشرف" : "عضو"}
          </span>
        </div>
      </div>

      {/* Middle row: Clean balance display */}
      <div className="relative z-10 mb-6">
        <p className="text-xs text-zinc-500 dark:text-white/50 font-medium mb-2">الرصيد الحالي</p>

        <div className="flex items-baseline gap-2">
          <span
            className={`text-3xl sm:text-4xl md:text-[44px] font-bold font-numbers tracking-tight leading-none ${amountColor}`}
          >
            {sign}
            {absAmount}
          </span>
          <span className="text-sm sm:text-base font-semibold text-zinc-500 dark:text-white/50">
            جنيه
          </span>
        </div>
      </div>

      {/* Bottom row: Cardholder details */}
      <div className="relative z-10 pt-4 border-t border-zinc-200/90 dark:border-white/[0.08] flex items-center justify-between text-xs">
        <div className="min-w-0">
          <span className="text-[10px] text-zinc-400 dark:text-white/40 uppercase tracking-wider block font-medium">
            صاحب البطاقة
          </span>
          <span className="font-semibold text-zinc-800 dark:text-white/90 truncate mt-0.5 block max-w-[200px] sm:max-w-[260px]">
            {userName || "عضو السكن"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-zinc-400 dark:text-white/40 font-mono text-[11px] tracking-wider">
          <span>BUDGETLY PASS</span>
        </div>
      </div>
    </div>
  );
}
