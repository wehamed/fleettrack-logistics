"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EMPLOYEE_ROLES, SALARY_TYPES } from "@/lib/constants";
import { fromSubunits } from "@/lib/money";
import { createEmployee, updateEmployee } from "@/app/(app)/employees/actions";
import type { EmployeeRow } from "./employees-view";

export function EmployeeFormDialog({
  open,
  onOpenChange,
  employee,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  employee: EmployeeRow | null;
}) {
  const [role, setRole] = useState(employee?.role ?? "سائق");
  const [salaryType, setSalaryType] = useState(employee?.salaryType ?? "ثابت");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const isEdit = Boolean(employee);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const formData = new FormData(e.currentTarget);
    formData.set("role", role);
    formData.set("salaryType", salaryType);

    const res = isEdit
      ? await updateEmployee(employee!.id, formData)
      : await createEmployee(formData);

    setPending(false);
    if (res.ok) {
      onOpenChange(false);
    } else {
      setError(res.error ?? "تعذّر الحفظ");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "تعديل موظف" : "إضافة موظف جديد"}</DialogTitle>
          <DialogDescription>
            أدخل بيانات الموظف. الحقول المميزة بـ * مطلوبة.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">الاسم *</Label>
              <Input id="name" name="name" required defaultValue={employee?.name ?? ""} placeholder="الاسم الكامل" />
            </div>
            <div>
              <Label htmlFor="phone">الهاتف</Label>
              <Input id="phone" name="phone" dir="ltr" defaultValue={employee?.phone ?? ""} placeholder="05xxxxxxxx" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>الدور *</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الدور" />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYEE_ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>نوع الراتب *</Label>
              <Select value={salaryType} onValueChange={setSalaryType}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع الراتب" />
                </SelectTrigger>
                <SelectContent>
                  {SALARY_TYPES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="baseSalary">الراتب الأساسي (بالعملة)</Label>
              <Input
                id="baseSalary"
                name="baseSalary"
                inputMode="decimal"
                defaultValue={employee?.baseSalary != null ? fromSubunits(employee.baseSalary) : ""}
                placeholder="مثال: 5000.00"
              />
            </div>
            <div>
              <Label htmlFor="hireDate">تاريخ التوظيف</Label>
              <Input id="hireDate" name="hireDate" type="date" defaultValue={employee?.hireDate ?? ""} />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-700 dark:bg-danger-900/20">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "جارٍ الحفظ..." : isEdit ? "حفظ التعديلات" : "إضافة موظف"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
