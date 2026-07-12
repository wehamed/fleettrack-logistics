import { toSubunits } from "./money";

// دوال تحقق آمنة: ترفض القيم الفارغة/السالبة/الصيغ غير الصحيحة قبل الحفظ.
export function parseMoneySafe(value: string | null | undefined): number | null {
  if (value == null || value.trim() === "") return null;
  const cleaned = value.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) {
    throw new Error("قيمة المبلغ غير صالحة");
  }
  const subunits = toSubunits(cleaned);
  if (subunits < 0) throw new Error("المبالغ لا يمكن أن تكون سالبة");
  return subunits;
}

export function parseDateSafe(value: string | null | undefined): Date | null {
  if (value == null || value.trim() === "") return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new Error("تاريخ غير صالح");
  return d;
}

export function parseYearSafe(value: string | null | undefined): number | null {
  if (value == null || value.trim() === "") return null;
  const y = Number.parseInt(value, 10);
  if (!Number.isFinite(y) || y < 1900 || y > 2100) {
    throw new Error("سنة غير صالحة");
  }
  return y;
}
