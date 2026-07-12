"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck, Lock, User, ArrowLeft } from "lucide-react";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: formData,
      });
      if (res.redirected) {
        window.location.href = res.url;
      } else if (res.ok) {
        window.location.href = "/";
      } else {
        let msg = "فشل تسجيل الدخول";
        try {
          const data = await res.json();
          msg = data.error ?? msg;
        } catch {
          console.error("[Login] Non-JSON error response:", res.status, await res.text().catch(() => ""));
        }
        setError(msg);
      }
    } catch (err) {
      console.error("[Login] Fetch error:", err);
      setError("حدث خطأ غير متوقع — تحقق من اتصال الخادم");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-secondary-50 dark:bg-secondary-900">
      {/* اللوحة الترويجية اللوجستية */}
      <div className="lg:w-1/2 relative overflow-hidden bg-gradient-to-l from-primary-800 via-primary-700 to-primary-900 p-10 lg:p-16 flex flex-col justify-between text-white">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 400">
            <defs>
              <pattern id="road" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <path d="M0 20 H40" stroke="white" strokeWidth="3" strokeDasharray="8 8" />
              </pattern>
            </defs>
            <rect width="400" height="400" fill="url(#road)" />
          </svg>
        </div>

        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur">
            <Truck className="w-6 h-6" />
          </div>
          <div className="text-xl font-bold tracking-tight">كنوال</div>
        </div>

        <div className="relative space-y-5">
          <h1 className="text-3xl lg:text-4xl font-bold leading-snug">
            نظام إدارة الشؤون المالية لأسطول الشاحنات
          </h1>
          <p className="text-primary-100 max-w-md leading-relaxed">
            تابع إيرادات النقل والمصروفات والرواتب لأُسطولك في مكان واحد،
            مع تقارير دقيقة ولوحة تحكم لحظية لكل شاحنة وسائق.
          </p>
          <div className="flex items-center gap-2 text-sm text-primary-100">
            <Truck className="w-4 h-4" />
            <span>تحكّم كامل في حركة أسطولك المالي</span>
          </div>
        </div>

        <div className="relative text-sm text-primary-200">
          © {new Date().getFullYear()} نظام كنوال المالي
        </div>
      </div>

      {/* نموذج الدخول */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center lg:text-right space-y-2">
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">
              تسجيل الدخول
            </h2>
            <p className="text-sm text-secondary-500 dark:text-secondary-400">
              أدخل بياناتك للوصول إلى لوحة التحكم
            </p>
          </div>

          <form onSubmit={handleSubmit} action="/api/auth/login" method="POST" className="space-y-5">
            {error && (
              <div className="rounded-xl bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 text-danger-700 dark:text-danger-300 text-sm px-4 py-3">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">اسم المستخدم</Label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <Input
                  id="username"
                  name="username"
                  autoComplete="username"
                  placeholder="مثال: admin"
                  className="pr-9 h-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pr-9 h-11"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base gap-2"
              disabled={pending}
            >
              {pending ? "جارٍ الدخول..." : "دخول"}
              {!pending && <ArrowLeft className="w-4 h-4" />}
            </Button>
          </form>

          <p className="text-center text-xs text-secondary-400 dark:text-secondary-500">
            بيانات الدخول الافتراضية: admin / admin123 — يُنصح بتغييرها من الإعدادات
          </p>
        </div>
      </div>
    </div>
  );
}
