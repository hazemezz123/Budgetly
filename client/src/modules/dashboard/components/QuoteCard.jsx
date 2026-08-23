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
    <Card className="rounded-lg sm:rounded-2xl border-(--color-border) bg-(--color-surface) shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group font-decorative py-0 gap-0 Quote-Card">
      <CardContent className="p-4 sm:p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 sm:p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Quote size={32} className="sm:w-12 sm:h-12 text-(--color-primary)" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-sm sm:text-lg font-bold text-(--color-primary-text) font-cairo flex items-center gap-1 sm:gap-2 animate-pulse">
              <Quote size={16} className="sm:w-5 sm:h-5" />
              <span>حكمة اليوم</span>
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={getRandomQuote}
              className="p-1.5 sm:p-2 rounded-full hover:bg-(--color-hover) text-(--color-secondary) h-auto w-auto min-w-0 min-h-0"
              title="حكمة تانية"
              aria-label="حكمة تانية"
            >
              <RefreshCw
                size={16}
                className={`sm:w-[18px] sm:h-[18px] ${isAnimating ? "animate-spin" : ""}`}
              />
            </Button>
          </div>

          <div
            className={`min-h-16 sm:min-h-20 flex items-center justify-center transition-opacity duration-300 ${isAnimating ? "opacity-0" : "opacity-100"}`}
          >
            <p className="text-sm sm:text-lg md:text-2xl text-center font-bold text-(--color-dark) font-cairo leading-relaxed">
              &quot;{quote}&quot;
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuoteCard;
