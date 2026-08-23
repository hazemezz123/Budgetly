import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import {
  LayoutDashboard,
  Receipt,
  LogOut,
  PlusCircle,
  Banknote,
  User,
  Home,
  Lock,
  Sun,
  Moon,
  StickyNote,
} from "lucide-react";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Navbar Component - Optimized for Mobile & Accessibility
const Navbar = () => {
  const { user, logout } = useAuth();
  const { themeMode, changeThemeMode } = useTheme();
  const location = useLocation();
  const toast = useToast();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const toggleTheme = () => {
    changeThemeMode(themeMode === "dark" ? "light" : "dark");
  };

  if (!user) return null;

  const isActive = (path) => location.pathname === path;
  const isLocked = !user.house;

  const handleLockedLinkClick = (e) => {
    if (isLocked) {
      e.preventDefault();
      toast.error("يرجى اختيار أو إنشاء بيت أولاً");
    }
  };

  return (
    <>
      <nav
        className="md:hidden backdrop-blur-xl border-b px-3 sm:px-6 py-3.5 sm:py-3  px-safe sticky top-0 z-40 shadow-xs font-primary bg-(--color-surface) border-(--color-border)"
        style={{
          paddingLeft: "max(1rem, env(safe-area-inset-left, 0px))",
          paddingRight: "max(1rem, env(safe-area-inset-right, 0px))",
        }}
        role="navigation"
        aria-label="التنقل الرئيسي"
      >
        {/* Skip to main content link */}
        <a href="#main-content" className="skip-link">
          روح للصفحة الرئيسية
        </a>

        {/* Locked Notification */}
        {isLocked && (
          <Card className="mb-2 rounded-lg border border-(--color-status-pending-border) bg-(--color-status-pending-bg) shadow-none py-0 gap-0">
            <CardContent className="flex items-center gap-2 px-3 py-1.5 text-xs text-(--color-status-pending) p-3">
              <Badge
                variant="outline"
                className="border-(--color-status-pending-border) bg-(--color-status-pending-bg) text-(--color-status-pending) p-1 rounded-md h-auto"
              >
                <Lock size={14} />
              </Badge>
              <span>يرجى اختيار بيت للوصول إلى كافة الميزات</span>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between items-center gap-2 sm:gap-3 h-14">
          <div className="flex items-center min-w-0 shrink ps-0 sm:ps-1">
            <img
              src="/assets/logo.png"
              alt="بدجتلي - Budgetly"
              className="w-16 sm:w-20 h-auto dark:invert shrink-0 max-w-full"
              style={{ minWidth: "56px" }}
            />
          </div>

          {/* Header Quick Tools */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Notes Shortcut */}
            <Link
              to="/notes"
              onClick={handleLockedLinkClick}
              className={`p-2.5 rounded-lg sm:rounded-xl min-w-[40px] min-h-[40px] flex items-center justify-center transition-all ${
                isLocked ? "opacity-50 cursor-not-allowed" : ""
              }`}
              style={{
                color: isActive("/notes")
                  ? "var(--color-primary)"
                  : "var(--color-secondary)",
                backgroundColor: isActive("/notes")
                  ? "var(--color-hover)"
                  : "transparent",
              }}
              aria-label="الملاحظات"
              aria-current={isActive("/notes") ? "page" : undefined}
            >
              <StickyNote size={19} aria-hidden="true" />
            </Link>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-10 w-10 min-w-[40px] min-h-[40px] rounded-lg sm:rounded-xl text-(--color-secondary) hover:bg-(--color-hover) hover:text-(--color-primary)"
              aria-label={
                themeMode === "dark" ? "الوضع النهاري" : "الوضع الليلي"
              }
            >
              {themeMode === "dark" ? <Sun size={19} /> : <Moon size={19} />}
            </Button>

            <Link
              to="/profile"
              onClick={handleLockedLinkClick}
              className={`p-2.5 rounded-lg sm:rounded-xl min-w-[40px] min-h-[40px] flex items-center justify-center transition-all ${
                isLocked ? "opacity-50 cursor-not-allowed" : ""
              }`}
              style={{
                color: isActive("/profile")
                  ? "var(--color-primary)"
                  : "var(--color-secondary)",
                backgroundColor: isActive("/profile")
                  ? "var(--color-hover)"
                  : "transparent",
              }}
              aria-label="الملف الشخصي"
              aria-current={isActive("/profile") ? "page" : undefined}
            >
              <User size={19} aria-hidden="true" />
            </Link>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowLogoutModal(true)}
              className="h-10 w-10 min-w-[40px] min-h-[40px] rounded-lg sm:rounded-xl text-(--color-error) hover:bg-(--color-error)/10 hover:text-(--color-error)"
              aria-label="تسجيل الخروج"
            >
              <LogOut size={19} aria-hidden="true" />
            </Button>
          </div>
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <div
          className="md:hidden fixed bottom-0 left-0 right-0 grid grid-cols-5 gap-1.5 sm:gap-1 border-t border-(--color-border) bg-(--color-surface) pb-safe backdrop-blur-xl pt-2 sm:pt-1.5 pb-2 sm:pb-1 z-50 shadow-lg px-1 sm:px-2"
          role="navigation"
          aria-label="التنقل السفلي"
        >
          <Link
            to="/"
            onClick={handleLockedLinkClick}
            className={`w-full min-h-[56px] sm:min-h-[48px] flex flex-col items-center justify-center gap-1 sm:gap-1 py-2.5 sm:py-2 px-1 sm:px-2 rounded-xl transition-all text-xs ${
              isActive("/") ? "text-(--color-primary)" : "text-(--color-muted)"
            } ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
            aria-label="الصفحة الرئيسية"
            aria-current={isActive("/") ? "page" : undefined}
            role="menuitem"
          >
            <LayoutDashboard
              size={22}
              aria-hidden="true"
              className="sm:size-[20px]"
            />
            <span className="text-xs sm:text-[11px] font-semibold">
              الرئيسية
            </span>
          </Link>

          <Link
            to="/expenses"
            onClick={handleLockedLinkClick}
            className={`w-full min-h-[56px] sm:min-h-[48px] flex flex-col items-center justify-center gap-1 sm:gap-1 py-2.5 sm:py-2 px-1 sm:px-2 rounded-xl transition-all text-xs ${
              isActive("/expenses")
                ? "text-(--color-primary)"
                : "text-(--color-muted)"
            } ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
            aria-label="المصاريف"
            aria-current={isActive("/expenses") ? "page" : undefined}
            role="menuitem"
          >
            <Receipt size={22} aria-hidden="true" className="sm:size-[20px]" />
            <span className="text-xs sm:text-[11px] font-semibold">
              المصاريف
            </span>
          </Link>

          <Link
            to="/add-expense"
            onClick={handleLockedLinkClick}
            className={`w-full min-h-[56px] sm:min-h-[48px] flex flex-col items-center justify-center gap-1 sm:gap-0.5 py-1.5 sm:py-1 px-2 rounded-2xl transition-all text-xs bg-(--color-primary) text-(--color-on-fill) ${
              isLocked ? "opacity-50 cursor-not-allowed" : ""
            }`}
            style={{
              boxShadow: isActive("/add-expense")
                ? "0 6px 16px rgba(0, 0, 0, 0.2)"
                : "0 2px 8px rgba(0, 0, 0, 0.14)",
              transform: isActive("/add-expense")
                ? "translateY(-2px)"
                : "translateY(-1px)",
            }}
            aria-label="إضافة مصروف"
            aria-current={isActive("/add-expense") ? "page" : undefined}
            role="menuitem"
          >
            <PlusCircle
              size={22}
              aria-hidden="true"
              className="sm:size-[20px]"
            />
            <span className="text-xs sm:text-[11px] font-bold">إضافة</span>
          </Link>

          <Link
            to={user.role === "admin" ? "/all-invoices" : "/my-invoices"}
            onClick={handleLockedLinkClick}
            className={`w-full min-h-[56px] sm:min-h-[48px] flex flex-col items-center justify-center gap-1 sm:gap-1 py-2.5 sm:py-2 px-1 sm:px-2 rounded-xl transition-all text-xs ${
              isActive("/all-invoices") || isActive("/my-invoices")
                ? "text-(--color-primary)"
                : "text-(--color-muted)"
            } ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
            aria-label="الفواتير"
            aria-current={
              isActive("/all-invoices") || isActive("/my-invoices")
                ? "page"
                : undefined
            }
            role="menuitem"
          >
            <Banknote size={22} aria-hidden="true" className="sm:size-[20px]" />
            <span className="text-xs sm:text-[11px] font-semibold">
              الفواتير
            </span>
          </Link>

          <Link
            to="/house-details"
            onClick={handleLockedLinkClick}
            className={`w-full min-h-[56px] sm:min-h-[48px] flex flex-col items-center justify-center gap-1 sm:gap-1 py-2.5 sm:py-2 px-1 sm:px-2 rounded-xl transition-all text-xs ${
              isActive("/house-details")
                ? "text-(--color-primary)"
                : "text-(--color-muted)"
            } ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
            aria-label="البيت"
            aria-current={isActive("/house-details") ? "page" : undefined}
            role="menuitem"
          >
            <Home size={22} aria-hidden="true" className="sm:size-[20px]" />
            <span className="text-xs sm:text-[11px] font-semibold">البيت</span>
          </Link>
        </div>
      </nav>

      <AlertDialog open={showLogoutModal} onOpenChange={setShowLogoutModal}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تسجيل الخروج</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد أنك تريد تسجيل الخروج؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowLogoutModal(false)}>
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                logout();
                setShowLogoutModal(false);
              }}
              className="bg-(--color-error) text-white hover:bg-(--color-error)/90"
            >
              تسجيل الخروج
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Navbar;
