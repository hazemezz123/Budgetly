import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Lock, Loader, CheckCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useResetPassword } from "../hooks";

const ResetPassword = () => {
  const { token } = useParams();
  const {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    success,
    handleSubmit,
  } = useResetPassword(token);
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-2xl border-(--color-border) bg-(--color-surface) shadow-lg">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-(--color-dark) mb-2">
              إعادة تعيين كلمة المرور
            </h1>
            {!success && (
              <p className="text-(--color-secondary)">
                أدخل كلمة المرور الجديدة
              </p>
            )}
          </div>

          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-lg font-semibold text-(--color-dark) mb-2">
                تم التغيير بنجاح!
              </h3>
              <p className="text-(--color-secondary) mb-6">
                سيتم توجيهك إلى صفحة تسجيل الدخول...
              </p>
              <Button asChild variant="link">
                <Link to="/login">الذهاب لتسجيل الدخول الآن</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <Label htmlFor="password">كلمة المرور الجديدة</Label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute top-1/2 -translate-y-1/2 right-3 text-(--color-muted) pointer-events-none"
                  />
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="******"
                    required
                    minLength={6}
                    className="h-11 pr-9 pl-10 text-sm sm:text-base md:text-base rounded-xl bg-(--color-bg) border-(--color-border)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute top-1/2 -translate-y-1/2 left-3 text-(--color-muted) hover:text-(--color-primary)"
                    tabIndex={-1}
                    aria-label={showPw ? "إخفاء" : "إظهار"}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute top-1/2 -translate-y-1/2 right-3 text-(--color-muted) pointer-events-none"
                  />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPw ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="******"
                    required
                    minLength={6}
                    className="h-11 pr-9 pl-10 text-sm sm:text-base md:text-base rounded-xl bg-(--color-bg) border-(--color-border)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute top-1/2 -translate-y-1/2 left-3 text-(--color-muted) hover:text-(--color-primary)"
                    tabIndex={-1}
                    aria-label={showConfirmPw ? "إخفاء" : "إظهار"}
                  >
                    {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
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
                  "تغيير كلمة المرور"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
