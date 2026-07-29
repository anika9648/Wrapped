"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/auth";
import { areFriends } from "@/lib/friends";

export async function addGiftIdeaAction(formData: FormData) {
  const me = await requireCurrentUser();
  const username = String(formData.get("username") ?? "");
  const title = String(formData.get("title") ?? "").trim().slice(0, 200);
  const description = String(formData.get("description") ?? "").trim().slice(0, 1000);
  if (!title) return;

  const target = await prisma.user.findUnique({ where: { username } });
  if (!target || target.id === me.id) return;
  if (!(await areFriends(me.id, target.id))) return;

  await prisma.giftIdea.create({
    data: { subjectId: target.id, authorId: me.id, title, description, source: "MANUAL" },
  });

  revalidatePath(`/guide/${username}`);
}

export async function deleteGiftIdeaAction(formData: FormData) {
  const me = await requireCurrentUser();
  const giftId = String(formData.get("giftId") ?? "");
  const username = String(formData.get("username") ?? "");

  const gift = await prisma.giftIdea.findUnique({ where: { id: giftId } });
  if (!gift || gift.authorId !== me.id) return;

  await prisma.giftIdea.delete({ where: { id: giftId } });
  revalidatePath(`/guide/${username}`);
}

export async function saveGeneratedIdeaAction(formData: FormData) {
  const me = await requireCurrentUser();
  const username = String(formData.get("username") ?? "");
  const title = String(formData.get("title") ?? "").trim().slice(0, 200);
  const description = String(formData.get("description") ?? "").trim().slice(0, 1000);
  if (!title) return;

  const target = await prisma.user.findUnique({ where: { username } });
  if (!target || target.id === me.id) return;
  if (!(await areFriends(me.id, target.id))) return;

  await prisma.giftIdea.create({
    data: { subjectId: target.id, authorId: me.id, title, description, source: "AI" },
  });

  revalidatePath(`/guide/${username}`);
  revalidatePath(`/guide/${username}/generated`);
}
