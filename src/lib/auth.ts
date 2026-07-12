import crypto from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import {
  verifySessionToken,
  SESSION_COOKIE_NAME,
} from "./session";

// تجزئة كلمة المرور عبر scrypt المدمج في Node (لا مكتبات خارجية)
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

// التأكد من وجود مستخدم افتراضي عند أول تشغيل
export async function ensureDefaultUser() {
  try {
    await prisma.systemUser.upsert({
      where: { username: "admin" },
      update: {},
      create: {
        username: "admin",
        passwordHash: hashPassword("admin123"),
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

