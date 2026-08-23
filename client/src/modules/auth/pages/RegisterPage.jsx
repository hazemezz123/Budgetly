import { useState } from "react";
import { Link } from "react-router-dom";
import { User, AtSign, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard, GoogleSignInButton } from "../components";
import { useRegister } from "../hooks";

const Register = () => {
  const { formData, handleChange, error, loading, handleRegister } =
    useRegister();
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const footerLink = (
    <p className="text-ios-secondary">
      لديك حساب بالفعل؟{" "}
      <Link
        to="/login"
        className="text-ios-primary-text hover:underline font-semibold transition-colors"
      >
        تسجيل الدخول
      </Link>
    </p>
  );

  const confirmMismatch =
    formData.confirmPassword &&
    formData.password !== formData.confirmPassword;
  const confirmMatch =
    formData.confirmPassword &&
    formData.password === formData.confirmPassword;

  return (
    <AuthCard
      title="إنشاء حساب جديد"
      subtitle="أنشئ حسابك للبدء في إدارة ميزانيتك"
      error={error}
      loading={loading}
      loadingText="جاري التسجيل..."
      footer={footerLink}
    >
      <form onSubmit={handleRegister} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="name">الاسم الكامل</Label>
          <div className="relative">
            <User
              size={16}
              className="absolute top-1/2 -translate-y-1/2 right-3 text-(--color-muted) pointer-events-none"
            />
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="أدخل اسمك الكامل"
              disabled={loading}
              required
              className="h-11 pr-9 text-sm sm:text-base md:text-base rounded-xl bg-(--color-bg) border-(--color-border)"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <div className="relative">
            <Mail
              size={16}
              className="absolute top-1/2 -translate-y-1/2 right-3 text-(--color-muted) pointer-events-none"
            />
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              disabled={loading}
              required
              className="h-11 pr-9 text-sm sm:text-base md:text-base rounded-xl bg-(--color-bg) border-(--color-border)"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="username">اسم المستخدم</Label>
          <div className="relative">
            <AtSign
              size={16}
              className="absolute top-1/2 -translate-y-1/2 right-3 text-(--color-muted) pointer-events-none"
            />
            <Input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="اختر اسم مستخدم"
              disabled={loading}
              required
              className="h-11 pr-9 text-sm sm:text-base md:text-base rounded-xl bg-(--color-bg) border-(--color-border)"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">كلمة المرور</Label>
          <div className="relative">
            <Lock
              size={16}
              className="absolute top-1/2 -translate-y-1/2 right-3 text-(--color-muted) pointer-events-none"
            />
            <Input
              id="password"
              name="password"
              type={showPw ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder="أدخل كلمة مرور قوية"
              disabled={loading}
              required
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
          <p className="text-xs text-(--color-muted)">يجب أن تكون 6 أحرف على الأقل</p>
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
              name="confirmPassword"
              type={showConfirmPw ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="أعد إدخال كلمة المرور"
              disabled={loading}
              required
              className="h-11 pr-9 pl-10 text-sm sm:text-base md:text-base rounded-xl bg-(--color-bg) border-(--color-border)"
              aria-invalid={confirmMismatch ? "true" : "false"}
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
          {confirmMismatch ? (
            <p className="text-xs text-(--color-error)">كلمات المرور غير متطابقة</p>
          ) : confirmMatch ? (
            <p className="text-xs text-(--color-success)">كلمات المرور متطابقة</p>
          ) : null}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full min-h-[44px] py-4 rounded-2xl font-bold"
        >
          {loading ? "جاري التسجيل..." : "إنشاء الحساب"}
        </Button>
      </form>
      <GoogleSignInButton />
    </AuthCard>
  );
};
export default Register;
