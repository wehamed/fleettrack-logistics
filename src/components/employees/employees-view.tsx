"use client";

import { useState, useMemo } from "react";
import { List, LayoutGrid, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmployeeTable } from "./employee-table";
import { EmployeeKanban } from "./employee-kanban";
import { EmployeeFormDialog } from "./employee-form-dialog";
import { EmployeeDetailDialog } from "./employee-detail-dialog";
import { cn } from "@/lib/utils";

export type EmployeeRow = {
  id: string;
  name: string;
  role: string;
  salaryType: string;
  baseSalary: number | null;
  phone: string | null;
  hireDate: string | null;
  assignedTruck: string | null;
};

export function EmployeesView({ employees }: { employees: EmployeeRow[] }) {
  const [view, setView] = useState<"list" | "kanban">("list");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EmployeeRow | null>(null);
  const [detail, setDetail] = useState<EmployeeRow | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim();
    if (!q) return employees;
    return employees.filter(
      (e) =>
        e.name.includes(q) ||
        e.role.includes(q) ||
        (e.assignedTruck ?? "").includes(q) ||
        (e.phone ?? "").includes(q)
    );
  }, [employees, search]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(emp: EmployeeRow) {
    setEditing(emp);
    setFormOpen(true);
  }

  return (
    <div>
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
          <Input
            placeholder="بحث بالاسم أو الدور أو الشاحنة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-secondary-200 bg-white p-0.5 dark:border-secondary-700 dark:bg-secondary-800">
            <button
              onClick={() => setView("list")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                view === "list"
                  ? "bg-primary-600 text-white"
                  : "text-secondary-600 hover:bg-secondary-100 dark:text-secondary-300 dark:hover:bg-secondary-700"
              )}
            >
              <List className="w-4 h-4" />
              قائمة
            </button>
            <button
              onClick={() => setView("kanban")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                view === "kanban"
                  ? "bg-primary-600 text-white"
                  : "text-secondary-600 hover:bg-secondary-100 dark:text-secondary-300 dark:hover:bg-secondary-700"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
              كروت
            </button>
          </div>

          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" />
            إضافة موظف
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-2 py-16 text-center">
          <p className="text-secondary-500 dark:text-secondary-400">
            لا يوجد موظفون مطابقون للبحث.
          </p>
        </div>
      ) : view === "list" ? (
        <EmployeeTable employees={filtered} onEdit={openEdit} onOpen={setDetail} />
      ) : (
        <EmployeeKanban employees={filtered} onEdit={openEdit} onOpen={setDetail} />
      )}

      <EmployeeFormDialog open={formOpen} onOpenChange={setFormOpen} employee={editing} />

      <EmployeeDetailDialog
        employee={detail}
        onClose={() => setDetail(null)}
        onEdit={(e) => {
          setDetail(null);
          openEdit(e);
        }}
      />
    </div>
  );
}
