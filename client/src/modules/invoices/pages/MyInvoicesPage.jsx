import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { useMyInvoices } from "../hooks";
import {
  InvoiceCard,
  RequestCard,
  MyInvoicesHeader,
  MyInvoicesFilters,
  MyInvoicesPagination,
} from "../components";

export default function MyInvoices() {
  const navigate = useNavigate();

  const {
    activeTab,
    setActiveTab,
    loading,
    filterStatus,
    setFilterStatus,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    filteredData,
    totalPending,
    isConfirmModalOpen,
    setIsConfirmModalOpen,
    handlePay,
    confirmPayment,
    isPaying,
    // Bulk Payment
    isBulkPayModalOpen,
    setIsBulkPayModalOpen,
    handleBulkPay,
    confirmBulkPayment,
    isBulkPaying,
    // Delete Request
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    handleDeleteRequest,
    confirmDeleteRequest,
    isDeleting,
  } = useMyInvoices();

  // Calculate pending invoices count and total for bulk payment
  const pendingInvoicesCount = filteredData
    ? filteredData.filter((item) => item.status === "pending").length
    : 0;

  const pendingInvoicesTotal = filteredData
    ? filteredData
        .filter((item) => item.status === "pending")
        .reduce((sum, item) => sum + (item.amount || 0), 0)
    : 0;

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Calculate paginated data
  const totalPages = Math.ceil((filteredData?.length || 0) / itemsPerPage);
  const paginatedData = filteredData
    ? filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : [];

  // Reset to page 1 when tab or filter changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <MyInvoicesHeader
        activeTab={activeTab}
        pendingInvoicesCount={pendingInvoicesCount}
        pendingInvoicesTotal={pendingInvoicesTotal}
        onBulkPay={handleBulkPay}
        onCreateRequest={() => navigate("/add-expense")}
        totalPending={totalPending}
      />

      <MyInvoicesFilters
        activeTab={activeTab}
        onTabChange={handleTabChange}
        filterStatus={filterStatus}
        onFilterChange={handleFilterChange}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-(--color-primary) border-t-transparent"></div>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="text-center py-12 bg-(--color-bg) rounded-xl border-2 border-dashed border-(--color-border)">
          <p className="text-(--color-secondary)">
            {activeTab === "invoices" ? "لا توجد فواتير تطابق بحثك." : "لا توجد طلبات تطابق بحثك."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedData.map((item) =>
            activeTab === "invoices" ? (
              <InvoiceCard key={item._id} invoice={item} onPay={handlePay} />
            ) : (
              <RequestCard key={item._id} request={item} onDelete={handleDeleteRequest} />
            ),
          )}
        </div>
      )}

      <MyInvoicesPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onPrevious={() => setCurrentPage((p) => Math.max(1, p - 1))}
        onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
      />

      <AlertDialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الدفع</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من دفع هذه الفاتورة؟ سيتم إرسال إشعار للمسؤول للموافقة.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPaying}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmPayment}
              disabled={isPaying}
              className="bg-(--color-primary) text-white hover:bg-(--color-primary)/90"
            >
              {isPaying ? "جاري الدفع..." : "تأكيد الدفع"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isBulkPayModalOpen} onOpenChange={setIsBulkPayModalOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>دفع الكل ({pendingInvoicesCount} فواتير)</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من دفع جميع الفواتير المعلقة بإجمالي {pendingInvoicesTotal.toLocaleString()} ج.م؟
              سيتم إرسال طلبات دفع للمسؤول.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkPaying}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkPayment}
              disabled={isBulkPaying}
              className="bg-(--color-primary) text-white hover:bg-(--color-primary)/90"
            >
              {isBulkPaying ? "جاري الدفع..." : "تأكيد الدفع للكل"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الطلب</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteRequest}
              disabled={isDeleting}
              className="bg-(--color-error) text-white hover:bg-(--color-error)/90"
            >
              {isDeleting ? "جاري الحذف..." : "تأكيد الحذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
