import { prisma } from "@/lib/prisma";

export type FriendStatusLabel =
  | "SELF"
  | "FRIENDS"
  | "REQUEST_SENT"
  | "REQUEST_RECEIVED"
  | "NONE";

export async function getConnection(userAId: string, userBId: string) {
  return prisma.friendConnection.findFirst({
    where: {
      OR: [
        { requesterId: userAId, addresseeId: userBId },
        { requesterId: userBId, addresseeId: userAId },
      ],
    },
  });
}

export async function getFriendStatus(meId: string, otherId: string): Promise<FriendStatusLabel> {
  if (meId === otherId) return "SELF";
  const connection = await getConnection(meId, otherId);
  if (!connection || connection.status === "DECLINED") return "NONE";
  if (connection.status === "ACCEPTED") return "FRIENDS";
  return connection.requesterId === meId ? "REQUEST_SENT" : "REQUEST_RECEIVED";
}

export async function areFriends(meId: string, otherId: string) {
  if (meId === otherId) return false;
  const connection = await getConnection(meId, otherId);
  return connection?.status === "ACCEPTED";
}

export async function listFriends(userId: string) {
  const connections = await prisma.friendConnection.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    },
    include: { requester: true, addressee: true },
  });
  return connections.map((c) => (c.requesterId === userId ? c.addressee : c.requester));
}

export async function listIncomingRequests(userId: string) {
  return prisma.friendConnection.findMany({
    where: { addresseeId: userId, status: "PENDING" },
    include: { requester: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function listOutgoingRequests(userId: string) {
  return prisma.friendConnection.findMany({
    where: { requesterId: userId, status: "PENDING" },
    include: { addressee: true },
    orderBy: { createdAt: "desc" },
  });
}
