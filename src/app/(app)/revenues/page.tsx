import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { RevenuesView } from "@/components/revenues/revenues-view";

export const dynamic = "force-dynamic";

export type RevenueRow = {
  id: string;
  truckId: string;
  truckPlate: string;
  date: string;
  clientName: string;
  destination: string | null;
  revenueType: string;
  amount: number;
  notes: string | null;
};

export type TruckOption = { id: string; plateNumber: string };

function toDateInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function getRevenues(): Promise<{
  revenues: RevenueRow[];
  trucks: TruckOption[];
  currency: string;
}> {
  const rows = await prisma.revenue.findMany({
    where: { deletedAt: null },
    orderBy: { date: "desc" },
    include: { truck: { select: { plateNumber: true } } },
  });

  const trucks = await prisma.truck.findMany({
    where: { deletedAt: null },
    orderBy: { plateNumber: "asc" },
    select: { id: true, plateNumber: true },
  });

  const settings = await prisma.companySettings.findUnique({
    where: { id: "singleton" },
    select: { currency: true },
  });

  const revenues: RevenueRow[] = rows.map((r) => ({
    id: r.id,
    truckId: r.truckId,
    truckPlate: r.truck.plateNumber,
    date: toDateInput(r.date),
    clientName: r.clientName,
    destination: r.destination,
    revenueType: r.revenueType,
    amount: r.amount,
    notes: r.notes,
  }));

  return { revenues, trucks, currency: settings?.currency ?? "د.إ" };
}

export default async function RevenuesPage() {
  const { revenues, trucks, currency } = await getRevenues();

  return (
    <div>
      <PageHeader
        title="المداخيل"
        description="تسجيل إيرادات كل رحلة أو عقد نقل لكل شاحنة"
      />
      <RevenuesView revenues={revenues} trucks={trucks} currency={currency} />
    </div>
  );
}
