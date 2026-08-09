import crypto from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import {
  verifySessionToken,
  SESSION_COOKIE_NAME,
} from "./session";

// تجزئة كلمة المرور عبر scrypt المدمج في Node (لا مكتبات خارجية)
const DEFAULT_ADMIN_USERNAME = "admin";
const DEFAULT_ADMIN_PASSWORD = "admin123";

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const idx = stored.indexOf(":");
  if (idx < 0) return false;
  const salt = stored.slice(0, idx);
  const hash = stored.slice(idx + 1);
  const computed = crypto.scryptSync(password, salt, 64).toString("hex");
  const a = Buffer.from(hash, "hex");
  const b = Buffer.from(computed, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export type AuthState = { error?: string; success?: boolean };

// هل كلمة المرور المدخلة هي الافتراضية المعروفة؟
export function isDefaultAdminPassword(password: string): boolean {
  return password === DEFAULT_ADMIN_PASSWORD;
}

// هل التجزئة المخزنة ما زالت لكلمة المرور الافتراضية؟
export function usesDefaultPassword(passwordHash: string): boolean {
  return verifyPassword(DEFAULT_ADMIN_PASSWORD, passwordHash);
}

// تحقق موحّد من كلمة المرور الجديدة (قصر، تطابق، ومنع الافتراضية)
export function validateNewPassword(next: string, confirm: string): string | null {
  if (!next || next.length < 6) {
    return "كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف";
  }
  if (next !== confirm) {
    return "كلمة المرور الجديدة وتأكيدها غير متطابقين";
  }
  if (isDefaultAdminPassword(next)) {
    return "لا يمكن استخدام كلمة المرور الافتراضية";
  }
  return null;
}

// التأكد من وجود مستخدم افتراضي عند أول تشغيل
export async function ensureDefaultUser() {
  try {
    await prisma.systemUser.upsert({
      where: { username: DEFAULT_ADMIN_USERNAME },
      update: {},
      create: {
        username: DEFAULT_ADMIN_USERNAME,
        passwordHash: hashPassword(DEFAULT_ADMIN_PASSWORD),
        displayName: "المحاسب",
      },
    });
  } catch {
    // تجاهل أي خطأ أثناء البذر الأولي
  }
}

export async function getCurrentUser() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);
  if (!session) return null;
  return prisma.systemUser.findUnique({ where: { id: session.userId } });
}

