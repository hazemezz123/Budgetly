export default function MobileRequestCard({
  request,
  onOpenDetails,
  onApprove,
  onReject,
}) {
  return (
    <div className="p-3.5 sm:p-4 bg-(--color-surface) border border-(--color-border) rounded-2xl shadow-sm space-y-3 min-w-0">
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-(--color-primary-bg) text-(--color-primary) flex items-center justify-center text-sm font-bold shrink-0">
            {request.createdBy?.name?.charAt(0) || "?"}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-sm sm:text-base text-(--color-dark) truncate">{request.createdBy?.name}</h4>
            <p className="text-xs sm:text-sm text-(--color-secondary)">
              {new Date(request.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
        <span className="shrink-0 px-2.5 py-1 bg-(--color-status-pending-bg) text-(--color-status-pending) rounded-full text-[11px] font-bold">
          معلق
        </span>
      </div>

      <div>
        <p className="font-medium text-sm sm:text-base text-(--color-dark) break-words line-clamp-2">{request.description}</p>
        <p className="text-lg sm:text-xl font-bold text-(--color-primary) mt-1 font-numbers">{request.totalAmount} جنيه</p>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-(--color-border)">
        <button
          onClick={() => onOpenDetails(request)}
          className="col-span-2 min-h-[44px] py-2.5 bg-(--color-bg) text-(--color-secondary) border border-(--color-border) rounded-xl hover:bg-(--color-hover) text-sm font-bold transition-colors"
        >
          عرض التفاصيل
        </button>
        <button
          onClick={() => onApprove(request._id)}
          className="min-h-[44px] py-2.5 bg-(--color-status-approved-bg) text-(--color-status-approved) rounded-xl hover:opacity-80 text-sm font-bold transition-colors"
        >
          موافقة
        </button>
        <button
          onClick={() => onReject(request._id)}
          className="min-h-[44px] py-2.5 bg-(--color-status-rejected-bg) text-(--color-status-rejected) rounded-xl hover:opacity-80 text-sm font-bold transition-colors"
        >
          رفض
        </button>
      </div>
    </div>
  );
}
