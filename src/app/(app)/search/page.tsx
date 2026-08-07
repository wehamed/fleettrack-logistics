import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { formatMoney } from "@/lib/money";
import { Truck, Users, DollarSign, Wallet, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

type SP = { searchParams: Promise<{ q?: string }> };

type SearchItem = { id: string; title: string; sub: string; href: string };

export default async function SearchPage({ searchParams }: SP) {
  const { q } = await searchParams;
  const term = (q ?? "").trim();

  let trucks: SearchItem[] = [];
  let employees: SearchItem[] = [];
  let revenues: SearchItem[] = [];
  let expenses: SearchItem[] = [];
  let payrolls: SearchItem[] = [];

  if (term) {
    const like = { contains: term };
    const [settings, t, e, r, x, p] = await Promise.all([
      prisma.companySettings.findUnique({ where: { id: "singleton" }, select: { currency: true } }),
      prisma.truck.findMany({
        where: { deletedAt: null, OR: [{ plateNumber: like }, { model: like }] },
        take: 20,
      }),
      prisma.employee.findMany({
        where: { deletedAt: null, name: like },
        take: 20,
      }),
      prisma.revenue.findMany({
        where: { deletedAt: null, OR: [{ clientName: like }, { destination: like }] },
        orderBy: { date: "desc" },
        take: 20,
      }),
      prisma.expense.findMany({
        where: { deletedAt: null, description: like },
        orderBy: { date: "desc" },
        take: 20,
      }),
      prisma.payroll.findMany({
        where: { deletedAt: null, OR: [{ notes: like }, { employee: { name: like } }] },
        include: { employee: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);
    const currency = settings?.currency ?? "د.إ";
    trucks = t.map((truck) => ({ id: truck.id, title: truck.plateNumber, sub: truck.model, href: "/trucks" }));
    employees = e.map((emp) => ({ id: emp.id, title: emp.name, sub: `${emp.role} — ${emp.salaryType}`, href: "/employees" }));
    revenues = r.map((rev) => ({
      id: rev.id,
      title: rev.clientName,
      sub: `${rev.revenueType}${rev.destination ? " — " + rev.destination : ""} • ${formatMoney(rev.amount, currency)}`,
      href: "/revenues",
    }));
    expenses = x.map((exp) => ({
      id: exp.id,
      title: exp.description || "مصروف",
      sub: `${formatMoney(exp.amount, currency)}`,
      href: "/expenses",
    }));
    payrolls = p.map((pay) => ({
      id: pay.id,
      title: pay.employee?.name ?? "—",
      sub: `الصافي: ${formatMoney(pay.net, currency)}${pay.paid ? " (مدفوع)" : ""}`,
      href: "/payroll",
    }));
  }

  const groups = [
    { label: "الشاحنات", icon: Truck, items: trucks },
    { label: "الموظفون", icon: Users, items: employees },
    { label: "المداخيل", icon: DollarSign, items: revenues },
    { label: "المصروفات", icon: Wallet, items: expenses },
    { label: "الرواتب", icon: Wallet, items: payrolls },
  ];
  const total = trucks.length + employees.length + revenues.length + expenses.length + payrolls.length;

  return (
    <div>
      <PageHeader title="نتائج البحث" description={term ? `عن: «${term}»` : "أدخل كلمة للبحث"} />
      {!term ? (
        <div className="text-center text-secondary-400 py-16">اكتب كلمة في خانة البحث بالأعلى للبدء.</div>
      ) : total === 0 ? (
        <div className="text-center text-secondary-400 py-16">لا توجد نتائج مطابقة لـ «{term}».</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {groups.map((g) => (
            <div key={g.label} className="card p-4">
              <div className="flex items-center gap-2 mb-3 text-secondary-700 dark:text-secondary-200">
                <g.icon className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold">{g.label}</h3>
                <span className="text-xs text-secondary-400 mr-auto">{g.items.length}</span>
              </div>
              {g.items.length === 0 ? (
                <div className="text-sm text-secondary-400 py-2">لا نتائج</div>
              ) : (
                <ul className="space-y-1">
                  {g.items.map((it) => (
                    <li key={it.id}>
                      <Link
                        href={it.href}
                        className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 hover:bg-secondary-50 dark:hover:bg-secondary-700/50 transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-secondary-800 dark:text-secondary-100 truncate">
                            {it.title}
                          </div>
                          {it.sub && (
                            <div className="text-xs text-secondary-500 truncate">{it.sub}</div>
                          )}
                        </div>
                        <ArrowLeft className="w-4 h-4 text-secondary-400 flex-shrink-0" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
