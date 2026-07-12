"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Bell,
  Moon,
  Sun,
  User,
  LogOut,
  KeyRound,
  ChevronDown,
} from "lucide-react";
import { logout } from "@/lib/auth-actions";
import { ChangePasswordDialog } from "@/components/settings/change-password-dialog";

export function Topbar({ user }: { user?: { username: string; displayName: string | null } | null }) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [query, setQuery] = useState("");

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  const displayName = user?.displayName || user?.username || "المستخدم";

  return (
    <header className="h-16 border-b border-topbar-border bg-topbar-bg flex items-center justify-between px-4 md:px-6 gap-4 sticky top-0 z-30">
      <div className="flex-1 max-w-md hidden sm:block">
        <form onSubmit={onSearch} className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="بحث في النظام..."
            className="pr-9 h-9 bg-secondary-50 dark:bg-secondary-700/50 border-secondary-200 dark:border-secondary-700"
          />
        </form>
      </div>

      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-lg text-topbar-text hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger-500" />
        </button>

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg text-topbar-text hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-topbar-text hidden sm:block">
              {displayName}
            </span>
            <ChevronDown className="w-4 h-4 text-secondary-400" />
          </button>

          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
              <div className="absolute left-0 top-full mt-1 w-52 bg-white dark:bg-secondary-800 rounded-xl shadow-lg border border-secondary-200 dark:border-secondary-700 py-1 z-50">
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    setPwOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors"
                >
                  <KeyRound className="w-4 h-4" />
                  تغيير كلمة المرور
                </button>
                <form action={logout}>
                  <button
                    type="submit"
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    تسجيل الخروج
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>

      <ChangePasswordDialog open={pwOpen} onOpenChange={setPwOpen} />
    </header>
  );
}
