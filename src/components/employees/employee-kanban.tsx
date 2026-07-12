"use client";

import { Eye, Pencil, Truck, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EMPLOYEE_ROLES, SALARY_TYPES } from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import type { EmployeeRow } from "./employees-view";

function roleLabel(v: string) {
  return EMPLOYEE_ROLES.find((r) => r.value === v)?.label ?? v;
}
function salaryLabel(v: string) {
  return SALARY_TYPES.find((s) => s.value === v)?.label ?? v;
}

export function EmployeeKanban({
  employees,
  onEdit,
  onOpen,
}: {
  employees: EmployeeRow[];
  onEdit: (e: EmployeeRow) => void;
  onOpen: (e: EmployeeRow) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {employees.map((e) => (
        <Card key={e.id} className="card-hover p-4 cursor-pointer" onClick={() => onOpen(e)}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-bold text-secondary-900 dark:text-secondary-100">
                {e.name}
              </div>
              <div className="mt-1">
                <Badge variant="secondary">{roleLabel(e.role)}</Badge>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-secondary-500 dark:text-secondary-400">نوع الراتب</span>
              <span className="font-medium text-secondary-700 dark:text-secondary-200">
                {salaryLabel(e.salaryType)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-secondary-500 dark:text-secondary-400">الراتب الأساسي</span>
              <span className="font-medium text-secondary-700 dark:text-secondary-200">
                {e.baseSalary != null ? formatMoney(e.baseSalary) : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-secondary-500 dark:text-secondary-400">الشاحنة</span>
              <span className="flex items-center gap-1 font-medium text-secondary-700 dark:text-secondary-200">
                <Truck className="w-3.5 h-3.5 text-secondary-400" />
                {e.assignedTruck ?? "—"}
              </span>
            </div>
            {e.phone && (
              <div className="flex items-center justify-between">
                <span className="text-secondary-500 dark:text-secondary-400">الهاتف</span>
                <span className="flex items-center gap-1 font-medium text-secondary-700 dark:text-secondary-200">
                  <Phone className="w-3.5 h-3.5 text-secondary-400" />
                  {e.phone}
                </span>
              </div>
            )}
          </div>

          <div
            className="mt-4 flex items-center gap-2 border-t border-secondary-100 pt-3 dark:border-secondary-700"
            onClick={(ev) => ev.stopPropagation()}
          >
            <Button variant="outline" size="sm" className="flex-1" onClick={() => onOpen(e)}>
              <Eye className="w-3.5 h-3.5" />
              تفاصيل
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onEdit(e)}>
              <Pencil className="w-3.5 h-3.5" />
              تعديل
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
