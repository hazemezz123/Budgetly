import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function MobileRequestCard({
  request,
  onOpenDetails,
  onApprove,
  onReject,
}) {
  return (
    <Card className="rounded-2xl border-(--color-border) bg-(--color-surface) shadow-sm py-0 gap-0 overflow-hidden">
      <CardContent className="p-3.5 sm:p-4 space-y-3 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-(--color-primary-bg) text-(--color-primary) flex items-center justify-center text-sm font-bold shrink-0">
              {request.createdBy?.name?.charAt(0) || "?"}
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-sm sm:text-base text-(--color-dark) truncate">
                {request.createdBy?.name}
              </h4>
              <p className="text-xs sm:text-sm text-(--color-secondary)">
                {new Date(request.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="shrink-0 px-2.5 py-1 bg-(--color-status-pending-bg) text-(--color-status-pending) border-(--color-status-pending-border) rounded-full text-[11px] font-bold"
          >
            معلق
          </Badge>
        </div>

        <div>
          <p className="font-medium text-sm sm:text-base text-(--color-dark) break-words line-clamp-2">
            {request.description}
          </p>
          <p className="text-lg sm:text-xl font-bold text-(--color-primary) mt-1 font-numbers">
            {request.totalAmount} جنيه
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-(--color-border)">
          <Button
            onClick={() => onOpenDetails(request)}
            variant="outline"
            className="col-span-2 min-h-[44px] py-2.5 bg-(--color-bg) text-(--color-secondary) border-(--color-border) hover:bg-(--color-hover) rounded-xl text-sm font-bold"
          >
            عرض التفاصيل
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="min-h-[44px] py-2.5 bg-(--color-status-approved-bg) text-(--color-status-approved) hover:bg-(--color-status-approved-bg)/80 rounded-xl text-sm font-bold">
                موافقة
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent dir="rtl">
              <AlertDialogHeader>
                <AlertDialogTitle>تأكيد الموافقة</AlertDialogTitle>
                <AlertDialogDescription>هل أنت متأكد من الموافقة على هذا الطلب؟</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction onClick={() => onApprove(request._id)}>تأكيد</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="min-h-[44px] py-2.5 bg-(--color-status-rejected-bg) text-(--color-status-rejected) hover:bg-(--color-status-rejected-bg)/80 rounded-xl text-sm font-bold">
                رفض
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent dir="rtl">
              <AlertDialogHeader>
                <AlertDialogTitle>تأكيد الرفض</AlertDialogTitle>
                <AlertDialogDescription>هل أنت متأكد من رفض هذا الطلب؟</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onReject(request._id)}
                  className="bg-(--color-error) text-white hover:bg-(--color-error)/90"
                >
                  تأكيد
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
