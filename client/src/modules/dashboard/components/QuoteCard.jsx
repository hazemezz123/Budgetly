import { useState, useEffect } from "react";
import { Quote, RefreshCw } from "lucide-react";
import { egyptianQuotes } from "../../../utils/quotes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const QuoteCard = () => {
  const [quote, setQuote] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  const getRandomQuote = () => {
    setIsAnimating(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * egyptianQuotes.length);
      setQuote(egyptianQuotes[randomIndex]);
      setIsAnimating(false);
    }, 300);
  };

  useEffect(() => {
    getRandomQuote();
    const interval = setInterval(getRandomQuote, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="rounded-2xl border-(--color-border) bg-(--color-surface) shadow-xs hover:shadow-sm transition-all duration-200 relative overflow-hidden group py-0 gap-0 Quote-Card">
      <CardContent className="p-3 sm:p-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
          <Quote size={24} className="text-(--color-primary)" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <h3 className="text-xs font-bold text-(--color-primary-text) font-cairo flex items-center gap-1.5">
              <Quote size={13} aria-hidden="true" />
              <span>حكمة اليوم</span>
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={getRandomQuote}
              className="p-1 rounded-full hover:bg-(--color-hover) text-(--color-secondary) h-7 w-7 min-w-0 min-h-0"
              title="حكمة تانية"
              aria-label="حكمة تانية"
            >
              <RefreshCw
                size={13}
                className={`${isAnimating ? "animate-spin" : ""}`}
              />
            </Button>
          </div>

          <div
            className={`min-h-8 sm:min-h-10 flex items-center justify-center transition-opacity duration-300 ${isAnimating ? "opacity-0" : "opacity-100"}`}
          >
            <p className="text-xs sm:text-sm text-center font-medium text-(--color-secondary) font-cairo leading-relaxed">
              &quot;{quote}&quot;
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuoteCard;
