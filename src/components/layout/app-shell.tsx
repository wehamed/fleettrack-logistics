"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"
import { Breadcrumb } from "./breadcrumb"

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user?: { username: string; displayName: string | null } | null;
}) {
  return (
    <ThemeProvider>

      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar user={user} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <Breadcrumb />
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}
