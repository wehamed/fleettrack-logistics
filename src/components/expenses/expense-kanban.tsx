"use client";

import { Eye, Pencil, Truck, ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/money";
import type { ExpenseRow } from "./expenses-view";

export function ExpenseKanban({
  expenses,
  currency,
  onEdit,
  onOpen,
}: {
  expenses: ExpenseRow[];
  currency: string;
  onEdit: (e: ExpenseRow) => void;
  onOpen: (e: ExpenseRow) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {expenses.map((e) => (
        <Card key={e.id} className="card-hover p-4 cursor-pointer" onClick={() => onOpen(e)}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-bold text-secondary-900 dark:text-secondary-100">
                {e.categoryName}
              </div>
              <div className="mt-1">
                {e.truckPlate ? (
                  <span className="inline-flex items-center gap-1 text-sm text-secondary-500 dark:text-secondary-400">
                    <Truck className="w-3.5 h-3.5 text-secondary-400" />
                    {e.truckPlate}
                  </span>
                ) : (
                  <Badge variant="secondary">مصروف عام</Badge>
                )}
              </div>
            </div>
            {e.receiptImage && (
              <ImageIcon className="w-4 h-4 text-primary-600" />
            )}
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-secondary-500 dark:text-secondary-400">التاريخ</span>
              <span className="font-medium text-secondary-700 dark:text-secondary-200">{e.date}</span>
            </div>
            {e.description && (
              <div className="flex items-center justify-between">
                <span className="text-secondary-500 dark:text-secondary-400">الوصف</span>
                <span className="max-w-[140px] truncate font-medium text-secondary-700 dark:text-secondary-200">
                  {e.description}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-secondary-500 dark:text-secondary-400">القيمة</span>
              <span className="font-semibold text-danger-700 dark:text-danger-300">
                {formatMoney(e.amount, currency)}
              </span>
            </div>
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
