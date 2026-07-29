import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/auth";
import { areFriends } from "@/lib/friends";
import { generateGiftIdeas } from "@/lib/giftSuggestions";
import { saveGeneratedIdeaAction } from "@/app/actions/gifts";

export default async function GeneratedIdeasPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const me = await requireCurrentUser();

  const target = await prisma.user.findUnique({ where: { username } });
  if (!target) notFound();
  if (target.id === me.id) redirect(`/u/${username}`);
  if (!(await areFriends(me.id, target.id))) redirect(`/u/${username}`);

  const [note, existingIdeas] = await Promise.all([
    prisma.personNote.findUnique({
      where: { subjectId_authorId: { subjectId: target.id, authorId: me.id } },
    }),
    prisma.giftIdea.findMany({
      where: { subjectId: target.id, authorId: me.id },
      select: { title: true },
    }),
  ]);

  const hasEnoughInput =
    Boolean(target.favoriteThings || target.activities || note?.favorites || note?.activities);

  const suggestions = hasEnoughInput
    ? generateGiftIdeas({
        subjectFavorites: target.favoriteThings,
        subjectActivities: target.activities,
        authorNoteFavorites: note?.favorites ?? "",
        authorNoteActivities: note?.activities ?? "",
        existingIdeaTitles: existingIdeas.map((i) => i.title),
      })
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-neutral-500">
          <Link href={`/guide/${username}`} className="hover:underline">
            ← Back to gift guide
          </Link>
        </p>
        <h1 className="mt-1 text-xl font-semibold text-neutral-900">
          ✨ Generated ideas for {target.name}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Based on {target.name}&apos;s profile and your private notes about them. These stay separate
          from your saved list until you add one.
        </p>
      </div>

      {!hasEnoughInput && (
        <div className="rounded-lg border border-dashed border-neutral-300 p-5 text-sm text-neutral-500">
          Not enough information yet. Add notes about {target.name} in the{" "}
          <Link href={`/guide/${username}`} className="font-medium text-rose-600 hover:underline">
            gift guide
          </Link>{" "}
          (or wait for them to fill out their profile) to get tailored suggestions.
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {suggestions.map((idea) => (
          <li
            key={idea.title}
            className="flex items-start justify-between gap-3 rounded-lg border border-neutral-200 p-4"
          >
            <div>
              <p className="text-sm font-medium text-neutral-900">{idea.title}</p>
              <p className="mt-0.5 text-xs text-neutral-500">{idea.description}</p>
            </div>
            <form action={saveGeneratedIdeaAction}>
              <input type="hidden" name="username" value={username} />
              <input type="hidden" name="title" value={idea.title} />
              <input type="hidden" name="description" value={idea.description} />
              <button
                type="submit"
                className="whitespace-nowrap rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700"
              >
                Save to my list
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
