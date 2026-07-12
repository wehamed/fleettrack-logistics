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
import { EMPLOYEE_ROLES, SALARY_TYPES } from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import { deleteEmployee } from "@/app/(app)/employees/actions";
import type { EmployeeRow } from "./employees-view";

function roleLabel(v: string) {
  return EMPLOYEE_ROLES.find((r) => r.value === v)?.label ?? v;
}
function salaryLabel(v: string) {
  return SALARY_TYPES.find((s) => s.value === v)?.label ?? v;
}

export function EmployeeTable({
  employees,
  onEdit,
  onOpen,
}: {
  employees: EmployeeRow[];
  onEdit: (e: EmployeeRow) => void;
  onOpen: (e: EmployeeRow) => void;
}) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setPendingId(id);
    setError(null);
    const res = await deleteEmployee(id);
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
              <th className="px-4 py-3 text-right font-medium">الاسم</th>
              <th className="px-4 py-3 text-right font-medium">الدور</th>
              <th className="px-4 py-3 text-right font-medium">نوع الراتب</th>
              <th className="px-4 py-3 text-right font-medium">الراتب الأساسي</th>
              <th className="px-4 py-3 text-right font-medium">الشاحنة</th>
              <th className="px-4 py-3 text-center font-medium">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr
                key={e.id}
                className="border-b border-secondary-100 last:border-0 hover:bg-secondary-50 dark:border-secondary-700/60 dark:hover:bg-secondary-700/30 cursor-pointer"
                onClick={() => onOpen(e)}
              >
                <td className="px-4 py-3 font-medium text-secondary-900 dark:text-secondary-100">
                  {e.name}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="secondary">{roleLabel(e.role)}</Badge>
                </td>
                <td className="px-4 py-3 text-secondary-600 dark:text-secondary-300">
                  {salaryLabel(e.salaryType)}
                </td>
                <td className="px-4 py-3 text-secondary-600 dark:text-secondary-300">
                  {e.baseSalary != null ? formatMoney(e.baseSalary) : "—"}
                </td>
                <td className="px-4 py-3 text-secondary-600 dark:text-secondary-300">
                  {e.assignedTruck ? (
                    <span className="inline-flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-secondary-400" />
                      {e.assignedTruck}
                    </span>
                  ) : (
                    <span className="text-secondary-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div
                    className="flex items-center justify-center gap-1"
                    onClick={(ev) => ev.stopPropagation()}
                  >
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="عرض" onClick={() => onOpen(e)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="تعديل" onClick={() => onEdit(e)}>
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
                            هل أنت متأكد من حذف الموظف «{e.name}»؟ يتم الحذف
                            منطقيًا مع الاحتفاظ بالسجل المحاسبي.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction disabled={pendingId === e.id} onClick={async () => { await handleDelete(e.id); }}>
                            {pendingId === e.id ? "جارٍ الحذف..." : "حذف نهائي"}
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
