import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import ConfirmModal from "./ConfirmModal";
import {
  LayoutDashboard,
  Receipt,
  LogOut,
  Banknote,
  BarChart3,
  User,
  Info,
  Home,
  Lock,
  StickyNote,
  ChevronRight,
  Mail,
  Sun,
  Moon,
} from "lucide-react";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { themeMode, changeThemeMode } = useTheme();

  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  if (!user) return null;

  const isActive = (path) => location.pathname === path;
  const isLocked = !user.house; // Check if user has no house

  const navGroups = [
    {
      title: "الرئيسية",
      items: [
        {
          path: "/",
          label: "لوحة التحكم",
          icon: LayoutDashboard,
          roles: ["admin", "user"],
        },
        {
          path: "/house-details",
          label: "تفاصيل البيت",
          icon: Home,
          roles: ["admin", "user"],
        },
      ],
    },
    {
      title: "المالية",
      items: [
        {
          path: "/expenses",
          label: "المصاريف",
          icon: Receipt,
          roles: ["admin", "user"],
        },
        {
          path: user.role === "admin" ? "/all-invoices" : "/my-invoices",
          label: "الفواتير",
          icon: Banknote,
          roles: ["admin", "user"],
        },
        {
          path: "/analytics",
          label: "التقارير والإحصائيات",
          icon: BarChart3,
          roles: ["admin"],
        },
      ],
    },
    {
      title: "الأدوات",
      items: [
        {
          path: "/notes",
          label: "الملاحظات",
          icon: StickyNote,
          roles: ["admin", "user"],
        },
      ],
    },
    {
      title: "الحساب",
      items: [
        {
          path: "/profile",
          label: "الملف الشخصي",
          icon: User,
          roles: ["admin", "user"],
        },
        {
          path: "/contact",
          label: "تواصل معنا",
          icon: Mail,
          roles: ["admin", "user"],
        },
        {
          path: "/about",
          label: "عن التطبيق",
          icon: Info,
          roles: ["admin", "user"],
        },
      ],
    },
  ];

  const handleLogoutConfirmation = () => {
    logout();
    setShowLogoutModal(false);
  };

  const toggleTheme = () => {
    changeThemeMode(themeMode === "dark" ? "light" : "dark");
  };

  return (
    <aside
      className={`hidden md:flex flex-col h-screen sticky top-0 border-l z-40 select-none overflow-hidden transition-all duration-300 ease-in-out ${
        collapsed ? "w-20" : "w-64"
      }`}
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Header / Logo */}
      <div
        className={`p-4 flex items-center border-b transition-all duration-300 ease-in-out ${
          collapsed ? "justify-center" : "justify-between"
        }`}
        style={{ borderColor: "var(--color-border)" }}
      >
        <div
          className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ease-in-out ${
            collapsed
              ? "opacity-0 max-w-0 pointer-events-none"
              : "opacity-100 max-w-xs"
          }`}
        >
          <img
            src="/assets/logo.png"
            alt="Budgetly"
            className="h-14 dark:invert transition-all shrink-0"
          />
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2.5 rounded-xl hover:bg-(--color-hover) transition-colors hover:text-(--color-primary) text-(--color-secondary) cursor-pointer shrink-0"
          title={collapsed ? "توسيع القائمة" : "طي القائمة"}
        >
          <ChevronRight
            size={20}
            className={`transition-transform duration-300 ease-in-out ${
              collapsed ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>
      </div>

      <div
        className={`flex-1 py-4 custom-scrollbar space-y-4 transition-all duration-300 ease-in-out ${
          collapsed
            ? "overflow-visible px-2"
            : "overflow-y-auto overflow-x-hidden px-3"
        }`}
      >
        {isLocked && (
          <div
            className={`px-3 py-2 rounded-lg flex items-center gap-2 text-xs overflow-hidden transition-all duration-300 ease-in-out ${
              collapsed
                ? "max-h-0 opacity-0 mb-0 py-0 border-0"
                : "max-h-20 opacity-100 mb-4 py-2"
            }`}
            style={{
              backgroundColor: "var(--color-status-pending-bg)",
              color: "var(--color-status-pending)",
              borderColor: "var(--color-status-pending-border)",
            }}
          >
            <Lock size={14} className="shrink-0" />
            <span className="whitespace-nowrap">انضم لبيت أولاً</span>
          </div>
        )}

        {navGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            <h3
              className={`px-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
                collapsed
                  ? "opacity-0 max-h-0 mb-0 py-0"
                  : "opacity-100 max-h-8 mb-2"
              }`}
              style={{ color: "var(--color-muted)" }}
            >
              {group.title}
            </h3>
            {groupIndex > 0 && (
              <div
                className={`mx-auto border-t transition-all duration-300 ease-in-out ${
                  collapsed
                    ? "opacity-100 w-8 my-3"
                    : "opacity-0 w-0 my-0 border-transparent"
                }`}
                style={{ borderColor: "var(--color-border)" }}
              />
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                if (item.roles && !item.roles.includes(user.role)) return null;

                const active = isActive(item.path);
                const itemLocked =
                  isLocked &&
                  item.path !== "/profile" &&
                  item.path !== "/house-selection";

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center rounded-xl transition-all duration-300 ease-in-out group relative ${
                      collapsed
                        ? "justify-center h-11 w-11 mx-auto px-0 py-0"
                        : "gap-3 px-3 py-2.5 w-full"
                    } ${itemLocked ? "opacity-50 cursor-not-allowed" : ""}`}
                    style={{
                      backgroundColor: active
                        ? "var(--color-primary)"
                        : "transparent",
                      color: active
                        ? "var(--color-on-fill)"
                        : "var(--color-secondary)",
                    }}
                    onClick={(e) => {
                      if (itemLocked) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <item.icon
                      size={20}
                      className={`${
                        active
                          ? "text-(--color-on-fill)"
                          : "text-(--color-secondary) group-hover:text-(--color-primary)"
                      } transition-colors shrink-0`}
                    />

                    <span
                      className={`font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
                        collapsed
                          ? "opacity-0 max-w-0 pointer-events-none"
                          : "opacity-100 max-w-xs"
                      } ${
                        active
                          ? "text-(--color-on-fill)"
                          : "text-(--color-dark)"
                      }`}
                    >
                      {item.label}
                    </span>

                    {collapsed && (
                      <div className="absolute right-full top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 dark:bg-gray-800 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50 pointer-events-none mr-2.5 shadow-xl border border-gray-700/50 flex items-center gap-1.5">
                        {itemLocked && <Lock size={12} className="text-amber-400" />}
                        <span>{item.label}</span>
                        {itemLocked && (
                          <span className="text-[10px] text-amber-300 font-normal">
                            (مقفل)
                          </span>
                        )}
                        <div className="absolute top-1/2 -translate-y-1/2 -right-1 border-y-4 border-y-transparent border-l-4 border-l-gray-900 dark:border-l-gray-800" />
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer / User Tools */}
      <div
        className="p-4 border-t relative"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div
          className={`flex transition-all duration-300 ease-in-out ${
            collapsed
              ? "flex-col gap-3 items-center"
              : "flex-row items-center justify-between"
          }`}
        >
          {/* Theme Toggle */}
          <div className="relative group">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl hover:bg-(--color-hover) transition-colors text-(--color-secondary) cursor-pointer flex items-center justify-center"
              title={!collapsed ? (themeMode === "dark" ? "الوضع النهاري" : "الوضع الليلي") : undefined}
            >
              {themeMode === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {collapsed && (
              <div className="absolute right-full top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 dark:bg-gray-800 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50 pointer-events-none mr-2.5 shadow-xl border border-gray-700/50">
                {themeMode === "dark" ? "الوضع النهاري" : "الوضع الليلي"}
                <div className="absolute top-1/2 -translate-y-1/2 -right-1 border-y-4 border-y-transparent border-l-4 border-l-gray-900 dark:border-l-gray-800" />
              </div>
            )}
          </div>

          {/* User Info (Expanded only) */}
          <div
            className={`flex flex-col items-end whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
              collapsed
                ? "opacity-0 max-w-0 pointer-events-none"
                : "opacity-100 max-w-xs"
            }`}
          >
            <span className="text-sm font-semibold text-(--color-dark)">
              {user.name}
            </span>
            <span className="text-xs text-(--color-muted)">
              {user.role === "admin" ? "مشرف" : "عضو"}
            </span>
          </div>

          {/* Logout */}
          <div className="relative group">
            <button
              onClick={() => setShowLogoutModal(true)}
              className="p-2.5 rounded-xl hover:bg-(--color-error)/10 cursor-pointer text-(--color-error) transition-colors flex items-center justify-center"
              title={!collapsed ? "تسجيل الخروج" : undefined}
            >
              <LogOut size={20} />
            </button>
            {collapsed && (
              <div className="absolute right-full top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 dark:bg-gray-800 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50 pointer-events-none mr-2.5 shadow-xl border border-gray-700/50">
                تسجيل الخروج
                <div className="absolute top-1/2 -translate-y-1/2 -right-1 border-y-4 border-y-transparent border-l-4 border-l-gray-900 dark:border-l-gray-800" />
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirmation}
        title="تسجيل الخروج"
        message="هل أنت متأكد أنك تريد تسجيل الخروج؟"
        type="danger"
      />
    </aside>
  );
};

export default Sidebar;
