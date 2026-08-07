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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TRUCK_STATUSES } from "@/lib/constants";
import { fromSubunits } from "@/lib/money";
import { createTruck, updateTruck } from "@/app/(app)/trucks/actions";
import type { TruckRow } from "./trucks-view";

export function TruckFormDialog({
  open,
  onOpenChange,
  truck,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  truck: TruckRow | null;
}) {
  const [status, setStatus] = useState(truck?.status ?? "تعمل");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const isEdit = Boolean(truck);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const formData = new FormData(e.currentTarget);
    formData.set("status", status);

    const res = isEdit
      ? await updateTruck(truck!.id, formData)
      : await createTruck(formData);

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
          <DialogTitle>{isEdit ? "تعديل شاحنة" : "إضافة شاحنة جديدة"}</DialogTitle>
          <DialogDescription>
            أدخل بيانات الشاحنة. الحقول المميزة بـ * مطلوبة.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="plateNumber">رقم اللوحة *</Label>
              <Input
                id="plateNumber"
                name="plateNumber"
                required
                defaultValue={truck?.plateNumber ?? ""}
                placeholder="مثال: أ ب ج 1234"
              />
            </div>
            <div>
              <Label htmlFor="model">الموديل *</Label>
              <Input
                id="model"
                name="model"
                required
                defaultValue={truck?.model ?? ""}
                placeholder="مثال: مرسيدس أكتروس"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="year">سنة الصنع</Label>
              <Input
                id="year"
                name="year"
                type="number"
                min={1900}
                max={2100}
                defaultValue={truck?.year ?? ""}
                placeholder="مثال: 2021"
              />
            </div>
            <div>
              <Label htmlFor="purchaseDate">تاريخ الشراء</Label>
              <Input
                id="purchaseDate"
                name="purchaseDate"
                type="date"
                defaultValue={truck?.purchaseDate ?? ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="purchaseValue">قيمة الشراء (بالعملة)</Label>
              <Input
                id="purchaseValue"
                name="purchaseValue"
                inputMode="decimal"
                defaultValue={truck?.purchaseValue != null ? fromSubunits(truck.purchaseValue) : ""}
                placeholder="مثال: 850000.00"
              />
            </div>
            <div>
              <Label>الحالة *</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  {TRUCK_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              {pending ? "جارٍ الحفظ..." : isEdit ? "حفظ التعديلات" : "إضافة الشاحنة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
