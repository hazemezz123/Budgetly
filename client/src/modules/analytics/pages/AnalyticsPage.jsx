import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  Loader2,
} from "lucide-react";
import useAnalytics from "../hooks/useAnalytics";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const Analytics = () => {
  const { analytics, loading, error } = useAnalytics();

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] w-full p-8">
        <div className="relative">
          <div className="absolute inset-0 bg-(--color-primary)/20 blur-xl rounded-full animate-pulse" />
          <Loader2 className="w-12 h-12 text-(--color-primary) animate-spin relative z-10" />
        </div>
        <p className="mt-4 text-(--color-muted) font-medium animate-pulse">
          بنحمّل التحليلات...
        </p>
      </div>
    );

  if (error) {
    return (
      <div className="text-center py-20 text-(--color-error)">
        فيه مشكلة في تحميل التحليلات
      </div>
    );
  }

  if (!analytics) return null;

  const { monthlyExpenses, categoryBreakdown, summary } = analytics;

  const getCategoryName = (category) => {
    const names = {
      Food: "أكل وشرب",
      Transport: "مواصلات",
      Utilities: "فواتير",
      Housing: "سكن",
      Entertainment: "ترفيه",
      General: "عام",
      Other: "حاجات تانية",
    };
    return names[category] || category;
  };

  const monthlyData = Object.entries(monthlyExpenses)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 6);

  return (
    <div className="pb-8 px-4 max-w-6xl mx-auto font-primary">
      <div className="flex items-center gap-3 mb-8 pt-4">
        <div className="p-3 bg-(--color-primary)/10 rounded-2xl">
          <BarChart3 className="text-(--color-primary)" size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-(--color-dark)">التحليلات</h1>
          <p className="text-(--color-muted) text-sm">تحليل شامل لمصاريفك</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-linear-to-br from-(--color-primary)/5 to-(--color-primary)/10 border-(--color-primary)/20 py-0 gap-0 rounded-2xl shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={20} className="text-(--color-primary)" />
              <p className="text-sm text-(--color-primary-text)">إجمالي المصاريف</p>
            </div>
            <p className="text-2xl font-bold text-(--color-dark)">
              {summary.totalExpenses.toFixed(2)}
              <span className="text-sm font-normal"> جنيه</span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-(--color-success)/5 to-(--color-success)/10 border-(--color-success)/20 py-0 gap-0 rounded-2xl shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={20} className="text-(--color-success)" />
              <p className="text-sm text-(--color-success-text)">متوسط شهري</p>
            </div>
            <p className="text-2xl font-bold text-(--color-dark)">
              {summary.avgMonthlyExpense}
              <span className="text-sm font-normal"> جنيه</span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-(--color-info)/5 to-(--color-info)/10 border-(--color-info)/20 py-0 gap-0 rounded-2xl shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={20} className="text-(--color-info)" />
              <p className="text-sm text-(--color-info-text)">الأشهر المتتبعة</p>
            </div>
            <p className="text-2xl font-bold text-(--color-dark)">
              {summary.monthsTracked}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-(--color-warning)/5 to-(--color-warning)/10 border-(--color-warning)/20 py-0 gap-0 rounded-2xl shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 size={20} className="text-(--color-warning)" />
              <p className="text-sm text-(--color-warning-text)">عدد المعاملات</p>
            </div>
            <p className="text-2xl font-bold text-(--color-dark)">
              {summary.totalTransactions}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl bg-(--color-bg) border-(--color-border) shadow-sm py-0 gap-0">
          <CardHeader className="p-6 pb-0">
            <div className="flex items-center gap-2 mb-5">
              <PieChart size={20} className="text-(--color-primary)" />
              <h2 className="text-lg font-bold text-(--color-dark)">
                التوزيع حسب النوع
              </h2>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-4">
              {Object.entries(categoryBreakdown)
                .sort((a, b) => b[1].amount - a[1].amount)
                .map(([category, data]) => (
                  <div key={category}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-(--color-secondary)">
                        {getCategoryName(category)}
                      </span>
                      <span className="text-sm font-bold text-(--color-dark)">
                        {data.amount.toFixed(2)} جنيه ({data.percentage}%)
                      </span>
                    </div>
                    <Progress
                      value={data.percentage}
                      className="h-2.5 bg-(--color-muted-bg) [&>div]:bg-(--color-primary)"
                    />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl bg-(--color-bg) border-(--color-border) shadow-sm py-0 gap-0">
          <CardHeader className="p-6 pb-0">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp size={20} className="text-(--color-primary)" />
              <h2 className="text-lg font-bold text-(--color-dark)">آخر 6 شهور</h2>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-3">
              {monthlyData.map(([month, data]) => {
                const date = new Date(month + "-01");
                const monthName = date.toLocaleDateString("ar-EG", {
                  month: "long",
                  year: "numeric",
                  calendar: "gregory",
                });

                return (
                  <div
                    key={month}
                    className="flex justify-between items-center p-3 bg-(--color-surface) rounded-xl hover:bg-(--color-hover) transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-(--color-dark)">{monthName}</p>
                      <p className="text-xs text-(--color-muted)">{data.count} معاملة</p>
                    </div>
                    <p className="text-lg font-bold text-(--color-dark)">
                      {data.total.toFixed(2)} <span className="text-sm">جنيه</span>
                    </p>
                  </div>
                );
              })}
            </div>

            {monthlyData.length === 0 && (
              <div className="text-center py-10 text-(--color-muted)">
                <BarChart3 size={48} className="mx-auto mb-3 opacity-30" />
                <p>مفيش بيانات لسه</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {monthlyData.length > 0 && (
        <Card className="rounded-2xl bg-(--color-bg) border-(--color-border) shadow-sm mt-6 py-0 gap-0">
          <CardHeader className="p-6 pb-0">
            <div className="flex items-center gap-2 mb-5">
              <TrendingDown size={20} className="text-(--color-primary)" />
              <h2 className="text-lg font-bold text-(--color-dark)">
                الشهر الحالي - حسب النوع
              </h2>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(monthlyData[0][1].categories).map(
                ([category, amount]) => (
                  <div
                    key={category}
                    className="text-center p-4 bg-(--color-surface) rounded-xl"
                  >
                    <p className="text-xs text-(--color-muted) mb-2">
                      {getCategoryName(category)}
                    </p>
                    <p className="text-lg font-bold text-(--color-dark)">
                      {amount.toFixed(0)}
                    </p>
                    <p className="text-xs text-(--color-muted)">جنيه</p>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Analytics;
