import 'dotenv/config';
import prisma from '../src/lib/prisma';

const { DEV_USER_ID } = process.env;

if (!DEV_USER_ID) {
  throw new Error("Missing DEV_USER_ID in environment variables");
}

function normalize(name: string) {
  return name.trim().toLowerCase();
}

const TAG_POOL = [
  "Backend",
  "Frontend",
  "Database",
  "DevOps",
  "System Design",
  "Testing",
];

function getRandomTags() {
  const count = Math.floor(Math.random() * 3) + 1; // 1–3 tags
  return [...TAG_POOL]
    .sort(() => 0.5 - Math.random())
    .slice(0, count);
}

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Create Tags
  const tags = await Promise.all(
    TAG_POOL.map((name) =>
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

  console.log("✅ Tags ready");

  // 2. Generate 50 Interests
  for (let i = 1; i <= 50; i++) {
    const tagNames = getRandomTags();

    const interest = await prisma.interest.create({
      data: {
        userId: DEV_USER_ID,
        title: `Sample Note ${i}`,
        reflection: `This is reflection for note ${i}. Focus on improving system thinking and backend design.`,
      },
    });

    const tagIds = tags
      .filter((t) => tagNames.includes(t.name))
      .map((t) => t.id);

    await prisma.interestTag.createMany({
      data: tagIds.map((tagId) => ({
        interestId: interest.id,
        tagId,
      })),
      skipDuplicates: true,
    });

    console.log(`✅ Created: Sample Note ${i}`);
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