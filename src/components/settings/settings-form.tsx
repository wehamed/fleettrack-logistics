"use client";

import { useState } from "react";
import { Save, Download, Upload, Database, Check, Palette, Image as ImageIcon, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import { saveSettings, saveProfile, type ActionResult } from "@/app/(app)/settings/actions";

export type SettingsValues = {
  companyName: string;
  currency: string;
  address: string;
  phone: string;
  email: string;
  taxNumber: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string | null;
};

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded-md border border-secondary-200 bg-white dark:border-secondary-700 dark:bg-secondary-800"
        />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="w-32 font-mono" />
      </div>
    </div>
  );
}

export function SettingsForm({ settings, displayName }: { settings: SettingsValues; displayName?: string | null }) {
  const [values, setValues] = useState<SettingsValues>(settings);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  const [importFile, setImportFile] = useState<File | null>(null);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const [logoPreview, setLogoPreview] = useState<string | null>(settings.logoUrl);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [profileName, setProfileName] = useState(displayName ?? "");
  const [profileSaved, setProfileSaved] = useState(false);
  const [profilePending, setProfilePending] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  function set<K extends keyof SettingsValues>(k: K, v: SettingsValues[K]) {
    setValues((p) => ({ ...p, [k]: v }));
    setSaved(false);
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleLogoRemove() {
    setLogoFile(null);
    setLogoPreview(null);
    setValues((p) => ({ ...p, logoUrl: null }));
  }

  async function handleSave() {
    setError(null);
    setSaved(false);
    const fd = new FormData();
    fd.append("companyName", values.companyName);
    fd.append("currency", values.currency);
    fd.append("address", values.address);
    fd.append("phone", values.phone);
    fd.append("email", values.email);
    fd.append("taxNumber", values.taxNumber);
    fd.append("primaryColor", values.primaryColor);
    fd.append("secondaryColor", values.secondaryColor);
    fd.append("accentColor", values.accentColor);
    fd.append("logoUrl", logoPreview ?? "");
    setPending(true);
    const res: ActionResult = await saveSettings(fd);
    setPending(false);
    if (!res.ok) {
      setError(res.error ?? "تعذّر الحفظ");
      return;
    }
    setSaved(true);
  }

  async function handleProfileSave() {
    setProfileError(null);
    setProfileSaved(false);
    const fd = new FormData();
    fd.append("displayName", profileName);
    setProfilePending(true);
    const res: ActionResult = await saveProfile(fd);
    setProfilePending(false);
    if (!res.ok) {
      setProfileError(res.error ?? "تعذّر الحفظ");
      return;
    }
    setProfileSaved(true);
  }

  async function handleImport() {
    if (!importFile) return;
    setImportMsg(null);
    const fd = new FormData();
    fd.append("file", importFile);
    setImporting(true);
    try {
      const res = await fetch("/api/backup", { method: "POST", body: fd });
      const json = await res.json();
      if (!json.ok) {
        setImportMsg("فشل الاستيراد: " + (json.error ?? ""));
      } else {
        setImportMsg("تم استيراد النسخة الاحتياطية بنجاح. يُرجى تحديث الصفحة.");
        setImportFile(null);
      }
    } catch {
      setImportMsg("فشل الاستيراد");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>بيانات الشركة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>اسم الشركة</Label>
            <Input value={values.companyName} onChange={(e) => set("companyName", e.target.value)} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>العملة</Label>
              <Input value={values.currency} onChange={(e) => set("currency", e.target.value)} placeholder="د.إ" />
            </div>
            <div className="space-y-1.5">
              <Label>الرقم الضريبي</Label>
              <Input value={values.taxNumber} onChange={(e) => set("taxNumber", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>الهاتف</Label>
              <Input value={values.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>البريد الإلكتروني</Label>
              <Input value={values.email} onChange={(e) => set("email", e.target.value)} dir="ltr" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>العنوان</Label>
            <Textarea value={values.address} onChange={(e) => set("address", e.target.value)} rows={2} />
          </div>
          <div className="space-y-1.5">
            <Label>الشعار</Label>
            <div className="flex items-center gap-4">
              <input type="file" accept="image/*" onChange={handleLogoChange} className="text-sm file:rounded-lg file:border-0 file:bg-primary-600 file:px-3 file:py-1.5 file:text-sm file:text-white hover:file:bg-primary-700 dark:file:bg-primary-500" />
              {logoPreview && (
                <div className="relative flex items-center gap-2">
                  <img src={logoPreview} alt="الشعار" className="h-12 w-auto object-contain rounded border" />
                  <Button type="button" variant="ghost" size="icon" onClick={handleLogoRemove} aria-label="حذف الشعار">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4" /> الملف الشخصي
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>الاسم المعروض</Label>
              <Input
                value={profileName}
                onChange={(e) => { setProfileName(e.target.value); setProfileSaved(false); }}
                placeholder="اسمك في النظام"
              />
              <p className="text-xs text-secondary-400">يظهر في شريط الأعلى و-headers التقارير</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleProfileSave} disabled={profilePending}>
                <Save className="w-4 h-4" />
                حفظ
              </Button>
              {profileSaved && (
                <span className="inline-flex items-center gap-1 text-sm text-accent-600">
                  <Check className="w-4 h-4" /> تم الحفظ
                </span>
              )}
              {profileError && (
                <span className="text-sm text-danger-600">{profileError}</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-4 w-4" /> ألوان الهوية
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <ColorField label="الأساسي" value={values.primaryColor} onChange={(v) => set("primaryColor", v)} />
            <ColorField label="الثانوي" value={values.secondaryColor} onChange={(v) => set("secondaryColor", v)} />
            <ColorField label="التمييز" value={values.accentColor} onChange={(v) => set("accentColor", v)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-4 w-4" /> النسخ الاحتياطي
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-secondary-500">
              صدّر كل بيانات النظام (شاحنات، موظفون، حركات، رواتب، إعدادات) ملف JSON واحد. الاستيراد يستبدل البيانات الحالية بالكامل.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <a href="/api/backup" download>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4" />
                  تصدير النسخة
                </Button>
              </a>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={!importFile || importing}>
                    <Upload className="w-4 h-4" />
                    استيراد النسخة
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>تأكيد الاستيراد</AlertDialogTitle>
                    <AlertDialogDescription>
                      سيتم حذف كل البيانات الحالية واستبدالها ببيانات ملف النسخة الاحتياطية. لا يمكن التراجع. هل أنت متأكد؟
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                    <AlertDialogAction onClick={handleImport}>استيراد</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <input
                type="file"
                accept="application/json"
                onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                className="text-sm file:rounded-lg file:border-0 file:bg-primary-600 file:px-3 file:py-1.5 file:text-sm file:text-white hover:file:bg-primary-700 dark:file:bg-primary-500"
              />
            </div>
            {importMsg && (
              <p className="rounded-md bg-secondary-100 px-3 py-2 text-sm text-secondary-700 dark:bg-secondary-800 dark:text-secondary-200">
                {importMsg}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={pending}>
            <Save className="w-4 h-4" />
            حفظ الإعدادات
          </Button>
          {saved && (
            <span className="inline-flex items-center gap-1 text-sm text-accent-600">
              <Check className="w-4 h-4" /> تم الحفظ
            </span>
          )}
        </div>
        {error && (
          <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
