"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export type ActionResult = { ok: boolean; error?: string };

function validHex(v: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(v);
}

function validDataUrl(v: string): boolean {
  return v.startsWith("data:image/");
}

export async function saveSettings(formData: FormData): Promise<ActionResult> {
  try {
    const companyName = (formData.get("companyName") as string)?.trim() ?? "";
    const currency = (formData.get("currency") as string)?.trim();
    const address = (formData.get("address") as string)?.trim() || null;
    const phone = (formData.get("phone") as string)?.trim() || null;
    const email = (formData.get("email") as string)?.trim() || null;
    const taxNumber = (formData.get("taxNumber") as string)?.trim() || null;
    const primaryColor = (formData.get("primaryColor") as string)?.trim() || "#1d4ed8";
    const secondaryColor = (formData.get("secondaryColor") as string)?.trim() || "#1e293b";
    const accentColor = (formData.get("accentColor") as string)?.trim() || "#10b981";

    const logoUrlRaw = (formData.get("logoUrl") as string)?.trim();
    const logoUrl = (logoUrlRaw && validDataUrl(logoUrlRaw)) ? logoUrlRaw : null;

    if (!currency) return { ok: false, error: "العملة مطلوبة" };
    if (!validHex(primaryColor)) return { ok: false, error: "لون الهوية الأساسي غير صالح" };
    if (!validHex(secondaryColor)) return { ok: false, error: "اللون الثانوي غير صالح" };
    if (!validHex(accentColor)) return { ok: false, error: "لون التمييز غير صالح" };

    await prisma.companySettings.upsert({
      where: { id: "singleton" },
      update: {
        companyName,
        currency,
        address,
        phone,
        email,
        taxNumber,
        primaryColor,
        secondaryColor,
        accentColor,
        logoUrl,
      },
      create: {
        id: "singleton",
        companyName,
        currency,
        address,
        phone,
        email,
        taxNumber,
        primaryColor,
        secondaryColor,
        accentColor,
        logoUrl,
      },
    });

    revalidatePath("/", "layout");
    return { ok: true };
  } catch {
    return { ok: false, error: "تعذّر حفظ إعدادات الشركة" };
  }
}

export async function saveProfile(formData: FormData): Promise<ActionResult> {
  try {
    const displayName = (formData.get("displayName") as string)?.trim() || null;
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: "انتهت الجلسة، يرجى تسجيل الدخول من جديد" };
    await prisma.systemUser.update({
      where: { id: user.id },
      data: { displayName },
    });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch {
    return { ok: false, error: "تعذّر حفظ الملف الشخصي" };
  }
}
