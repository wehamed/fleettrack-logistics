import { redirect } from "next/navigation";
import { getCurrentUser, usesDefaultPassword } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  // في الإنتاج: منع المستخدم الذي ما زال على كلمة المرور الافتراضية من
  // متابعة الاستخدام قبل تغييرها.
  if (
    user &&
    process.env.NODE_ENV === "production" &&
    usesDefaultPassword(user.passwordHash)
  ) {
    redirect("/change-password");
  }
  return (
    <AppShell
      user={user ? { username: user.username, displayName: user.displayName } : null}
    >
      {children}
    </AppShell>
  );
}
