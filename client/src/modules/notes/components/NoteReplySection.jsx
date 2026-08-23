import { useState } from "react";
import { Send, MessageCircle, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function NoteReplySection({ note, onReply }) {
  const [replyingTo, setReplyingTo] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ar-EG", {
      day: "numeric",
      month: "long",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleSubmit = async () => {
    const success = await onReply(note._id, replyContent);
    if (success) {
      setReplyContent("");
      setReplyingTo(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-(--color-border)">
      {note.replies?.length > 0 && (
        <div className="space-y-3 mb-4 ps-4 border-s-2 border-(--color-border)">
          {note.replies.map((reply) => (
            <div key={reply._id} className="text-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-(--color-text)">
                  {reply.createdBy?.name}
                </span>
                <span className="text-xs text-(--color-muted)">
                  {formatDate(reply.createdAt)}
                </span>
              </div>
              <p className="text-(--color-muted) whitespace-pre-wrap">
                {reply.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Reply Input */}
      {replyingTo ? (
        <div className="flex gap-2">
          <Input
            type="text"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="اكتب ردك هنا..."
            autoFocus
            className="flex-1 h-10 bg-(--color-bg) border-(--color-border) rounded-xl text-sm focus-visible:ring-1 focus-visible:ring-(--color-primary)"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <Button
            onClick={handleSubmit}
            disabled={!replyContent.trim()}
            size="icon"
            className="shrink-0 rounded-xl bg-(--color-primary) text-white hover:bg-(--color-primary)/90 disabled:opacity-50"
          >
            <Send size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setReplyingTo(false);
              setReplyContent("");
            }}
            className="shrink-0 rounded-xl text-(--color-muted) hover:bg-(--color-bg)"
            aria-label="إلغاء"
          >
            <X size={16} />
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          onClick={() => setReplyingTo(true)}
          className="gap-2 text-sm text-(--color-muted) hover:text-(--color-primary) h-auto p-1"
        >
          <MessageCircle size={16} />
          <span>رد على الملاحظة</span>
        </Button>
      )}
    </div>
  );
}
