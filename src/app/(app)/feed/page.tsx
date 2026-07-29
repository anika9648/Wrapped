import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/auth";
import { listFriends } from "@/lib/friends";

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default async function FeedPage() {
  const me = await requireCurrentUser();
  const friends = await listFriends(me.id);
  const feedUserIds = [me.id, ...friends.map((f) => f.id)];

  const events = await prisma.activityEvent.findMany({
    where: { actorId: { in: feedUserIds } },
    include: { actor: true },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const otherUserIds = events
    .filter((e) => e.type === "FRIEND_CONNECTED" && e.metadata)
    .map((e) => e.metadata);
  const otherUsers = otherUserIds.length
    ? await prisma.user.findMany({ where: { id: { in: otherUserIds } } })
    : [];
  const otherUserById = new Map(otherUsers.map((u) => [u.id, u]));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-neutral-900">Feed</h1>

      {events.length === 0 && (
        <p className="text-sm text-neutral-500">
          Nothing here yet. Add some friends to see their updates.
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {events.map((event) => (
          <li key={event.id} className="flex items-start gap-3 rounded-lg border border-neutral-200 p-4">
            <span className="text-xl">{event.actor.avatarEmoji}</span>
            <div className="flex-1">
              <p className="text-sm text-neutral-800">
                <Link href={`/u/${event.actor.username}`} className="font-medium hover:underline">
                  {event.actor.name}
                </Link>{" "}
                {describeEvent(event, otherUserById)}
              </p>
              <p className="mt-0.5 text-xs text-neutral-400">{timeAgo(event.createdAt)}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function describeEvent(
  event: { type: string; metadata: string },
  otherUserById: Map<string, { name: string; username: string }>,
) {
  switch (event.type) {
    case "JOINED":
      return "joined Wrapped 🎉";
    case "PROFILE_UPDATED":
      return "updated their profile";
    case "FRIEND_CONNECTED": {
      const other = otherUserById.get(event.metadata);
      return other ? (
        <>
          became friends with{" "}
          <Link href={`/u/${other.username}`} className="font-medium hover:underline">
            {other.name}
          </Link>
        </>
      ) : (
        "made a new friend"
      );
    }
    default:
      return "";
  }
}
