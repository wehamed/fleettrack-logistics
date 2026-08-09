"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { hashPassword, verifyPassword, getCurrentUser, usesDefaultPassword, validateNewPassword, type AuthState } from "./auth";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
} from "./session";

export async function login(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const username = (formData.get("username")?.toString() ?? "").trim();
  const password = formData.get("password")?.toString() ?? "";
  if (!username || !password) {
    return { error: "اسم المستخدم وكلمة المرور مطلوبان" };
  }
  const user = await prisma.systemUser.findUnique({ where: { username } });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "اسم المستخدم أو كلمة المرور غير صحيحة" };
  }
  const token = await createSessionToken(user.id, user.username);
  (await cookies()).set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
  // في الإنتاج: إجبار المستخدم على تغيير كلمة المرور الافتراضية عند أول دخول
  const mustChangePassword =
    process.env.NODE_ENV === "production" && usesDefaultPassword(user.passwordHash);
  redirect(mustChangePassword ? "/change-password" : "/");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE_NAME);
  redirect("/login");
}

export async function changePassword(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const current = formData.get("current")?.toString() ?? "";
  const next = formData.get("next")?.toString() ?? "";
  const confirm = formData.get("confirm")?.toString() ?? "";

  if (!current || !next || !confirm) {
    return { error: "جميع الحقول مطلوبة" };
  }
  const validationError = validateNewPassword(next, confirm);
  if (validationError) {
    return { error: validationError };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { error: "انتهت الجلسة، يرجى تسجيل الدخول من جديد" };
  }
  if (!verifyPassword(current, user.passwordHash)) {
    return { error: "كلمة المرور الحالية غير صحيحة" };
  }

  await prisma.systemUser.update({
    where: { id: user.id },
    data: { passwordHash: hashPassword(next) },
  });
  return { success: true };
}

// نفس التحقق مع إعادة توجيه إجبارية بعد النجاح — تُستخدم في صفحة
// تغيير كلمة المرور الافتراضية عند أول دخول في الإنتاج.
export async function changePasswordRequired(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const result = await changePassword(_prev, formData);
  if (result.success) {
    redirect("/");
  }
  return result;
}
