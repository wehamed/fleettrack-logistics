"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { toSubunits } from "@/lib/money";
import { EMPLOYEE_ROLES, SALARY_TYPES } from "@/lib/constants";

export type ActionResult = { ok: boolean; error?: string };

function parseMoneySafe(value: string | null | undefined): number | null {
  if (value == null || value.trim() === "") return null;
  const cleaned = value.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) {
    throw new Error("قيمة المبلغ غير صالحة");
  }
  const subunits = toSubunits(cleaned);
  if (subunits < 0) throw new Error("المبالغ لا يمكن أن تكون سالبة");
  return subunits;
}

function parseDateSafe(value: string | null | undefined): Date | null {
  if (value == null || value.trim() === "") return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new Error("تاريخ غير صالح");
  return d;
}

export async function createEmployee(formData: FormData): Promise<ActionResult> {
  try {
    const name = (formData.get("name") as string)?.trim();
    const role = (formData.get("role") as string) || "سائق";
    const salaryType = (formData.get("salaryType") as string) || "ثابت";
    const baseSalary = parseMoneySafe(formData.get("baseSalary") as string);
    const phone = (formData.get("phone") as string)?.trim() || null;
    const hireDate = parseDateSafe(formData.get("hireDate") as string);

    if (!name) return { ok: false, error: "اسم الموظف مطلوب" };
    if (!EMPLOYEE_ROLES.some((r) => r.value === role)) {
      return { ok: false, error: "الدور غير صالح" };
    }
    if (!SALARY_TYPES.some((s) => s.value === salaryType)) {
      return { ok: false, error: "نوع الراتب غير صالح" };
    }

    await prisma.employee.create({
      data: { name, role, salaryType, baseSalary, phone, hireDate },
    });

    revalidatePath("/employees");
    return { ok: true };
  } catch {
    return { ok: false, error: "تعذّر حفظ بيانات الموظف" };
  }
}

export async function updateEmployee(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const name = (formData.get("name") as string)?.trim();
    const role = (formData.get("role") as string) || "سائق";
    const salaryType = (formData.get("salaryType") as string) || "ثابت";
    const baseSalary = parseMoneySafe(formData.get("baseSalary") as string);
    const phone = (formData.get("phone") as string)?.trim() || null;
    const hireDate = parseDateSafe(formData.get("hireDate") as string);

    if (!name) return { ok: false, error: "اسم الموظف مطلوب" };
    if (!EMPLOYEE_ROLES.some((r) => r.value === role)) {
      return { ok: false, error: "الدور غير صالح" };
    }
    if (!SALARY_TYPES.some((s) => s.value === salaryType)) {
      return { ok: false, error: "نوع الراتب غير صالح" };
    }

    await prisma.employee.update({
      where: { id },
      data: { name, role, salaryType, baseSalary, phone, hireDate },
    });

    revalidatePath("/employees");
    return { ok: true };
  } catch {
    return { ok: false, error: "تعذّر تحديث بيانات الموظف" };
  }
}

export async function deleteEmployee(id: string): Promise<ActionResult> {
  try {
    await prisma.employee.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    revalidatePath("/employees");
    return { ok: true };
  } catch {
    return { ok: false, error: "تعذّر حذف الموظف" };
  }
}
