"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { REVENUE_TYPES } from "@/lib/constants";
import { fromSubunits } from "@/lib/money";
import { createRevenue, updateRevenue } from "@/app/(app)/revenues/actions";
import type { RevenueRow, TruckOption } from "./revenues-view";

export function RevenueFormDialog({
  open,
  onOpenChange,
  revenue,
  trucks,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  revenue: RevenueRow | null;
  trucks: TruckOption[];
}) {
  const [truckId, setTruckId] = useState(revenue?.truckId ?? "");
  const [revenueType, setRevenueType] = useState(revenue?.revenueType ?? "أجرة نقل");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const isEdit = Boolean(revenue);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const formData = new FormData(e.currentTarget);
    formData.set("truckId", truckId);
    formData.set("revenueType", revenueType);

    const res = isEdit
      ? await updateRevenue(revenue!.id, formData)
      : await createRevenue(formData);

    setPending(false);
    if (res.ok) {
      onOpenChange(false);
    } else {
      setError(res.error ?? "تعذّر الحفظ");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "تعديل إيراد" : "إضافة إيراد جديد"}</DialogTitle>
          <DialogDescription>سجّل رحلة أو عقد نقل لشاحنة محددة.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>الشاحنة *</Label>
              <Select value={truckId} onValueChange={setTruckId}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الشاحنة" />
                </SelectTrigger>
                <SelectContent>
                  {trucks.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.plateNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date">التاريخ *</Label>
              <Input id="date" name="date" type="date" defaultValue={revenue?.date ?? ""} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clientName">اسم العميل *</Label>
              <Input id="clientName" name="clientName" required defaultValue={revenue?.clientName ?? ""} placeholder="اسم العميل أو الجهة" />
            </div>
            <div>
              <Label htmlFor="destination">الوجهة</Label>
              <Input id="destination" name="destination" defaultValue={revenue?.destination ?? ""} placeholder="مثال: الرياض - جدة" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>نوع الإيراد *</Label>
              <Select value={revenueType} onValueChange={setRevenueType}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر النوع" />
                </SelectTrigger>
                <SelectContent>
                  {REVENUE_TYPES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">قيمة الإيراد *</Label>
              <Input
                id="amount"
                name="amount"
                inputMode="decimal"
                required
                defaultValue={revenue?.amount != null ? fromSubunits(revenue.amount) : ""}
                placeholder="مثال: 5000.00"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea id="notes" name="notes" defaultValue={revenue?.notes ?? ""} placeholder="أي تفاصيل إضافية..." />
          </div>

          {error && (
            <div className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-700 dark:bg-danger-900/20">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "جارٍ الحفظ..." : isEdit ? "حفظ التعديلات" : "إضافة الإيراد"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
