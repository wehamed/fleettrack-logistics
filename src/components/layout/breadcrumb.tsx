"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronLeft, Home } from "lucide-react"

const routeLabels: Record<string, string> = {
  "/": "لوحة التحكم",
  "/trucks": "الشاحنات",
  "/employees": "الموظفين",
  "/revenues": "المداخيل",
  "/expenses": "المصروفات",
  "/payroll": "الرواتب",
  "/reports": "التقارير",
  "/settings": "الإعدادات",
  "/search": "البحث",
}

export function Breadcrumb() {
  const pathname = usePathname()

  const segments = pathname.split("/").filter(Boolean)
  if (segments.length === 0 || (segments.length === 1 && segments[0] === "")) {
    return null
  }

  const paths = [{ href: "/", label: routeLabels["/"] || "الرئيسية" }]

  let current = ""
  for (const segment of segments) {
    current += `/${segment}`
    const label = routeLabels[current] || segment
    paths.push({ href: current, label })
  }

  return (
    <nav className="flex items-center gap-1 text-sm text-breadcrumb-text mb-4">
      {paths.map((p, i) => {
        const isLast = i === paths.length - 1
        return (
          <span key={p.href} className="flex items-center gap-1">
            {i > 0 && <ChevronLeft className="w-3.5 h-3.5 text-secondary-400" />}
            {isLast ? (
              <span className="font-medium text-breadcrumb-active">{p.label}</span>
            ) : (
              <Link href={p.href} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                {i === 0 ? <Home className="w-3.5 h-3.5" /> : p.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
