// دوال حساب التقارير الصرفة (بدون Prisma) — قابلة للاستخدام داخل مكوّنات العميل.
// كل المبالغ بأصغر وحدة (القرش = 1/100) للحفاظ على الدقة.

export type TruckLite = { id: string; plateNumber: string };

export type ReportDataset = {
  currency: string;
  trucks: TruckLite[];
  revenues: {
    id: string;
    truckId: string;
    date: string; // YYYY-MM-DD
    amount: number;
    revenueType: string;
    clientName: string;
    destination: string | null;
  }[];
  expenses: {
    id: string;
    truckId: string | null;
    date: string; // YYYY-MM-DD
    amount: number;
    categoryName: string;
    description: string | null;
  }[];
  payroll: {
    id: string;
    month: string; // YYYY-MM
    net: number;
    employeeName: string;
  }[];
};

export type Filtered = {
  revenues: ReportDataset["revenues"];
  direct: ReportDataset["expenses"];
  general: ReportDataset["expenses"];
  payroll: ReportDataset["payroll"];
};

function inRange(date: string, from: string, to: string): boolean {
  return date >= from && date <= to;
}

export function currentMonthRange(): { from: string; to: string } {
  const d = new Date();
  const from = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  const to = `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, "0")}-${String(last.getDate()).padStart(2, "0")}`;
  return { from, to };
}

// النطاق الافتراضي للعرض: من أقدم حركة إلى آخر حركة في البيانات.
// إن لم توجد بيانات يرجع إلى الشهر الحالي حتى لا يظهر الفلتر فارغًا.
export function defaultRange(d: ReportDataset): { from: string; to: string } {
  const dates: string[] = [];
  for (const r of d.revenues) dates.push(r.date);
  for (const e of d.expenses) dates.push(e.date);
  for (const p of d.payroll) dates.push(`${p.month}-01`);
  if (dates.length === 0) return currentMonthRange();
  const min = dates.reduce((a, b) => (a < b ? a : b));
  const max = dates.reduce((a, b) => (a > b ? a : b));
  return { from: min, to: max };
}

export function filterByRange(d: ReportDataset, from: string, to: string): Filtered {
  const revenues = d.revenues.filter((r) => inRange(r.date, from, to));
  const allExp = d.expenses.filter((e) => inRange(e.date, from, to));
  const direct = allExp.filter((e) => e.truckId != null);
  const general = allExp.filter((e) => e.truckId == null);
  const fromM = from.slice(0, 7);
  const toM = to.slice(0, 7);
  const payroll = d.payroll.filter((p) => p.month >= fromM && p.month <= toM);
  return { revenues, direct, general, payroll };
}

export function computeSummary(f: Filtered) {
  const totalRevenue = f.revenues.reduce((s, r) => s + r.amount, 0);
  const totalDirect = f.direct.reduce((s, e) => s + e.amount, 0);
  const totalGeneral = f.general.reduce((s, e) => s + e.amount, 0);
  const totalPayroll = f.payroll.reduce((s, p) => s + p.net, 0);
  const netProfit = totalRevenue - totalDirect - totalGeneral - totalPayroll;
  return { totalRevenue, totalDirect, totalGeneral, totalPayroll, netProfit };
}

export type RankingRow = {
  id: string;
  plate: string;
  revenue: number;
  direct: number;
  share: number;
  profit: number;
};

export function computeRanking(f: Filtered, trucks: TruckLite[]) {
  const totalGeneral = f.general.reduce((s, e) => s + e.amount, 0);
  const totalPayroll = f.payroll.reduce((s, p) => s + p.net, 0);
  const pool = totalGeneral + totalPayroll;
  const share = trucks.length > 0 ? pool / trucks.length : 0;

  const rows: RankingRow[] = trucks.map((t) => {
    const revenue = f.revenues
      .filter((r) => r.truckId === t.id)
      .reduce((s, r) => s + r.amount, 0);
    const direct = f.direct
      .filter((e) => e.truckId === t.id)
      .reduce((s, e) => s + e.amount, 0);
    const profit = revenue - direct - share;
    return { id: t.id, plate: t.plateNumber, revenue, direct, share, profit };
  });

  rows.sort((a, b) => b.profit - a.profit);
  return { rows, share, pool };
}

export function computeMonthlySeries(d: ReportDataset, months = 12) {
  const now = new Date();
  const arr: { month: string; revenue: number; expense: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
    const revenue = d.revenues
      .filter((r) => r.date.startsWith(key))
      .reduce((s, r) => s + r.amount, 0);
    const expense = d.expenses
      .filter((e) => e.date.startsWith(key))
      .reduce((s, e) => s + e.amount, 0);
    arr.push({ month: key, revenue, expense });
  }
  return arr;
}

export type StatementRow = {
  kind: string;
  date: string;
  desc: string;
  amount: number;
  sign: 1 | -1;
};

export function buildStatementRows(f: Filtered, trucks: TruckLite[]): StatementRow[] {
  const plateOf = (id: string | null) =>
    trucks.find((t) => t.id === id)?.plateNumber ?? "عام";
  const rows: StatementRow[] = [];

  f.revenues.forEach((r) =>
    rows.push({
      kind: "إيراد",
      date: r.date,
      desc: `${r.clientName}${r.destination ? " — " + r.destination : ""} (${plateOf(r.truckId)})`,
      amount: r.amount,
      sign: 1,
    })
  );
  f.direct.forEach((e) =>
    rows.push({
      kind: "مصروف مباشر",
      date: e.date,
      desc: `${e.categoryName} (${plateOf(e.truckId)})`,
      amount: e.amount,
      sign: -1,
    })
  );
  f.general.forEach((e) =>
    rows.push({
      kind: "مصروف عام",
      date: e.date,
      desc: `${e.categoryName}${e.description ? " — " + e.description : ""}`,
      amount: e.amount,
      sign: -1,
    })
  );
  f.payroll.forEach((p) =>
    rows.push({
      kind: "راتب",
      date: `${p.month}-01`,
      desc: p.employeeName,
      amount: p.net,
      sign: -1,
    })
  );

  rows.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return rows;
}
