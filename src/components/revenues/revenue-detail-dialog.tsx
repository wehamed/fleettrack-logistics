"use client";

import { useState } from "react";
import { Pencil, Trash2, Truck, MapPin } from "lucide-react";
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
import { REVENUE_TYPES } from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import { deleteRevenue } from "@/app/(app)/revenues/actions";
import type { RevenueRow } from "./revenues-view";

function typeLabel(v: string) {
  return REVENUE_TYPES.find((r) => r.value === v)?.label ?? v;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-secondary-100 py-2.5 last:border-0 dark:border-secondary-700/60">
      <span className="text-secondary-500 dark:text-secondary-400">{label}</span>
      <span className="font-medium text-secondary-800 dark:text-secondary-200">{value}</span>
    </div>
  );
}

export function RevenueDetailDialog({
  revenue,
  currency,
  onClose,
  onEdit,
}: {
  revenue: RevenueRow | null;
  currency: string;
  onClose: () => void;
  onEdit: (r: RevenueRow) => void;
}) {
  const [delPending, setDelPending] = useState(false);
  if (!revenue) return null;

  async function handleDelete() {
    setDelPending(true);
    const res = await deleteRevenue(revenue!.id);
    setDelPending(false);
    if (res.ok) onClose();
  }

  return (
    <Dialog open={Boolean(revenue)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="flex items-center gap-2">
              {revenue.clientName}
              <Badge variant="accent">{typeLabel(revenue.revenueType)}</Badge>
            </DialogTitle>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" title="تعديل" onClick={() => onEdit(revenue)}>
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
                      هل أنت متأكد من حذف إيراد «{revenue.clientName}»؟ يتم الحذف
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
            <TabsTrigger value="notes">ملاحظات</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <div>
              <DetailRow
                label="الشاحنة"
                value={
                  <span className="inline-flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-secondary-400" />
                    {revenue.truckPlate}
                  </span>
                }
              />
              <DetailRow label="التاريخ" value={revenue.date} />
              <DetailRow label="اسم العميل" value={revenue.clientName} />
              <DetailRow
                label="الوجهة"
                value={
                  revenue.destination ? (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-secondary-400" />
                      {revenue.destination}
                    </span>
                  ) : (
                    "—"
                  )
                }
              />
              <DetailRow label="نوع الإيراد" value={typeLabel(revenue.revenueType)} />
              <DetailRow
                label="القيمة"
                value={
                  <span className="font-semibold text-accent-700 dark:text-accent-300">
                    {formatMoney(revenue.amount, currency)}
                  </span>
                }
              />
            </div>
          </TabsContent>

          <TabsContent value="notes">
            <div className="rounded-lg bg-secondary-50 p-4 text-sm text-secondary-600 dark:bg-secondary-700/40 dark:text-secondary-300">
              {revenue.notes || "لا توجد ملاحظات."}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
