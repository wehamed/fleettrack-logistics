"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { parseMoneySafe } from "@/lib/validation";

export type ActionResult = { ok: boolean; error?: string; existingId?: string };

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function savePayroll(formData: FormData): Promise<ActionResult> {
  try {
    const id = (formData.get("id") as string)?.trim() || null;
    const employeeId = (formData.get("employeeId") as string)?.trim();
    const month = (formData.get("month") as string)?.trim() || currentMonth();
    const baseRaw = formData.get("baseAmount") as string;
    const dedRaw = formData.get("deductions") as string;
    const advRaw = formData.get("advances") as string;
    const notes = (formData.get("notes") as string)?.trim() || null;

    if (!employeeId) return { ok: false, error: "يجب تحديد الموظف" };
    if (!/^\d{4}-\d{2}$/.test(month)) return { ok: false, error: "الشهر غير صالح" };

    let base: number;
    try {
      base = parseMoneySafe(baseRaw) ?? 0;
    } catch {
      return { ok: false, error: "قيمة الراتب الأساسي غير صالحة" };
    }
    if (base <= 0) return { ok: false, error: "الراتب الأساسي يجب أن يكون أكبر من صفر" };

    let deductions = 0;
    if (dedRaw && dedRaw.trim() !== "") {
      try {
        deductions = parseMoneySafe(dedRaw) ?? 0;
      } catch {
        return { ok: false, error: "قيمة الخصومات غير صالحة" };
      }
    }

    let advances = 0;
    if (advRaw && advRaw.trim() !== "") {
      try {
        advances = parseMoneySafe(advRaw) ?? 0;
      } catch {
        return { ok: false, error: "قيمة السلف غير صالحة" };
      }
    }

    const net = base - deductions - advances;
    if (net < 0) {
      return {
        ok: false,
        error: "صافي المستحق لا يمكن أن يكون سالبًا (الخصومات + السلف تتجاوز الراتب)",
      };
    }

    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, deletedAt: null },
    });
    if (!employee) return { ok: false, error: "الموظف غير موجود" };

    if (id) {
      const existing = await prisma.payroll.findUnique({ where: { id } });
      if (!existing || existing.deletedAt) {
        return { ok: false, error: "سجل الراتب غير موجود" };
      }
      const conflict = await prisma.payroll.findFirst({
        where: { employeeId, month, NOT: { id } },
      });
      if (conflict) {
        return {
          ok: false,
          error: "يوجد بالفعل راتب مسجل لهذا الموظف في هذا الشهر — عدّل السجل الموجود بدل تسجيل واحد جديد",
          existingId: conflict.id,
        };
      }
      await prisma.payroll.update({
        where: { id },
        data: { baseAmount: base, deductions, advances, net, notes, month },
      });
    } else {
      const conflict = await prisma.payroll.findFirst({
        where: { employeeId, month },
      });
      if (conflict) {
        if (conflict.deletedAt) {
          await prisma.payroll.update({
            where: { id: conflict.id },
            data: { deletedAt: null, baseAmount: base, deductions, advances, net, notes },
          });
        } else {
          return {
            ok: false,
            error: "يوجد بالفعل راتب مسجل لهذا الموظف في هذا الشهر — عدّل السجل الموجود بدل تسجيل واحد جديد",
            existingId: conflict.id,
          };
        }
      } else {
        await prisma.payroll.create({
          data: {
            employeeId,
            month,
            baseAmount: base,
            deductions,
            advances,
            net,
            notes,
            paid: false,
          },
        });
      }
    }

    revalidatePath("/payroll");
    return { ok: true };
  } catch (e: any) {
    if (e?.code === "P2002") {
      return {
        ok: false,
        error: "يوجد بالفعل راتب مسجل لهذا الموظف في هذا الشهر — عدّل السجل الموجود بدل تسجيل واحد جديد",
      };
    }
    return { ok: false, error: "تعذّر حفظ بيانات الراتب" };
  }
}

export async function setPayrollPaid(id: string, paid: boolean): Promise<ActionResult> {
  try {
    await prisma.payroll.update({
      where: { id },
      data: { paid, paymentDate: paid ? new Date() : null },
    });
    revalidatePath("/payroll");
    return { ok: true };
  } catch {
    return { ok: false, error: "تعذّر تحديث حالة الصرف" };
  }
}

export async function deletePayroll(id: string): Promise<ActionResult> {
  try {
    await prisma.payroll.update({ where: { id }, data: { deletedAt: new Date() } });
    revalidatePath("/payroll");
    return { ok: true };
  } catch {
    return { ok: false, error: "تعذّر حذف سجل الراتب" };
  }
}
