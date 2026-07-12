import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const adapter = new PrismaLibSql({ url: `file:${path.resolve("./prisma/dev.db")}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  const counts = await Promise.all([
    prisma.truck.count({ where: { deletedAt: null } }),
    prisma.employee.count({ where: { deletedAt: null } }),
    prisma.revenue.count({ where: { deletedAt: null } }),
    prisma.expense.count({ where: { deletedAt: null } }),
    prisma.payroll.count({ where: { deletedAt: null } }),
    prisma.expenseCategory.count(),
    prisma.companySettings.findUnique({ where: { id: "singleton" } }),
  ]);

  console.log("=== Record Counts ===");
  console.log(`Trucks: ${counts[0]}`);
  console.log(`Employees: ${counts[1]}`);
  console.log(`Revenues: ${counts[2]}`);
  console.log(`Expenses: ${counts[3]}`);
  console.log(`Payrolls: ${counts[4]}`);
  console.log(`Expense Categories: ${counts[5]}`);
  console.log(`Company Settings: ${counts[6] ? "EXISTS" : "MISSING"}`);
  
  if (counts[6]) {
    console.log(`  Company: ${counts[6].companyName}`);
    console.log(`  Currency: ${counts[6].currency}`);
  }

  await prisma.$disconnect();
}

main().catch(console.error);