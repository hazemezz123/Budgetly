import { useState } from "react";
import { Send } from "lucide-react";
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

  return (
    <form onSubmit={handleSubmit} className="relative mb-6">
      <Textarea
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        placeholder="اكتب ملاحظة جديدة..."
        rows={rows}
        style={{ height: `${rows * 1.5}rem` }}
        className="min-h-14 pr-4 pl-12 py-3.5 text-sm sm:text-[15px] bg-(--color-surface) border-(--color-border) rounded-2xl resize-none placeholder:text-(--color-muted)/60 focus-visible:border-(--color-primary) focus-visible:ring-2 focus-visible:ring-(--color-primary)/20 shadow-sm"
      />
      <Button
        type="submit"
        disabled={submitting || !newNote.trim()}
        size="icon"
        className="absolute bottom-2.5 left-2.5 h-9 w-9 rounded-xl  text-white hover:bg-(--color-primary)/90 disabled:opacity-40 shadow-sm"
      >
        {submitting ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <Send size={16} />
        )}
      </Button>
    </form>
  );
}
