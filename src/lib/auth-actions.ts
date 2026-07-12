"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { hashPassword, verifyPassword, getCurrentUser, type AuthState } from "./auth";
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
  console.log("[login] redirecting to /");
  redirect("/");
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
  if (next.length < 6) {
    return { error: "كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف" };
  }
  if (next !== confirm) {
    return { error: "كلمة المرور الجديدة وتأكيدها غير متطابقين" };
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
