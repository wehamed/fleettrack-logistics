"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { toSubunits } from "@/lib/money";
import { TRUCK_STATUSES } from "@/lib/constants";

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

function parseYearSafe(value: string | null | undefined): number | null {
  if (value == null || value.trim() === "") return null;
  const y = Number.parseInt(value, 10);
  if (!Number.isFinite(y) || y < 1900 || y > 2100) {
    throw new Error("سنة الصنع غير صالحة");
  }
  return y;
}

function parseDateSafe(value: string | null | undefined): Date | null {
  if (value == null || value.trim() === "") return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new Error("تاريخ غير صالح");
  return d;
}

export async function createTruck(formData: FormData): Promise<ActionResult> {
  try {
    const plateNumber = (formData.get("plateNumber") as string)?.trim();
    const model = (formData.get("model") as string)?.trim();
    const status = (formData.get("status") as string) || "تعمل";
    const purchaseValue = parseMoneySafe(formData.get("purchaseValue") as string);
    const year = parseYearSafe(formData.get("year") as string);
    const purchaseDate = parseDateSafe(formData.get("purchaseDate") as string);

    if (!plateNumber) return { ok: false, error: "رقم اللوحة مطلوب" };
    if (!model) return { ok: false, error: "الموديل مطلوب" };
    if (!TRUCK_STATUSES.some((s) => s.value === status)) {
      return { ok: false, error: "حالة الشاحنة غير صالحة" };
    }

    const existing = await prisma.truck.findFirst({
      where: { plateNumber, deletedAt: null },
    });
    if (existing) return { ok: false, error: "رقم اللوحة مسجل مسبقًا" };

    await prisma.truck.create({
      data: {
        plateNumber,
        model,
        status,
        purchaseValue,
        year,
        purchaseDate,
      },
    });

    revalidatePath("/trucks");
    return { ok: true };
  } catch {
    return { ok: false, error: "تعذّر حفظ بيانات الشاحنة" };
  }
}

export async function updateTruck(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const plateNumber = (formData.get("plateNumber") as string)?.trim();
    const model = (formData.get("model") as string)?.trim();
    const status = (formData.get("status") as string) || "تعمل";
    const purchaseValue = parseMoneySafe(formData.get("purchaseValue") as string);
    const year = parseYearSafe(formData.get("year") as string);
    const purchaseDate = parseDateSafe(formData.get("purchaseDate") as string);

    if (!plateNumber) return { ok: false, error: "رقم اللوحة مطلوب" };
    if (!model) return { ok: false, error: "الموديل مطلوب" };
    if (!TRUCK_STATUSES.some((s) => s.value === status)) {
      return { ok: false, error: "حالة الشاحنة غير صالحة" };
    }

    const duplicate = await prisma.truck.findFirst({
      where: { plateNumber, deletedAt: null, NOT: { id } },
    });
    if (duplicate) return { ok: false, error: "رقم اللوحة مسجل مسبقًا" };

    await prisma.truck.update({
      where: { id },
      data: {
        plateNumber,
        model,
        status,
        purchaseValue,
        year,
        purchaseDate,
      },
    });

    revalidatePath("/trucks");
    return { ok: true };
  } catch {
    return { ok: false, error: "تعذّر تحديث بيانات الشاحنة" };
  }
}

// حذف منطقي (Soft Delete) — لا حذف فعلي من قاعدة البيانات حفاظًا على السجل المحاسبي.
export async function deleteTruck(id: string): Promise<ActionResult> {
  try {
    await prisma.truck.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    revalidatePath("/trucks");
    return { ok: true };
  } catch {
    return { ok: false, error: "تعذّر حذف الشاحنة" };
  }
}

// تعيين سائق لشاحنة: يُغلق أي تعيين مفتوح سابقًا ثم يُنشئ تعيينًا جديدًا.
export async function assignDriver(formData: FormData): Promise<ActionResult> {
  try {
    const truckId = formData.get("truckId") as string;
    const employeeId = formData.get("employeeId") as string;
    const startDateRaw = (formData.get("startDate") as string)?.trim();

    if (!truckId) return { ok: false, error: "يجب تحديد الشاحنة" };
    if (!employeeId) return { ok: false, error: "يجب تحديد السائق" };
    if (!startDateRaw) return { ok: false, error: "تاريخ بداية التعيين مطلوب" };

    const startDate = new Date(startDateRaw);
    if (Number.isNaN(startDate.getTime())) {
      return { ok: false, error: "تاريخ بداية التعيين غير صالح" };
    }

    const role = await prisma.employee.findFirst({
      where: { id: employeeId, deletedAt: null },
      select: { role: true },
    });
    if (!role) return { ok: false, error: "السائق غير موجود" };
    if (role.role !== "سائق") {
      return { ok: false, error: "فقط السائقين يمكن تعيينهم على الشاحنات" };
    }

    await prisma.$transaction([
      prisma.truckDriverAssignment.updateMany({
        where: { truckId, endDate: null },
        data: { endDate: startDate },
      }),
      prisma.truckDriverAssignment.create({
        data: { truckId, employeeId, startDate },
      }),
    ]);

    revalidatePath("/trucks");
    return { ok: true };
  } catch {
    return { ok: false, error: "تعذّر تعيين السائق" };
  }
}
