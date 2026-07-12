import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { PageHeader } from "@/components/layout/page-header";
import { SettingsForm } from "@/components/settings/settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [s, user] = await Promise.all([
    prisma.companySettings.findUnique({ where: { id: "singleton" } }),
    getCurrentUser(),
  ]);
  const settings = {
    companyName: s?.companyName ?? "",
    currency: s?.currency ?? "د.إ",
    address: s?.address ?? "",
    phone: s?.phone ?? "",
    email: s?.email ?? "",
    taxNumber: s?.taxNumber ?? "",
    primaryColor: s?.primaryColor ?? "#1d4ed8",
    secondaryColor: s?.secondaryColor ?? "#1e293b",
    accentColor: s?.accentColor ?? "#10b981",
    logoUrl: s?.logoUrl ?? null,
  };

  return (
    <div>
      <PageHeader
        title="الإعدادات"
        description="بيانات الشركة والملف الشخصي والألوان والنسخ الاحتياطي"
      />
      <SettingsForm settings={settings} displayName={user?.displayName ?? ""} />
    </div>
  );
}
