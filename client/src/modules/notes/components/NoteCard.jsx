import { Trash2 } from "lucide-react";
import NoteReplySection from "./NoteReplySection";

export default function NoteCard({ note, currentUser, onDelete, onReply }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ar-EG", {
      day: "numeric",
      month: "long",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleDelete = () => {
    // Confirmation moved to component level or hook? The original had it in component.
    // Hook handles update, but confirmation is UI.
    if (window.confirm("متأكد أنك عايز تحذف الملاحظة دي؟")) {
      onDelete(note._id);
    }
  };

  const isOwnerOrAdmin =
    currentUser.role === "admin" || currentUser.id === note.createdBy?._id;

  return (
    <div className="bg-(--color-surface) rounded-2xl p-4 sm:p-5 shadow-sm border border-(--color-border) hover:shadow-md transition-all group min-w-0">
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
          <button
            onClick={handleDelete}
            className="min-w-[40px] min-h-[40px] p-2 text-(--color-status-rejected) hover:bg-(--color-status-rejected-bg) rounded-xl flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all shrink-0"
            title="حذف الملاحظة"
            aria-label="حذف الملاحظة"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
      <p className="text-sm sm:text-base text-(--color-text) whitespace-pre-wrap leading-relaxed mb-4 break-words">
        {note.content}
      </p>

      <NoteReplySection note={note} onReply={onReply} />
    </div>
  );
}
