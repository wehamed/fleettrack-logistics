import { getReportDataset } from "@/lib/reports-data";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getReportDataset();
  const s = await prisma.companySettings.findUnique({
    where: { id: "singleton" },
    select: {
      companyName: true,
      logoUrl: true,
      address: true,
      phone: true,
      email: true,
      taxNumber: true,
    },
  });
  const company = {
    companyName: s?.companyName ?? "",
    logoUrl: s?.logoUrl ?? null,
    address: s?.address ?? "",
    phone: s?.phone ?? "",
    email: s?.email ?? "",
    taxNumber: s?.taxNumber ?? "",
  };

  return (
    <div>
      <PageHeader
        title="لوحة التحكم"
        description="نظرة سريعة على الأداء المالي للأسطول والربحية"
      />
      <DashboardView data={data} company={company} />
    </div>
  );
}
