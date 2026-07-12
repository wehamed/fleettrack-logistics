"use client";

import { useState, useMemo } from "react";
import { TrendingUp, DollarSign, Wallet, Receipt, Truck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatMoney } from "@/lib/money";
import {
  filterByRange,
  computeSummary,
  computeRanking,
  computeMonthlySeries,
  defaultRange,
  type ReportDataset,
} from "@/lib/compute-reports";
import { PeriodFilter } from "@/components/reports/period-filter";
import { IncomeStatement } from "@/components/reports/income-statement";
import { MonthlyChart } from "@/components/dashboard/monthly-chart";

type CompanyInfo = {
  companyName: string;
  logoUrl: string | null;
  address: string;
  phone: string;
  email: string;
  taxNumber: string;
};

export function DashboardView({
  data,
  company,
}: {
  data: ReportDataset;
  company: CompanyInfo;
}) {
  const init = defaultRange(data);
  const [from, setFrom] = useState(init.from);
  const [to, setTo] = useState(init.to);

  const filtered = useMemo(() => filterByRange(data, from, to), [data, from, to]);
  const summary = useMemo(() => computeSummary(filtered), [filtered]);
  const ranking = useMemo(() => computeRanking(filtered, data.trucks), [filtered, data.trucks]);
  const series = useMemo(() => computeMonthlySeries(data, 12), [data]);

  const maxProfit = Math.max(0, ...ranking.rows.map((r) => r.profit));

  const cards = [
    {
      label: "صافي الربح",
      value: summary.netProfit,
      icon: TrendingUp,
      positive: summary.netProfit >= 0,
    },
    { label: "الإيرادات", value: summary.totalRevenue, icon: DollarSign, positive: true },
    {
      label: "المصروفات",
      value: summary.totalDirect + summary.totalGeneral,
      icon: Wallet,
      positive: false,
    },
    { label: "الرواتب", value: summary.totalPayroll, icon: Receipt, positive: false },
  ];

  return (
    <div className="space-y-4">
      <div className="no-print">
        <PeriodFilter from={from} to={to} onChange={(f, t) => { setFrom(f); setTo(t); }} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="card-hover">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-secondary-500 dark:text-secondary-400">
                {c.label}
              </CardTitle>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/30">
                <c.icon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div
                className={
                  "text-2xl font-bold " +
                  (c.positive ? "text-primary-700 dark:text-primary-400" : "text-danger-600")
                }
              >
                {formatMoney(c.value, data.currency)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-4 w-4" /> ترتيب الشاحنات حسب الربحية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ranking.rows.length === 0 ? (
              <p className="py-6 text-center text-secondary-400">لا توجد شاحنات</p>
            ) : (
              ranking.rows.map((r, i) => (
                <div key={r.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-secondary-800 dark:text-secondary-100">
                      <span className="text-secondary-400">{i + 1}. </span>
                      {r.plate}
                    </span>
                    <span
                      className={
                        "font-semibold " +
                        (r.profit >= 0 ? "text-accent-600" : "text-danger-600")
                      }
                    >
                      {formatMoney(r.profit, data.currency)}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary-100 dark:bg-secondary-700">
                    <div
                      className={
                        "h-full rounded-full " +
                        (r.profit >= 0 ? "bg-accent-500" : "bg-danger-500")
                      }
                      style={{ width: `${maxProfit > 0 ? (Math.max(0, r.profit) / maxProfit) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))
            )}
            <p className="pt-1 text-xs text-secondary-400">
              نصيب كل شاحنة من المصاريف العامة + الرواتب: {formatMoney(Math.round(ranking.share), data.currency)} (بالتساوي حسب عدد الشاحنات: {data.trucks.length})
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الإيرادات مقابل المصروفات (آخر 12 شهرًا)</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyChart series={series} currency={data.currency} />
          </CardContent>
        </Card>
      </div>

      <IncomeStatement data={data} from={from} to={to} company={company} />
    </div>
  );
}
