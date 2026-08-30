import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "../context/AuthContext";
import {
  useNotifications,
  useUnreadCount,
  useMarkRead,
  useMarkAllRead,
  useDeleteNotification,
} from "../../modules/notifications/hooks/useNotifications";

const timeAgo = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `منذ ${days} يوم`;
  return d.toLocaleDateString("ar-EG", { day: "numeric", month: "short" });
};

const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const enabled = Boolean(user?.house);
  const { data: unreadData } = useUnreadCount(enabled);
  const unreadCount = unreadData?.count ?? 0;

  const { data, isLoading } = useNotifications({ page: 1, limit: 10 });
  const items = data?.items ?? [];

  const markRead = useMarkRead();
  const markAll = useMarkAllRead();
  const deleteOne = useDeleteNotification();

  const handleClickItem = async (item) => {
    try {
      if (!item.read) await markRead.mutateAsync(item._id);
    } catch (e) {
      console.debug("mark read failed", e);
    }
    const fallbackId = item.expense || item.data?.expenseId;
    const url = item.url || (fallbackId ? `/all-invoices?requestId=${fallbackId}#pending-requests` : "/all-invoices");
    navigate(url);
    if (item.data) {
      window.dispatchEvent(new CustomEvent("budgetly:pending-request-open", { detail: item.data }));
      window.dispatchEvent(new CustomEvent("budgetly:pending-expense-open", { detail: item.data }));
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAll.mutateAsync();
    } catch (e) {
      console.debug("mark all failed", e);
    }
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 min-w-[40px] min-h-[40px] rounded-xl text-(--color-secondary) hover:bg-(--color-hover) hover:text-(--color-primary)"
          aria-label={`الإشعارات${unreadCount ? ` - ${unreadCount} غير مقروء` : ""}`}
        >
          <Bell size={19} aria-hidden="true" />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -left-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full text-[10px] font-bold bg-(--color-primary) text-white border-2 border-(--color-surface) font-numbers"
              aria-hidden="true"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[360px] max-w-[92vw] p-0 rounded-2xl overflow-hidden bg-(--color-surface) border-(--color-border) shadow-lg"
        dir="rtl"
      >
        <div className="flex items-center justify-between px-4 py-3 bg-(--color-bg)">
          <h3 className="text-sm font-bold text-(--color-dark)">الإشعارات</h3>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAll}
                disabled={markAll.isPending}
                className="h-7 text-xs rounded-full gap-1 text-(--color-primary) hover:bg-(--color-hover)"
              >
                <CheckCheck size={14} />
                تعليم الكل كمقروء
              </Button>
            )}
          </div>
        </div>
        <Separator />
        <ScrollArea className="max-h-[380px]">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse space-y-2">
                  <div className="h-4 bg-(--color-hover) rounded w-3/4" />
                  <div className="h-3 bg-(--color-hover) rounded w-full" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="py-10 px-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center bg-(--color-hover) mb-3">
                <Bell size={20} className="text-(--color-muted)" />
              </div>
              <p className="text-sm font-semibold text-(--color-dark)">مفيش إشعارات لسه</p>
              <p className="text-xs text-(--color-muted) mt-1">لما أي عضو يضيف مصروف هتوصلك هنا</p>
            </div>
          ) : (
            <div className="divide-y divide-(--color-border)">
              {items.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleClickItem(item)}
                  className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-(--color-hover) ${!item.read ? "bg-(--color-primary-bg)/30" : ""}`}
                >
                  <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!item.read ? "bg-(--color-primary)" : "bg-transparent"}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!item.read ? "font-bold text-(--color-dark)" : "font-medium text-(--color-dark)"}`}>
                      {item.title}
                    </p>
                    <p className="text-xs text-(--color-secondary) mt-1 line-clamp-2 break-words">{item.body}</p>
                    <p className="text-[11px] text-(--color-muted) mt-1.5 font-numbers">{timeAgo(item.createdAt)}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteOne.mutate(item._id);
                    }}
                    className="self-start p-1.5 rounded-full hover:bg-(--color-hover) text-(--color-muted) hover:text-(--color-error) transition-colors"
                    aria-label="حذف الإشعار"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <Separator />
        <div className="p-2 flex gap-2">
          <Button
            variant="ghost"
            className="flex-1 rounded-xl text-xs h-9"
            onClick={() => navigate("/notifications")}
          >
            عرض الكل
          </Button>
          {unreadCount > 0 && (
            <Badge variant="outline" className="rounded-full self-center bg-(--color-primary) text-white border-(--color-primary) font-numbers px-2">
              {unreadCount} جديد
            </Badge>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
