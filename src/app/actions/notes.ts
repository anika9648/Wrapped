"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/auth";
import { areFriends } from "@/lib/friends";

export async function updatePersonNoteAction(formData: FormData) {
  const me = await requireCurrentUser();
  const username = String(formData.get("username") ?? "");
  const target = await prisma.user.findUnique({ where: { username } });
  if (!target || target.id === me.id) return;
  if (!(await areFriends(me.id, target.id))) return;

  const activities = String(formData.get("activities") ?? "").slice(0, 2000);
  const favorites = String(formData.get("favorites") ?? "").slice(0, 2000);

  await prisma.personNote.upsert({
    where: { subjectId_authorId: { subjectId: target.id, authorId: me.id } },
    update: { activities, favorites },
    create: { subjectId: target.id, authorId: me.id, activities, favorites },
  });

  revalidatePath(`/guide/${username}`);
}
