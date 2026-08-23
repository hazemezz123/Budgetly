import { useState } from "react";
import { useAuth } from "../../../shared/context/AuthContext";
import { useToast } from "../../../shared/context/ToastContext";
import {
  User,
  Mail,
  Shield,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  Edit,
} from "lucide-react";
import { Loader } from "../../../shared/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import useProfile from "../hooks/useProfile";

// Available profile pictures
const availableAvatars = [
  "botttsNeutral-1763768541507.png",
  "botttsNeutral-1763768546369.png",
  "botttsNeutral-1763768550746.png",
  "botttsNeutral-1763768560012.png",
  "botttsNeutral-1763768565019.png",
  "botttsNeutral-1763768569238.png",
  "botttsNeutral-1763768572840.png",
  "botttsNeutral-1763768577274.png",
  "botttsNeutral-1763768581968.png",
  "botttsNeutral-1763768586146.png",
  "botttsNeutral-1763768589940.png",
  "botttsNeutral-1763768594623.png",
  "botttsNeutral-1763768601505.png",
  "botttsNeutral-1763768605149.png",
  "botttsNeutral-1763768608769.png",
  "botttsNeutral-1763768613011.png",
  "botttsNeutral-1763768617031.png",
  "botttsNeutral-1763768621235.png",
  "botttsNeutral-1763768624817.png",
  "botttsNeutral-1763768628084.png",
];

