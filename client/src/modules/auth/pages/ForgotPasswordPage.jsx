import { Link } from "react-router-dom";
import { Mail, ArrowRight, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useForgotPassword } from "../hooks";

const ForgotPassword = () => {
  const { email, setEmail, loading, sent, handleSubmit } = useForgotPassword();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-2xl border-(--color-border) bg-(--color-surface) shadow-lg">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-(--color-dark) mb-2">
              نسيت كلمة المرور؟
            </h1>
            <p className="text-(--color-secondary)">
              أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور
            </p>
          </div>

          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={32} />
              </div>
              <h3 className="text-lg font-semibold text-(--color-dark) mb-2">
                تفقّد بريدك الإلكتروني
              </h3>
              <p className="text-(--color-secondary) mb-6">
                لقد أرسلنا رابط إعادة التعيين إلى {email}
              </p>
              <Button asChild variant="link" className="gap-2">
                <Link to="/login">
                  <ArrowRight size={16} />
                  العودة لتسجيل الدخول
                </Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute top-1/2 -translate-y-1/2 right-3 text-(--color-muted) pointer-events-none"
                  />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="h-11 pr-9 text-sm sm:text-base md:text-base rounded-xl bg-(--color-bg) border-(--color-border)"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full min-h-[44px] rounded-xl font-bold"
              >
                {loading ? (
                  <Loader className="animate-spin" size={20} />
                ) : (
                  "إرسال الرابط"
                )}
              </Button>

              <div className="text-center">
                <Button asChild variant="link" size="sm" className="text-(--color-secondary)">
                  <Link to="/login">العودة لتسجيل الدخول</Link>
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
