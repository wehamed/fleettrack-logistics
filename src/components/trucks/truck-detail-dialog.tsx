"use client";

import { useState } from "react";
import { Pencil, Trash2, UserPlus, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { statusBadgeClass, statusLabel } from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import { deleteTruck, assignDriver } from "@/app/(app)/trucks/actions";
import type { TruckRow } from "./trucks-view";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-secondary-100 py-2.5 last:border-0 dark:border-secondary-700/60">
      <span className="text-secondary-500 dark:text-secondary-400">{label}</span>
      <span className="font-medium text-secondary-800 dark:text-secondary-200">{value}</span>
    </div>
  );
}

export function TruckDetailDialog({
  truck,
  drivers,
  onClose,
  onEdit,
}: {
  truck: TruckRow | null;
  drivers: { id: string; name: string }[];
  onClose: () => void;
  onEdit: (t: TruckRow) => void;
}) {
  const [driverId, setDriverId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignPending, setAssignPending] = useState(false);
  const [delPending, setDelPending] = useState(false);

  if (!truck) return null;

  async function handleAssign(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAssignError(null);
    setAssignPending(true);
    const formData = new FormData();
    formData.set("truckId", truck!.id);
    formData.set("employeeId", driverId);
    formData.set("startDate", startDate);
    const res = await assignDriver(formData);
    setAssignPending(false);
    if (res.ok) {
      setDriverId("");
      setStartDate("");
      onClose();
    } else {
      setAssignError(res.error ?? "تعذّر التعيين");
    }
  }

  async function handleDelete() {
    setDelPending(true);
    const res = await deleteTruck(truck!.id);
    setDelPending(false);
    if (res.ok) onClose();
  }

  return (
    <Dialog open={Boolean(truck)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="flex items-center gap-2">
              {truck.plateNumber}
              <span className={`status-badge ${statusBadgeClass(truck.status)}`}>
                {statusLabel(truck.status)}
              </span>
            </DialogTitle>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" title="تعديل" onClick={() => onEdit(truck)}>
                <Pencil className="w-4 h-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                    <AlertDialogDescription>
                      هل أنت متأكد من حذف الشاحنة «{truck.plateNumber}»؟ يتم الحذف
                      منطقيًا مع الاحتفاظ بالسجل المحاسبي.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                    <AlertDialogAction disabled={delPending} onClick={handleDelete}>
                      {delPending ? "جارٍ الحذف..." : "حذف نهائي"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">التفاصيل</TabsTrigger>
            <TabsTrigger value="driver">السائق</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <div>
              <DetailRow label="رقم اللوحة" value={truck.plateNumber} />
              <DetailRow label="الموديل" value={truck.model} />
              <DetailRow label="سنة الصنع" value={truck.year ?? "—"} />
              <DetailRow
                label="تاريخ الشراء"
                value={truck.purchaseDate ?? "—"}
              />
              <DetailRow
                label="قيمة الشراء"
                value={truck.purchaseValue != null ? formatMoney(truck.purchaseValue) : "—"}
              />
              <DetailRow
                label="السائق الحالي"
                value={
                  truck.currentDriver?.name ?? (
                    <span className="text-secondary-400">بدون سائق</span>
                  )
                }
              />
            </div>
          </TabsContent>

          <TabsContent value="driver">
            <div className="space-y-4">
              <div className="rounded-lg bg-secondary-50 p-4 dark:bg-secondary-700/40">
                <div className="text-sm text-secondary-500 dark:text-secondary-400">
                  السائق الحالي
                </div>
                <div className="mt-1 flex items-center gap-2 font-medium text-secondary-800 dark:text-secondary-200">
                  <User className="w-4 h-4 text-secondary-400" />
                  {truck.currentDriver?.name ?? "بدون سائق معيّن"}
                </div>
              </div>

              <form onSubmit={handleAssign} className="space-y-4 rounded-lg border border-secondary-200 p-4 dark:border-secondary-700">
                <div className="flex items-center gap-2 text-sm font-medium text-secondary-700 dark:text-secondary-300">
                  <UserPlus className="w-4 h-4" />
                  تعيين سائق جديد
                </div>
                <div>
                  <Label>السائق</Label>
                  <Select value={driverId} onValueChange={setDriverId}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر السائق" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="startDate">تاريخ بداية التعيين</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                {assignError && (
                  <div className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-700 dark:bg-danger-900/20">
                    {assignError}
                  </div>
                )}
                <Button type="submit" disabled={assignPending || !driverId || !startDate}>
                  {assignPending ? "جارٍ التعيين..." : "تعيين السائق"}
                </Button>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
