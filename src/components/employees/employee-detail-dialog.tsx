"use client";

import { useState } from "react";
import { Pencil, Trash2, Truck, Phone } from "lucide-react";
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

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-secondary-100 py-2.5 last:border-0 dark:border-secondary-700/60">
      <span className="text-secondary-500 dark:text-secondary-400">{label}</span>
      <span className="font-medium text-secondary-800 dark:text-secondary-200">{value}</span>
    </div>
  );
}

export function EmployeeDetailDialog({
  employee,
  onClose,
  onEdit,
}: {
  employee: EmployeeRow | null;
  onClose: () => void;
  onEdit: (e: EmployeeRow) => void;
}) {
  const [delPending, setDelPending] = useState(false);
  if (!employee) return null;

  async function handleDelete() {
    setDelPending(true);
    const res = await deleteEmployee(employee!.id);
    setDelPending(false);
    if (res.ok) onClose();
  }

  return (
    <Dialog open={Boolean(employee)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="flex items-center gap-2">
              {employee.name}
              <Badge variant="secondary">{roleLabel(employee.role)}</Badge>
            </DialogTitle>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" title="تعديل" onClick={() => onEdit(employee)}>
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
                      هل أنت متأكد من حذف الموظف «{employee.name}»؟ يتم الحذف
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
            <TabsTrigger value="assignment">التعيين</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <div>
              <DetailRow label="الاسم" value={employee.name} />
              <DetailRow label="الدور" value={roleLabel(employee.role)} />
              <DetailRow label="نوع الراتب" value={salaryLabel(employee.salaryType)} />
              <DetailRow
                label="الراتب الأساسي"
                value={employee.baseSalary != null ? formatMoney(employee.baseSalary) : "—"}
              />
              <DetailRow
                label="الهاتف"
                value={
                  employee.phone ? (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-secondary-400" />
                      {employee.phone}
                    </span>
                  ) : (
                    "—"
                  )
                }
              />
              <DetailRow label="تاريخ التوظيف" value={employee.hireDate ?? "—"} />
            </div>
          </TabsContent>

          <TabsContent value="assignment">
            <div className="rounded-lg bg-secondary-50 p-4 dark:bg-secondary-700/40">
              <div className="text-sm text-secondary-500 dark:text-secondary-400">
                الشاحنة الحالية
              </div>
              <div className="mt-1 flex items-center gap-2 font-medium text-secondary-800 dark:text-secondary-200">
                <Truck className="w-4 h-4 text-secondary-400" />
                {employee.assignedTruck ?? "غير معيّن على شاحنة"}
              </div>
              <p className="mt-3 text-xs text-secondary-400">
                لتعيين السائق على شاحنة، افتح شاشة «الشاحنات» واختر الشاحنة ثم
                تبويب «السائق».
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
