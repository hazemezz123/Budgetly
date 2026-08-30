import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useNotifications,
  useUnreadCount,
  useMarkRead,
  useMarkAllRead,
  useDeleteNotification,
} from "../hooks/useNotifications";

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
  if (days < 30) return `منذ ${days} يوم`;
  return d.toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
};

const NotificationsPage = () => {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all"); // all | unread
  const unreadOnly = filter === "unread";
  const navigate = useNavigate();

  const { data, isLoading } = useNotifications({ page, limit: 10, unreadOnly });
  const { data: unreadData } = useUnreadCount(true);
  const unreadCount = unreadData?.count ?? 0;

  const markRead = useMarkRead();
  const markAll = useMarkAllRead();
  const deleteOne = useDeleteNotification();

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  const handleClick = async (item) => {
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

  return (
    <div className="pb-8 px-3 sm:px-4 max-w-3xl mx-auto font-primary">
      <div className="flex items-start gap-3 mb-6">
        <div className="p-2.5 rounded-2xl border bg-(--color-surface) border-(--color-border)">
          <Bell className="w-6 h-6 text-(--color-primary)" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-(--color-dark)">الإشعارات</h1>
          <p className="text-xs sm:text-sm text-(--color-secondary)">كل المصاريف اللي مستنيّة مراجعتك</p>
        </div>
        {unreadCount > 0 && (
          <Badge className="rounded-full bg-(--color-primary) text-white border-(--color-primary) font-numbers">
            {unreadCount} جديد
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 mb-4">
        <Tabs value={filter} onValueChange={(v) => { setFilter(v); setPage(1); }}>
          <TabsList className="rounded-full bg-(--color-bg) p-1">
            <TabsTrigger value="all" className="rounded-full text-xs data-[state=active]:bg-(--color-surface)">الكل</TabsTrigger>
            <TabsTrigger value="unread" className="rounded-full text-xs data-[state=active]:bg-(--color-surface)">غير مقروء</TabsTrigger>
          </TabsList>
        </Tabs>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
            className="rounded-full text-xs gap-1.5"
          >
            <CheckCheck size={14} />
            تعليم الكل كمقروء
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="rounded-2xl border-(--color-border) bg-(--color-surface) animate-pulse">
              <CardContent className="p-4 space-y-2">
                <div className="h-4 bg-(--color-hover) rounded w-3/4" />
                <div className="h-3 bg-(--color-hover) rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="rounded-2xl border-(--color-border) bg-(--color-surface) py-12 text-center">
          <CardContent>
            <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center bg-(--color-hover) mb-3">
              <Bell size={22} className="text-(--color-muted)" />
            </div>
            <p className="font-bold text-(--color-dark)">{unreadOnly ? "مفيش إشعارات غير مقروءة" : "مفيش إشعارات"}</p>
            <p className="text-xs text-(--color-muted) mt-1">الإشعارات هتظهر هنا لما حد يضيف مصروف</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card
              key={item._id}
              onClick={() => handleClick(item)}
              className={`rounded-2xl cursor-pointer transition-all hover:shadow-sm ${!item.read ? "border-(--color-primary-border) bg-(--color-primary-bg)/20" : "bg-(--color-surface) border-(--color-border)"}`}
            >
              <CardContent className="p-4 flex gap-3">
                <div className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${!item.read ? "bg-(--color-primary)" : "bg-transparent border border-(--color-border)"}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!item.read ? "font-bold text-(--color-dark)" : "font-medium text-(--color-dark)"}`}>{item.title}</p>
                  <p className="text-xs sm:text-sm text-(--color-secondary) mt-1 break-words">{item.body}</p>
                  <p className="text-[11px] text-(--color-muted) mt-2 font-numbers">{timeAgo(item.createdAt)}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteOne.mutate(item._id);
                  }}
                  className="self-start p-2 rounded-xl hover:bg-(--color-hover) text-(--color-muted) hover:text-(--color-error) transition-colors"
                  aria-label="حذف"
                >
                  <Trash2 size={16} />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-xl"
          >
            السابق
          </Button>
          <span className="text-xs text-(--color-muted) font-numbers">
            {page} / {totalPages} — {total} إشعار
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-xl"
          >
            التالي
          </Button>
        </div>
      )}

      {(markRead.isPending || markAll.isPending || deleteOne.isPending) && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-(--color-surface) border border-(--color-border) rounded-full px-4 py-2 shadow-lg flex items-center gap-2 text-xs">
          <Loader2 size={14} className="animate-spin text-(--color-primary)" />
          جاري التحديث...
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
