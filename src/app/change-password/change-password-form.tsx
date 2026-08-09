"use client";

import { useActionState } from "react";
import { changePasswordRequired } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";

export function ChangePasswordRequiredForm() {
  const [state, formAction, pending] = useActionState(changePasswordRequired, {});

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="rounded-xl bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 text-danger-700 dark:text-danger-300 text-sm px-4 py-3">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="current">كلمة المرور الحالية</Label>
        <div className="relative">
          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
          <Input
            id="current"
            name="current"
            type="password"
            autoComplete="current-password"
            className="pr-9"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="next">كلمة المرور الجديدة</Label>
        <div className="relative">
          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
          <Input
            id="next"
            name="next"
            type="password"
            autoComplete="new-password"
            className="pr-9"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm">تأكيد كلمة المرور الجديدة</Label>
        <div className="relative">
          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
          <Input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            className="pr-9"
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full h-11" disabled={pending}>
        {pending ? "جارٍ الحفظ..." : "حفظ ومتابعة"}
      </Button>
    </form>
  );
}
