import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/auth";

async function main() {
  const passwordHash = await hashPassword("password123");

  const alice = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      email: "alice@example.com",
      username: "alice",
      name: "Alice Chen",
      passwordHash,
      avatarEmoji: "🌟",
      bio: "Always planning the next trip.",
      activities: "Hiking on weekends, trying new coffee shops, board game nights.",
      favoriteThings: "Anything lavender-scented, cozy sweaters, specialty coffee.",
    },
  });

  const ben = await prisma.user.upsert({
    where: { email: "ben@example.com" },
    update: {},
    create: {
      email: "ben@example.com",
      username: "ben",
      name: "Ben Rodriguez",
      passwordHash,
      avatarEmoji: "🎸",
      bio: "Guitarist, gamer, terrible cook.",
      activities: "Playing guitar, video games with friends, watching sci-fi movies.",
      favoriteThings: "Vinyl records, retro game consoles, dark chocolate.",
    },
  });

  const cara = await prisma.user.upsert({
    where: { email: "cara@example.com" },
    update: {},
    create: {
      email: "cara@example.com",
      username: "cara",
      name: "Cara Patel",
      passwordHash,
      avatarEmoji: "🌸",
      bio: "Plant mom and weekend baker.",
      activities: "Gardening, baking bread, yoga in the mornings.",
      favoriteThings: "Succulents, herbal tea, handmade ceramics.",
    },
  });

  for (const [a, b] of [
    [alice, ben],
    [alice, cara],
  ] as const) {
    await prisma.friendConnection.upsert({
      where: { requesterId_addresseeId: { requesterId: a.id, addresseeId: b.id } },
      update: { status: "ACCEPTED" },
      create: { requesterId: a.id, addresseeId: b.id, status: "ACCEPTED" },
    });
  }

  await prisma.personNote.upsert({
    where: { subjectId_authorId: { subjectId: ben.id, authorId: alice.id } },
    update: {},
    create: {
      subjectId: ben.id,
      authorId: alice.id,
      activities: "We went to a concert together last month, he loved it.",
      favorites: "He mentioned wanting a new guitar pedal.",
    },
  });

  await prisma.giftIdea.upsert({
    where: { id: "seed-gift-1" },
    update: {},
    create: {
      id: "seed-gift-1",
      subjectId: ben.id,
      authorId: alice.id,
      title: "Guitar effects pedal",
      description: "He's been talking about wanting a reverb pedal.",
      source: "MANUAL",
    },
  });

  for (const user of [alice, ben, cara]) {
    await prisma.activityEvent.create({ data: { actorId: user.id, type: "JOINED" } });
  }

  console.log("Seeded users:", { alice: alice.username, ben: ben.username, cara: cara.username });
  console.log("All demo passwords: password123");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
