import Decimal from "decimal.js";

// كل المبالغ المالية تُخزَّن في قاعدة البيانات كأعداد صحيحة بأصغر وحدة (القرش = 1/100).
// جميع العمليات الحسابية تتم عبر decimal.js لضمان الدقة العشرية الكاملة دون Float.

const SUBUNIT = 100;

// تحويل نص عشري (مثل "1234.56") إلى عدد صحيح بالقرش، بدقة كاملة.
export function toSubunits(value: string | number): number {
  const dec = new Decimal(value.toString());
  return dec.mul(SUBUNIT).round().toNumber();
}

// تحويل عدد صحيح بالقرش إلى نص عشري (مثل 123456 => "1234.56").
export function fromSubunits(subunits: number | null | undefined): string {
  if (subunits == null) return "0.00";
  return new Decimal(subunits).div(SUBUNIT).toFixed(2);
}

// جمع قائمة من الأعداد الصحيحة (بالقرش) بنتيجة صحيحة دقيقة.
export function sumSubunits(values: number[]): number {
  return values.reduce((acc, v) => acc + (v || 0), 0);
}

// تنسيق عدد صحيح بالقرش إلى نص مع رمز العملة.
export function formatMoney(
  subunits: number | null | undefined,
  currency = "د.إ"
): string {
  const dec = new Decimal(subunits ?? 0).div(SUBUNIT);
  return `${dec.toFixed(2)} ${currency}`;
}

// تنسيق نص عشري مع رمز العملة (للعرض المباشر).
export function formatDecimal(value: string | number, currency = "د.إ"): string {
  const dec = new Decimal(value.toString());
  return `${dec.toFixed(2)} ${currency}`;
}
