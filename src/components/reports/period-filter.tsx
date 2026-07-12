"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function ym(y: number, m: number) {
  return `${y}-${String(m).padStart(2, "0")}`;
}
function monthStartEnd(offset: number) {
  const d = new Date();
  const dt = new Date(d.getFullYear(), d.getMonth() - offset, 1);
  const last = new Date(dt.getFullYear(), dt.getMonth() + 1, 0);
  return { from: ym(dt.getFullYear(), dt.getMonth() + 1), to: ym(last.getFullYear(), last.getMonth() + 1) };
}
function yearRange() {
  const d = new Date();
  const from = `${d.getFullYear()}-01-01`;
  const to = `${d.getFullYear()}-12-31`;
  return { from, to };
}

export function PeriodFilter({
  from,
  to,
  onChange,
}: {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}) {
  const quick: { label: string; range: () => { from: string; to: string } }[] = [
    { label: "هذا الشهر", range: () => monthStartEnd(0) },
    { label: "آخر 3 أشهر", range: () => monthStartEnd(2) },
    { label: "هذه السنة", range: () => yearRange() },
    { label: "الكل", range: () => ({ from: "2000-01-01", to: "2100-12-31" }) },
  ];

  function isActive(r: { from: string; to: string }) {
    return r.from === from && r.to === to;
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="space-y-1">
        <label className="text-xs text-secondary-500 dark:text-secondary-400">من</label>
        <Input type="date" value={from} onChange={(e) => onChange(e.target.value, to)} className="w-40" />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-secondary-500 dark:text-secondary-400">إلى</label>
        <Input type="date" value={to} onChange={(e) => onChange(from, e.target.value)} className="w-40" />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {quick.map((q) => {
          const r = q.range();
          return (
            <Button
              key={q.label}
              size="sm"
              variant="outline"
              className={cn(isActive(r) && "border-primary-500 text-primary-700")}
              onClick={() => onChange(r.from, r.to)}
            >
              {q.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
