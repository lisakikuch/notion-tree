import 'dotenv/config';
import prisma from '../src/lib/prisma';

const { DEV_USER_ID } = process.env;

if (!DEV_USER_ID) {
  throw new Error("Missing DEV_USER_ID in environment variables");
}

function normalize(name: string) {
  return name.trim().toLowerCase();
}

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Create Tags
  const tagNames = ["Backend", "Frontend", "Database"];

  const tags = await Promise.all(
    tagNames.map((name) =>
      prisma.tag.upsert({
        where: {
          userId_nameNormalized: {
            userId: DEV_USER_ID,
            nameNormalized: normalize(name),
          },
        },
        update: {},
        create: {
          userId: DEV_USER_ID,
          name,
          nameNormalized: normalize(name),
        },
      })
    )
  );

  console.log("✅ Tags seeded:", tags.map(t => t.name));

  // 2. Create Interests
  const interestsData = [
    {
      title: "Learn Express.js deeply",
      reflection: "Understand middleware, routing, error handling",
      tagNames: ["Backend"],
    },
    {
      title: "Study React patterns",
      reflection: "Hooks, state management, performance",
      tagNames: ["Frontend"],
    },
    {
      title: "Master SQL joins",
      reflection: "Focus on performance and indexing",
      tagNames: ["Database"],
    },
    {
      title: "Build fullstack project",
      reflection: "Connect frontend + backend + DB",
      tagNames: ["Backend", "Frontend"],
    },
  ];

  for (const item of interestsData) {
    // Create interest
    const interest = await prisma.interest.create({
      data: {
        userId: DEV_USER_ID,
        title: item.title,
        reflection: item.reflection,
      },
    });

    // Map tag names to IDs
    const tagIds = tags
      .filter((t) => item.tagNames.includes(t.name))
      .map((t) => t.id);

    // Create relations
    await prisma.interestTag.createMany({
      data: tagIds.map((tagId) => ({
        interestId: interest.id,
        tagId,
      })),
      skipDuplicates: true,
    });

    console.log(`✅ Interest created: ${interest.title}`);
  }

  console.log("🎉 Seeding complete");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });