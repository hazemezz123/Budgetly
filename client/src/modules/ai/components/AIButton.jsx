import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, Sparkles } from "lucide-react";
import AIAssistant from "./AIAssistant";
import { Button } from "@/components/ui/button";

const _motion = motion;

const AIButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 left-6 z-50 hidden lg:flex flex-col items-end gap-2">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => setIsOpen(!isOpen)}
            size="icon"
            className={`relative group flex items-center justify-center w-14 h-14 rounded-full shadow-lg shadow-(--color-primary)/30 transition-all duration-300 ${
              isOpen
                ? "bg-(--color-surface) text-(--color-primary) rotate-90 border border-(--color-border)"
                : "bg-(--color-primary) text-white hover:bg-(--color-primary)/90"
            }`}
            aria-label={isOpen ? "إغلاق المساعد" : "فتح المساعد"}
          >
            {!isOpen && (
              <span className="absolute inline-flex h-full w-full rounded-full bg-(--color-primary) opacity-20 animate-ping" />
            )}
            <span className="relative z-10">
              {isOpen ? (
                <Sparkles className="w-6 h-6" />
              ) : (
                <Bot className="w-7 h-7" />
              )}
            </span>
          </Button>
        </motion.div>
      </div>

      <AIAssistant isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default AIButton;
