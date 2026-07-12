"use client";

import { formatMoney } from "@/lib/money";

export function MonthlyChart({
  series,
  currency,
}: {
  series: { month: string; revenue: number; expense: number }[];
  currency: string;
}) {
  const max = Math.max(1, ...series.flatMap((s) => [s.revenue, s.expense]));

  return (
    <div>
      <div className="mb-3 flex items-center gap-4 text-xs text-secondary-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-accent-500" /> الإيرادات
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-danger-500" /> المصروفات
        </span>
      </div>

      <div className="flex h-60 items-end gap-2 overflow-x-auto">
        {series.map((s) => {
          const rh = (s.revenue / max) * 100;
          const eh = (s.expense / max) * 100;
          return (
            <div key={s.month} className="flex min-w-[44px] flex-1 flex-col items-center gap-1">
              <div className="flex h-44 items-end gap-1">
                <div
                  title={`إيراد ${formatMoney(s.revenue, currency)}`}
                  className="w-4 rounded-t bg-accent-500"
                  style={{ height: `${rh}%` }}
                />
                <div
                  title={`مصروف ${formatMoney(s.expense, currency)}`}
                  className="w-4 rounded-t bg-danger-500"
                  style={{ height: `${eh}%` }}
                />
              </div>
              <div className="text-[10px] text-secondary-400">{s.month.slice(2)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
