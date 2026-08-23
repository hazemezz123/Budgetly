import { useState } from "react";
import { Mail, Send, User, MessageSquare } from "lucide-react";
import { useAuth } from "../../../shared/context/AuthContext";
import { useToast } from "../../../shared/context/ToastContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const ContactDeveloper = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const text = `رسالة جديدة من تطبيق Budgetly 📱\nالاسم: ${formData.name}\nالإيميل: ${formData.email}\nالموضوع: ${formData.subject}\n----------------\n${formData.message}`;
      const encodedText = encodeURIComponent(text);
      const whatsappUrl = `https://wa.me/201005291205?text=${encodedText}`;

      window.open(whatsappUrl, "_blank");

      toast.success("بيتم تحويلك للواتساب...");

      setFormData({
        name: user?.name || "",
        email: user?.email || "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error(error);
      toast.error("حصلت مشكلة");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto font-primary">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-2xl bg-(--color-primary)/10">
          <Mail className="text-(--color-primary)" size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-(--color-dark)">تواصل مع المطور</h1>
          <p className="text-(--color-secondary) mt-1">
            عندك اقتراح؟ مشكلة؟ أو مجرد عايز تسلم؟ ابعتلنا!
          </p>
        </div>
      </div>

      <Card className="rounded-3xl border-(--color-border) bg-(--color-surface) shadow-lg backdrop-blur-xl">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label htmlFor="contact-name">الاسم</Label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute top-1/2 -translate-y-1/2 right-3 text-(--color-muted) pointer-events-none"
                  />
                  <Input
                    id="contact-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={isSubmitting}
                    className="h-11 pr-9 text-sm sm:text-base md:text-base rounded-xl bg-(--color-bg) border-(--color-border)"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact-email">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute top-1/2 -translate-y-1/2 right-3 text-(--color-muted) pointer-events-none"
                  />
                  <Input
                    id="contact-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    disabled={isSubmitting}
                    className="h-11 pr-9 text-sm sm:text-base md:text-base rounded-xl bg-(--color-bg) border-(--color-border)"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contact-subject">الموضوع</Label>
              <div className="relative">
                <MessageSquare
                  size={16}
                  className="absolute top-1/2 -translate-y-1/2 right-3 text-(--color-muted) pointer-events-none"
                />
                <Input
                  id="contact-subject"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  required
                  disabled={isSubmitting}
                  placeholder="بخصوص..."
                  className="h-11 pr-9 text-sm sm:text-base md:text-base rounded-xl bg-(--color-bg) border-(--color-border)"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="message">الرسالة</Label>
              <Textarea
                id="message"
                rows={5}
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                required
                disabled={isSubmitting}
                placeholder="اكتب رسالتك هنا..."
                className="min-h-32 text-sm sm:text-base md:text-base bg-(--color-bg) border-(--color-border) rounded-xl"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[44px] py-4 rounded-2xl font-bold"
            >
              {isSubmitting ? (
                "جاري الإرسال..."
              ) : (
                <>
                  <Send size={20} />
                  إرسال الرسالة
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactDeveloper;
