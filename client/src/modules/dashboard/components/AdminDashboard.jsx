import { TrendingUp, TrendingDown, Users, Wallet } from "lucide-react";
import StatCard from "./StatCard";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AdminDashboard({ stats }) {
  const adminBalance = stats.overview.adminBalance || 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      <section aria-labelledby="overview-heading">
        <h2 id="overview-heading" className="sr-only">
          نظرة عامة
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <StatCard
            title="إجمالي المصاريف"
            value={`${stats.overview.totalExpenseAmount.toFixed(2)} جنيه`}
            icon={TrendingUp}
          />
          <StatCard
            title="إجمالي المستحق"
            value={`${stats.overview.totalOwed.toFixed(2)} جنيه`}
            icon={TrendingDown}
          />
          <StatCard
            title={adminBalance > 0 ? "اللي فلوس ليك" : "اللي عليك"}
            value={`${Math.abs(adminBalance).toFixed(2)} جنيه`}
            icon={Wallet}
          />
          <StatCard title="عدد الأعضاء" value={stats.overview.totalUsers} icon={Users} />
        </div>
      </section>

      <Card className="rounded-2xl sm:rounded-3xl border-(--color-border) bg-(--color-surface) overflow-hidden shadow-sm sm:shadow-md py-0 gap-0">
        <CardHeader className="p-4 sm:p-6 border-b border-(--color-border)">
          <h2
            id="debtors-heading"
            className="text-lg sm:text-xl font-bold text-(--color-dark)"
          >
            الناس اللي عليها فلوس
          </h2>
        </CardHeader>
        <CardContent className="p-0">
          {stats.usersOwing.length > 0 ? (
            <ul className="divide-y divide-(--color-border)">
              {stats.usersOwing.map((u) => (
                <li
                  key={u.userId}
                  className="p-4 sm:p-5 flex justify-between items-center gap-3 hover:bg-(--color-hover) transition-colors min-w-0"
                >
                  <span className="font-semibold text-(--color-dark) text-sm sm:text-base truncate flex-1 min-w-0">
                    {u.name}{" "}
                    <span className="text-(--color-secondary) text-xs sm:text-sm">
                      (@{u.username})
                    </span>
                  </span>
                  <span className="text-(--color-error) font-bold text-sm sm:text-base shrink-0">
                    عليه {u.owes.toFixed(2)} جنيه
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-6 text-(--color-secondary) text-center text-sm">
              مفيش حد عليه فلوس!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
