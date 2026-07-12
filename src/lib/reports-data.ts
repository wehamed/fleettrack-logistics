import { prisma } from "@/lib/prisma";
import type { ReportDataset } from "@/lib/compute-reports";

function toDateInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// جلب كل البيانات المالية المطلوبة للوحة التحكم والتقارير دفعة واحدة.
// الحجم متواضع لهذا النظام (أسطول 9 شاحنات) فيُعاد حسابه في العميل حسب الفترة.
export async function getReportDataset(): Promise<ReportDataset> {
  console.log("[reports-data] Starting getReportDataset...");
  const start = Date.now();
  try {
    const [revenues, expenses, payroll, trucks, settings] = await Promise.all([
      prisma.revenue.findMany({
        where: { deletedAt: null },
        orderBy: { date: "desc" },
        select: {
          id: true,
          truckId: true,
          date: true,
          amount: true,
          revenueType: true,
          clientName: true,
          destination: true,
        },
      }),
      prisma.expense.findMany({
        where: { deletedAt: null },
        orderBy: { date: "desc" },
        select: {
          id: true,
          truckId: true,
          date: true,
          amount: true,
          category: { select: { name: true } },
          description: true,
        },
      }),
      prisma.payroll.findMany({
        where: { deletedAt: null },
        orderBy: { month: "desc" },
        select: { id: true, month: true, net: true, employee: { select: { name: true } } },
      }),
      prisma.truck.findMany({
        where: { deletedAt: null },
        orderBy: { plateNumber: "asc" },
        select: { id: true, plateNumber: true },
      }),
      prisma.companySettings.findUnique({
        where: { id: "singleton" },
        select: { currency: true },
      }),
    ]);

    console.log("[reports-data] Query results:", {
      revenues: revenues.length,
      expenses: expenses.length,
      payroll: payroll.length,
      trucks: trucks.length,
      settings: settings ? "found" : "null",
      elapsed: Date.now() - start
    });

    return {
    currency: settings?.currency ?? "د.إ",
    trucks: trucks.map((t) => ({ id: t.id, plateNumber: t.plateNumber })),
    revenues: revenues.map((r) => ({
      id: r.id,
      truckId: r.truckId,
      date: toDateInput(r.date),
      amount: r.amount,
      revenueType: r.revenueType,
      clientName: r.clientName,
      destination: r.destination,
    })),
    expenses: expenses.map((e) => ({
      id: e.id,
      truckId: e.truckId,
      date: toDateInput(e.date),
      amount: e.amount,
      categoryName: e.category.name,
      description: e.description,
    })),
    payroll: payroll.map((p) => ({
      id: p.id,
      month: p.month,
      net: p.net,
      employeeName: p.employee.name,
    })),
  };
  } catch (error) {
    console.error("[reports-data] Error in getReportDataset:", error);
    throw error;
  }
}
