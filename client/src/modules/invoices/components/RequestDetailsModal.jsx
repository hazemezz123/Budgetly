import { CreditCard, User as UserIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const dialogClasses =
  "top-auto bottom-0 left-0 right-0 translate-x-0 translate-y-0 " +
  "max-w-none w-full rounded-t-3xl rounded-b-none border-b-0 sm:border-b p-0 gap-0 " +
  "sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:-translate-y-1/2 " +
  "sm:max-w-lg sm:w-full sm:rounded-3xl bg-(--color-surface) max-h-[85vh] sm:max-h-[90vh] flex flex-col overflow-hidden";

export default function RequestDetailsModal({ isOpen, onClose, request }) {
  if (!request) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={dialogClasses} dir="rtl">
        <div className="sm:hidden absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1.5 rounded-full bg-(--color-border)" />
        <DialogTitle className="sr-only">تفاصيل الفاتورة</DialogTitle>
        <DialogDescription className="sr-only">
          تفاصيل الفاتورة {request.description}
        </DialogDescription>

        <div className="p-4 sm:p-6 border-b border-(--color-border) flex justify-between items-start shrink-0 pt-6 sm:pt-6">
          <div>
            <h3
              id="request-details-title"
              className="text-lg sm:text-xl font-bold text-(--color-dark) flex items-center gap-2"
            >
              <CreditCard className="text-(--color-primary)" size={24} />
              تفاصيل الفاتورة
            </h3>
            <p className="text-xs sm:text-sm text-(--color-secondary) mt-1">
              تم الإنشاء بواسطة {request.createdBy?.name}
            </p>
          </div>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-(--color-bg) p-4 rounded-xl border border-(--color-border)">
                <p className="text-xs text-(--color-secondary) mb-1">الوصف</p>
                <p className="font-semibold text-(--color-dark)">{request.description}</p>
              </div>
              <div className="bg-(--color-bg) p-4 rounded-xl border border-(--color-border)">
                <p className="text-xs text-(--color-secondary) mb-1">المبلغ الكلي</p>
                <p className="font-bold text-xl text-(--color-primary)">{request.totalAmount} جنيه</p>
              </div>
              <div className="bg-(--color-bg) p-4 rounded-xl border border-(--color-border)">
                <p className="text-xs text-(--color-secondary) mb-1">التاريخ</p>
                <p className="font-medium text-(--color-dark)">
                  {new Date(request.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="bg-(--color-bg) p-4 rounded-xl border border-(--color-border)">
                <p className="text-xs text-(--color-secondary) mb-1">الفئة</p>
                <p className="font-medium text-(--color-dark)">{request.category || "عام"}</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-(--color-dark) mb-3 flex items-center gap-2">
                <UserIcon size={18} />
                المشاركون في الدفع
              </h4>
              <div className="space-y-3">
                {request.splits?.map((split, index) => {
                  const isPayer = split.user._id === request.createdBy._id;
                  return (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 rounded-lg bg-(--color-bg) border border-(--color-border)"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-(--color-surface) border border-(--color-border) flex items-center justify-center text-sm font-bold text-(--color-primary)">
                          {split.user.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-(--color-dark) text-sm sm:text-base">
                            {split.user.name}
                          </p>
                          {isPayer && (
                            <span className="text-[10px] bg-(--color-status-approved-bg) text-(--color-status-approved) px-2 py-0.5 rounded-full font-bold">
                              الدافع
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="font-bold text-(--color-dark) text-sm sm:text-base">
                        {split.amount.toFixed(2)} جنيه
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 sm:p-6 border-t border-(--color-border) bg-(--color-bg) flex justify-end shrink-0 pb-safe">
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 bg-(--color-surface) border-(--color-border) text-(--color-dark) hover:bg-(--color-hover) rounded-xl font-medium"
          >
            إغلاق
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
