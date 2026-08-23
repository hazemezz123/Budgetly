import { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Trash2,
  Sparkles,
  MessageSquare,
  Plus,
  History,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import useAI from "../hooks/useAI";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

const _motion = motion;

const AIPage = () => {
  const { chats, loadingChats, useChat, sendMessage, isSending, deleteChat } =
    useAI();

  const [currentChatId, setCurrentChatId] = useState(null);
  const [input, setInput] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const { data: currentChat } = useChat(currentChatId);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat, isSending]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const userMessage = input.trim();
    setInput("");

    try {
      const response = await sendMessage({
        message: userMessage,
        chatId: currentChatId,
      });
      if (!currentChatId && response?.data?.chatId) {
        setCurrentChatId(response.data.chatId);
      }
    } catch {
      setInput(userMessage);
    }
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setShowHistory(false);
  };

  const displayMessages =
    currentChatId && currentChat ? currentChat.messages : [];

  const historyList = (
    <>
      <div className="p-4 border-b border-(--color-border)">
        <Button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 rounded-xl font-bold"
        >
          <Plus size={20} />
          محادثة جديدة
        </Button>
      </div>

      <div className="flex-1 p-2">
        {loadingChats ? (
          <div className="flex justify-center p-4">
            <Loader2 className="w-5 h-5 animate-spin text-(--color-muted)" />
          </div>
        ) : chats?.length > 0 ? (
          <div className="space-y-2">
            {chats.map((chat) => (
              <div
                key={chat._id}
                role="button"
                tabIndex={0}
                onClick={() => setCurrentChatId(chat._id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setCurrentChatId(chat._id);
                  }
                }}
                className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between group ${
                  currentChatId === chat._id
                    ? "bg-(--color-primary-bg) font-bold"
                    : "hover:bg-(--color-bg) text-(--color-muted)"
                }`}
              >
                <div className="truncate flex-1 text-right text-sm">
                  {chat.title || "محادثة جديدة"}
                </div>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(chat._id);
                    if (currentChatId === chat._id) setCurrentChatId(null);
                  }}
                  className="opacity-0 group-hover:opacity-100 h-7 w-7 shrink-0"
                  aria-label="حذف المحادثة"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-(--color-muted) flex flex-col items-center gap-2 mt-10">
            <MessageSquare size={32} className="opacity-20" />
            <p className="text-sm">مفيش محادثات سابقة</p>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="h-[calc(100vh-100px)] flex gap-4 font-primary max-w-6xl mx-auto p-4">
      {/* Desktop Sidebar - History */}
      <div className="w-1/4 hidden md:flex flex-col bg-(--color-surface) rounded-2xl border border-(--color-border) overflow-hidden">
        {historyList}
      </div>

      {/* Mobile Drawer */}
      <Drawer open={showHistory} onOpenChange={setShowHistory}>
        <DrawerContent dir="rtl" className="h-[70vh]">
          <DrawerHeader>
            <DrawerTitle>السجل</DrawerTitle>
          </DrawerHeader>
          <ScrollArea className="flex-1 p-4">{historyList}</ScrollArea>
        </DrawerContent>
      </Drawer>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-(--color-surface) rounded-2xl border border-(--color-border) shadow-sm overflow-hidden relative">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-3 border-b border-(--color-border) shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHistory(true)}
            className="gap-2"
          >
            <History size={16} />
            السجل
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNewChat}
            aria-label="محادثة جديدة"
          >
            <Plus size={18} />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {!currentChatId && displayMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-(--color-muted) opacity-50 py-16">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                  <Sparkles size={40} className="text-purple-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  أهلاً بيك في المساعد الذكي
                </h2>
                <p>أنا هنا عشان أساعدك تفهم مصاريفك وتظبط ميزانيتك</p>
              </div>
            ) : (
              <AnimatePresence>
                {displayMessages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${
                      msg.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        msg.role === "user"
                          ? "bg-(--color-primary) text-white"
                          : "bg-purple-100 text-purple-600"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <User size={16} />
                      ) : (
                        <Bot size={16} />
                      )}
                    </div>
                    <Card
                      className={`max-w-[80%] rounded-2xl py-0 gap-0 shadow-sm ${
                        msg.role === "user"
                          ? "bg-(--color-primary) text-white rounded-tr-none border-(--color-primary)"
                          : "bg-(--color-bg) text-(--color-dark) rounded-tl-none border-(--color-border)"
                      }`}
                    >
                      <CardContent className="p-4 text-sm leading-relaxed [&_p]:m-0">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                {isSending && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 flex-row"
                  >
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                    <Card className="bg-(--color-bg) text-(--color-muted) rounded-2xl rounded-tl-none border border-(--color-border) py-0 gap-0">
                      <CardContent className="p-4 text-sm">
                        جاري الكتابة...
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 bg-(--color-surface) border-t border-(--color-border) shrink-0">
          <form onSubmit={handleSubmit} className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="اكتب رسالتك هنا..."
                disabled={isSending}
                className="w-full h-11 rounded-2xl bg-(--color-bg) border-(--color-border) pr-4 pl-12 text-sm sm:text-base"
              />
              <Button
                type="submit"
                disabled={!input.trim() || isSending}
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-xl h-8 w-8"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIPage;
