"use client";

import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
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
import { statusBadgeClass, statusLabel } from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import { deleteTruck } from "@/app/(app)/trucks/actions";
import type { TruckRow } from "./trucks-view";

export function TruckTable({
  trucks,
  onEdit,
  onOpen,
}: {
  trucks: TruckRow[];
  onEdit: (t: TruckRow) => void;
  onOpen: (t: TruckRow) => void;
}) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setPendingId(id);
    setError(null);
    const res = await deleteTruck(id);
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
              <th className="px-4 py-3 text-right font-medium">رقم اللوحة</th>
              <th className="px-4 py-3 text-right font-medium">الموديل</th>
              <th className="px-4 py-3 text-right font-medium">السنة</th>
              <th className="px-4 py-3 text-right font-medium">قيمة الشراء</th>
              <th className="px-4 py-3 text-right font-medium">السائق الحالي</th>
              <th className="px-4 py-3 text-right font-medium">الحالة</th>
              <th className="px-4 py-3 text-center font-medium">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {trucks.map((t) => (
              <tr
                key={t.id}
                className="border-b border-secondary-100 last:border-0 hover:bg-secondary-50 dark:border-secondary-700/60 dark:hover:bg-secondary-700/30 cursor-pointer"
                onClick={() => onOpen(t)}
              >
                <td className="px-4 py-3 font-medium text-secondary-900 dark:text-secondary-100">
                  {t.plateNumber}
                </td>
                <td className="px-4 py-3 text-secondary-600 dark:text-secondary-300">
                  {t.model}
                </td>
                <td className="px-4 py-3 text-secondary-600 dark:text-secondary-300">
                  {t.year ?? "—"}
                </td>
                <td className="px-4 py-3 text-secondary-600 dark:text-secondary-300">
                  {t.purchaseValue != null ? formatMoney(t.purchaseValue) : "—"}
                </td>
                <td className="px-4 py-3 text-secondary-600 dark:text-secondary-300">
                  {t.currentDriver?.name ?? (
                    <span className="text-secondary-400">بدون سائق</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`status-badge ${statusBadgeClass(t.status)}`}>
                    {statusLabel(t.status)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div
                    className="flex items-center justify-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="عرض"
                      onClick={() => onOpen(t)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="تعديل"
                      onClick={() => onEdit(t)}
                    >
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
                            هل أنت متأكد من حذف الشاحنة ذات اللوحة «{t.plateNumber}»؟
                            سيتم حذفها منطقيًا مع الاحتفاظ بسجلها المحاسبي ولا يمكن
                            التراجع عن هذا الإجراء بسهولة.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction
                            disabled={pendingId === t.id}
                            onClick={async () => {
                              await handleDelete(t.id);
                            }}
                          >
                            {pendingId === t.id ? "جارٍ الحذف..." : "حذف نهائي"}
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
