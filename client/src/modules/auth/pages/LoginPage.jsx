import { useState } from "react";
import { Link } from "react-router-dom";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard, GoogleSignInButton } from "../components";
import { useLogin } from "../hooks";

// صفحة تسجيل الدخول - محسّنة للإتاحة
const Login = () => {
  const {
    username,
    setUsername,
    password,
    setPassword,
    error,
    loading,
    handleLogin,
  } = useLogin();
  const [showPw, setShowPw] = useState(false);

  const footerLink = (
    <p className="text-ios-secondary">
      معندكش حساب؟{" "}
      <Link
        to="/register"
        className="text-ios-primary-text hover:underline font-semibold transition-colors"
      >
        سجل دلوقتي
      </Link>
    </p>
  );

  return (
    <AuthCard
      subtitle="اسهل طريقة عشان تتابع فيها مصاريف السكن"
      error={error}
      loading={loading}
      loadingText="بندخلك اهو اصبر شوية..."
      footer={footerLink}
    >
      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="username">اسم المستخدم</Label>
          <div className="relative">
            <User
              size={16}
              className="absolute top-1/2 -translate-y-1/2 right-3 text-(--color-muted) pointer-events-none"
            />
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="h-11 pr-9 text-sm sm:text-base md:text-base rounded-xl bg-(--color-bg) border-(--color-border)"
              aria-invalid={error ? "true" : "false"}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">الباسورد</Label>
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
              required
              autoComplete="current-password"
              className="h-11 pr-9 pl-10 text-sm sm:text-base md:text-base rounded-xl bg-(--color-bg) border-(--color-border)"
              aria-invalid={error ? "true" : "false"}
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

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-[var(--color-primary-text)] hover:text-[var(--color-primary-text)]/80 transition-colors"
          >
            نسيت كلمة المرور؟
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full min-h-[44px] py-4 rounded-2xl font-bold"
          aria-label="دخول التطبيق"
        >
          ادخل
        </Button>
      </form>
      <GoogleSignInButton />
    </AuthCard>
  );
};

export default Login;
