"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { formatMoney } from "@/lib/money";
import { PayrollTable, type PayrollMergedRow } from "./payroll-table";
import { PayrollFormDialog } from "./payroll-form-dialog";
import { setPayrollPaid, deletePayroll } from "@/app/(app)/payroll/actions";

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

export function PayrollView({
  payroll,
  employees,
  currency,
  month,
}: {
  payroll: PayrollRow[];
  employees: EmployeeOption[];
  currency: string;
  month: string;
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PayrollRow | null>(null);
  const [presetEmployeeId, setPresetEmployeeId] = useState<string | undefined>(undefined);

  const rows: PayrollMergedRow[] = useMemo(() => {
    return employees.map((employee) => ({
      employee,
      payroll: payroll.find((p) => p.employeeId === employee.id && p.month === month) ?? null,
    }));
  }, [employees, payroll, month]);

  const summary = useMemo(() => {
    const monthRows = rows.filter((r) => r.payroll).map((r) => r.payroll!);
    return {
      count: monthRows.length,
      base: monthRows.reduce((s, p) => s + p.baseAmount, 0),
      ded: monthRows.reduce((s, p) => s + p.deductions, 0),
      adv: monthRows.reduce((s, p) => s + p.advances, 0),
      net: monthRows.reduce((s, p) => s + p.net, 0),
      paidCount: monthRows.filter((p) => p.paid).length,
    };
  }, [rows]);

  function changeMonth(value: string) {
    if (value) router.push(`/payroll?month=${value}`);
  }

  function openCreate(presetId?: string) {
    setEditing(null);
    setPresetEmployeeId(presetId);
    setFormOpen(true);
  }

  function openEdit(row: PayrollMergedRow) {
    if (!row.payroll) return;
    setEditing(row.payroll);
    setPresetEmployeeId(undefined);
    setFormOpen(true);
  }

  async function handleTogglePaid(p: PayrollRow, paid: boolean) {
    await setPayrollPaid(p.id, paid);
  }

  async function handleDelete(p: PayrollRow) {
    await deletePayroll(p.id);
  }

  return (
    <div>
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-end gap-2">
          <div className="space-y-1">
            <label className="text-xs text-secondary-500">الشهر</label>
            <Input
              type="month"
              value={month}
              onChange={(e) => changeMonth(e.target.value)}
              className="w-44"
            />
          </div>
        </div>

        <Button onClick={() => openCreate()} disabled={employees.length === 0}>
          <Plus className="w-4 h-4" />
          تسجيل راتب
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 lg:grid-cols-5">
        <Card className="p-4">
          <div className="text-xs text-secondary-500 dark:text-secondary-400">الموظفون المسجّلون</div>
          <div className="mt-1 text-xl font-bold text-secondary-900 dark:text-secondary-100">
            {summary.count}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-secondary-500 dark:text-secondary-400">إجمالي الراتب الأساسي</div>
          <div className="mt-1 text-xl font-bold text-secondary-900 dark:text-secondary-100">
            {formatMoney(summary.base, currency)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-secondary-500 dark:text-secondary-400">إجمالي الخصومات + السلف</div>
          <div className="mt-1 text-xl font-bold text-red-600 dark:text-red-400">
            {formatMoney(summary.ded + summary.adv, currency)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-secondary-500 dark:text-secondary-400">صافي المستحق الإجمالي</div>
          <div className="mt-1 text-xl font-bold text-primary-700 dark:text-primary-400">
            {formatMoney(summary.net, currency)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-secondary-500 dark:text-secondary-400">تم الصرف</div>
          <div className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {summary.paidCount} / {summary.count}
          </div>
        </Card>
      </div>

      {employees.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-2 py-16 text-center">
          <Wallet className="w-8 h-8 text-secondary-400" />
          <p className="text-secondary-500 dark:text-secondary-400">
            لا يوجد موظفون. أضف موظفًا أولًا من شاشة «الموظفون».
          </p>
        </div>
      ) : rows.every((r) => !r.payroll) ? (
        <div className="card flex flex-col items-center justify-center gap-2 py-16 text-center">
          <p className="text-secondary-500 dark:text-secondary-400">
            لا توجد رواتب مسجّلة لشهر {month}. استخدم «تسجيل راتب» أو زر «تسجيل» بجانب كل موظف.
          </p>
        </div>
      ) : (
        <PayrollTable
          rows={rows}
          currency={currency}
          onEdit={openEdit}
          onRegister={(emp) => openCreate(emp.id)}
          onTogglePaid={handleTogglePaid}
          onDelete={handleDelete}
        />
      )}

      <PayrollFormDialog
        key={editing?.id ?? (presetEmployeeId ?? "new")}
        open={formOpen}
        onOpenChange={setFormOpen}
        payroll={editing}
        employees={employees}
        month={month}
        currency={currency}
        presetEmployeeId={presetEmployeeId}
      />
    </div>
  );
}
