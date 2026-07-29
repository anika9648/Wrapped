import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/auth";
import { getFriendStatus } from "@/lib/friends";
import { sendFriendRequestAction, respondToRequestAction } from "@/app/actions/friends";
import { ProfileEditor } from "@/components/ProfileEditor";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const me = await requireCurrentUser();

  const target = await prisma.user.findUnique({ where: { username } });
  if (!target) notFound();

  const status = await getFriendStatus(me.id, target.id);

  if (status === "SELF") {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-xl font-semibold text-neutral-900">Your profile</h1>
        <ProfileEditor user={target} />
      </div>
    );
  }

  let connectionId: string | null = null;
  if (status === "REQUEST_RECEIVED") {
    const connection = await prisma.friendConnection.findFirst({
      where: { requesterId: target.id, addresseeId: me.id, status: "PENDING" },
    });
    connectionId = connection?.id ?? null;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 rounded-lg border border-neutral-200 p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-3xl">
            {target.avatarEmoji}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">{target.name}</h1>
            <p className="text-sm text-neutral-500">@{target.username}</p>
            {target.bio && <p className="mt-2 max-w-md text-sm text-neutral-700">{target.bio}</p>}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {status === "NONE" && (
            <form action={sendFriendRequestAction}>
              <input type="hidden" name="username" value={target.username} />
              <button
                type="submit"
                className="rounded-md bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700"
              >
                Add friend
              </button>
            </form>
          )}
          {status === "REQUEST_SENT" && (
            <span className="rounded-md bg-neutral-100 px-3 py-1.5 text-sm text-neutral-500">
              Request sent
            </span>
          )}
          {status === "REQUEST_RECEIVED" && connectionId && (
            <form action={respondToRequestAction} className="flex gap-2">
              <input type="hidden" name="connectionId" value={connectionId} />
              <button
                name="decision"
                value="accept"
                className="rounded-md bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700"
              >
                Accept
              </button>
              <button
                name="decision"
                value="decline"
                className="rounded-md bg-neutral-100 px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-200"
              >
                Decline
              </button>
            </form>
          )}
          {status === "FRIENDS" && (
            <Link
              href={`/guide/${target.username}`}
              className="rounded-md bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700"
            >
              Gift guide →
            </Link>
          )}
        </div>
      </div>

      {status === "FRIENDS" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoCard title="Likes to do" content={target.activities} />
          <InfoCard title="Favorite things" content={target.favoriteThings} />
        </div>
      )}
    </div>
  );
}

function InfoCard({ title, content }: { title: string; content: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 p-4">
      <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
      <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-600">
        {content || "Nothing added yet."}
      </p>
    </div>
  );
}
