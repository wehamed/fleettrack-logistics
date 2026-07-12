"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { savePayroll, type ActionResult } from "@/app/(app)/payroll/actions";
import { toSubunits, formatMoney } from "@/lib/money";
import { SALARY_TYPES } from "@/lib/constants";

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

function parseLocal(v: string): number {
  const t = v.trim();
  if (!t) return 0;
  if (!/^\d+(\.\d{1,2})?$/.test(t)) return NaN;
  return toSubunits(t);
}

export function PayrollFormDialog({
  open,
  onOpenChange,
  payroll,
  employees,
  month,
  currency,
  presetEmployeeId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  payroll: PayrollRow | null;
  employees: EmployeeOption[];
  month: string;
  currency: string;
  presetEmployeeId?: string;
}) {
  const editing = payroll != null;
  const [employeeId, setEmployeeId] = useState("");
  const [baseAmount, setBaseAmount] = useState("");
  const [deductions, setDeductions] = useState("");
  const [advances, setAdvances] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (payroll) {
      setEmployeeId(payroll.employeeId);
      setBaseAmount((payroll.baseAmount / 100).toFixed(2));
      setDeductions((payroll.deductions / 100).toFixed(2));
      setAdvances((payroll.advances / 100).toFixed(2));
      setNotes(payroll.notes ?? "");
    } else {
      const empId = presetEmployeeId ?? employees[0]?.id ?? "";
      setEmployeeId(empId);
      const emp = employees.find((e) => e.id === empId);
      setBaseAmount(emp && emp.baseSalary != null ? (emp.baseSalary / 100).toFixed(2) : "");
      setDeductions("");
      setAdvances("");
      setNotes("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, payroll]);

  function onEmployeeChange(id: string) {
    setEmployeeId(id);
    const emp = employees.find((e) => e.id === id);
    if (emp && emp.baseSalary != null) {
      setBaseAmount((emp.baseSalary / 100).toFixed(2));
    }
  }

  const base = parseLocal(baseAmount);
  const ded = parseLocal(deductions);
  const adv = parseLocal(advances);
  const netValid = !isNaN(base);
  const net = netValid ? base - (isNaN(ded) ? 0 : ded) - (isNaN(adv) ? 0 : adv) : NaN;

  async function handleSubmit() {
    setError(null);
    const fd = new FormData();
    if (editing && payroll) fd.append("id", payroll.id);
    fd.append("employeeId", employeeId);
    fd.append("month", month);
    fd.append("baseAmount", baseAmount);
    fd.append("deductions", deductions);
    fd.append("advances", advances);
    fd.append("notes", notes);

    setPending(true);
    const res: ActionResult = await savePayroll(fd);
    setPending(false);
    if (!res.ok) {
      setError(res.error ?? "تعذّر الحفظ");
      return;
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "تعديل راتب شهر" : "تسجيل راتب شهر"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>الموظف</Label>
              <Select value={employeeId} onValueChange={onEmployeeChange} disabled={editing}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الموظف" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name} ({SALARY_TYPES.find((s) => s.value === e.salaryType)?.label ?? e.salaryType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>الشهر</Label>
              <Input value={month} disabled className="bg-secondary-50 dark:bg-secondary-900" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>الراتب الأساسي ({currency})</Label>
            <Input
              inputMode="decimal"
              value={baseAmount}
              onChange={(e) => setBaseAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>الخصومات ({currency})</Label>
              <Input
                inputMode="decimal"
                value={deductions}
                onChange={(e) => setDeductions(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1.5">
              <Label>السلف ({currency})</Label>
              <Input
                inputMode="decimal"
                value={advances}
                onChange={(e) => setAdvances(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="rounded-lg border border-secondary-200 bg-secondary-50 p-3 text-sm dark:border-secondary-700 dark:bg-secondary-900">
            <div className="flex items-center justify-between">
              <span className="text-secondary-600 dark:text-secondary-300">
                صافي المستحق = الأساسي − الخصومات − السلف
              </span>
              <span
                className={
                  netValid
                    ? net < 0
                      ? "font-bold text-red-600 dark:text-red-400"
                      : "font-bold text-primary-700 dark:text-primary-400"
                    : "font-bold text-secondary-400"
                }
              >
                {netValid ? formatMoney(net, currency) : "—"}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>ملاحظات</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي ملاحظة عن الراتب أو الخصومات..."
              rows={2}
            />
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" disabled={pending}>
              إلغاء
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={pending || employees.length === 0}>
            حفظ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
