"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSessionCookie, clearSessionCookie, hashPassword, verifyPassword } from "@/lib/auth";
import { signupSchema, loginSchema } from "@/lib/validation";

export type AuthActionState = { error: string } | null;

export async function signupAction(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { name, username, email, password } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    return {
      error: existing.email === email ? "That email is already registered" : "That username is taken",
    };
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, username, email, passwordHash },
  });

  await prisma.activityEvent.create({
    data: { actorId: user.id, type: "JOINED" },
  });

  await createSessionCookie(user.id);
  redirect("/feed");
}

export async function loginAction(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Incorrect email or password" };
  }

  await createSessionCookie(user.id);
  redirect("/feed");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}
