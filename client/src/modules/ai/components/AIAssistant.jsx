import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  X,
  Bot,
  Sparkles,
  Loader2,
  Calculator,
  History,
  Trash2,
} from "lucide-react";
import api from "../../../utils/api";
import { useToast } from "../../../shared/context/ToastContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const _motion = motion;

const AIAssistant = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "أهلاً يا باشا! 👋 أنا مساعدك الذكي في Budgetly. \nمعاك في أي حسابات، تظبيط ميزانية، أو حتى لو عايز تفضفض عن المصاريف. \nقولي أقدر أساعدك إزاي النهاردة؟ 💸",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const messagesEndRef = useRef(null);
  const toast = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatHistory = async () => {
    try {
      setLoadingHistory(true);
      const { data } = await api.get("/ai/chats");
      setChatHistory(data.chats);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      toast.error("فيه مشكلة في تحميل السجل");
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadPreviousChat = async (chatId) => {
    try {
      setIsLoading(true);
      const { data } = await api.get(`/ai/chats/${chatId}`);
      setMessages(data.chat.messages || []);
      setCurrentChatId(chatId);
      setShowHistory(false);
    } catch (error) {
      console.error("Error loading chat:", error);
      toast.error("فيه مشكلة في تحميل المحادثة");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteChat = async (chatId, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/ai/chats/${chatId}`);
      setChatHistory(chatHistory.filter((c) => c._id !== chatId));
      if (currentChatId === chatId) {
        setMessages([
          {
            role: "assistant",
            content:
              "أهلاً يا باشا! 👋 أنا مساعدك الذكي في Budgetly. \nمعاك في أي حسابات، تظبيط ميزانية، أو حتى لو عايز تفضفض عن المصاريف. \nقولي أقدر أساعدك إزاي النهاردة؟ 💸",
          },
        ]);
        setCurrentChatId(null);
      }
      toast.success("تم حذف المحادثة");
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("فيه مشكلة في حذف المحادثة");
    }
  };

  const startNewChat = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "أهلاً يا باشا! 👋 أنا مساعدك الذكي في Budgetly. \nمعاك في أي حسابات، تظبيط ميزانية، أو حتى لو عايز تفضفض عن المصاريف. \nقولي أقدر أساعدك إزاي النهاردة؟ 💸",
      },
    ]);
    setCurrentChatId(null);
    setShowHistory(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await api.post("/ai/chat", {
        message: userMessage,
        chatId: currentChatId,
      });

      if (response.data.success) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: response.data.response },
        ]);
        if (!currentChatId && response.data.chatId) {
          setCurrentChatId(response.data.chatId);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "معلش يا ريس، حصلت مشكلة صغيرة وأنا بفكر. جرب تاني كده كمان شوية! 😅",
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessage = (content) => {
    return content.split("\n").map((line, i) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <div
          key={i}
          className={`${
            line.trim().startsWith("-") || line.trim().match(/^\d+\./)
              ? "pl-4"
              : "min-h-[1.5em]"
          }`}
        >
          {parts.map((part, j) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return <strong key={j}>{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </div>
      );
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-24 left-4 w-[90vw] sm:w-[400px] h-[600px] max-h-[80vh] bg-(--color-surface) rounded-2xl shadow-2xl border border-(--color-border) flex flex-col z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 flex items-center justify-between text-(--color-primary) shadow-md shrink-0 border-b border-(--color-border) bg-(--color-surface)">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-(--color-primary)/10 rounded-lg">
                <Bot className="w-5 h-5 text-(--color-primary)" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight text-(--color-dark)">
                  Budgetly AI
                </h3>
                <p className="text-xs opacity-70 text-(--color-muted)">
                  Financial Assistant
                </p>
              </div>
            </div>
            <div className="flex gap-1 items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowHistory(!showHistory);
                  if (!showHistory && chatHistory.length === 0) {
                    fetchChatHistory();
                  }
                }}
                title="السجل"
                className="rounded-full"
              >
                <History className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* History Panel */}
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="absolute inset-0 bg-(--color-surface) rounded-2xl z-40 flex flex-col"
            >
              <div className="p-4 border-b border-(--color-border) flex items-center justify-between">
                <h3 className="font-bold text-(--color-dark)">سجل المحادثات</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowHistory(false)}
                  className="h-8 w-8"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <ScrollArea className="flex-1 p-3">
                <div className="space-y-2">
                  <Button
                    onClick={startNewChat}
                    variant="outline"
                    className="w-full justify-start gap-2 bg-(--color-primary)/10 text-(--color-primary) border-(--color-primary)/20 hover:bg-(--color-primary)/20"
                  >
                    + محادثة جديدة
                  </Button>

                  {loadingHistory ? (
                    <div className="text-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-(--color-muted)" />
                    </div>
                  ) : chatHistory.length === 0 ? (
                    <div className="text-center py-8 text-(--color-muted) text-sm">
                      لا توجد محادثات سابقة
                    </div>
                  ) : (
                    chatHistory.map((chat) => (
                      <motion.button
                        key={chat._id}
                        whileHover={{ x: 2 }}
                        onClick={() => loadPreviousChat(chat._id)}
                        className="w-full p-3 text-right bg-(--color-bg) hover:bg-(--color-hover) rounded-lg transition-colors group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-(--color-dark) text-sm truncate">
                              {chat.title}
                            </p>
                            <p className="text-xs text-(--color-muted)">
                              {new Date(chat.createdAt).toLocaleDateString(
                                "ar-EG",
                                {
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={(e) => deleteChat(chat._id, e)}
                            className="opacity-0 group-hover:opacity-100 h-7 w-7 shrink-0 hover:bg-(--color-error)/10 hover:text-(--color-error)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </motion.div>
          )}

          {/* Messages Area */}
          <ScrollArea className="flex-1 bg-(--color-bg)">
            <div className="p-4 space-y-4">
              {messages.map((msg, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={idx}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <Card
                    className={`max-w-[85%] rounded-2xl py-0 gap-0 shadow-sm ${
                      msg.role === "user"
                        ? "bg-(--color-primary) text-white rounded-br-none border-(--color-primary)"
                        : msg.isError
                          ? "bg-(--color-error)/10 text-(--color-error) border border-(--color-error)/30 rounded-bl-none"
                          : "bg-(--color-surface) text-(--color-dark) border border-(--color-border) rounded-bl-none"
                    }`}
                  >
                    <CardContent className="p-3.5">
                      {msg.role === "assistant" && !msg.isError && (
                        <div className="flex items-center gap-2 mb-2 text-xs font-medium text-(--color-primary)">
                          <Sparkles className="w-3 h-3" />
                          AI Assistant
                        </div>
                      )}
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.role === "assistant"
                          ? formatMessage(msg.content)
                          : msg.content}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <Card className="bg-(--color-surface) rounded-2xl rounded-bl-none border border-(--color-border) py-0 gap-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex gap-1.5">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                          className="w-2 h-2 bg-(--color-primary) rounded-full"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{
                            repeat: Infinity,
                            duration: 1,
                            delay: 0.2,
                          }}
                          className="w-2 h-2 bg-(--color-primary) rounded-full"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{
                            repeat: Infinity,
                            duration: 1,
                            delay: 0.4,
                          }}
                          className="w-2 h-2 bg-(--color-primary) rounded-full"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 bg-(--color-surface) border-t border-(--color-border) shrink-0">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="اسألني عن أي حسابات أو نصايح..."
                className="flex-1 h-11 rounded-xl bg-(--color-bg) border-(--color-border) text-sm sm:text-base"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-11 w-11 rounded-xl shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </form>
            <div className="mt-2 text-center">
              <p className="text-[10px] text-(--color-muted) flex items-center justify-center gap-1">
                <Calculator className="w-3 h-3" />
                Powered by Gemini AI • Can make mistakes
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIAssistant;
