"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/auth";
import { EMOJI_CHOICES } from "@/lib/constants";

export async function updateProfileAction(formData: FormData) {
  const me = await requireCurrentUser();

  const bio = String(formData.get("bio") ?? "").slice(0, 500);
  const favoriteThings = String(formData.get("favoriteThings") ?? "").slice(0, 1000);
  const activities = String(formData.get("activities") ?? "").slice(0, 1000);
  let avatarEmoji = String(formData.get("avatarEmoji") ?? "🙂");
  if (!EMOJI_CHOICES.includes(avatarEmoji)) avatarEmoji = "🙂";

  await prisma.user.update({
    where: { id: me.id },
    data: { bio, favoriteThings, activities, avatarEmoji },
  });

  await prisma.activityEvent.create({
    data: { actorId: me.id, type: "PROFILE_UPDATED" },
  });

  revalidatePath(`/u/${me.username}`);
  revalidatePath("/feed");
}
