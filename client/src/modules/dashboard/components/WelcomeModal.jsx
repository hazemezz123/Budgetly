import { useEffect, useState } from "react";
import { ExternalLink, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const dialogClasses =
  "top-auto bottom-0 left-0 right-0 translate-x-0 translate-y-0 " +
  "max-w-none w-full rounded-t-3xl rounded-b-none border-b-0 sm:border-b p-0 gap-0 " +
  "sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:-translate-y-1/2 " +
  "sm:max-w-lg sm:w-full sm:rounded-3xl bg-(--color-surface) max-h-[85vh] sm:max-h-[90vh] flex flex-col overflow-hidden";

const WelcomeModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("hasSeenWelcome", "true");
  };

  const handleStartGuide = () => {
    handleClose();
    navigate("/guide");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className={dialogClasses} dir="rtl" showCloseButton={false}>
        <div className="sm:hidden pt-1 pb-2 flex justify-center shrink-0">
          <div className="w-10 h-1.5 rounded-full bg-(--color-border)" />
        </div>

        <DialogTitle id="welcome-title" className="sr-only">
          أهلاً بيك في Budgetly! 👋
        </DialogTitle>
        <DialogDescription className="sr-only">
          دليل ترحيبي لشرح مميزات Budgetly وكيفية إدارة الميزانية.
        </DialogDescription>

        <div className="p-5 sm:p-6 flex flex-col overflow-hidden">
          <div className="text-center pt-2 sm:pt-4">
            <div className="mx-auto bg-(--color-primary)/10 w-20 h-20 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="text-(--color-primary) w-10 h-10" />
            </div>

            <h2
              id="welcome-title-visible"
              className="text-xl sm:text-2xl font-bold text-(--color-dark) mb-3"
            >
              أهلاً بيك في Budgetly! 👋
            </h2>

            <p className="text-sm sm:text-base text-(--color-secondary) mb-6 sm:mb-8 leading-relaxed">
              مبسوطين إنك انضميت لينا. عشان تستفيد أقصى استفادة من الموقع، عملنا
              دليل سريع يشرحلك كل المميزات وازاي تدير ميزانيتك بسهولة.
            </p>

            <div className="space-y-3 pb-safe">
              <Button
                onClick={handleStartGuide}
                className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <span>ابدأ الجولة التعريفية</span>
                <ExternalLink size={18} />
              </Button>

              <Button
                variant="ghost"
                onClick={handleClose}
                className="w-full min-h-[44px] py-3 px-6 rounded-2xl font-medium text-(--color-secondary) hover:bg-black/5"
              >
                لا شكراً، هكتشف بنفسي
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;
