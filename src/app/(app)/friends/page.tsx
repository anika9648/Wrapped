import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/auth";
import { listFriends, listIncomingRequests, listOutgoingRequests } from "@/lib/friends";
import { sendFriendRequestAction, respondToRequestAction } from "@/app/actions/friends";

export default async function FriendsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const me = await requireCurrentUser();
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const [friends, incoming, outgoing, results] = await Promise.all([
    listFriends(me.id),
    listIncomingRequests(me.id),
    listOutgoingRequests(me.id),
    query
      ? prisma.user.findMany({
          where: {
            id: { not: me.id },
            OR: [
              { username: { contains: query } },
              { name: { contains: query } },
            ],
          },
          take: 10,
        })
      : Promise.resolve([]),
  ]);

  const friendIds = new Set(friends.map((f) => f.id));
  const outgoingIds = new Set(outgoing.map((r) => r.addresseeId));
  const incomingByRequesterId = new Map(incoming.map((r) => [r.requesterId, r.id]));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Friends</h1>
        <form className="mt-3 flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by name or username…"
            className="w-full max-w-sm rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
          />
          <button type="submit" className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white">
            Search
          </button>
        </form>

        {query && (
          <ul className="mt-4 flex flex-col gap-2">
            {results.length === 0 && <li className="text-sm text-neutral-500">No users found.</li>}
            {results.map((user) => (
              <li
                key={user.id}
                className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2"
              >
                <Link href={`/u/${user.username}`} className="flex items-center gap-3">
                  <span className="text-xl">{user.avatarEmoji}</span>
                  <span>
                    <span className="block text-sm font-medium text-neutral-900">{user.name}</span>
                    <span className="block text-xs text-neutral-500">@{user.username}</span>
                  </span>
                </Link>
                {friendIds.has(user.id) ? (
                  <span className="text-xs text-neutral-400">Friends</span>
                ) : outgoingIds.has(user.id) ? (
                  <span className="text-xs text-neutral-400">Request sent</span>
                ) : incomingByRequesterId.has(user.id) ? (
                  <form action={respondToRequestAction}>
                    <input type="hidden" name="connectionId" value={incomingByRequesterId.get(user.id)} />
                    <button
                      name="decision"
                      value="accept"
                      className="rounded-md bg-rose-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-rose-700"
                    >
                      Accept
                    </button>
                  </form>
                ) : (
                  <form action={sendFriendRequestAction}>
                    <input type="hidden" name="username" value={user.username} />
                    <button className="rounded-md bg-rose-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-rose-700">
                      Add
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {incoming.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-neutral-900">Requests</h2>
          <ul className="mt-2 flex flex-col gap-2">
            {incoming.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2"
              >
                <Link href={`/u/${r.requester.username}`} className="flex items-center gap-3">
                  <span className="text-xl">{r.requester.avatarEmoji}</span>
                  <span className="text-sm font-medium text-neutral-900">{r.requester.name}</span>
                </Link>
                <form action={respondToRequestAction} className="flex gap-2">
                  <input type="hidden" name="connectionId" value={r.id} />
                  <button
                    name="decision"
                    value="accept"
                    className="rounded-md bg-rose-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-rose-700"
                  >
                    Accept
                  </button>
                  <button
                    name="decision"
                    value="decline"
                    className="rounded-md bg-neutral-100 px-2.5 py-1 text-xs text-neutral-600 hover:bg-neutral-200"
                  >
                    Decline
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="text-sm font-semibold text-neutral-900">Your friends ({friends.length})</h2>
        {friends.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">
            No friends yet — search above to connect with someone.
          </p>
        ) : (
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {friends.map((friend) => (
              <li key={friend.id} className="rounded-md border border-neutral-200 px-3 py-2">
                <Link href={`/u/${friend.username}`} className="flex items-center gap-3">
                  <span className="text-xl">{friend.avatarEmoji}</span>
                  <span>
                    <span className="block text-sm font-medium text-neutral-900">{friend.name}</span>
                    <span className="block text-xs text-neutral-500">@{friend.username}</span>
                  </span>
                </Link>
                <Link
                  href={`/guide/${friend.username}`}
                  className="mt-2 inline-block text-xs font-medium text-rose-600 hover:underline"
                >
                  Gift guide →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
