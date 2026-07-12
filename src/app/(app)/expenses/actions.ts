"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { parseMoneySafe, parseDateSafe } from "@/lib/validation";
import { saveReceipt, removeReceipt } from "@/lib/upload";

export type ActionResult = { ok: boolean; error?: string };

function isRealFile(v: FormDataEntryValue | null): v is File {
  return Boolean(v) && typeof v !== "string" && (v as File).size > 0;
}

export async function createExpense(formData: FormData): Promise<ActionResult> {
  try {
    const truckIdRaw = (formData.get("truckId") as string)?.trim() || null;
    const categoryId = (formData.get("categoryId") as string)?.trim();
    const dateRaw = (formData.get("date") as string)?.trim();
    const amountRaw = formData.get("amount") as string;
    const description = (formData.get("description") as string)?.trim() || null;

    if (!categoryId) return { ok: false, error: "يجب تحديد تصنيف المصروف" };
    if (!dateRaw) return { ok: false, error: "تاريخ المصروف مطلوب" };
    const date = parseDateSafe(dateRaw);
    if (!date) return { ok: false, error: "تاريخ المصروف غير صالح" };
    const amount = parseMoneySafe(amountRaw);
    if (amount == null) return { ok: false, error: "قيمة المصروف مطلوبة" };
    if (amount <= 0) return { ok: false, error: "قيمة المصروف يجب أن تكون أكبر من صفر" };

    const category = await prisma.expenseCategory.findUnique({ where: { id: categoryId } });
    if (!category) return { ok: false, error: "تصنيف المصروف غير موجود" };

    let truckId: string | null = null;
    if (truckIdRaw) {
      const truck = await prisma.truck.findFirst({ where: { id: truckIdRaw, deletedAt: null } });
      if (!truck) return { ok: false, error: "الشاحنة غير موجودة" };
      truckId = truck.id;
    }

    let receiptImage: string | null = null;
    const file = formData.get("receipt");
    if (isRealFile(file)) {
      receiptImage = await saveReceipt(file);
    }

    await prisma.expense.create({
      data: { truckId, categoryId, date, amount, description, receiptImage },
    });

    revalidatePath("/expenses");
    return { ok: true };
  } catch {
    return { ok: false, error: "تعذّر حفظ بيانات المصروف" };
  }
}

export async function updateExpense(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const truckIdRaw = (formData.get("truckId") as string)?.trim() || null;
    const categoryId = (formData.get("categoryId") as string)?.trim();
    const dateRaw = (formData.get("date") as string)?.trim();
    const amountRaw = formData.get("amount") as string;
    const description = (formData.get("description") as string)?.trim() || null;
    const keepReceipt = (formData.get("keepReceipt") as string) === "1";

    if (!categoryId) return { ok: false, error: "يجب تحديد تصنيف المصروف" };
    if (!dateRaw) return { ok: false, error: "تاريخ المصروف مطلوب" };
    const date = parseDateSafe(dateRaw);
    if (!date) return { ok: false, error: "تاريخ المصروف غير صالح" };
    const amount = parseMoneySafe(amountRaw);
    if (amount == null) return { ok: false, error: "قيمة المصروف مطلوبة" };
    if (amount <= 0) return { ok: false, error: "قيمة المصروف يجب أن تكون أكبر من صفر" };

    const category = await prisma.expenseCategory.findUnique({ where: { id: categoryId } });
    if (!category) return { ok: false, error: "تصنيف المصروف غير موجود" };

    let truckId: string | null = null;
    if (truckIdRaw) {
      const truck = await prisma.truck.findFirst({ where: { id: truckIdRaw, deletedAt: null } });
      if (!truck) return { ok: false, error: "الشاحنة غير موجودة" };
      truckId = truck.id;
    }

    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) return { ok: false, error: "المصروف غير موجود" };

    let receiptImage = existing.receiptImage;
    const file = formData.get("receipt");
    if (isRealFile(file)) {
      receiptImage = await saveReceipt(file);
    } else if (!keepReceipt) {
      await removeReceipt(existing.receiptImage);
      receiptImage = null;
    }

    await prisma.expense.update({
      where: { id },
      data: { truckId, categoryId, date, amount, description, receiptImage },
    });

    revalidatePath("/expenses");
    return { ok: true };
  } catch {
    return { ok: false, error: "تعذّر تحديث بيانات المصروف" };
  }
}

export async function deleteExpense(id: string): Promise<ActionResult> {
  try {
    const existing = await prisma.expense.findUnique({ where: { id } });
    if (existing?.receiptImage) await removeReceipt(existing.receiptImage);
    await prisma.expense.update({ where: { id }, data: { deletedAt: new Date() } });
    revalidatePath("/expenses");
    return { ok: true };
  } catch {
    return { ok: false, error: "تعذّر حذف المصروف" };
  }
}
