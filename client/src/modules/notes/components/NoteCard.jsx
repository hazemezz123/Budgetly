import { Trash2 } from "lucide-react";
import NoteReplySection from "./NoteReplySection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

export default function NoteCard({ note, currentUser, onDelete, onReply }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ar-EG", {
      day: "numeric",
      month: "long",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const isOwnerOrAdmin =
    currentUser.role === "admin" || currentUser.id === note.createdBy?._id;

  return (
    <Card className="rounded-2xl border-(--color-border) bg-(--color-surface) shadow-sm hover:shadow-md transition-all group py-0 gap-0 overflow-hidden">
      <CardContent className="p-4 sm:p-5">
        <div className="flex justify-between items-start gap-2 mb-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-(--color-primary-bg) flex items-center justify-center text-(--color-primary) font-bold text-base sm:text-lg shrink-0">
              {note.createdBy?.name?.charAt(0) || "?"}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-(--color-text) truncate">
                {note.createdBy?.name || "مستخدم غير موجود"}
              </h3>
              <span className="text-[11px] sm:text-xs text-(--color-muted)">
                {formatDate(note.date)}
              </span>
            </div>
          </div>
          {isOwnerOrAdmin && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="min-w-[40px] min-h-[40px] rounded-xl text-(--color-status-rejected) hover:bg-(--color-status-rejected-bg) hover:text-(--color-status-rejected) opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all shrink-0"
                  aria-label="حذف الملاحظة"
                >
                  <Trash2 size={18} />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent dir="rtl">
                <AlertDialogHeader>
                  <AlertDialogTitle>حذف الملاحظة؟</AlertDialogTitle>
                  <AlertDialogDescription>لا يمكن التراجع.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(note._id)}
                    className="bg-(--color-error) text-white hover:bg-(--color-error)/90"
                  >
                    حذف
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        <p className="text-sm sm:text-base text-(--color-text) whitespace-pre-wrap leading-relaxed mb-4 break-words">
          {note.content}
        </p>

        <NoteReplySection note={note} onReply={onReply} />
      </CardContent>
    </Card>
  );
}
