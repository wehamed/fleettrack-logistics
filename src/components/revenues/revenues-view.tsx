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
import { RevenueTable } from "./revenue-table";
import { RevenueKanban } from "./revenue-kanban";
import { RevenueFormDialog } from "./revenue-form-dialog";
import { RevenueDetailDialog } from "./revenue-detail-dialog";
import { REVENUE_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type RevenueRow = {
  id: string;
  truckId: string;
  truckPlate: string;
  date: string;
  clientName: string;
  destination: string | null;
  revenueType: string;
  amount: number;
  notes: string | null;
};

export type TruckOption = { id: string; plateNumber: string };

export function RevenuesView({
  revenues,
  trucks,
  currency,
}: {
  revenues: RevenueRow[];
  trucks: TruckOption[];
  currency: string;
}) {
  const [view, setView] = useState<"list" | "kanban">("list");
  const [search, setSearch] = useState("");
  const [filterTruck, setFilterTruck] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterType, setFilterType] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RevenueRow | null>(null);
  const [detail, setDetail] = useState<RevenueRow | null>(null);

  const hasActiveFilter =
    filterTruck !== "" || filterMonth !== "" || filterType !== "" || search.trim() !== "";

  const filtered = useMemo(() => {
    const q = search.trim();
    return revenues.filter((r) => {
      if (q) {
        const hay = [r.truckPlate, r.clientName, r.destination ?? "", r.revenueType].join(" ");
        if (!hay.includes(q)) return false;
      }
      if (filterTruck && r.truckId !== filterTruck) return false;
      if (filterMonth && !r.date.startsWith(filterMonth)) return false;
      if (filterType && r.revenueType !== filterType) return false;
      return true;
    });
  }, [revenues, search, filterTruck, filterMonth, filterType]);

  function clearFilters() {
    setSearch("");
    setFilterTruck("");
    setFilterMonth("");
    setFilterType("");
  }

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(r: RevenueRow) {
    setEditing(r);
    setFormOpen(true);
  }

  return (
    <div>
      <div className="flex flex-col gap-3 mb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
          <Input
            placeholder="بحث بالشاحنة أو العميل أو الوجهة..."
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

          <Button onClick={openCreate} disabled={trucks.length === 0}>
            <Plus className="w-4 h-4" />
            إضافة إيراد
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

        <Select value={filterType || "all"} onValueChange={(v) => setFilterType(v === "all" ? "" : v)}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="كل أنواع الإيراد" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل أنواع الإيراد</SelectItem>
            {REVENUE_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
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

      {trucks.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-2 py-16 text-center">
          <p className="text-secondary-500 dark:text-secondary-400">
            يجب إضافة شاحنة أولاً قبل تسجيل الإيرادات.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-2 py-16 text-center">
          <p className="text-secondary-500 dark:text-secondary-400">
            لا توجد إيرادات مطابقة للفلتر أو البحث.
          </p>
        </div>
      ) : view === "list" ? (
        <RevenueTable revenues={filtered} currency={currency} onEdit={openEdit} onOpen={setDetail} />
      ) : (
        <RevenueKanban revenues={filtered} currency={currency} onEdit={openEdit} onOpen={setDetail} />
      )}

      <RevenueFormDialog
        key={editing?.id ?? "new"}
        open={formOpen}
        onOpenChange={setFormOpen}
        revenue={editing}
        trucks={trucks}
      />

      <RevenueDetailDialog
        revenue={detail}
        currency={currency}
        onClose={() => setDetail(null)}
        onEdit={(r) => {
          setDetail(null);
          openEdit(r);
        }}
      />
    </div>
  );
}
