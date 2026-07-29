"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/auth";
import { getConnection } from "@/lib/friends";

export async function sendFriendRequestAction(formData: FormData) {
  const me = await requireCurrentUser();
  const username = String(formData.get("username") ?? "").trim();
  if (!username) return;

  const target = await prisma.user.findUnique({ where: { username } });
  if (!target || target.id === me.id) return;

  const existing = await getConnection(me.id, target.id);
  if (existing) return;

  await prisma.friendConnection.create({
    data: { requesterId: me.id, addresseeId: target.id, status: "PENDING" },
  });

  revalidatePath(`/u/${username}`);
  revalidatePath("/friends");
}

export async function respondToRequestAction(formData: FormData) {
  const me = await requireCurrentUser();
  const connectionId = String(formData.get("connectionId") ?? "");
  const accept = formData.get("decision") === "accept";

  const connection = await prisma.friendConnection.findUnique({ where: { id: connectionId } });
  if (!connection || connection.addresseeId !== me.id || connection.status !== "PENDING") return;

  await prisma.friendConnection.update({
    where: { id: connectionId },
    data: { status: accept ? "ACCEPTED" : "DECLINED", respondedAt: new Date() },
  });

  if (accept) {
    await prisma.activityEvent.create({
      data: { actorId: me.id, type: "FRIEND_CONNECTED", metadata: connection.requesterId },
    });
    await prisma.activityEvent.create({
      data: { actorId: connection.requesterId, type: "FRIEND_CONNECTED", metadata: me.id },
    });
  }

  revalidatePath("/friends");
  revalidatePath("/feed");
}
