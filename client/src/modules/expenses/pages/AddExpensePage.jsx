import { PlusCircle, Check, FileText, Coins } from "lucide-react";
import { Loader } from "../../../shared/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddExpense } from "../hooks";

// Shared classes for the native selects on this page (compact mobile ramp).
// Native selects keep the system wheel/sheet picker on phones.
const selectClasses =
  "h-11 sm:h-10 w-full cursor-pointer rounded-xl border border-(--color-border) bg-transparent px-3 text-start text-sm sm:text-base text-(--color-dark) transition-colors focus:border-(--color-primary) disabled:opacity-60";

// صفحة إضافة مصروف - تصميم مضغوط للموبايل
const AddExpense = () => {
  const {
    user,
    formData,
    users,
    selectedUsers,
    loading,
    isSubmitting,
    error,
    handleInputChange,
    handleSplitTypeChange,
    toggleUserSelection,
    handleSubmit,
  } = useAddExpense();

  if (loading) return <Loader text="بنحمّل البيانات..." />;

  return (
    <div className="max-w-2xl mx-auto font-primary">
      {/* Header */}
      <div className="flex items-center gap-2.5 sm:gap-3 mb-5 sm:mb-8">
        <div className="p-2.5 sm:p-3 rounded-2xl bg-(--color-primary-bg)">
          <PlusCircle className="w-6 h-6 sm:w-8 sm:h-8 text-(--color-primary)" />
        </div>
        <h1 className="text-xl sm:text-3xl font-bold text-(--color-dark)">
          {user?.role === "admin" ? "سجّل مصروف جديد" : "طلب تسجيل مصروف"}
        </h1>
      </div>

      {error && (
        <div className="p-3 sm:p-4 rounded-2xl mb-4 sm:mb-6 text-sm sm:text-base bg-(--color-status-rejected-bg) text-(--color-status-rejected) border border-(--color-status-rejected-bg)">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="backdrop-blur-xl p-4 sm:p-8 rounded-2xl sm:rounded-3xl space-y-4 sm:space-y-6 shadow-lg bg-(--color-surface) border border-(--color-border)"
      >
        <div className="space-y-1.5">
          <Label htmlFor="expense-title">عنوان المصروف</Label>
          <div className="relative">
            <FileText
              size={16}
              className="absolute top-1/2 -translate-y-1/2 right-3 text-(--color-muted) pointer-events-none"
            />
            <Input
              id="expense-title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="مثال: فاتورة الكهرباء"
              required
              className="h-11 sm:h-10 pr-9 text-sm sm:text-base rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="expense-description">وصف المصروف</Label>
          <textarea
            id="expense-description"
            rows={3}
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="تفاصيل إضافية عن المصروف..."
            className="caret w-full rounded-xl border border-(--color-border) bg-transparent px-3 py-2.5 text-sm sm:text-base text-(--color-dark) placeholder:text-(--color-muted)/50 transition-colors focus:border-(--color-primary) resize-y"
          />
        </div>

        {user?.role === "admin" && (
          <div className="space-y-1.5">
            <Label htmlFor="expense-payer">مين اللي دفع؟</Label>
            <select
              id="expense-payer"
              value={formData.payer}
              onChange={(e) => handleInputChange("payer", e.target.value)}
              className={selectClasses}
            >
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="expense-category">النوع</Label>
            <select
              id="expense-category"
              value={formData.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
              className={selectClasses}
            >
              <option value="General">عام</option>
              <option value="Food">أكل وشرب</option>
              <option value="Transport">مواصلات</option>
              <option value="Utilities">فواتير</option>
              <option value="Entertainment">ترفيه</option>
              <option value="CashOut">سحب كاش (فلوس في اليد)</option>
              <option value="Housing">سكن</option>
              <option value="Other">حاجات تانية</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="expense-amount">الفلوس (جنيه)</Label>
            <div className="relative">
              <Coins
                size={16}
                className="absolute top-1/2 -translate-y-1/2 right-3 text-(--color-muted) pointer-events-none"
              />
              <Input
                id="expense-amount"
                type="number"
                step="0.01"
                inputMode="decimal"
                value={formData.totalAmount}
                onChange={(e) => handleInputChange("totalAmount", e.target.value)}
                placeholder="0.00"
                required
                className="h-11 sm:h-10 pr-9 pl-3 text-sm sm:text-base rounded-xl font-numbers"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="expense-split">هنقسمها إزاي</Label>
          <select
            id="expense-split"
            value={formData.splitType}
            onChange={handleSplitTypeChange}
            className={selectClasses}
          >
            <option value="equal">قسّمها على الكل</option>
            <option value="specific">قسّمها على ناس معينة</option>
          </select>
        </div>

        {formData.splitType === "specific" && (
          <div className="p-3 sm:p-5 rounded-2xl bg-(--color-bg) border border-(--color-border)">
            <Label className="block mb-2.5 sm:mb-3">اختار مين هيدفع</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 max-h-72 sm:max-h-96 overflow-y-auto p-1 custom-scrollbar">
              {users.map((u) => {
                const isSelected = selectedUsers.includes(u._id);
                return (
                  <button
                    key={u._id}
                    type="button"
                    onClick={() => toggleUserSelection(u._id)}
                    className={`relative p-2.5 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group flex flex-col items-center gap-1.5 sm:gap-3 ${
                      isSelected
                        ? "bg-(--color-primary)/10 border-(--color-primary) shadow-lg scale-[1.02]"
                        : "bg-(--color-surface) border-(--color-border) hover:border-(--color-primary) hover:shadow-md"
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 bg-(--color-primary) text-(--color-on-fill) rounded-full p-0.5 shadow-sm">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}

                    <span
                      className={`w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm sm:text-lg font-bold border-2 ${
                        isSelected
                          ? "bg-(--color-primary) border-(--color-primary) text-(--color-on-fill)"
                          : "bg-(--color-bg) border-(--color-border) text-(--color-primary)"
                      }`}
                    >
                      {u.name.charAt(0)}
                    </span>

                    <span className="text-center w-full">
                      <span className="font-bold truncate text-xs sm:text-sm mb-0.5 text-(--color-dark) block">
                        {u.name}
                      </span>
                      <span className="text-[10px] sm:text-xs truncate text-(--color-secondary) block">
                        @{u.username}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs mt-3 sm:mt-4 text-(--color-secondary) font-medium text-center">
              تم اختيار {selectedUsers.length} من أصل {users.length} شخص
            </p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full min-h-[48px] sm:min-h-[52px] py-3.5 sm:py-4 text-base sm:text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl mt-2"
        >
          {isSubmitting
            ? "جاري المعالجة..."
            : user?.role === "admin"
            ? "تسجيل المصروف"
            : "إرسال للموافقة"}
        </Button>
      </form>
    </div>
  );
};

export default AddExpense;
