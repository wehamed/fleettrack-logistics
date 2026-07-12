"use client";

import { useMemo, useState } from "react";
import { Search, History } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ActivityRow = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  summary: string;
  createdAt: string; // ISO
};

const ACTION_OPTIONS = ["الكل", "إضافة", "تعديل", "حذف", "إضافة/تعديل", "استيراد", "تصدير"];
const ENTITY_OPTIONS = [
  "الكل",
  "شاحنة",
  "موظف",
  "إيراد",
  "مصروف",
  "راتب",
  "إعدادات الشركة",
  "النسخة الاحتياطية",
  "سجل النشاط",
];

function badgeClass(action: string): string {
  if (action === "حذف")
    return "bg-danger-100 text-danger-700 dark:bg-danger-500/20 dark:text-danger-300";
  if (action === "إضافة" || action === "استيراد")
    return "bg-accent-100 text-accent-700 dark:bg-accent-500/20 dark:text-accent-300";
  if (action === "تصدير")
    return "bg-secondary-100 text-secondary-700 dark:bg-secondary-500/20 dark:text-secondary-300";
  return "bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-300";
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ActivityView({ logs }: { logs: ActivityRow[] }) {
  const [action, setAction] = useState("الكل");
  const [entity, setEntity] = useState("الكل");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim();
    return logs.filter((l) => {
      if (action !== "الكل" && l.action !== action) return false;
      if (entity !== "الكل" && l.entityType !== entity) return false;
      if (needle && !l.summary.includes(needle) && !(l.entityId ?? "").includes(needle))
        return false;
      return true;
    });
  }, [logs, action, entity, q]);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-wrap items-end gap-3 py-4">
          <div className="space-y-1.5 min-w-[160px]">
            <Label>العملية</Label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTION_OPTIONS.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 min-w-[180px]">
            <Label>الكيان</Label>
            <Select value={entity} onValueChange={setEntity}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENTITY_OPTIONS.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 flex-1 min-w-[200px]">
            <Label>بحث</Label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ابحث في التفاصيل أو المعرّف"
                className="pr-9"
              />
            </div>
          </div>
          <div className="text-sm text-secondary-500 pb-1">
            إجمالي السجلات: {filtered.length}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-secondary-400">
              <History className="w-10 h-10" />
              <p>لا توجد عمليات مطابقة</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-secondary-200 bg-secondary-50 text-secondary-600 dark:border-secondary-700 dark:bg-secondary-800/50 dark:text-secondary-300">
                    <th className="text-right font-medium px-4 py-3">#</th>
                    <th className="text-right font-medium px-4 py-3">التاريخ والوقت</th>
                    <th className="text-right font-medium px-4 py-3">العملية</th>
                    <th className="text-right font-medium px-4 py-3">الكيان</th>
                    <th className="text-right font-medium px-4 py-3">التفاصيل</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((l, i) => (
                    <tr
                      key={l.id}
                      className="border-b border-secondary-100 last:border-0 hover:bg-secondary-50 dark:border-secondary-800 dark:hover:bg-secondary-800/40"
                    >
                      <td className="px-4 py-3 text-secondary-400">{i + 1}</td>
                      <td className="px-4 py-3 text-secondary-600 dark:text-secondary-300 whitespace-nowrap">
                        {formatDateTime(l.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium " +
                            badgeClass(l.action)
                          }
                        >
                          {l.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-secondary-700 dark:text-secondary-200">
                        {l.entityType}
                      </td>
                      <td className="px-4 py-3 text-secondary-800 dark:text-secondary-100">
                        {l.summary}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
