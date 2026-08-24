import { useState } from "react";
import { ArrowUp } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function CreateNoteForm({ onAddNote, submitting }) {
  const [newNote, setNewNote] = useState("");

  const calculateRows = (text) => {
    if (!text) return 1;
    const newLines = (text.match(/\n/g) || []).length;
    return Math.min(Math.max(newLines + 1, 1), 5);
  };

  const rows = calculateRows(newNote);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newNote.trim() || submitting) return;
    const success = await onAddNote(newNote);
    if (success) setNewNote("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const hasText = newNote.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="relative mb-6">
      <Textarea
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="اكتب ملاحظة جديدة..."
        rows={rows}
        style={{ height: `${rows * 1.35}rem` }}
        className="min-h-11 max-h-28 pr-4 pl-11 py-2.5 text-sm bg-(--color-surface) border-(--color-border) rounded-[22px] resize-none placeholder:text-(--color-muted)/50 focus-visible:border-(--color-border) focus-visible:ring-1 focus-visible:ring-(--color-border) shadow-sm leading-5"
      />
      <Button
        type="submit"
        disabled={submitting || !hasText}
        size="icon"
        className={`absolute bottom-1.5 left-1.5 h-8 w-8 rounded-full shadow-none transition-colors ${
          hasText
            ? "bg-(--color-primary) text-white hover:bg-(--color-primary)/90"
            : "bg-transparent text-(--color-muted) hover:bg-(--color-hover) hover:text-(--color-muted)"
        } disabled:opacity-100 disabled:pointer-events-none`}
      >
        {submitting ? (
          <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
        ) : (
          <ArrowUp size={16} strokeWidth={2.5} />
        )}
      </Button>
    </form>
  );
}
