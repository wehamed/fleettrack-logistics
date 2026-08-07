"use client";

import { useState, useRef } from "react";
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
import { fromSubunits } from "@/lib/money";
import { createExpense, updateExpense } from "@/app/(app)/expenses/actions";
import type { ExpenseRow, TruckOption, CategoryOption } from "./expenses-view";

export function ExpenseFormDialog({
  open,
  onOpenChange,
  expense,
  trucks,
  categories,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  expense: ExpenseRow | null;
  trucks: TruckOption[];
  categories: CategoryOption[];
}) {
  const [truckId, setTruckId] = useState(expense?.truckId ?? "");
  const [categoryId, setCategoryId] = useState(expense?.categoryId ?? "");
  const [keepReceipt, setKeepReceipt] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const isEdit = Boolean(expense);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const formData = new FormData(e.currentTarget);
    formData.set("truckId", truckId === "__general__" ? "" : truckId);
    formData.set("categoryId", categoryId);
    formData.set("keepReceipt", keepReceipt ? "1" : "0");

    const res = isEdit
      ? await updateExpense(expense!.id, formData)
      : await createExpense(formData);

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
          <DialogTitle>{isEdit ? "تعديل مصروف" : "إضافة مصروف جديد"}</DialogTitle>
          <DialogDescription>
            اربط المصروف بشاحنة محددة أو اتركه مصروفًا عامًا. يمكن إرفاق صورة الإيصال.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>الشاحنة</Label>
              <Select value={truckId} onValueChange={setTruckId}>
                <SelectTrigger>
                  <SelectValue placeholder="مصروف عام (بدون شاحنة)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__general__">مصروف عام</SelectItem>
                  {trucks.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.plateNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>تصنيف المصروف *</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر التصنيف" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">التاريخ *</Label>
              <Input id="date" name="date" type="date" defaultValue={expense?.date ?? ""} required />
            </div>
            <div>
              <Label htmlFor="amount">قيمة المصروف *</Label>
              <Input
                id="amount"
                name="amount"
                inputMode="decimal"
                required
                defaultValue={expense?.amount != null ? fromSubunits(expense.amount) : ""}
                placeholder="مثال: 350.00"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">الوصف</Label>
            <Textarea id="description" name="description" defaultValue={expense?.description ?? ""} placeholder="تفاصيل المصروف..." />
          </div>

          <div>
            <Label htmlFor="receipt">صورة الإيصال (اختياري)</Label>
            <Input id="receipt" name="receipt" type="file" accept="image/*" ref={fileRef} className="cursor-pointer" />
            {isEdit && expense?.receiptImage && (
              <div className="mt-2 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={expense.receiptImage}
                  alt="الإيصال الحالي"
                  className="h-16 w-16 rounded-md border border-secondary-200 object-cover dark:border-secondary-700"
                />
                <label className="flex items-center gap-2 text-sm text-secondary-600 dark:text-secondary-300">
                  <input
                    type="checkbox"
                    checked={keepReceipt}
                    onChange={(e) => setKeepReceipt(e.target.checked)}
                  />
                  الإبقاء على الإيصال الحالي
                </label>
              </div>
            )}
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
              {pending ? "جارٍ الحفظ..." : isEdit ? "حفظ التعديلات" : "إضافة المصروف"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
