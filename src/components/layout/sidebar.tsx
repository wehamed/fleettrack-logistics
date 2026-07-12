"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Truck,
  Users,
  DollarSign,
  Wallet,
  Receipt,
  FileBarChart,
  Settings,
  History,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react"

interface NavItem {
  label: string
  icon: React.ElementType
  href: string
}

const navItems: NavItem[] = [
  { label: "لوحة التحكم", icon: LayoutDashboard, href: "/" },
  { label: "الشاحنات", icon: Truck, href: "/trucks" },
  { label: "الموظفين", icon: Users, href: "/employees" },
  { label: "المداخيل", icon: DollarSign, href: "/revenues" },
  { label: "المصروفات", icon: Wallet, href: "/expenses" },
  { label: "الرواتب", icon: Receipt, href: "/payroll" },
  { label: "التقارير", icon: FileBarChart, href: "/reports" },
  { label: "سجل النشاط", icon: History, href: "/activity" },
  { label: "الإعدادات", icon: Settings, href: "/settings" },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 right-3 z-50 flex md:hidden items-center justify-center w-9 h-9 rounded-lg bg-white border border-secondary-200 shadow-sm dark:bg-secondary-800 dark:border-secondary-700"
      >
        <Menu className="w-5 h-5 text-secondary-600 dark:text-secondary-300" />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed md:relative z-50 h-screen bg-sidebar text-sidebar-text flex flex-col transition-all duration-300",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex items-center gap-3 h-16 px-4 border-b border-secondary-700/50">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
            <Truck className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <span className="font-bold text-base text-white truncate">
              كنوال المالي
            </span>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                  isActive
                    ? "bg-sidebar-active text-sidebar-text-active"
                    : "text-sidebar-text hover:bg-sidebar-hover hover:text-white"
                )}
              >
                <item.icon className={cn("w-5 h-5 flex-shrink-0", collapsed && "mx-auto")} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-secondary-700/50 p-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex items-center justify-center w-full h-8 rounded-lg text-sidebar-text hover:bg-sidebar-hover hover:text-white transition-colors"
          >
            {collapsed ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </aside>
    </>
  )
}
