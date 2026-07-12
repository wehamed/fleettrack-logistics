"use client";

import { useState } from "react";
import { Pencil, Trash2, Truck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { formatMoney } from "@/lib/money";
import { deleteExpense } from "@/app/(app)/expenses/actions";
import type { ExpenseRow } from "./expenses-view";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-secondary-100 py-2.5 last:border-0 dark:border-secondary-700/60">
      <span className="text-secondary-500 dark:text-secondary-400">{label}</span>
      <span className="font-medium text-secondary-800 dark:text-secondary-200">{value}</span>
    </div>
  );
}

export function ExpenseDetailDialog({
  expense,
  currency,
  onClose,
  onEdit,
}: {
  expense: ExpenseRow | null;
  currency: string;
  onClose: () => void;
  onEdit: (e: ExpenseRow) => void;
}) {
  const [delPending, setDelPending] = useState(false);
  if (!expense) return null;

  async function handleDelete() {
    setDelPending(true);
    const res = await deleteExpense(expense!.id);
    setDelPending(false);
    if (res.ok) onClose();
  }

  return (
    <Dialog open={Boolean(expense)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="flex items-center gap-2">
              {expense.categoryName}
              {expense.truckPlate ? (
                <span className="inline-flex items-center gap-1 text-sm font-normal text-secondary-500">
                  <Truck className="w-3.5 h-3.5" />
                  {expense.truckPlate}
                </span>
              ) : (
                <Badge variant="secondary">عام</Badge>
              )}
            </DialogTitle>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" title="تعديل" onClick={() => onEdit(expense)}>
                <Pencil className="w-4 h-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                    <AlertDialogDescription>
                      هل أنت متأكد من حذف مصروف «{expense.categoryName}»؟ يتم الحذف
                      منطقيًا مع الاحتفاظ بالسجل المحاسبي.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                    <AlertDialogAction disabled={delPending} onClick={handleDelete}>
                      {delPending ? "جارٍ الحذف..." : "حذف نهائي"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">التفاصيل</TabsTrigger>
            <TabsTrigger value="receipt">الإيصال</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <div>
              <DetailRow
                label="الشاحنة"
                value={
                  expense.truckPlate ? (
                    <span className="inline-flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-secondary-400" />
                      {expense.truckPlate}
                    </span>
                  ) : (
                    "مصروف عام"
                  )
                }
              />
              <DetailRow label="التصنيف" value={expense.categoryName} />
              <DetailRow label="التاريخ" value={expense.date} />
              <DetailRow
                label="القيمة"
                value={
                  <span className="font-semibold text-danger-700 dark:text-danger-300">
                    {formatMoney(expense.amount, currency)}
                  </span>
                }
              />
              <DetailRow label="الوصف" value={expense.description || "—"} />
            </div>
          </TabsContent>

          <TabsContent value="receipt">
            {expense.receiptImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={expense.receiptImage}
                alt="صورة الإيصال"
                className="w-full rounded-lg border border-secondary-200 dark:border-secondary-700"
              />
            ) : (
              <div className="rounded-lg bg-secondary-50 p-4 text-sm text-secondary-600 dark:bg-secondary-700/40 dark:text-secondary-300">
                لا توجد صورة إيصال مرفقة.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
