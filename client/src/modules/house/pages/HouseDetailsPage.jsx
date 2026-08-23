import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../shared/context/AuthContext";
import {
  Users,
  Settings,
  LogOut,
  Trash2,
  Shield,
  Key,
  Home,
  UserX,
  Copy,
  CheckCheck,
  Download,
  FileSpreadsheet,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { RoleRotationSettings } from "../components";
import { useHouse } from "../hooks";

const tabTriggerCls =
  "min-h-[44px] rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 data-[state=active]:bg-(--color-primary) data-[state=active]:text-(--color-on-fill) dark:data-[state=active]:bg-(--color-primary) dark:data-[state=active]:text-(--color-on-fill) dark:data-[state=active]:border-transparent";

const HouseDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const userId = user?.id || user?._id;

  const houseId =
    id || (typeof user?.house === "object" ? user?.house?._id : user?.house);

  const {
    house,
    loading,
    error,
    updateName,
    updatePassword,
    removeMember,
    leaveHouse,
    deleteHouse,
    clearAllData,
    exportData,
    isUpdatingName,
    isUpdatingPassword,
    isClearingData,
  } = useHouse(houseId);

  const [activeTab, setActiveTab] = useState("members");

  // Edit Name State
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  // Edit Password State
  const [editingPassword, setEditingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  // Modals State
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showClearDataModal, setShowClearDataModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);

  // Copy ID State
  const [copiedId, setCopiedId] = useState(false);

  // Initialize newName when house is loaded
  useEffect(() => {
    if (house) {
      setNewName(house.name);
    }
  }, [house]);

  const isAdmin = house?.admin?._id === userId;

  const handleCopyId = () => {
    navigator.clipboard.writeText(house._id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) return;
    try {
      await updateName(newName.trim());
      setEditingName(false);
    } catch {
      // Handled in hook
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword.trim()) return;
    try {
      await updatePassword(newPassword.trim());
      setEditingPassword(false);
      setNewPassword("");
    } catch {
      // Handled in hook
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    try {
      await removeMember(memberToRemove._id);
      setMemberToRemove(null);
    } catch {
      // Handled in hook
    }
  };

  const handleLeaveHouse = async () => {
    try {
      await leaveHouse();
    } catch {
      // Handled in hook
    }
  };

  const handleDeleteHouse = async () => {
    try {
      await deleteHouse();
    } catch {
      // Handled in hook
    }
  };

  const handleClearAllData = async () => {
    try {
      await clearAllData();
      setShowClearDataModal(false);
    } catch {
      // Handled in hook
    }
  };

  const handleExport = async (type) => {
    await exportData(type);
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] w-full p-8">
        <div className="relative">
          <div className="absolute inset-0 bg-(--color-primary)/20 blur-xl rounded-full animate-pulse" />
          <Loader2 className="w-12 h-12 text-(--color-primary) animate-spin relative z-10" />
        </div>
        <p className="mt-4 text-(--color-muted) font-medium animate-pulse">
          بنحمّل تفاصيل البيت...
        </p>
      </div>
    );

  if (error || !house) {
    return (
      <div className="text-center py-20 text-red-500">
        مش قادرين نحمل تفاصيل البيت حالياً
      </div>
    );
  }

  return (
    <div className="pb-8 px-3 sm:px-4 max-w-4xl mx-auto font-primary">
      {/* Header */}
      <div className="bg-(--color-surface) rounded-2xl p-3 sm:p-6 shadow-sm border border-(--color-border) mb-6 relative">
        <div className="flex flex-row items-start justify-between gap-2 sm:gap-4 mb-4">
          <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1 pl-7 sm:pl-0">
            <div className="p-2 sm:p-3 bg-(--color-primary)/10 rounded-lg sm:rounded-xl shrink-0">
              <Home className="text-(--color-primary) size-5 sm:size-8" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-2xl font-bold text-(--color-dark) break-words leading-tight">
                {house.name}
              </h1>
              <button
                type="button"
                className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm text-(--color-muted) cursor-pointer hover:text-(--color-primary) transition-colors break-all text-start"
                onClick={handleCopyId}
                title="نسخ كود البيت"
              >
                <span className="leading-relaxed">ID: {house._id}</span>
                {copiedId ? (
                  <CheckCheck size={12} className="sm:size-[14px] shrink-0" />
                ) : (
                  <Copy size={12} className="sm:size-[14px] shrink-0" />
                )}
              </button>
            </div>
          </div>
          {isAdmin && (
            <div className="absolute top-2.5 left-2.5 sm:static flex gap-2 shrink-0 self-start">
              <button
                onClick={() => {
                  setNewName(house.name);
                  setEditingName(true);
                }}
                className="p-1.5 sm:p-2 hover:bg-(--color-bg) rounded-lg sm:rounded-xl transition-colors text-(--color-primary) shrink-0 bg-(--color-surface) sm:bg-transparent border border-(--color-border) sm:border-0 shadow-sm sm:shadow-none"
                title="تعديل الاسم"
              >
                <Settings size={16} className="sm:size-[20px]" />
              </button>
            </div>
          )}
        </div>

        {/* Edit Name Form */}
        {editingName && (
          <div className="mb-4 p-4 bg-(--color-bg) rounded-xl border border-(--color-border)">
            <h3 className="font-bold mb-3 text-sm">تغيير اسم البيت</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="اسم البيت الجديد"
                className="flex-1 h-11 rounded-xl bg-(--color-bg) border-(--color-border) text-sm sm:text-base"
              />
              <Button
                onClick={handleUpdateName}
                disabled={isUpdatingName}
                className="min-h-[44px] px-4 py-2.5 rounded-xl font-bold flex-1 sm:flex-none"
              >
                {isUpdatingName ? "حفظ..." : "حفظ"}
              </Button>
              <Button
                onClick={() => setEditingName(false)}
                variant="outline"
                className="min-h-[44px] px-4 py-2.5 rounded-xl font-bold flex-1 sm:flex-none bg-(--color-surface)"
              >
                إلغاء
              </Button>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="p-4 bg-(--color-bg) rounded-xl text-center">
            <p className="text-(--color-muted) text-sm mb-1">الأعضاء</p>
            <p className="text-2xl font-bold text-(--color-dark)">
              {house.members.length}
            </p>
          </div>
          <div className="p-4 bg-(--color-bg) rounded-xl text-center">
            <p className="text-(--color-muted) text-sm mb-1">الأدمن</p>
            <p className="font-bold text-(--color-primary-text)">
              {house.admin.name}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList
          className={`w-full group-data-[orientation=horizontal]/tabs:h-auto p-1 rounded-xl border border-(--color-border) bg-(--color-surface) grid ${
            isAdmin ? "grid-cols-3" : "grid-cols-2"
          }`}
        >
          <TabsTrigger value="members" className={tabTriggerCls}>
            <Users size={16} className="sm:size-[18px]" />
            <span>الأعضاء</span>
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="settings" className={tabTriggerCls}>
              <Settings size={16} className="sm:size-[18px]" />
              <span>إعدادات</span>
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger value="rotation" className={tabTriggerCls}>
              <RotateCcw size={16} className="sm:size-[18px]" />
              <span>المهام</span>
            </TabsTrigger>
          )}
        </TabsList>
      </Tabs>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === "members" && (
          <div className="space-y-3">
            {house.members.map((member) => (
              <div
                key={member._id}
                className="flex items-center justify-between gap-3 p-4 bg-(--color-surface) rounded-xl border border-(--color-border) shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    {member.profilePicture ? (
                      <img
                        src={`/profiles/${member.profilePicture}`}
                        alt={member.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-(--color-border)"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-(--color-primary)/10 flex items-center justify-center text-(--color-primary-text) font-bold text-lg border-2 border-(--color-primary)/20">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {house.admin._id === member._id && (
                      <div className="absolute -bottom-1 -right-1 bg-(--color-warning) text-white p-1 rounded-full shadow-sm">
                        <Shield size={10} fill="currentColor" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-(--color-dark) break-words">
                      {member.name}
                      {userId === member._id && (
                        <span className="text-xs text-(--color-muted) mr-2">
                          (أنت)
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-(--color-muted) break-all">
                      @{member.username}
                    </p>
                  </div>
                </div>

                {isAdmin && member._id !== userId && (
                  <Button
                    onClick={() => setMemberToRemove(member)}
                    variant="ghost"
                    size="icon"
                    className="shrink-0 p-2 text-(--color-error) hover:text-(--color-error) hover:bg-(--color-error)/10 rounded-lg"
                    title="حذف العضو"
                    aria-label="حذف العضو"
                  >
                    <UserX size={20} />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === "settings" && isAdmin && (
          <div className="space-y-6">
            {/* Change Password */}
            <div className="bg-(--color-surface) p-4 sm:p-6 rounded-2xl border border-(--color-border) shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-(--color-primary)/10 text-(--color-primary) rounded-lg">
                  <Key size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-(--color-dark)">
                    باسوورد البيت
                  </h3>
                  <p className="text-xs text-(--color-muted)">
                    تغيير الباسوورد المستخدم للانضمام للبيت
                  </p>
                </div>
              </div>

              {editingPassword ? (
                <div className="space-y-3">
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="الباسوورد الجديد"
                    className="h-11 rounded-xl bg-(--color-bg) border-(--color-border) text-sm sm:text-base"
                  />
                  <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
                    <Button
                      onClick={() => setEditingPassword(false)}
                      variant="ghost"
                      className="min-h-[44px] px-4 py-2 text-sm font-bold rounded-xl"
                    >
                      إلغاء
                    </Button>
                    <Button
                      onClick={handleUpdatePassword}
                      disabled={isUpdatingPassword}
                      className="min-h-[44px] px-4 py-2 text-sm font-bold rounded-xl shadow-md hover:shadow-lg"
                    >
                      {isUpdatingPassword
                        ? "جاري التغيير..."
                        : "تغيير الباسوورد"}
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setEditingPassword(true)}
                  className="w-full py-3 border-2 border-dashed border-(--color-border) rounded-xl text-(--color-muted) font-bold hover:border-(--color-primary) hover:text-(--color-primary) transition-all"
                >
                  تغيير الباسوورد
                </button>
              )}
            </div>

            {/* Data Export Section */}
            <div className="bg-(--color-surface) p-4 sm:p-6 rounded-2xl border border-(--color-border) shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-(--color-success)/10 text-(--color-success) rounded-lg">
                  <Download size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-(--color-dark)">
                    تصدير البيانات
                  </h3>
                  <p className="text-xs text-(--color-muted)">
                    تحميل البيانات كملف CSV
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  onClick={() => handleExport("expenses")}
                  variant="outline"
                  className="flex items-center justify-center gap-2 min-h-[44px] py-3 border-2 border-dashed rounded-xl text-(--color-secondary) font-bold hover:border-(--color-success) hover:text-(--color-success)"
                >
                  <FileSpreadsheet size={18} />
                  تصدير المصاريف
                </Button>
                <Button
                  onClick={() => handleExport("invoices")}
                  variant="outline"
                  className="flex items-center justify-center gap-2 min-h-[44px] py-3 border-2 border-dashed rounded-xl text-(--color-secondary) font-bold hover:border-(--color-success) hover:text-(--color-success)"
                >
                  <FileSpreadsheet size={18} />
                  تصدير الفواتير
                </Button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-(--color-surface) p-4 sm:p-6 rounded-2xl border border-(--color-error)/30 shadow-sm">
              <h3 className="font-bold text-(--color-error) mb-4 flex items-center gap-2">
                <div className="p-2 bg-(--color-error)/10 text-(--color-error) rounded-lg">
                  <AlertTriangle size={20} />
                </div>
                منطقة الخطر
              </h3>

              <div className="flex flex-col gap-3">
                {/* Clear All Data */}
                <Button
                  onClick={() => setShowClearDataModal(true)}
                  disabled={isClearingData}
                  variant="outline"
                  className="flex items-center justify-between p-4 h-auto min-h-[44px] rounded-xl border-(--color-warning) text-(--color-warning) shadow-sm group"
                >
                  <div className="text-right">
                    <span className="font-bold block">مسح كل البيانات</span>
                    <span className="text-xs opacity-75">
                      حذف جميع المصاريف والفواتير
                    </span>
                  </div>
                  <Trash2
                    size={20}
                    className="group-hover:scale-110 transition-transform"
                  />
                </Button>

                {/* Delete House */}
                <Button
                  onClick={() => setShowDeleteModal(true)}
                  variant="outline"
                  className="flex items-center justify-between p-4 h-auto min-h-[44px] rounded-xl border-(--color-error) text-(--color-error) shadow-sm group"
                >
                  <div className="text-right">
                    <span className="font-bold block">حذف البيت بالكامل</span>
                    <span className="text-xs opacity-75">
                      إجراء نهائي لا يمكن التراجع عنه
                    </span>
                  </div>
                  <Trash2
                    size={20}
                    className="group-hover:scale-110 transition-transform"
                  />
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "rotation" && isAdmin && (
          <RoleRotationSettings
            houseId={houseId}
            members={house?.members || []}
            isAdmin={isAdmin}
          />
        )}
      </div>

      {/* Leave House Button (Visible to everyone) */}
      <div className="mt-8 pt-6 border-t border-(--color-border)">
        <Button
          onClick={() => setShowLeaveModal(true)}
          variant="outline"
          className="w-full min-h-[44px] flex items-center justify-center gap-2 py-3 text-(--color-error) hover:text-(--color-error) hover:bg-(--color-error)/10 font-bold rounded-xl"
        >
          <LogOut size={20} />
          مغادرة البيت
        </Button>
      </div>

      {/* Modals */}
      <AlertDialog
        open={!!memberToRemove}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
      >
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف عضو</AlertDialogTitle>
            <AlertDialogDescription>
              {`متأكد إنك عايز تحذف ${memberToRemove?.name} من البيت؟`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMemberToRemove(null)}>
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveMember}>حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showLeaveModal} onOpenChange={setShowLeaveModal}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>مغادرة البيت</AlertDialogTitle>
            <AlertDialogDescription>
              متأكد إنك عايز تخرج من البيت ده؟ مش هتقدر تشوف المصاريف تاني.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeaveHouse}>مغادرة</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف البيت</AlertDialogTitle>
            <AlertDialogDescription>
              تحذير: الإجراء ده نهائي! كل البيانات والمصاريف هتتحذف تماماً ومحدش
              هيقدر يرجعها. متأكد؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteHouse}>
              حذف نهائي
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showClearDataModal} onOpenChange={setShowClearDataModal}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>مسح كل البيانات</AlertDialogTitle>
            <AlertDialogDescription>
              هيتم حذف كل المصاريف والفواتير والمدفوعات. البيت والأعضاء هيفضلوا زي
              ما هم. متأكد؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAllData}>
              مسح البيانات
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default HouseDetails;
