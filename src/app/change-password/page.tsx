import { redirect } from "next/navigation";
import { getCurrentUser, usesDefaultPassword } from "@/lib/auth";
import { ChangePasswordRequiredForm } from "./change-password-form";

export const dynamic = "force-dynamic";

export default async function ChangePasswordPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (process.env.NODE_ENV !== "production" || !usesDefaultPassword(user.passwordHash)) {
    redirect("/");
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-900 p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
            تغيير كلمة المرور الافتراضية
          </h1>
          <p className="text-sm text-secondary-500 dark:text-secondary-400">
            يجب تغيير كلمة المرور الافتراضية قبل متابعة استخدام النظام.
          </p>
        </div>
        <ChangePasswordRequiredForm />
      </div>
    </div>
  );
}
