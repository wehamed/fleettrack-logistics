import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { EmployeesView } from "@/components/employees/employees-view";

export const dynamic = "force-dynamic";

type EmployeeRow = {
  id: string;
  name: string;
  role: string;
  salaryType: string;
  baseSalary: number | null;
  phone: string | null;
  hireDate: string | null;
  assignedTruck: string | null;
};

function toDateInput(d: Date | null): string | null {
  if (!d) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function getEmployees(): Promise<EmployeeRow[]> {
  const employees = await prisma.employee.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
    include: {
      assignments: {
        where: { endDate: null },
        include: { truck: { select: { plateNumber: true } } },
        take: 1,
      },
    },
  });

  return employees.map((e) => ({
    id: e.id,
    name: e.name,
    role: e.role,
    salaryType: e.salaryType,
    baseSalary: e.baseSalary,
    phone: e.phone,
    hireDate: toDateInput(e.hireDate),
    assignedTruck: e.assignments[0]?.truck.plateNumber ?? null,
  }));
}

export default async function EmployeesPage() {
  const employees = await getEmployees();

  return (
    <div>
      <PageHeader
        title="الموظفين"
        description="إدارة بيانات العاملين والسائقين ونوع الراتب"
      />
      <EmployeesView employees={employees} />
    </div>
  );
}
