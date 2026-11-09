import { Badge } from "@/components/ui/badge";

export default function StatusBadge({ status }) {
  const labels = {
    pending: "مطلوب سداده",
    awaiting_approval: "في انتظار الموافقة",
    partially_paid: "مدفوع جزئيًا",
    paid: "تم الدفع",
    offset: "مقاصة",
    approved: "تمت الموافقة",
    rejected: "مرفوض",
  };

  const getStatusClasses = (s) => {
    switch (s) {
      case "pending":
        return "bg-(--color-status-pending-bg) text-(--color-status-pending) border-(--color-status-pending-border)";
      case "awaiting_approval":
      case "partially_paid":
        return "bg-(--color-info-bg) text-(--color-info) border-(--color-info-border)";
      case "offset":
        return "bg-(--color-primary-bg) text-(--color-primary-text) border-(--color-primary-border)";
      case "paid":
      case "approved":
        return "bg-(--color-status-approved-bg) text-(--color-status-approved) border-(--color-status-approved-border)";
      case "rejected":
        return "bg-(--color-status-rejected-bg) text-(--color-status-rejected) border-(--color-status-rejected-border)";
      default:
        return "bg-(--color-light) text-(--color-secondary) border-(--color-border)";
    }
  };

  return (
    <Badge variant="outline" className={getStatusClasses(status)}>
      {labels[status] || status}
    </Badge>
  );
}