// Bottom sheet on phones, centered dialog on desktop — single Radix Dialog,
// positioned responsively.
const avatarDialogClasses =
  "top-auto bottom-0 left-0 right-0 translate-x-0 translate-y-0 " +
  "max-w-none w-full rounded-t-3xl rounded-b-none border-b-0 p-4 pb-6 pt-3 sm:p-6 " +
  "sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:-translate-y-1/2 " +
  "sm:max-w-lg sm:w-full sm:rounded-b-3xl sm:rounded-t-3xl";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const {
    stats,
    loadingStats,
    updateAvatar,
    updateUsername,
    updateName,
    updateEmail,
    isUpdatingUsername,
    isUpdatingName,
    isUpdatingEmail,
  } = useProfile(user, updateUser);

  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(
    user.profilePicture || null
  );

  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(user.username || "");

  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user.name || "");

  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState(user.email || "");

  const handleSaveAvatar = async () => {
    await updateAvatar(selectedAvatar);
    setShowAvatarModal(false);
  };

  const handleSaveUsername = async () => {
    // Validation
    if (!newUsername || newUsername.trim() === "") {
      toast.warning("اليوزرنيم مينفعش يكون فاضي");
      return;
    }

    if (newUsername.trim() === user.username) {
      setEditingUsername(false);
      return;
    }

    try {
      await updateUsername(newUsername.trim());
      setEditingUsername(false);
    } catch {
      // Error handled in hook
    }
  };

  const handleCancelEdit = () => {
    setNewUsername(user.username);
    setEditingUsername(false);
  };

  const handleSaveName = async () => {
    // Validation
    if (!newName || newName.trim() === "") {
      toast.warning("الاسم مينفعش يكون فاضي");
      return;
    }

    if (newName.trim() === user.name) {
      setEditingName(false);
      return;
    }

    try {
      await updateName(newName.trim());
      setEditingName(false);
    } catch {
      // Error handled in hook
    }
  };

  const handleCancelNameEdit = () => {
    setNewName(user.name);
    setEditingName(false);
  };

  const handleSaveEmail = async () => {
    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newEmail || !emailRegex.test(newEmail)) {
      toast.warning("من فضلك أدخل بريد إلكتروني صحيح");
      return;
    }

    if (newEmail.trim() === user.email) {
      setEditingEmail(false);
      return;
    }

    try {
      await updateEmail(newEmail.trim());
      setEditingEmail(false);
    } catch {
      // Error handled in hook
    }
  };

  const handleCancelEmailEdit = () => {
    setNewEmail(user.email || "");
    setEditingEmail(false);
  };

  if (loadingStats) return <Loader text="بنحمّل بياناتك..." />;

  // Safely handle missing stats
  if (!stats) return null;

  return (
    <div className="pb-8 px-3 sm:px-4 max-w-4xl mx-auto font-primary">
      {/* Header */}
      <div className="flex items-start sm:items-center gap-3 mb-6 sm:mb-8">
        <div className="p-2.5 sm:p-3 rounded-2xl border bg-(--color-surface) border-(--color-border)">
          <User className="w-6 h-6 sm:w-8 sm:h-8 text-(--color-primary)" />
        </div>
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-(--color-dark)">
            الملف الشخصي
          </h1>
          <p className="text-xs sm:text-sm text-(--color-secondary)">
            شوف معلوماتك وإحصائياتك
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="backdrop-blur-xl p-4 sm:p-8 rounded-3xl shadow-lg mb-6 bg-(--color-surface) border border-(--color-border)">
        {/* Avatar and Name */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-6">
          <div className="relative self-center sm:self-auto">
            {user.profilePicture ? (
              <img
                src={`/profiles/${user.profilePicture}`}
                alt={user.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full shadow-lg object-cover border-[3px] border-(--color-primary)"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-3xl sm:text-4xl font-bold text-white shadow-lg bg-[linear-gradient(135deg,var(--color-primary)_0%,var(--color-info)_100%)]">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <button
              onClick={() => setShowAvatarModal(true)}
              className="absolute bottom-0 right-0 p-2 rounded-full shadow-lg transition-all hover:scale-110 bg-(--color-primary) text-(--color-on-fill) cursor-pointer"
              aria-label="تغيير صورة الملف الشخصي"
            >
              <Edit size={14} />
            </button>
          </div>
          <div className="flex-1 min-w-0 w-full">
            {/* Editable Name */}
            <div className="flex items-center gap-2 mb-2 sm:mb-1.5">
              {editingName ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 w-full">
                  <Input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="الاسم"
                    disabled={isUpdatingName}
                    className="flex-1 h-10 text-sm sm:text-base md:text-base rounded-xl"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveName}
                      disabled={isUpdatingName}
                      size="sm"
                      className="min-h-[44px] flex-1 sm:flex-none px-4 bg-(--color-success) text-white hover:bg-(--color-success)/90"
                    >
                      {isUpdatingName ? "..." : "حفظ"}
                    </Button>
                    <Button
                      onClick={handleCancelNameEdit}
                      disabled={isUpdatingName}
                      size="sm"
                      variant="outline"
                      className="min-h-[44px] flex-1 sm:flex-none px-4"
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 min-w-0">
                  <h2 className="text-lg sm:text-2xl font-bold break-words text-(--color-dark)">
                    {user.name}
                  </h2>
                  <button
                    onClick={() => setEditingName(true)}
                    className="p-1.5 rounded-lg hover:bg-(--color-hover) transition-all text-(--color-primary) cursor-pointer shrink-0"
                    title="تعديل الاسم"
                    aria-label="تعديل الاسم"
                  >
                    <Edit size={15} />
                  </button>
                </div>
              )}
            </div>
            {/* Editable Email */}
            <div className="flex items-start gap-2 mb-2">
              <Mail
                size={15}
                className="mt-1 shrink-0 text-(--color-secondary)"
              />
              {editingEmail ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-0">
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="example@mail.com"
                    disabled={isUpdatingEmail}
                    className="flex-1 h-10 text-sm sm:text-base md:text-base rounded-xl dir-ltr text-left"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveEmail}
                      disabled={isUpdatingEmail}
                      size="sm"
                      className="min-h-[44px] flex-1 sm:flex-none px-4 bg-(--color-success) text-white hover:bg-(--color-success)/90"
                    >
                      {isUpdatingEmail ? "..." : "حفظ"}
                    </Button>
                    <Button
                      onClick={handleCancelEmailEdit}
                      disabled={isUpdatingEmail}
                      size="sm"
                      variant="outline"
                      className="min-h-[44px] flex-1 sm:flex-none px-4"
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start sm:items-center gap-2 min-w-0">
                  <span
                    className={`${
                      !user.email ? "italic text-(--color-error)" : "text-(--color-secondary)"
                    } text-xs sm:text-sm break-all`}
                  >
                    {user.email || "أضف بريدك الإلكتروني لاسترجاع الباسورد"}
                  </span>
                  <button
                    onClick={() => setEditingEmail(true)}
                    className="p-1.5 rounded-lg hover:bg-(--color-hover) transition-all text-(--color-primary) cursor-pointer shrink-0"
                    title="تعديل البريد الإلكتروني"
                    aria-label="تعديل البريد الإلكتروني"
                  >
                    <Edit size={13} />
                  </button>
                </div>
              )}
            </div>
            {/* Editable Username */}
            <div className="flex items-start gap-2 mb-2">
              <User
                size={15}
                className="mt-1 shrink-0 text-(--color-secondary)"
              />
              {editingUsername ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-0">
                  <Input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="اليوزرنيم"
                    disabled={isUpdatingUsername}
                    className="flex-1 h-10 text-sm sm:text-base md:text-base rounded-xl"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveUsername}
                      disabled={isUpdatingUsername}
                      size="sm"
                      className="min-h-[44px] flex-1 sm:flex-none px-4 bg-(--color-success) text-white hover:bg-(--color-success)/90"
                    >
                      {isUpdatingUsername ? "..." : "حفظ"}
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      disabled={isUpdatingUsername}
                      size="sm"
                      variant="outline"
                      className="min-h-[44px] flex-1 sm:flex-none px-4"
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start sm:items-center gap-2 min-w-0">
                  <span className="break-all text-xs sm:text-sm text-(--color-secondary)">
                    @{user.username}
                  </span>
                  <button
                    onClick={() => setEditingUsername(true)}
                    className="p-1.5 rounded-lg hover:bg-(--color-hover) transition-all text-(--color-primary) cursor-pointer shrink-0"
                    title="تعديل اليوزرنيم"
                    aria-label="تعديل اليوزرنيم"
                  >
                    <Edit size={13} />
                  </button>
                </div>
              )}
            </div>
            <Badge
              variant="outline"
              className={cn(
                "rounded-full gap-1.5 mt-2 text-[11px] sm:text-xs",
                user.role === "admin"
                  ? "bg-(--color-status-pending-bg) text-(--color-status-pending) border-(--color-status-pending-border)"
                  : "bg-(--color-primary-bg) text-(--color-primary-text) border-(--color-primary-border)"
              )}
            >
              {user.role === "admin" ? (
                <>
                  <Shield size={12} />
                  أدمن
                </>
              ) : (
                <>
                  <User size={12} />
                  عضو
                </>
              )}
            </Badge>
          </div>
        </div>

        {/* User Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-(--color-border)">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-(--color-bg)">
            <Calendar className="w-5 h-5 shrink-0 text-(--color-primary)" />
            <div className="min-w-0">
              <p className="text-xs text-(--color-secondary)">عضو من</p>
              <p className="font-semibold text-sm sm:text-base text-(--color-dark)">
                {new Date(user.createdAt).toLocaleDateString("ar-EG", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-(--color-bg)">
            <DollarSign
              className={cn(
                "w-5 h-5 shrink-0",
                stats.balance < 0 ? "text-(--color-error)" : "text-(--color-success)"
              )}
            />
            <div className="min-w-0">
              <p className="text-xs text-(--color-secondary)">الرصيد الحالي</p>
              <p
                className={cn(
                  "font-semibold text-base sm:text-lg font-numbers",
                  stats.balance < 0
                    ? "text-(--color-error-text)"
                    : "text-(--color-success-text)"
                )}
              >
                {stats.balance < 0
                  ? `عليك ${Math.abs(stats.balance).toFixed(2)}`
                  : stats.balance > 0
                  ? `ليك ${stats.balance.toFixed(2)}`
                  : "0.00"}{" "}
                جنيه
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="p-4 sm:p-5 rounded-2xl bg-(--color-surface) border border-(--color-border)">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-(--color-error)" />
            <p className="text-xs sm:text-sm text-(--color-secondary)">إجمالي المصاريف</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-(--color-dark) font-numbers">
            {stats.totalOwed.toFixed(2)}
          </p>
          <p className="text-xs text-(--color-muted)">جنيه</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-(--color-surface) border border-(--color-border)">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={16} className="text-(--color-success)" />
            <p className="text-xs sm:text-sm text-(--color-secondary)">إجمالي المدفوع</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-(--color-dark) font-numbers">
            {stats.totalPaid.toFixed(2)}
          </p>
          <p className="text-xs text-(--color-muted)">جنيه</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-(--color-surface) border border-(--color-border)">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-(--color-info)" />
            <p className="text-xs sm:text-sm text-(--color-secondary)">عدد المصاريف</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-(--color-dark) font-numbers">
            {stats.expensesCount}
          </p>
          <p className="text-xs text-(--color-muted)">مصروف</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-(--color-surface) border border-(--color-border)">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={16} className="text-(--color-primary)" />
            <p className="text-xs sm:text-sm text-(--color-secondary)">عدد الدفعات</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-(--color-dark) font-numbers">
            {stats.paymentsCount}
          </p>
          <p className="text-xs text-(--color-muted)">دفعة</p>
        </div>
      </div>

      {/* Payments Status */}
      <div className="backdrop-blur-xl p-4 sm:p-6 rounded-3xl shadow-lg bg-(--color-surface) border border-(--color-border)">
        <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-(--color-dark)">
          حالة الدفعات
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 rounded-xl bg-(--color-bg)">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-(--color-status-pending)" />
              <p className="text-xs sm:text-sm font-semibold text-(--color-secondary)">
                دفعات منتظرة
              </p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-(--color-status-pending) font-numbers">
              {stats.pendingPayments}
            </p>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-(--color-bg)">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={16} className="text-(--color-status-approved)" />
              <p className="text-xs sm:text-sm font-semibold text-(--color-secondary)">
                دفعات موافق عليها
              </p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-(--color-status-approved) font-numbers">
              {stats.approvedPayments}
            </p>
          </div>
        </div>
      </div>

      {/* Avatar Selector — bottom sheet on mobile, centered dialog on desktop */}
      <Dialog open={showAvatarModal} onOpenChange={setShowAvatarModal}>
        <DialogContent className={avatarDialogClasses}>
          {/* Mobile drag-handle indicator */}
          <div className="sm:hidden absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1.5 rounded-full bg-(--color-border)" />
          <DialogTitle className="text-base sm:text-2xl font-bold text-(--color-dark) mt-3 sm:mt-0">
            اختر صورة الملف الشخصي
          </DialogTitle>
          <DialogDescription className="sr-only">
            اختار من الصور المتاحة تحت دي وصورتك الجديدة هتتحفظ
          </DialogDescription>

          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 sm:gap-3 max-h-[50vh] overflow-y-auto custom-scrollbar p-1">
            {availableAvatars.map((avatar) => (
              <button
                key={avatar}
                type="button"
                onClick={() => setSelectedAvatar(avatar)}
                className={cn(
                  "cursor-pointer transition-all hover:scale-105 p-1 rounded-2xl border-2 bg-transparent",
                  selectedAvatar === avatar
                    ? "border-(--color-primary)"
                    : "border-transparent"
                )}
                aria-pressed={selectedAvatar === avatar}
                aria-label={`صورة ${availableAvatars.indexOf(avatar) + 1}`}
              >
                <img
                  src={`/profiles/${avatar}`}
                  alt=""
                  className="w-full aspect-square rounded-xl object-cover"
                />
              </button>
            ))}
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3">
            <Button
              onClick={handleSaveAvatar}
              className="flex-1 min-h-[44px] rounded-2xl font-bold"
            >
              احفظ
            </Button>
            <Button
              onClick={() => setShowAvatarModal(false)}
              variant="outline"
              className="flex-1 min-h-[44px] rounded-2xl font-bold"
            >
              إلغاء
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
