"use client";

import { Eye, Pencil, Truck, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { REVENUE_TYPES } from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import type { RevenueRow } from "./revenues-view";

function typeLabel(v: string) {
  return REVENUE_TYPES.find((r) => r.value === v)?.label ?? v;
}

export function RevenueKanban({
  revenues,
  currency,
  onEdit,
  onOpen,
}: {
  revenues: RevenueRow[];
  currency: string;
  onEdit: (r: RevenueRow) => void;
  onOpen: (r: RevenueRow) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {revenues.map((r) => (
        <Card key={r.id} className="card-hover p-4 cursor-pointer" onClick={() => onOpen(r)}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-bold text-secondary-900 dark:text-secondary-100">
                {r.clientName}
              </div>
              <div className="mt-1 flex items-center gap-1 text-sm text-secondary-500 dark:text-secondary-400">
                <Truck className="w-3.5 h-3.5 text-secondary-400" />
                {r.truckPlate}
              </div>
            </div>
            <Badge variant="accent">{typeLabel(r.revenueType)}</Badge>
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-secondary-500 dark:text-secondary-400">التاريخ</span>
              <span className="font-medium text-secondary-700 dark:text-secondary-200">{r.date}</span>
            </div>
            {r.destination && (
              <div className="flex items-center justify-between">
                <span className="text-secondary-500 dark:text-secondary-400">الوجهة</span>
                <span className="flex items-center gap-1 font-medium text-secondary-700 dark:text-secondary-200">
                  <MapPin className="w-3.5 h-3.5 text-secondary-400" />
                  {r.destination}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-secondary-500 dark:text-secondary-400">القيمة</span>
              <span className="font-semibold text-accent-700 dark:text-accent-300">
                {formatMoney(r.amount, currency)}
              </span>
            </div>
          </div>

          <div
            className="mt-4 flex items-center gap-2 border-t border-secondary-100 pt-3 dark:border-secondary-700"
            onClick={(e) => e.stopPropagation()}
          >
            <Button variant="outline" size="sm" className="flex-1" onClick={() => onOpen(r)}>
              <Eye className="w-3.5 h-3.5" />
              تفاصيل
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onEdit(r)}>
              <Pencil className="w-3.5 h-3.5" />
              تعديل
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
