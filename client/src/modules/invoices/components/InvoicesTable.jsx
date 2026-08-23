import { useMemo, useState } from "react";
import { Search, Check, X, ArrowUpDown } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import StatusBadge from "./StatusBadge";
import MobileInvoiceCard from "./MobileInvoiceCard";

export default function InvoicesTable({
  data,
  loading,
  onApprove,
  onReject,
  showUserColumn = true,
}) {
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo(() => {
    const cols = [
      {
        accessorKey: "date",
        header: "التاريخ",
        accessorFn: (row) => row.createdAt,
        cell: (info) => (
          <span className="text-sm text-(--color-secondary)">
            {new Date(info.getValue()).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        ),
      },
      {
        accessorKey: "description",
        header: "الوصف",
        cell: (info) => <span className="text-(--color-dark) font-medium">{info.getValue()}</span>,
      },
      {
        accessorKey: "amount",
        header: "المبلغ",
        cell: (info) => (
          <span className="font-bold text-(--color-dark)">{Number(info.getValue()).toFixed(2)} جنيه</span>
        ),
      },
      {
        accessorKey: "status",
        header: "الحالة",
        cell: (info) => <StatusBadge status={info.getValue()} />,
      },
      {
        id: "actions",
        header: "إجراءات",
        cell: ({ row }) => {
          const invoice = row.original;
          return (
            <div className="flex items-center justify-start gap-2">
              {invoice.status === "awaiting_approval" ? (
                <>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 bg-(--color-status-approved-bg) text-(--color-status-approved) hover:bg-(--color-status-approved-bg)/80 rounded-lg"
                        aria-label="موافقة"
                      >
                        <Check size={16} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent dir="rtl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>تأكيد الموافقة</AlertDialogTitle>
                        <AlertDialogDescription>هل أنت متأكد من الموافقة على الدفع؟</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onApprove(invoice._id)}>موافقة</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 bg-(--color-status-rejected-bg) text-(--color-status-rejected) hover:bg-(--color-status-rejected-bg)/80 rounded-lg"
                        aria-label="رفض"
                      >
                        <X size={16} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent dir="rtl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>تأكيد الرفض</AlertDialogTitle>
                        <AlertDialogDescription>هل أنت متأكد من رفض الدفع؟</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onReject(invoice._id)}
                          className="bg-(--color-error) text-white hover:bg-(--color-error)/90"
                        >
                          رفض
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              ) : (
                <span className="text-(--color-secondary) text-xs">-</span>
              )}
            </div>
          );
        },
      },
    ];

    if (showUserColumn) {
      cols.splice(1, 0, {
        accessorKey: "user",
        header: "المستخدم",
        accessorFn: (row) => row.user?.name,
        cell: (info) => (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-(--color-primary-bg) text-(--color-primary-text) flex items-center justify-center text-xs font-bold">
              {info.getValue()?.charAt(0) || "?"}
            </div>
            <span className="font-medium text-(--color-dark) text-sm">{info.getValue()}</span>
          </div>
        ),
      });
    }

    return cols;
  }, [showUserColumn, onApprove, onReject]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  return (
    <div className="space-y-4">
      <Input
        placeholder="بحث..."
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="h-10 max-w-sm bg-(--color-bg) border-(--color-border) text-(--color-dark)"
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-(--color-primary) border-t-transparent"></div>
        </div>
      ) : table.getRowModel().rows.length === 0 ? (
        <div className="text-center py-12 bg-(--color-bg) rounded-xl border-2 border-dashed border-(--color-border)">
          <p className="text-(--color-secondary)">لا توجد فواتير</p>
        </div>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto border border-(--color-border) rounded-xl">
            <Table>
              <TableHeader className="bg-(--color-bg)">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-(--color-border)">
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="py-3 px-4 text-xs font-semibold text-(--color-muted) uppercase cursor-pointer hover:text-(--color-primary) transition-colors text-start"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-1">
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && <ArrowUpDown size={12} className="opacity-50" />}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="bg-(--color-surface) divide-y divide-(--color-border)">
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-(--color-hover) transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3 px-4 text-sm text-start">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="md:hidden space-y-4">
            {table.getRowModel().rows.map((row) => (
              <MobileInvoiceCard
                key={row.id}
                invoice={row.original}
                onApprove={onApprove}
                onReject={onReject}
                showUser={showUserColumn}
              />
            ))}
          </div>
        </>
      )}

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between text-xs text-(--color-secondary) pt-4 border-t border-(--color-border)">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            السابق
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            التالي
          </Button>
        </div>
        <span>
          صفحة {table.getState().pagination.pageIndex + 1} من {table.getPageCount()}
        </span>
      </div>
    </div>
  );
}
