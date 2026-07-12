"use client";

import { useState } from "react";
import { Eye, Pencil, Trash2, Truck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { REVENUE_TYPES } from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import { deleteRevenue } from "@/app/(app)/revenues/actions";
import type { RevenueRow } from "./revenues-view";

function typeLabel(v: string) {
  return REVENUE_TYPES.find((r) => r.value === v)?.label ?? v;
}

export function RevenueTable({
  revenues,
  currency,
  onEdit,
  onOpen,
}: {
  revenues: RevenueRow[];
  currency: string;
  onEdit: (r: RevenueRow) => void;
  onOpen: (r: RevenueRow) => void;
}) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setPendingId(id);
    setError(null);
    const res = await deleteRevenue(id);
    setPendingId(null);
    if (!res.ok) setError(res.error ?? "تعذّر الحذف");
  }

  return (
    <Card className="overflow-hidden p-0">
      {error && (
        <div className="bg-danger-50 px-4 py-2 text-sm text-danger-700 dark:bg-danger-900/20">
          {error}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-secondary-200 bg-secondary-50 text-secondary-600 dark:border-secondary-700 dark:bg-secondary-700/40 dark:text-secondary-300">
              <th className="px-4 py-3 text-right font-medium">التاريخ</th>
              <th className="px-4 py-3 text-right font-medium">الشاحنة</th>
              <th className="px-4 py-3 text-right font-medium">العميل</th>
              <th className="px-4 py-3 text-right font-medium">الوجهة</th>
              <th className="px-4 py-3 text-right font-medium">النوع</th>
              <th className="px-4 py-3 text-right font-medium">القيمة</th>
              <th className="px-4 py-3 text-center font-medium">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {revenues.map((r) => (
              <tr
                key={r.id}
                className="border-b border-secondary-100 last:border-0 hover:bg-secondary-50 dark:border-secondary-700/60 dark:hover:bg-secondary-700/30 cursor-pointer"
                onClick={() => onOpen(r)}
              >
                <td className="px-4 py-3 text-secondary-600 dark:text-secondary-300">{r.date}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 font-medium text-secondary-800 dark:text-secondary-200">
                    <Truck className="w-3.5 h-3.5 text-secondary-400" />
                    {r.truckPlate}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-secondary-900 dark:text-secondary-100">
                  {r.clientName}
                </td>
                <td className="px-4 py-3 text-secondary-600 dark:text-secondary-300">
                  {r.destination ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="accent">{typeLabel(r.revenueType)}</Badge>
                </td>
                <td className="px-4 py-3 font-semibold text-accent-700 dark:text-accent-300">
                  {formatMoney(r.amount, currency)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="عرض" onClick={() => onOpen(r)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="تعديل" onClick={() => onEdit(r)}>
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
                            هل أنت متأكد من حذف إيراد «{r.clientName}» بقيمة{" "}
                            {formatMoney(r.amount, currency)}؟ يتم الحذف منطقيًا مع
                            الاحتفاظ بالسجل المحاسبي.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction disabled={pendingId === r.id} onClick={async () => { await handleDelete(r.id); }}>
                            {pendingId === r.id ? "جارٍ الحذف..." : "حذف نهائي"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
