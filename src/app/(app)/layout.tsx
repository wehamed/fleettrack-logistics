import { getCurrentUser } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  return (
    <AppShell
      user={user ? { username: user.username, displayName: user.displayName } : null}
    >
      {children}
    </AppShell>
  );
}
