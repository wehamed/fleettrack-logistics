"use client";

import { useState } from "react";
import { PeriodFilter } from "@/components/reports/period-filter";
import { IncomeStatement } from "@/components/reports/income-statement";
import { defaultRange, type ReportDataset } from "@/lib/compute-reports";

type CompanyInfo = {
  companyName: string;
  logoUrl: string | null;
  address: string;
  phone: string;
  email: string;
  taxNumber: string;
};

export function ReportsView({
  data,
  company,
}: {
  data: ReportDataset;
  company: CompanyInfo;
}) {
  const init = defaultRange(data);
  const [from, setFrom] = useState(init.from);
  const [to, setTo] = useState(init.to);

  return (
    <div className="space-y-4">
      <div className="no-print">
        <PeriodFilter from={from} to={to} onChange={(f, t) => { setFrom(f); setTo(t); }} />
      </div>
      <IncomeStatement data={data} from={from} to={to} company={company} />
    </div>
  );
}
