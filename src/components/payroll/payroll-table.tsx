"use client";

import { Pencil, Plus, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/money";
import { SALARY_TYPES } from "@/lib/constants";
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

export type PayrollRow = {
  id: string;
  employeeId: string;
  employeeName: string;
  salaryType: string;
  month: string;
  baseAmount: number;
  deductions: number;
  advances: number;
  net: number;
  paid: boolean;
  notes: string | null;
};

export type EmployeeOption = {
  id: string;
  name: string;
  salaryType: string;
  baseSalary: number | null;
};

export type PayrollMergedRow = {
  employee: EmployeeOption;
  payroll: PayrollRow | null;
};

export function PayrollTable({
  rows,
  currency,
  onEdit,
  onRegister,
  onTogglePaid,
  onDelete,
}: {
  rows: PayrollMergedRow[];
  currency: string;
  onEdit: (row: PayrollMergedRow) => void;
  onRegister: (employee: EmployeeOption) => void;
  onTogglePaid: (payroll: PayrollRow, paid: boolean) => void;
  onDelete: (payroll: PayrollRow) => void;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-secondary-200 bg-secondary-50 text-secondary-600 dark:border-secondary-700 dark:bg-secondary-800 dark:text-secondary-300">
              <th className="px-4 py-3 text-right font-medium">الموظف</th>
              <th className="px-4 py-3 text-right font-medium">الراتب الأساسي</th>
              <th className="px-4 py-3 text-right font-medium">الخصومات</th>
              <th className="px-4 py-3 text-right font-medium">السلف</th>
              <th className="px-4 py-3 text-right font-medium">صافي المستحق</th>
              <th className="px-4 py-3 text-right font-medium">الحالة</th>
              <th className="px-4 py-3 text-right font-medium">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ employee, payroll }) => {
              const salaryLabel =
                SALARY_TYPES.find((s) => s.value === employee.salaryType)?.label ??
                employee.salaryType;
              return (
                <tr
                  key={employee.id}
                  className="border-b border-secondary-100 last:border-0 dark:border-secondary-800"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-secondary-900 dark:text-secondary-100">
                      {employee.name}
                    </div>
                    <div className="text-xs text-secondary-400">{salaryLabel}</div>
                  </td>

                  {payroll ? (
                    <>
                      <td className="px-4 py-3 text-secondary-700 dark:text-secondary-200">
                        {formatMoney(payroll.baseAmount, currency)}
                      </td>
                      <td className="px-4 py-3 text-secondary-700 dark:text-secondary-200">
                        {payroll.deductions > 0
                          ? formatMoney(payroll.deductions, currency)
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-secondary-700 dark:text-secondary-200">
                        {payroll.advances > 0
                          ? formatMoney(payroll.advances, currency)
                          : "—"}
                      </td>
                      <td className="px-4 py-3 font-semibold text-primary-700 dark:text-primary-400">
                        {formatMoney(payroll.net, currency)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => onTogglePaid(payroll, !payroll.paid)}
                          className={
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors " +
                            (payroll.paid
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300")
                          }
                          title={payroll.paid ? "تم الصرف — اضغط للتراجع" : "غير مدفوع — اضغط للتعليم كمدفوع"}
                        >
                          {payroll.paid ? (
                            <>
                              <Check className="w-3.5 h-3.5" /> مدفوع
                            </>
                          ) : (
                            <>
                              <X className="w-3.5 h-3.5" /> غير مدفوع
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => onEdit({ employee, payroll })}>
                            <Pencil className="w-4 h-4" />
                            تعديل
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                                <AlertDialogDescription>
                                  هل أنت متأكد من حذف سجل راتب {employee.name} لهذا الشهر؟ يمكن استرجاعه لاحقًا من قبل المدير.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(payroll)}>
                                  حذف
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-secondary-400" colSpan={5}>
                        لم يُسجّل راتب هذا الشهر بعد
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="outline" size="sm" onClick={() => onRegister(employee)}>
                          <Plus className="w-4 h-4" />
                          تسجيل
                        </Button>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
