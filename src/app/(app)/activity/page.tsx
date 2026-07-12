import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { ActivityView, type ActivityRow } from "@/components/activity/activity-view";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const rows: ActivityRow[] = logs.map((l) => ({
    id: l.id,
    action: l.action,
    entityType: l.entityType,
    entityId: l.entityId,
    summary: l.summary,
    createdAt: l.createdAt.toISOString(),
  }));

  return (
    <div>
      <PageHeader
        title="سجل النشاط"
        description="كل الإضافات والتعديلات والحذف مع التاريخ والوقت، يُسجَّل تلقائيًا"
      />
      <ActivityView logs={rows} />
    </div>
  );
}
