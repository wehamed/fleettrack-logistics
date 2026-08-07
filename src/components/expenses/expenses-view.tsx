"use client";

import { useState, useMemo } from "react";
import { List, LayoutGrid, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExpenseTable } from "./expense-table";
import { ExpenseKanban } from "./expense-kanban";
import { ExpenseFormDialog } from "./expense-form-dialog";
import { ExpenseDetailDialog } from "./expense-detail-dialog";
import { cn } from "@/lib/utils";

export type ExpenseRow = {
  id: string;
  truckId: string | null;
  truckPlate: string | null;
  categoryId: string;
  categoryName: string;
  date: string;
  amount: number;
  description: string | null;
  receiptImage: string | null;
};

export type TruckOption = { id: string; plateNumber: string };
export type CategoryOption = { id: string; name: string };

export function ExpensesView({
  expenses,
  trucks,
  categories,
  currency,
}: {
  expenses: ExpenseRow[];
  trucks: TruckOption[];
  categories: CategoryOption[];
  currency: string;
}) {
  const [view, setView] = useState<"list" | "kanban">("list");
  const [search, setSearch] = useState("");
  const [filterTruck, setFilterTruck] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ExpenseRow | null>(null);
  const [detail, setDetail] = useState<ExpenseRow | null>(null);

  const hasActiveFilter =
    filterTruck !== "" || filterMonth !== "" || filterCategory !== "" || search.trim() !== "";

  const filtered = useMemo(() => {
    const q = search.trim();
    return expenses.filter((e) => {
      if (q) {
        const hay = [e.truckPlate ?? "عام", e.categoryName, e.description ?? ""].join(" ");
        if (!hay.includes(q)) return false;
      }
      if (filterTruck === "general" && e.truckId !== null) return false;
      if (filterTruck && filterTruck !== "general" && e.truckId !== filterTruck) return false;
      if (filterMonth && !e.date.startsWith(filterMonth)) return false;
      if (filterCategory && e.categoryId !== filterCategory) return false;
      return true;
    });
  }, [expenses, search, filterTruck, filterMonth, filterCategory]);

  function clearFilters() {
    setSearch("");
    setFilterTruck("");
    setFilterMonth("");
    setFilterCategory("");
  }

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(e: ExpenseRow) {
    setEditing(e);
    setFormOpen(true);
  }

  return (
    <div>
      <div className="flex flex-col gap-3 mb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
          <Input
            placeholder="بحث بالشاحنة أو التصنيف أو الوصف..."
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

          <Button onClick={openCreate} disabled={categories.length === 0}>
            <Plus className="w-4 h-4" />
            إضافة مصروف
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4 rounded-lg border border-secondary-200 bg-white p-3 dark:border-secondary-700 dark:bg-secondary-800">
        <Select value={filterTruck || "all"} onValueChange={(v) => setFilterTruck(v === "all" ? "" : v)}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="كل الشاحنات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الشاحنات</SelectItem>
            <SelectItem value="general">مصاريف عامة فقط</SelectItem>
            {trucks.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.plateNumber}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="w-full sm:w-44"
          aria-label="تصفية حسب الشهر"
        />

        <Select
          value={filterCategory || "all"}
          onValueChange={(v) => setFilterCategory(v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="كل التصنيفات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل التصنيفات</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilter && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-secondary-500">
            <X className="w-4 h-4" />
            مسح الفلاتر
          </Button>
        )}
      </div>

      {categories.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-2 py-16 text-center">
          <p className="text-secondary-500 dark:text-secondary-400">
            لا توجد تصنيفات مصاريف. أعد تشغيل سكربت التصنيفات (seed).
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-2 py-16 text-center">
          <p className="text-secondary-500 dark:text-secondary-400">
            لا توجد مصاريف مطابقة للفلتر أو البحث.
          </p>
        </div>
      ) : view === "list" ? (
        <ExpenseTable expenses={filtered} currency={currency} onEdit={openEdit} onOpen={setDetail} />
      ) : (
        <ExpenseKanban expenses={filtered} currency={currency} onEdit={openEdit} onOpen={setDetail} />
      )}

      <ExpenseFormDialog
        key={editing?.id ?? "new"}
        open={formOpen}
        onOpenChange={setFormOpen}
        expense={editing}
        trucks={trucks}
        categories={categories}
      />

      <ExpenseDetailDialog
        expense={detail}
        currency={currency}
        onClose={() => setDetail(null)}
        onEdit={(e) => {
          setDetail(null);
          openEdit(e);
        }}
      />
    </div>
  );
}
