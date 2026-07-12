import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import {
  PayrollView,
  type PayrollRow,
  type EmployeeOption,
} from "@/components/payroll/payroll-view";

export const dynamic = "force-dynamic";

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

async function getPayrollData() {
  const employees = await prisma.employee.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true, salaryType: true, baseSalary: true },
  });

  const rows = await prisma.payroll.findMany({
    where: { deletedAt: null },
    orderBy: [{ month: "desc" }, { employee: { name: "asc" } }],
    include: { employee: { select: { name: true, salaryType: true } } },
  });

  const settings = await prisma.companySettings.findUnique({
    where: { id: "singleton" },
    select: { currency: true },
  });

  const payroll: PayrollRow[] = rows.map((p) => ({
    id: p.id,
    employeeId: p.employeeId,
    employeeName: p.employee.name,
    salaryType: p.employee.salaryType,
    month: p.month,
    baseAmount: p.baseAmount,
    deductions: p.deductions,
    advances: p.advances,
    net: p.net,
    paid: p.paid,
    notes: p.notes,
  }));

  const employeeOptions: EmployeeOption[] = employees.map((e) => ({
    id: e.id,
    name: e.name,
    salaryType: e.salaryType,
    baseSalary: e.baseSalary,
  }));

  return { payroll, employeeOptions, currency: settings?.currency ?? "د.إ" };
}

export default async function PayrollPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const sp = await searchParams;
  const month =
    sp.month && /^\d{4}-\d{2}$/.test(sp.month) ? sp.month : currentMonth();
  const { payroll, employeeOptions, currency } = await getPayrollData();

  return (
    <div>
      <PageHeader
        title="الرواتب"
        description="تسجيل الرواتب الشهرية مع الخصومات والسلف لكل موظف"
      />
      <PayrollView
        payroll={payroll}
        employees={employeeOptions}
        currency={currency}
        month={month}
      />
    </div>
  );
}
