export const TRUCK_STATUSES = [
  { value: "تعمل", label: "تعمل", badge: "status-active" },
  { value: "صيانة", label: "صيانة", badge: "status-maintenance" },
  { value: "متوقفة", label: "متوقفة", badge: "status-stopped" },
] as const;

export const EMPLOYEE_ROLES = [
  { value: "سائق", label: "سائق" },
  { value: "فني", label: "فني" },
  { value: "إداري", label: "إداري" },
] as const;

export const SALARY_TYPES = [
  { value: "ثابت", label: "ثابت شهري" },
  { value: "بالرحلة", label: "بالرحلة" },
  { value: "نسبة", label: "نسبة من الإيراد" },
] as const;

export const REVENUE_TYPES = [
  { value: "أجرة نقل", label: "أجرة نقل" },
  { value: "عقد شهري", label: "عقد شهري ثابت" },
  { value: "إيجار شاحنة", label: "إيجار شاحنة" },
] as const;

export function statusBadgeClass(status: string): string {
  const found = TRUCK_STATUSES.find((s) => s.value === status);
  return found ? found.badge : "status-stopped";
}

export function statusLabel(status: string): string {
  const found = TRUCK_STATUSES.find((s) => s.value === status);
  return found ? found.label : status;
}
