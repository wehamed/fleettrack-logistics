import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { TrucksView } from "@/components/trucks/trucks-view";

export const dynamic = "force-dynamic";

type TruckRow = {
  id: string;
  plateNumber: string;
  model: string;
  year: number | null;
  purchaseValue: number | null;
  purchaseDate: string | null;
  status: string;
  currentDriver: { id: string; name: string } | null;
};

function toDateInput(d: Date | null): string | null {
  if (!d) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function getTrucks(): Promise<{ trucks: TruckRow[]; drivers: { id: string; name: string }[] }> {
  const trucks = await prisma.truck.findMany({
    where: { deletedAt: null },
    orderBy: { plateNumber: "asc" },
    include: {
      assignments: {
        where: { endDate: null },
        include: { employee: { select: { id: true, name: true } } },
        take: 1,
      },
    },
  });

  const drivers = await prisma.employee.findMany({
    where: { role: "سائق", deletedAt: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const rows: TruckRow[] = trucks.map((t) => ({
    id: t.id,
    plateNumber: t.plateNumber,
    model: t.model,
    year: t.year,
    purchaseValue: t.purchaseValue,
    purchaseDate: toDateInput(t.purchaseDate),
    status: t.status,
    currentDriver: t.assignments[0]?.employee ?? null,
  }));

  return { trucks: rows, drivers };
}

export default async function TrucksPage() {
  const { trucks, drivers } = await getTrucks();

  return (
    <div>
      <PageHeader
        title="الشاحنات"
        description="إدارة أسطول الشاحنات ومتابعة حالتها وربط كل شاحنة بسائقها"
      />
      <TrucksView trucks={trucks} drivers={drivers} />
    </div>
  );
}
