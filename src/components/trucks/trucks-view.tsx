"use client";

import { useState, useMemo } from "react";
import { List, LayoutGrid, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TruckTable } from "./truck-table";
import { TruckKanban } from "./truck-kanban";
import { TruckFormDialog } from "./truck-form-dialog";
import { TruckDetailDialog } from "./truck-detail-dialog";
import { cn } from "@/lib/utils";

export type TruckRow = {
  id: string;
  plateNumber: string;
  model: string;
  year: number | null;
  purchaseValue: number | null;
  purchaseDate: string | null;
  status: string;
  currentDriver: { id: string; name: string } | null;
};

type DriverOption = { id: string; name: string };

export function TrucksView({
  trucks,
  drivers,
}: {
  trucks: TruckRow[];
  drivers: DriverOption[];
}) {
  const [view, setView] = useState<"list" | "kanban">("list");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TruckRow | null>(null);
  const [detail, setDetail] = useState<TruckRow | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim();
    if (!q) return trucks;
    return trucks.filter(
      (t) =>
        t.plateNumber.includes(q) ||
        t.model.includes(q) ||
        (t.currentDriver?.name ?? "").includes(q)
    );
  }, [trucks, search]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(truck: TruckRow) {
    setEditing(truck);
    setFormOpen(true);
  }

  return (
    <div>
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
          <Input
            placeholder="بحث برقم اللوحة أو الموديل أو السائق..."
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
            إضافة شاحنة
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-2 py-16 text-center">
          <p className="text-secondary-500 dark:text-secondary-400">
            لا توجد شاحنات مطابقة للبحث.
          </p>
        </div>
      ) : view === "list" ? (
        <TruckTable
          trucks={filtered}
          onEdit={openEdit}
          onOpen={setDetail}
        />
      ) : (
        <TruckKanban trucks={filtered} onEdit={openEdit} onOpen={setDetail} />
      )}

      <TruckFormDialog
        key={editing?.id ?? "new"}
        open={formOpen}
        onOpenChange={setFormOpen}
        truck={editing}
      />

      <TruckDetailDialog
        truck={detail}
        drivers={drivers}
        onClose={() => setDetail(null)}
        onEdit={(t) => {
          setDetail(null);
          openEdit(t);
        }}
      />
    </div>
  );
}
