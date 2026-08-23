import { StickyNote } from "lucide-react";
import NoteCard from "./NoteCard";
import { Card, CardContent } from "@/components/ui/card";

export default function NoteList({
  notes,
  loading,
  currentUser,
  onDelete,
  onReply,
  hasFilters,
}) {
  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="w-8 h-8 border-4 border-(--color-primary) border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-(--color-muted)">جاري تحميل الملاحظات...</p>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <Card className="rounded-2xl border-dashed border-(--color-border) bg-(--color-surface) py-0">
        <CardContent className="text-center py-10">
          <StickyNote className="w-12 h-12 text-(--color-border) mx-auto mb-3" />
          <p className="text-(--color-muted)">
            {hasFilters ? "مفيش ملاحظات بتطابق البحث ده" : "مفيش ملاحظات لسه"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <NoteCard
          key={note._id}
          note={note}
          currentUser={currentUser}
          onDelete={onDelete}
          onReply={onReply}
        />
      ))}
    </div>
  );
}
