import { getReportDataset } from "@/lib/reports-data";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { ReportsView } from "@/components/reports/reports-view";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
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
        title="التقارير"
        description="قائمة الدخل التفصيلية والتصفية والتصدير"
      />
      <ReportsView data={data} company={company} />
    </div>
  );
}
