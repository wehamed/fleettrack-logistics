import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { ExpensesView } from "@/components/expenses/expenses-view";

export const dynamic = "force-dynamic";

export type ExpenseRow = {
  id: string;
  truckId: string | null;
  truckPlate: string | null;
  categoryId: string;
  categoryName: string;
  date: string;
  amount: number;
  description: string | null;
  receiptImage: string | null;
};

export type TruckOption = { id: string; plateNumber: string };
export type CategoryOption = { id: string; name: string };

function toDateInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function getExpenses(): Promise<{
  expenses: ExpenseRow[];
  trucks: TruckOption[];
  categories: CategoryOption[];
  currency: string;
}> {
  const rows = await prisma.expense.findMany({
    where: { deletedAt: null },
    orderBy: { date: "desc" },
    include: {
      truck: { select: { plateNumber: true } },
      category: { select: { name: true } },
    },
  });

  const trucks = await prisma.truck.findMany({
    where: { deletedAt: null },
    orderBy: { plateNumber: "asc" },
    select: { id: true, plateNumber: true },
  });

  const categories = await prisma.expenseCategory.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const settings = await prisma.companySettings.findUnique({
    where: { id: "singleton" },
    select: { currency: true },
  });

  const expenses: ExpenseRow[] = rows.map((e) => ({
    id: e.id,
    truckId: e.truckId,
    truckPlate: e.truck?.plateNumber ?? null,
    categoryId: e.categoryId,
    categoryName: e.category.name,
    date: toDateInput(e.date),
    amount: e.amount,
    description: e.description,
    receiptImage: e.receiptImage,
  }));

  return { expenses, trucks, categories, currency: settings?.currency ?? "د.إ" };
}

export default async function ExpensesPage() {
  const { expenses, trucks, categories, currency } = await getExpenses();

  return (
    <div>
      <PageHeader
        title="المصروفات"
        description="تسجيل مصاريف التشغيل لكل شاحنة أو مصاريف عامة"
      />
      <ExpensesView
        expenses={expenses}
        trucks={trucks}
        categories={categories}
        currency={currency}
      />
    </div>
  );
}
