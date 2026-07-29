import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/auth";
import { areFriends } from "@/lib/friends";
import { updatePersonNoteAction } from "@/app/actions/notes";
import { addGiftIdeaAction, deleteGiftIdeaAction } from "@/app/actions/gifts";

export default async function GiftGuidePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const me = await requireCurrentUser();

  const target = await prisma.user.findUnique({ where: { username } });
  if (!target) notFound();
  if (target.id === me.id) redirect(`/u/${username}`);
  if (!(await areFriends(me.id, target.id))) redirect(`/u/${username}`);

  const [note, giftIdeas] = await Promise.all([
    prisma.personNote.findUnique({
      where: { subjectId_authorId: { subjectId: target.id, authorId: me.id } },
    }),
    prisma.giftIdea.findMany({
      where: { subjectId: target.id, authorId: me.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-sm text-neutral-500">
          <Link href={`/u/${username}`} className="hover:underline">
            ← {target.name}&apos;s profile
          </Link>
        </p>
        <h1 className="mt-1 text-xl font-semibold text-neutral-900">
          Your private gift guide for {target.name}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Only you can see this. Other friends keep their own separate notes and ideas about{" "}
          {target.name}, and {target.name} can&apos;t see any of it — no spoilers.
        </p>
      </div>

      {(target.activities || target.favoriteThings) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {target.activities && (
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                {target.name} says they like to do
              </h2>
              <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-700">{target.activities}</p>
            </div>
          )}
          {target.favoriteThings && (
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                {target.name}&apos;s favorite things
              </h2>
              <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-700">{target.favoriteThings}</p>
            </div>
          )}
        </div>
      )}

      <section className="rounded-lg border border-neutral-200 p-5">
        <h2 className="text-sm font-semibold text-neutral-900">Your notes about {target.name}</h2>
        <p className="mt-1 text-xs text-neutral-500">
          What you&apos;ve noticed from spending time together — this feeds your AI suggestions below.
        </p>
        <form action={updatePersonNoteAction} className="mt-3 flex flex-col gap-3">
          <input type="hidden" name="username" value={username} />
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-neutral-700">Things you do together / activities they enjoy</span>
            <textarea
              name="activities"
              defaultValue={note?.activities ?? ""}
              rows={3}
              maxLength={2000}
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-neutral-700">Favorite things you&apos;ve noticed</span>
            <textarea
              name="favorites"
              defaultValue={note?.favorites ?? ""}
              rows={3}
              maxLength={2000}
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            />
          </label>
          <button
            type="submit"
            className="self-start rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Save notes
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-neutral-200 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900">
            Your gift ideas for {target.name} ({giftIdeas.length})
          </h2>
          <Link
            href={`/guide/${username}/generated`}
            className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700"
          >
            ✨ Generate more ideas
          </Link>
        </div>

        <form action={addGiftIdeaAction} className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-start">
          <input type="hidden" name="username" value={username} />
          <input
            name="title"
            required
            maxLength={200}
            placeholder="Gift idea title"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 sm:max-w-xs"
          />
          <input
            name="description"
            maxLength={1000}
            placeholder="Notes (optional) — size, where to buy, etc."
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
          />
          <button
            type="submit"
            className="w-full whitespace-nowrap rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 sm:w-auto"
          >
            Add idea
          </button>
        </form>

        <ul className="mt-4 flex flex-col gap-2">
          {giftIdeas.length === 0 && (
            <li className="text-sm text-neutral-500">No gift ideas yet — add one above.</li>
          )}
          {giftIdeas.map((idea) => (
            <li
              key={idea.id}
              className="flex items-start justify-between gap-3 rounded-md border border-neutral-200 px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-neutral-900">
                  {idea.title}
                  {idea.source === "AI" && (
                    <span className="ml-2 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-700">
                      AI
                    </span>
                  )}
                </p>
                {idea.description && (
                  <p className="mt-0.5 whitespace-pre-wrap text-xs text-neutral-500">{idea.description}</p>
                )}
              </div>
              <form action={deleteGiftIdeaAction}>
                <input type="hidden" name="giftId" value={idea.id} />
                <input type="hidden" name="username" value={username} />
                <button type="submit" className="text-xs text-neutral-400 hover:text-red-600">
                  Remove
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
