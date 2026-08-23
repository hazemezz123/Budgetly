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

import ConfirmModal from "./ConfirmModal";

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
        className="md:hidden backdrop-blur-xl border-b px-4 sm:px-6 py-3 pt-safe px-safe sticky top-0 z-40 shadow-xs font-primary"
        style={{
          backgroundColor: "var(--color-surface)",
          borderColor: "var(--color-border)",
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
          <div
            className="mb-2 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs"
            style={{
              backgroundColor: "var(--color-status-pending-bg)",
              borderColor: "var(--color-status-pending-border)",
              borderWidth: "1px",
              borderStyle: "solid",
              color: "var(--color-status-pending)",
            }}
          >
            <Lock size={14} />
            <span>يرجى اختيار بيت للوصول إلى كافة الميزات</span>
          </div>
        )}

        <div className="flex justify-between items-center gap-3 h-12">
          <div className="flex items-center shrink-0 ps-1">
            <img
              src="/assets/logo.png"
              alt="بدجتلي - Budgetly"
              className="w-20 sm:w-24 h-auto dark:invert shrink-0"
              style={{ minWidth: "80px" }}
            />
          </div>

          {/* Header Quick Tools */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Notes Shortcut */}
            <Link
              to="/notes"
              onClick={handleLockedLinkClick}
              className={`p-2.5 rounded-xl min-w-[40px] min-h-[40px] flex items-center justify-center transition-all ${
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
            >
              <StickyNote size={19} aria-hidden="true" />
            </Link>

            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl min-w-[40px] min-h-[40px] flex items-center justify-center transition-all hover:bg-(--color-hover)"
              style={{ color: "var(--color-secondary)" }}
              aria-label={
                themeMode === "dark" ? "الوضع النهاري" : "الوضع الليلي"
              }
            >
              {themeMode === "dark" ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            <Link
              to="/profile"
              onClick={handleLockedLinkClick}
              className={`p-2.5 rounded-xl min-w-[40px] min-h-[40px] flex items-center justify-center transition-all ${
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

            <button
              onClick={() => setShowLogoutModal(true)}
              className="p-2.5 rounded-xl min-w-[40px] min-h-[40px] flex items-center justify-center transition-all hover:bg-(--color-error)/10"
              style={{ color: "var(--color-error)" }}
              aria-label="تسجيل الخروج"
            >
              <LogOut size={19} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <div
          className="md:hidden fixed bottom-0 left-0 right-0 backdrop-blur-xl border-t pt-1.5 pb-safe z-50 shadow-lg"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
          }}
        >
          <div className="grid grid-cols-5 items-center gap-1 px-2 mb-1.5">
            <Link
              to="/"
              onClick={handleLockedLinkClick}
              className={`w-full min-h-[48px] flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-xl transition-all ${
                isLocked ? "opacity-50 cursor-not-allowed" : ""
              }`}
              style={{
                color: isActive("/")
                  ? "var(--color-primary)"
                  : "var(--color-secondary)",
                backgroundColor: "transparent",
              }}
              aria-label="الصفحة الرئيسية"
              aria-current={isActive("/") ? "page" : undefined}
              role="menuitem"
            >
              <LayoutDashboard size={20} aria-hidden="true" />
              <span className="text-[11px] font-semibold">الرئيسية</span>
            </Link>

            <Link
              to="/expenses"
              onClick={handleLockedLinkClick}
              className={`w-full min-h-[48px] flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-xl transition-all ${
                isLocked ? "opacity-50 cursor-not-allowed" : ""
              }`}
              style={{
                color: isActive("/expenses")
                  ? "var(--color-primary)"
                  : "var(--color-secondary)",
                backgroundColor: "transparent",
              }}
              aria-label="المصاريف"
              aria-current={isActive("/expenses") ? "page" : undefined}
              role="menuitem"
            >
              <Receipt size={20} aria-hidden="true" />
              <span className="text-[11px] font-semibold">المصاريف</span>
            </Link>

            <Link
              to="/add-expense"
              onClick={handleLockedLinkClick}
              className={`w-full min-h-[48px] flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-2xl transition-all ${
                isLocked ? "opacity-50 cursor-not-allowed" : ""
              }`}
              style={{
                color: "var(--color-on-fill)",
                backgroundColor: "var(--color-primary)",
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
              <PlusCircle size={20} aria-hidden="true" />
              <span className="text-[11px] font-bold">إضافة</span>
            </Link>

            <Link
              to={user.role === "admin" ? "/all-invoices" : "/my-invoices"}
              onClick={handleLockedLinkClick}
              className={`w-full min-h-[48px] flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-xl transition-all ${
                isLocked ? "opacity-50 cursor-not-allowed" : ""
              }`}
              style={{
                color:
                  isActive("/all-invoices") || isActive("/my-invoices")
                    ? "var(--color-primary)"
                    : "var(--color-secondary)",
                backgroundColor: "transparent",
              }}
              aria-label="الفواتير"
              aria-current={
                isActive("/all-invoices") || isActive("/my-invoices")
                  ? "page"
                  : undefined
              }
              role="menuitem"
            >
              <Banknote size={20} aria-hidden="true" />
              <span className="text-[11px] font-semibold">الفواتير</span>
            </Link>

            <Link
              to="/house-details"
              onClick={handleLockedLinkClick}
              className={`w-full min-h-[48px] flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-xl transition-all ${
                isLocked ? "opacity-50 cursor-not-allowed" : ""
              }`}
              style={{
                color: isActive("/house-details")
                  ? "var(--color-primary)"
                  : "var(--color-secondary)",
                backgroundColor: "transparent",
              }}
              aria-label="البيت"
              aria-current={isActive("/house-details") ? "page" : undefined}
              role="menuitem"
            >
              <Home size={20} aria-hidden="true" />
              <span className="text-[11px] font-semibold">البيت</span>
            </Link>
          </div>
        </div>
      </nav>

      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          logout();
          setShowLogoutModal(false);
        }}
        title="تسجيل الخروج"
        message="هل أنت متأكد أنك تريد تسجيل الخروج؟"
        type="danger"
      />
    </>
  );
};

export default Navbar;
