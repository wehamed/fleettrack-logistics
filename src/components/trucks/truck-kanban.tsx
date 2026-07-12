"use client";

import { Eye, Pencil, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { statusBadgeClass, statusLabel } from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import type { TruckRow } from "./trucks-view";

export function TruckKanban({
  trucks,
  onEdit,
  onOpen,
}: {
  trucks: TruckRow[];
  onEdit: (t: TruckRow) => void;
  onOpen: (t: TruckRow) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {trucks.map((t) => (
        <Card key={t.id} className="card-hover p-4 cursor-pointer" onClick={() => onOpen(t)}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-bold text-secondary-900 dark:text-secondary-100">
                {t.plateNumber}
              </div>
              <div className="text-sm text-secondary-500 dark:text-secondary-400">
                {t.model} {t.year ? `· ${t.year}` : ""}
              </div>
            </div>
            <span className={`status-badge ${statusBadgeClass(t.status)}`}>
              {statusLabel(t.status)}
            </span>
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-secondary-500 dark:text-secondary-400">السائق</span>
              <span className="flex items-center gap-1 font-medium text-secondary-700 dark:text-secondary-200">
                <User className="w-3.5 h-3.5 text-secondary-400" />
                {t.currentDriver?.name ?? "بدون سائق"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-secondary-500 dark:text-secondary-400">قيمة الشراء</span>
              <span className="font-medium text-secondary-700 dark:text-secondary-200">
                {t.purchaseValue != null ? formatMoney(t.purchaseValue) : "—"}
              </span>
            </div>
          </div>

          <div
            className="mt-4 flex items-center gap-2 border-t border-secondary-100 pt-3 dark:border-secondary-700"
            onClick={(e) => e.stopPropagation()}
          >
            <Button variant="outline" size="sm" className="flex-1" onClick={() => onOpen(t)}>
              <Eye className="w-3.5 h-3.5" />
              تفاصيل
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onEdit(t)}>
              <Pencil className="w-3.5 h-3.5" />
              تعديل
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
