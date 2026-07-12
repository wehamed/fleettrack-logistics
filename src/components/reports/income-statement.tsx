"use client";

import { useMemo } from "react";
import { FileSpreadsheet, Printer, Download, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatMoney } from "@/lib/money";
import {
  filterByRange,
  computeSummary,
  buildStatementRows,
  type ReportDataset,
} from "@/lib/compute-reports";

type CompanyInfo = {
  companyName: string;
  logoUrl: string | null;
  address: string;
  phone: string;
  email: string;
  taxNumber: string;
};

export function IncomeStatement({
  data,
  from,
  to,
  company,
}: {
  data: ReportDataset;
  from: string;
  to: string;
  company: CompanyInfo;
}) {
  const filtered = useMemo(() => filterByRange(data, from, to), [data, from, to]);
  const summary = useMemo(() => computeSummary(filtered), [filtered]);
  const rows = useMemo(
    () => buildStatementRows(filtered, data.trucks),
    [filtered, data.trucks]
  );

  const generatedAt = useMemo(
    () =>
      new Intl.DateTimeFormat("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date()),
    []
  );

  async function downloadFile(url: string, filename: string) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Export failed");
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(blobUrl);
  }

  function exportExcel() {
    downloadFile(`/api/reports/excel?from=${from}&to=${to}`, `income-statement-${from}-${to}.xlsx`);
  }

  function exportPdf() {
    downloadFile(`/api/reports/pdf?from=${from}&to=${to}`, `income-statement-${from}-${to}.pdf`);
  }

  const pl: { label: string; value: number; sign: 1 | -1 }[] = [
    { label: "إجمالي الإيرادات", value: summary.totalRevenue, sign: 1 },
    { label: "إجمالي المصروفات المباشرة", value: summary.totalDirect, sign: -1 },
    { label: "إجمالي المصاريف العامة", value: summary.totalGeneral, sign: -1 },
    { label: "إجمالي الرواتب", value: summary.totalPayroll, sign: -1 },
  ];

  return (
    <div id="print-area">
      {/* ترويسة التقرير المطبوع */}
      <div className="flex items-center justify-between gap-4 border-b border-secondary-200 pb-4 mb-5 dark:border-secondary-700">
        <div className="flex items-center gap-3">
          {company.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={company.logoUrl} alt="شعار الشركة" className="h-14 w-auto object-contain" />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-primary-600 flex items-center justify-center">
              <Truck className="w-7 h-7 text-white" />
            </div>
          )}
          <div>
            <div className="text-lg font-bold text-secondary-900 dark:text-white">
              {company.companyName || "نظام كنوال المالي"}
            </div>
            {company.address && (
              <div className="text-xs text-secondary-500">{company.address}</div>
            )}
            <div className="text-xs text-secondary-500 mt-0.5">
              {[company.phone, company.email, company.taxNumber && `الرقم الضريبي: ${company.taxNumber}`]
                .filter(Boolean)
                .join("  •  ")}
            </div>
          </div>
        </div>
        <div className="text-left">
          <div className="font-semibold text-secondary-800 dark:text-secondary-100">
            قائمة الدخل التفصيلية
          </div>
          <div className="text-xs text-secondary-500 mt-1">
            الفترة: {from} ← {to}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>ملخص الفترة</CardTitle>
          <div className="no-print flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportExcel}>
              <FileSpreadsheet className="w-4 h-4" />
              تصدير Excel
            </Button>
            <Button variant="outline" size="sm" onClick={exportPdf}>
              <Download className="w-4 h-4" />
              تصدير PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="w-4 h-4" />
              طباعة
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            {pl.map((p) => (
              <div key={p.label} className="rounded-lg border border-secondary-200 p-3 dark:border-secondary-700">
                <div className="text-xs text-secondary-500 dark:text-secondary-400">{p.label}</div>
                <div
                  className={
                    "mt-1 text-lg font-bold " +
                    (p.sign > 0 ? "text-accent-600" : "text-danger-600")
                  }
                >
                  {formatMoney(p.value, data.currency)}
                </div>
              </div>
            ))}
            <div className="rounded-lg border border-primary-200 bg-primary-50 p-3 dark:border-primary-700 dark:bg-primary-900/20">
              <div className="text-xs text-secondary-500">صافي الربح</div>
              <div
                className={
                  "mt-1 text-lg font-bold " +
                  (summary.netProfit >= 0 ? "text-primary-700 dark:text-primary-400" : "text-danger-600")
                }
              >
                {formatMoney(summary.netProfit, data.currency)}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-secondary-200 bg-secondary-50 text-secondary-600 dark:border-secondary-700 dark:bg-secondary-800 dark:text-secondary-300">
                  <th className="px-3 py-2 text-right font-medium">النوع</th>
                  <th className="px-3 py-2 text-right font-medium">التاريخ</th>
                  <th className="px-3 py-2 text-right font-medium">البيان</th>
                  <th className="px-3 py-2 text-left font-medium">المبلغ</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-secondary-400">
                      لا توجد حركات في هذه الفترة
                    </td>
                  </tr>
                ) : (
                  rows.map((r, i) => (
                    <tr key={i} className="border-b border-secondary-100 last:border-0 dark:border-secondary-800">
                      <td className="px-3 py-2">
                        <span
                          className={
                            "inline-block rounded-full px-2 py-0.5 text-xs " +
                            (r.sign > 0
                              ? "bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300"
                              : "bg-danger-100 text-danger-700 dark:bg-danger-900/40 dark:text-danger-300")
                          }
                        >
                          {r.kind}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-secondary-500">{r.date}</td>
                      <td className="px-3 py-2 text-secondary-700 dark:text-secondary-200">{r.desc}</td>
                      <td
                        className={
                          "px-3 py-2 text-left font-medium " +
                          (r.sign > 0 ? "text-accent-600" : "text-danger-600")
                        }
                      >
                        {r.sign > 0 ? "+" : "−"}
                        {formatMoney(r.amount, data.currency)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ذيل التقرير المطبوع */}
      <div className="mt-5 flex items-center justify-between border-t border-secondary-200 pt-3 text-xs text-secondary-400 dark:border-secondary-700">
        <span>تم إنشاء هذا التقرير في: {generatedAt}</span>
        <span>نظام كنوال المالي — تقرير قائمة الدخل</span>
      </div>
    </div>
  );
}
