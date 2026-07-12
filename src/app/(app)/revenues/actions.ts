"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { parseMoneySafe, parseDateSafe } from "@/lib/validation";
import { REVENUE_TYPES } from "@/lib/constants";

export type ActionResult = { ok: boolean; error?: string };

export async function createRevenue(formData: FormData): Promise<ActionResult> {
  try {
    const truckId = (formData.get("truckId") as string)?.trim();
    const dateRaw = (formData.get("date") as string)?.trim();
    const clientName = (formData.get("clientName") as string)?.trim();
    const destination = (formData.get("destination") as string)?.trim() || null;
    const revenueType = (formData.get("revenueType") as string) || "أجرة نقل";
    const amountRaw = formData.get("amount") as string;
    const notes = (formData.get("notes") as string)?.trim() || null;

    if (!truckId) return { ok: false, error: "يجب تحديد الشاحنة" };
    if (!clientName) return { ok: false, error: "اسم العميل مطلوب" };
    if (!dateRaw) return { ok: false, error: "تاريخ الإيراد مطلوب" };
    if (!REVENUE_TYPES.some((r) => r.value === revenueType)) {
      return { ok: false, error: "نوع الإيراد غير صالح" };
    }
    const date = parseDateSafe(dateRaw);
    if (!date) return { ok: false, error: "تاريخ الإيراد غير صالح" };
    const amount = parseMoneySafe(amountRaw);
    if (amount == null) return { ok: false, error: "قيمة الإيراد مطلوبة" };
    if (amount <= 0) return { ok: false, error: "قيمة الإيراد يجب أن تكون أكبر من صفر" };

    const truck = await prisma.truck.findFirst({ where: { id: truckId, deletedAt: null } });
    if (!truck) return { ok: false, error: "الشاحنة غير موجودة" };

    await prisma.revenue.create({
      data: { truckId, date, clientName, destination, revenueType, amount, notes },
    });

    revalidatePath("/revenues");
    return { ok: true };
  } catch {
    return { ok: false, error: "تعذّر حفظ بيانات الإيراد" };
  }
}

export async function updateRevenue(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const truckId = (formData.get("truckId") as string)?.trim();
    const dateRaw = (formData.get("date") as string)?.trim();
    const clientName = (formData.get("clientName") as string)?.trim();
    const destination = (formData.get("destination") as string)?.trim() || null;
    const revenueType = (formData.get("revenueType") as string) || "أجرة نقل";
    const amountRaw = formData.get("amount") as string;
    const notes = (formData.get("notes") as string)?.trim() || null;

    if (!truckId) return { ok: false, error: "يجب تحديد الشاحنة" };
    if (!clientName) return { ok: false, error: "اسم العميل مطلوب" };
    if (!dateRaw) return { ok: false, error: "تاريخ الإيراد مطلوب" };
    if (!REVENUE_TYPES.some((r) => r.value === revenueType)) {
      return { ok: false, error: "نوع الإيراد غير صالح" };
    }
    const date = parseDateSafe(dateRaw);
    if (!date) return { ok: false, error: "تاريخ الإيراد غير صالح" };
    const amount = parseMoneySafe(amountRaw);
    if (amount == null) return { ok: false, error: "قيمة الإيراد مطلوبة" };
    if (amount <= 0) return { ok: false, error: "قيمة الإيراد يجب أن تكون أكبر من صفر" };

    await prisma.revenue.update({
      where: { id },
      data: { truckId, date, clientName, destination, revenueType, amount, notes },
    });

    revalidatePath("/revenues");
    return { ok: true };
  } catch {
    return { ok: false, error: "تعذّر تحديث بيانات الإيراد" };
  }
}

export async function deleteRevenue(id: string): Promise<ActionResult> {
  try {
    await prisma.revenue.update({ where: { id }, data: { deletedAt: new Date() } });
    revalidatePath("/revenues");
    return { ok: true };
  } catch {
    return { ok: false, error: "تعذّر حذف الإيراد" };
  }
}
