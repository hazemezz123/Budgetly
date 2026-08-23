import { Card, CardContent } from "@/components/ui/card";

export default function StatCard({
  title,
  value,
  subtext,
  type = "neutral",
  icon: Icon,
}) {
  const getCardClasses = () => {
    switch (type) {
      case "positive":
        return "border-(--color-success)/20 bg-(--color-success)/10";
      case "negative":
        return "border-(--color-error)/20 bg-(--color-error)/10";
      default:
        return "border-(--color-border) bg-(--color-surface)";
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "positive":
        return "text-(--color-success)";
      case "negative":
        return "text-(--color-error)";
      default:
        return "text-(--color-muted)";
    }
  };

  return (
    <Card
      className={`rounded-2xl ${getCardClasses()} shadow-sm hover:shadow-md transition-all py-0 gap-0`}
      role="article"
    >
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-2">
          {Icon && <Icon size={16} className={getIconColor()} aria-hidden="true" />}
          <p className="text-xs sm:text-sm text-(--color-secondary)">{title}</p>
        </div>
        <p className="text-xl sm:text-2xl font-bold text-(--color-dark) font-numbers">
          {value}
          {subtext && (
            <span className="text-base font-normal opacity-60 mr-2">{subtext}</span>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
