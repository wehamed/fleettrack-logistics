"use client";

import { useActionState, useEffect } from "react";
import { changePassword } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Lock, CheckCircle2 } from "lucide-react";

export function ChangePasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, pending] = useActionState(changePassword, {});

  useEffect(() => {
    if (state?.success) {
      const t = setTimeout(() => onOpenChange(false), 1500);
      return () => clearTimeout(t);
    }
  }, [state?.success, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تغيير كلمة المرور</DialogTitle>
          <DialogDescription>
            أدخل كلمة المرور الحالية ثم الجديدة لتحديث بيانات دخولك.
          </DialogDescription>
        </DialogHeader>

        {state?.success ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-accent-500" />
            <p className="text-secondary-700 dark:text-secondary-200">
              تم تغيير كلمة المرور بنجاح
            </p>
          </div>
        ) : (
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
                <Input id="current" name="current" type="password" className="pr-9" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="next">كلمة المرور الجديدة</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <Input id="next" name="next" type="password" className="pr-9" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm">تأكيد كلمة المرور الجديدة</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <Input id="confirm" name="confirm" type="password" className="pr-9" required />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "جارٍ الحفظ..." : "حفظ كلمة المرور"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
