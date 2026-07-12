import { NextResponse } from "next/server";
import { getReportDataset } from "@/lib/reports-data";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log("[test-data] Testing direct prisma queries...");
    
    // Test direct queries
    const [trucks, revenues, expenses, payroll] = await Promise.all([
      prisma.truck.findMany({ where: { deletedAt: null } }),
      prisma.revenue.findMany({ where: { deletedAt: null } }),
      prisma.expense.findMany({ where: { deletedAt: null } }),
      prisma.payroll.findMany({ where: { deletedAt: null } }),
    ]);

    console.log("[test-data] Direct query results:", {
      trucks: trucks.length,
      revenues: revenues.length,
      expenses: expenses.length,
      payroll: payroll.length,
    });

    const data = await getReportDataset();
    return NextResponse.json({
      success: true,
      trucksCount: data.trucks.length,
      revenuesCount: data.revenues.length,
      expensesCount: data.expenses.length,
      payrollCount: data.payroll.length,
      currency: data.currency,
    });
  } catch (error) {
    console.error("[test-data] Error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}