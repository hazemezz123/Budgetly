import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  RefreshCw,
  User as UserIcon,
  CreditCard,
  AlertCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useAllInvoices } from "../hooks";
import { InvoicesTable, MobileRequestCard, RequestDetailsModal } from "../components";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AllInvoices() {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const highlightRequestId = searchParams.get("requestId");

  const {
    invoices,
    pendingRequests,
    loading,
    refreshData,
    selectedUserId,
    setSelectedUserId,
    userStats,
    selectedUser,
    selectedUserInvoices,
    handleApprove,
    handleApproveAllUserInvoices,
    handleReject,
    handleApproveRequest,
    handleRejectRequest,
    isApprovingAllUserInvoices,
  } = useAllInvoices();

  const openRequestDetails = (request) => {
    setSelectedRequest(request);
    setIsDetailsModalOpen(true);
  };

  // Deep-link: open pending request from notification (?requestId=xxx)
  useEffect(() => {
    if (!highlightRequestId || pendingRequests.length === 0) return;
    const matched = pendingRequests.find((r) => String(r._id) === String(highlightRequestId));
    if (matched) {
      openRequestDetails(matched);
      // highlight scroll after modal opens
      setTimeout(() => {
        const el = document.getElementById(`pending-request-${highlightRequestId}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [highlightRequestId, pendingRequests]);

  const handlePendingRequestEvent = useCallback(
    (event) => {
      const payload = event.detail || {};
      const id = payload.expenseId || payload.requestId;
      if (!id) return;
      // update URL to reflect highlighted request
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("requestId", id);
        return next;
      });
      const matched = pendingRequests.find((r) => String(r._id) === String(id));
      if (matched) openRequestDetails(matched);
    },
    [pendingRequests, setSearchParams]
  );

  useEffect(() => {
    window.addEventListener("budgetly:pending-request-open", handlePendingRequestEvent);
    window.addEventListener("budgetly:pending-expense-open", handlePendingRequestEvent);
    return () => {
      window.removeEventListener("budgetly:pending-request-open", handlePendingRequestEvent);
      window.removeEventListener("budgetly:pending-expense-open", handlePendingRequestEvent);
    };
  }, [handlePendingRequestEvent]);

  const selectedUserEligibleInvoicesCount = selectedUserInvoices.filter(
    (invoice) => invoice.status === "awaiting_approval" && invoice.paymentRequest,
  ).length;

  return (
    <div className="space-y-8 pb-20 md:pb-0" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-(--color-dark)">إدارة الفواتير</h1>
          <p className="text-(--color-secondary)">متابعة الفواتير والمدفوعات لكل المستخدمين</p>
        </div>
        <Button
          onClick={refreshData}
          variant="outline"
          size="icon"
          className="self-end sm:self-auto rounded-full bg-(--color-surface) border-(--color-border) text-(--color-dark) hover:bg-(--color-bg)"
          aria-label="تحديث البيانات"
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </Button>
      </div>

      {pendingRequests.length > 0 && (
        <Card id="pending-requests" className="rounded-2xl border-(--color-border) bg-(--color-surface) shadow-sm py-0 gap-0 overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-(--color-dark)">
              <Clock className="text-(--color-status-pending)" />
              طلبات معلقة ({pendingRequests.length})
            </h2>

            <div className="hidden md:block overflow-x-auto rounded-xl border border-(--color-border)">
              <Table>
                <TableHeader className="bg-(--color-bg)">
                  <TableRow className="hover:bg-transparent border-b border-(--color-border)">
                    <TableHead className="py-3 px-4 text-start text-xs uppercase text-(--color-muted)">
                      التاريخ
                    </TableHead>
                    <TableHead className="py-3 px-4 text-start text-xs uppercase text-(--color-muted)">
                      المستخدم
                    </TableHead>
                    <TableHead className="py-3 px-4 text-start text-xs uppercase text-(--color-muted)">
                      الوصف
                    </TableHead>
                    <TableHead className="py-3 px-4 text-start text-xs uppercase text-(--color-muted)">
                      المبلغ الكلي
                    </TableHead>
                    <TableHead className="py-3 px-4 text-start text-xs uppercase text-(--color-muted)">
                      إجراءات
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-(--color-border) bg-(--color-surface)">
                  {pendingRequests.map((req) => (
                    <TableRow
                      key={req._id}
                      id={`pending-request-${req._id}`}
                      className={`hover:bg-(--color-hover) ${String(highlightRequestId) === String(req._id) ? "bg-(--color-primary-bg)/30 ring-2 ring-(--color-primary)/40" : ""}`}
                    >
                      <TableCell className="py-3 px-4 text-sm text-(--color-secondary) text-start">
                        {new Date(req.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-sm font-medium text-(--color-dark) text-start">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-(--color-primary-bg) text-(--color-primary-text) flex items-center justify-center text-xs font-bold">
                            {req.createdBy?.name?.charAt(0) || "?"}
                          </div>
                          {req.createdBy?.name}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-sm text-(--color-dark) text-start">
                        {req.description}
                      </TableCell>
                      <TableCell className="py-3 px-4 text-sm font-bold text-(--color-dark) text-start">
                        {req.totalAmount} جنيه
                      </TableCell>
                      <TableCell className="py-3 px-4 text-start">
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => openRequestDetails(req)}
                            variant="outline"
                            size="sm"
                            className="px-3 py-1 h-7 bg-(--color-bg) text-(--color-secondary) border-(--color-border) hover:bg-(--color-hover) text-xs font-bold rounded-lg"
                          >
                            تفاصيل
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                className="px-3 py-1 h-7 bg-(--color-status-approved-bg) text-(--color-status-approved) hover:bg-(--color-status-approved-bg)/80 text-xs font-bold rounded-lg"
                              >
                                موافقة
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent dir="rtl">
                              <AlertDialogHeader>
                                <AlertDialogTitle>تأكيد الموافقة</AlertDialogTitle>
                                <AlertDialogDescription>
                                  هل أنت متأكد من الموافقة على هذا الطلب؟
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleApproveRequest(req._id)}>
                                  موافقة
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                className="px-3 py-1 h-7 bg-(--color-status-rejected-bg) text-(--color-status-rejected) hover:bg-(--color-status-rejected-bg)/80 text-xs font-bold rounded-lg"
                              >
                                رفض
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent dir="rtl">
                              <AlertDialogHeader>
                                <AlertDialogTitle>تأكيد الرفض</AlertDialogTitle>
                                <AlertDialogDescription>هل أنت متأكد من رفض هذا الطلب؟</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRejectRequest(req._id)}
                                  className="bg-(--color-error) text-white hover:bg-(--color-error)/90"
                                >
                                  رفض
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
              </Table>
            </div>

            <div className="md:hidden space-y-4">
              {pendingRequests.map((req) => (
                <div key={req._id} id={`pending-request-${req._id}`} className={`${String(highlightRequestId) === String(req._id) ? "ring-2 ring-(--color-primary)/50 rounded-2xl" : ""}`}>
                  <MobileRequestCard
                    request={req}
                    onOpenDetails={openRequestDetails}
                    onApprove={handleApproveRequest}
                    onReject={handleRejectRequest}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {userStats.map((u) => (
          <div
            key={u._id}
            role="button"
            tabIndex={0}
            onClick={() => setSelectedUserId((prev) => (prev === u._id ? null : u._id))}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelectedUserId((prev) => (prev === u._id ? null : u._id));
              }
            }}
            className={`cursor-pointer rounded-xl p-3 sm:p-4 border transition-all duration-200 relative overflow-hidden group ${
              selectedUserId === u._id
                ? " border-(--color-primary) shadow-lg transform scale-[1.02] bg-(--color-primary)/20"
                : " border-(--color-border) border hover:border-(--color-primary) hover:shadow-md"
            }`}
          >
            <div className="flex items-center gap-3 sm:gap-4 relative z-10">
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm sm:text-lg font-bold shadow-sm ${
                  selectedUserId === u._id
                    ? " border-(--color-primary) border text-(--color-primary-text)"
                    : "  text-(--color-primary-text)"
                }`}
              >
                {u.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <h3 className="font-bold truncate text-(--color-dark)">{u.name}</h3>
                <p className="text-xs truncate text-(--color-secondary)">@{u.username}</p>
              </div>
            </div>

            <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2 relative z-10">
              {u.pendingCount > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] sm:text-xs flex items-center gap-1 ${
                    selectedUserId === u._id
                      ? " text-(--color-primary) font-bold shadow-sm bg-(--color-primary)/20"
                      : "bg-(--color-status-pending-bg) text-(--color-status-pending)"
                  }`}
                >
                  <AlertCircle size={10} /> {u.pendingCount} مطلوب
                </span>
              )}
              {u.awaitingCount > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] sm:text-xs flex items-center gap-1 ${
                    selectedUserId === u._id
                      ? "bg-white/90 text-(--color-primary) font-bold shadow-sm"
                      : "bg-(--color-info-bg) text-(--color-info)"
                  }`}
                >
                  <Clock size={10} /> {u.awaitingCount} انتظار
                </span>
              )}
              {u.pendingCount === 0 && u.awaitingCount === 0 && (
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] sm:text-xs flex items-center gap-1 ${
                    selectedUserId === u._id
                      ? "bg-white/90 text-(--color-primary) font-bold shadow-sm"
                      : "bg-(--color-success-bg) text-(--color-success-text)"
                  }`}
                >
                  <CheckCircle2 size={10} /> خالص
                </span>
              )}
            </div>

            {selectedUserId === u._id && (
              <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
                <UserIcon size={80} color="white" />
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedUser && (
        <Card className="rounded-2xl border-(--color-border) bg-(--color-surface) shadow-sm py-0 gap-0 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:justify-between sm:items-center">
              <div className="flex items-center gap-2 text-(--color-dark)">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <UserIcon className="text-(--color-primary)" />
                  فواتير {selectedUser.name}
                </h2>
                <Button
                  onClick={() => setSelectedUserId(null)}
                  variant="ghost"
                  size="sm"
                  className="text-sm text-(--color-secondary) hover:text-(--color-primary) underline h-auto p-0"
                >
                  إغلاق
                </Button>
              </div>

              {selectedUserEligibleInvoicesCount > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      disabled={isApprovingAllUserInvoices}
                      className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-xl bg-(--color-status-approved-bg) text-(--color-status-approved) hover:bg-(--color-status-approved-bg)/80 font-bold flex items-center justify-center disabled:opacity-60"
                    >
                      {isApprovingAllUserInvoices
                        ? "جاري الموافقة..."
                        : `موافقة على الكل (${selectedUserEligibleInvoicesCount})`}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent dir="rtl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>تأكيد الموافقة على الكل</AlertDialogTitle>
                      <AlertDialogDescription>
                        هل أنت متأكد من الموافقة على {selectedUserEligibleInvoicesCount} فواتير دفعة واحدة؟
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>إلغاء</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() =>
                          handleApproveAllUserInvoices(selectedUser._id, selectedUserEligibleInvoicesCount)
                        }
                      >
                        موافقة
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            <InvoicesTable
              data={selectedUserInvoices}
              loading={loading}
              onApprove={handleApprove}
              onReject={handleReject}
              showUserColumn={false}
            />
          </CardContent>
        </Card>
      )}

      <Card className="rounded-2xl border-(--color-border) bg-(--color-surface) shadow-sm py-0 gap-0 overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-(--color-dark)">
            <CreditCard className="text-(--color-primary)" />
            كل الفواتير
          </h2>
          <InvoicesTable data={invoices} loading={loading} onApprove={handleApprove} onReject={handleReject} showUserColumn={true} />
        </CardContent>
      </Card>

      <RequestDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        request={selectedRequest}
        onApprove={(id) => {
          handleApproveRequest(id);
          setIsDetailsModalOpen(false);
        }}
        onReject={(id) => {
          handleRejectRequest(id);
          setIsDetailsModalOpen(false);
        }}
      />
    </div>
  );
}
