import path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

declare global {
  var __suppressActivityLog: boolean | undefined;
}

type AnyRecord = Record<string, unknown>;

// Prisma 7 removed the built-in SQLite engine، لذا يلزم استخدام Driver Adapter.
// نستخدم libsql (WASM) للاتصال بملف SQLite المحلي بشكل متسق بين أداة Prisma CLI والتطبيق.
const dbPath =
  process.env.DATABASE_FILE ??
  path.join(process.cwd(), "dev.db");

const adapter = new PrismaLibSql({ url: `file:${dbPath}` });

const base = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === "development" ? ["error", "warn", "query"] : ["error"],
});

// Test connection on startup
if (process.env.NODE_ENV !== "production") {
  base.$connect().then(() => {
    console.info("[Prisma] Database connected successfully");
  }).catch((e) => {
    console.error("[Prisma] Connection failed:", e);
  });
}

// تسمية الكيانات بالعربية لعرضها في سجل النشاط
const ENTITY_LABELS: Record<string, string> = {
  Truck: "شاحنة",
  Employee: "موظف",
  Revenue: "إيراد",
  Expense: "مصروف",
  Payroll: "راتب",
  CompanySettings: "إعدادات الشركة",
  ActivityLog: "سجل النشاط",
  SystemUser: "مستخدم النظام",
};

function extractLabel(args: unknown, result: unknown): string {
  const data = (args as { data?: AnyRecord } | undefined)?.data ?? {};
  const res = result as AnyRecord | undefined;
  const where = (args as { where?: { id?: string } } | undefined)?.where;
  const v: unknown =
    data.plateNumber ??
    data.name ??
    data.clientName ??
    data.companyName ??
    res?.plateNumber ??
    res?.name ??
    res?.clientName ??
    res?.companyName ??
    where?.id ??
    "";
  return typeof v === "string" || typeof v === "number" ? String(v) : "";
}

// تسجيل النشاط في جدول منفصل عبر العميل الأصلي (بدون وساطة) لتفادي التكرار اللانهائي
async function recordActivity(model: string, operation: string, args: unknown, result: unknown) {
  const entityType = ENTITY_LABELS[model] ?? model;

  let action = "تعديل";
  if (operation === "create") action = "إضافة";
  else if (operation === "delete" || operation === "deleteMany") action = "حذف";
  else if (operation === "upsert") action = "إضافة/تعديل";

  // كشف الحذف الناعم (deletedAt) الذي تستخدمه شاشات النظام
  const data = (args as { data?: AnyRecord } | undefined)?.data;
  if (operation === "update" && data && "deletedAt" in data && data.deletedAt) {
    action = "حذف";
  }

  const label = extractLabel(args, result);
  const summary = `${action} ${entityType}${label ? " — " + label : ""}`;
  const res = result as AnyRecord | undefined;
  const rawId = (res && (res.id ?? res.plateNumber)) || (args as { where?: { id?: string } } | undefined)?.where?.id || null;

  await base.activityLog.create({
    data: {
      action,
      entityType,
      entityId: rawId ? String(rawId) : null,
      summary,
    },
  });
}

const extended = base.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const result = await query(args);
        // تجاوز التسجيل أثناء استيراد النسخة الاحتياطية لتفادي إغراق السجل
        if (globalThis.__suppressActivityLog) return result;
        // لا نسجّل عمليات جدول السجل نفسه
        if (model === "ActivityLog") return result;

        const MUTATIONS = [
          "create",
          "update",
          "delete",
          "createMany",
          "updateMany",
          "upsert",
          "deleteMany",
        ];
        if (!MUTATIONS.includes(operation)) return result;

        try {
          await recordActivity(model, operation, args, result);
        } catch {
          // تجاهل أي خطأ في السجل كي لا يعطّل العملية الأصلية
        }
        return result;
      },
    },
  },
});

const globalForPrisma = globalThis as unknown as { prisma?: typeof extended };

export const prisma = globalForPrisma.prisma ?? extended;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}