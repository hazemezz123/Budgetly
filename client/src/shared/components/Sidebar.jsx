import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
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
  Bell,
} from "lucide-react";
import { useUnreadCount } from "../../modules/notifications/hooks/useNotifications";
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

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { themeMode, changeThemeMode } = useTheme();

  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { data: unreadData } = useUnreadCount(Boolean(user?.house));
  const unreadCount = unreadData?.count ?? 0;

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
          path: "/notifications",
          label: "الإشعارات",
          icon: Bell,
          roles: ["admin", "user"],
        },
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
      className={`hidden md:flex flex-col h-screen sticky top-0 border-l z-40 select-none transition-all duration-300 ease-in-out bg-(--color-surface) border-(--color-border) ${
        collapsed ? "w-20 overflow-visible" : "w-64 overflow-hidden"
      }`}
    >
      {/* Header / Logo */}
      <div
        className={`p-4 flex items-center border-b border-(--color-border) transition-all duration-300 ease-in-out ${
          collapsed ? "justify-center" : "justify-between"
        }`}
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
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-10 w-10 rounded-xl text-(--color-secondary) hover:bg-(--color-hover) hover:text-(--color-primary) shrink-0"
          aria-label={collapsed ? "توسيع القائمة" : "طي القائمة"}
          title={collapsed ? "توسيع القائمة" : "طي القائمة"}
        >
          <ChevronRight
            size={20}
            className={`transition-transform duration-300 ease-in-out ${
              collapsed ? "rotate-180" : "rotate-0"
            }`}
          />
        </Button>
      </div>

      <div
        className={`flex-1 py-4 custom-scrollbar space-y-4 transition-all duration-300 ease-in-out ${
          collapsed
            ? "overflow-visible px-2"
            : "overflow-y-auto overflow-x-hidden px-3"
        }`}
      >
        {isLocked && (
          <Card
            className={`rounded-lg border border-(--color-status-pending-border) bg-(--color-status-pending-bg) shadow-none py-0 gap-0 overflow-hidden transition-all duration-300 ease-in-out ${
              collapsed
                ? "max-h-0 opacity-0 mb-0 py-0 border-0"
                : "max-h-20 opacity-100 mb-4"
            }`}
          >
            <CardContent className="flex items-center gap-2 px-3 py-2 text-xs text-(--color-status-pending) p-3">
              <Badge
                variant="outline"
                className="border-(--color-status-pending-border) bg-(--color-status-pending-bg) text-(--color-status-pending) p-1 rounded-md h-auto"
              >
                <Lock size={14} className="shrink-0" />
              </Badge>
              <span className="whitespace-nowrap">انضم لبيت أولاً</span>
            </CardContent>
          </Card>
        )}

        {navGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            <h3
              className={`px-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out text-(--color-muted) ${
                collapsed
                  ? "opacity-0 max-h-0 mb-0 py-0"
                  : "opacity-100 max-h-8 mb-2"
              }`}
            >
              {group.title}
            </h3>
            {groupIndex > 0 && (
              <div
                className={`mx-auto border-t border-(--color-border) transition-all duration-300 ease-in-out ${
                  collapsed
                    ? "opacity-100 w-8 my-3"
                    : "opacity-0 w-0 my-0 border-transparent"
                }`}
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
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center rounded-xl transition-all duration-300 ease-in-out group relative ${
                      collapsed
                        ? "justify-center h-11 w-11 mx-auto px-0 py-0"
                        : "gap-3 px-3 py-2.5 w-full"
                    } ${itemLocked ? "opacity-50 cursor-not-allowed" : ""} ${
                      active
                        ? "bg-(--color-primary) text-(--color-on-fill)"
                        : "text-(--color-secondary) hover:bg-(--color-hover) hover:text-(--color-primary)"
                    }`}
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

                    {item.path === "/notifications" && unreadCount > 0 && !collapsed && (
                      <span
                        className={`ms-auto min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full text-[11px] font-bold font-numbers shrink-0 ${
                          active
                            ? "bg-white text-(--color-primary)"
                            : "bg-(--color-primary) text-white"
                        }`}
                      >
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}

                    {item.path === "/notifications" && unreadCount > 0 && collapsed && (
                      <span className="absolute -top-1 -left-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full text-[10px] font-bold bg-(--color-primary) text-white border-2 border-(--color-surface) font-numbers">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}

                    {collapsed && (
                      <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 hidden group-hover:block whitespace-nowrap rounded-lg bg-(--color-surface) border border-(--color-border) px-3 py-1.5 text-xs shadow-lg z-50 pointer-events-none">
                        <div className="flex items-center gap-1.5">
                          {itemLocked && (
                            <Lock
                              size={12}
                              className="text-(--color-status-pending) shrink-0"
                            />
                          )}
                          <span>{item.label}</span>
                          {itemLocked && (
                            <span className="text-[10px] text-(--color-muted) font-normal">
                              (مقفل)
                            </span>
                          )}
                        </div>
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
        className={`border-t border-(--color-border) relative transition-all duration-300 ease-in-out ${
          collapsed ? "p-3" : "p-4"
        }`}
      >
        <div
          className={`flex transition-all duration-300 ease-in-out ${
            collapsed
              ? "flex-col gap-3 items-center justify-center"
              : "flex-row items-center justify-between"
          }`}
        >
          {/* Theme Toggle */}
          <div className="relative group flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-10 w-10 rounded-xl text-(--color-secondary) hover:bg-(--color-hover) hover:text-(--color-primary)"
              aria-label={
                themeMode === "dark" ? "الوضع النهاري" : "الوضع الليلي"
              }
              title={
                !collapsed
                  ? themeMode === "dark"
                    ? "الوضع النهاري"
                    : "الوضع الليلي"
                  : undefined
              }
            >
              {themeMode === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
            {collapsed && (
              <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 hidden group-hover:block whitespace-nowrap rounded-lg bg-(--color-surface) border border-(--color-border) px-3 py-1.5 text-xs shadow-lg z-50 pointer-events-none">
                {themeMode === "dark" ? "الوضع النهاري" : "الوضع الليلي"}
              </div>
            )}
          </div>

          {/* User Info (Expanded only) */}
          {!collapsed && (
            <div className="flex flex-col items-end whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out">
              <span className="text-sm font-semibold text-(--color-dark)">
                {user.name}
              </span>
              <span className="text-xs text-(--color-muted)">
                {user.role === "admin" ? "مشرف" : "عضو"}
              </span>
            </div>
          )}

          {/* Logout */}
          <div className="relative group flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowLogoutModal(true)}
              className="h-10 w-10 rounded-xl text-(--color-error) hover:bg-(--color-error)/10 hover:text-(--color-error)"
              aria-label="تسجيل الخروج"
              title={!collapsed ? "تسجيل الخروج" : undefined}
            >
              <LogOut size={20} />
            </Button>
            {collapsed && (
              <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 hidden group-hover:block whitespace-nowrap rounded-lg bg-(--color-surface) border border-(--color-border) px-3 py-1.5 text-xs shadow-lg z-50 pointer-events-none">
                تسجيل الخروج
              </div>
            )}
          </div>
        </div>
      </div>

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
              onClick={handleLogoutConfirmation}
              className="bg-(--color-error) text-white hover:bg-(--color-error)/90"
            >
              تسجيل الخروج
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  );
};

export default Sidebar;
