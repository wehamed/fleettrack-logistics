import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const STRIP = ["createdAt", "updatedAt", "deletedAt"] as const;
function clean<T extends Record<string, unknown>>(row: T) {
  const out: Record<string, unknown> = { ...row };
  for (const k of STRIP) delete out[k];
  return out as Omit<T, (typeof STRIP)[number]>;
}

export async function GET() {
  const data = {
    app: "kanwal-financial",
    exportedAt: new Date().toISOString(),
    companySettings: await prisma.companySettings.findUnique({ where: { id: "singleton" } }),
    expenseCategories: await prisma.expenseCategory.findMany(),
    trucks: await prisma.truck.findMany({ where: { deletedAt: null } }),
    employees: await prisma.employee.findMany({ where: { deletedAt: null } }),
    assignments: await prisma.truckDriverAssignment.findMany(),
    revenues: await prisma.revenue.findMany({ where: { deletedAt: null } }),
    expenses: await prisma.expense.findMany({ where: { deletedAt: null } }),
    payroll: await prisma.payroll.findMany({ where: { deletedAt: null } }),
    activityLog: await prisma.activityLog.findMany({ orderBy: { createdAt: "desc" } }),
    systemUsers: await prisma.systemUser.findMany(),
  };

  const body = JSON.stringify(data, null, 2);
  const filename = `kanwal-backup-${new Date().toISOString().slice(0, 10)}.json`;

  // تسجيل عملية التصدير في السجل (النموذج ActivityLog مُستثنى من الوساطة)
  try {
    await prisma.activityLog.create({
      data: { action: "تصدير", entityType: "النسخة الاحتياطية", summary: "تصدير النسخة الاحتياطية الكاملة" },
    });
  } catch {
    // لا نعطّل التصدير عند فشل التسجيل
  }

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

export async function POST(req: NextRequest) {
  globalThis.__suppressActivityLog = true;
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "ملف غير صالح" }, { status: 400 });
    }
    const text = await file.text();
    const data = JSON.parse(text) as Record<string, unknown>;

    await prisma.$transaction(async (tx) => {
      await tx.activityLog.deleteMany({});
      await tx.systemUser.deleteMany({});
      await tx.truckDriverAssignment.deleteMany({});
      await tx.payroll.deleteMany({});
      await tx.revenue.deleteMany({});
      await tx.expense.deleteMany({});
      await tx.expenseCategory.deleteMany({});
      await tx.truck.deleteMany({});
      await tx.employee.deleteMany({});

      if (Array.isArray(data.systemUsers) && data.systemUsers.length)
        await tx.systemUser.createMany({ data: data.systemUsers.map(clean) as Prisma.SystemUserCreateManyInput[] });
      if (Array.isArray(data.expenseCategories) && data.expenseCategories.length)
        await tx.expenseCategory.createMany({ data: data.expenseCategories.map(clean) as Prisma.ExpenseCategoryCreateManyInput[] });
      if (Array.isArray(data.trucks) && data.trucks.length)
        await tx.truck.createMany({ data: data.trucks.map(clean) as Prisma.TruckCreateManyInput[] });
      if (Array.isArray(data.employees) && data.employees.length)
        await tx.employee.createMany({ data: data.employees.map(clean) as Prisma.EmployeeCreateManyInput[] });
      if (Array.isArray(data.assignments) && data.assignments.length)
        await tx.truckDriverAssignment.createMany({ data: data.assignments.map(clean) as Prisma.TruckDriverAssignmentCreateManyInput[] });
      if (Array.isArray(data.revenues) && data.revenues.length)
        await tx.revenue.createMany({ data: data.revenues.map(clean) as Prisma.RevenueCreateManyInput[] });
      if (Array.isArray(data.expenses) && data.expenses.length)
        await tx.expense.createMany({ data: data.expenses.map(clean) as Prisma.ExpenseCreateManyInput[] });
      if (Array.isArray(data.payroll) && data.payroll.length)
        await tx.payroll.createMany({ data: data.payroll.map(clean) as Prisma.PayrollCreateManyInput[] });
      if (Array.isArray(data.activityLog) && data.activityLog.length)
        await tx.activityLog.createMany({ data: data.activityLog.map(clean) as Prisma.ActivityLogCreateManyInput[] });

      if (data.companySettings) {
        const cs = data.companySettings as Prisma.CompanySettingsUncheckedCreateInput;
        await tx.companySettings.upsert({
          where: { id: "singleton" },
          update: {
            companyName: cs.companyName ?? "",
            currency: cs.currency ?? "د.إ",
            fiscalYearStart: cs.fiscalYearStart ?? null,
            logoUrl: cs.logoUrl ?? null,
            address: cs.address ?? null,
            phone: cs.phone ?? null,
            email: cs.email ?? null,
            taxNumber: cs.taxNumber ?? null,
            primaryColor: cs.primaryColor ?? "#1d4ed8",
            secondaryColor: cs.secondaryColor ?? "#1e293b",
            accentColor: cs.accentColor ?? "#10b981",
          },
          create: {
            id: "singleton",
            companyName: cs.companyName ?? "",
            currency: cs.currency ?? "د.إ",
            fiscalYearStart: cs.fiscalYearStart ?? null,
            logoUrl: cs.logoUrl ?? null,
            address: cs.address ?? null,
            phone: cs.phone ?? null,
            email: cs.email ?? null,
            taxNumber: cs.taxNumber ?? null,
            primaryColor: cs.primaryColor ?? "#1d4ed8",
            secondaryColor: cs.secondaryColor ?? "#1e293b",
            accentColor: cs.accentColor ?? "#10b981",
          },
        });
      }
    });

    await prisma.activityLog.create({
      data: { action: "استيراد", entityType: "النسخة الاحتياطية", summary: "استيراد النسخة الاحتياطية الكاملة" },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "فشل الاستيراد" },
      { status: 500 }
    );
  } finally {
    globalThis.__suppressActivityLog = false;
  }
}
