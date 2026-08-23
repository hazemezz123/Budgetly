import { useState } from "react";
import { Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CreateNoteForm({ onAddNote, submitting }) {
  const [newNote, setNewNote] = useState("");

  const calculateRows = (text) => {
    if (!text) return 1;
    const newLines = (text.match(/\n/g) || []).length;
    return Math.min(Math.max(newLines + 1, 1), 6); // Min 1, Max 6 lines
  };

  const rows = calculateRows(newNote);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onAddNote(newNote);
    if (success) {
      setNewNote("");
    }
  };

  return (
    <Card className="rounded-2xl border-(--color-border) bg-(--color-surface) shadow-sm mb-6 sm:mb-8 py-0 gap-0 overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="relative">
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="اكتب ملاحظة جديدة..."
            className="min-h-20 pr-10 text-sm sm:text-base bg-(--color-bg) border-(--color-border) rounded-xl p-3.5 sm:p-4 pl-12 resize-none focus-visible:ring-2 focus-visible:ring-(--color-primary)"
            style={{ height: `${rows * 1.5}rem` }}
            rows={rows}
          />
          <Button
            type="submit"
            disabled={submitting || !newNote.trim()}
            size="icon"
            className="absolute bottom-2 left-2 min-h-[44px] min-w-[44px] rounded-xl bg-(--color-primary) text-white hover:bg-(--color-primary)/90 disabled:opacity-50"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                <Send size={18} />
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
