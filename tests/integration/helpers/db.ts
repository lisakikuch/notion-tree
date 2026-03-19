import prisma from '@/lib/prisma.js';

export async function resetDatabase() {
    await prisma.$transaction([
        prisma.interestTag.deleteMany(),
        prisma.interest.deleteMany(),
        prisma.tag.deleteMany(),
    ]);
}

export async function disconnectDatabase() {
    await prisma.$disconnect();
}

export async function createSingleTestTag(userId: string, name: string) {
    return await prisma.tag.create({
        data: {
            userId,
            name,
            nameNormalized: name.toLowerCase(),
        },
    });
}

export async function createMultipleTestTags(tags: {
    userId: string;
    name: string
}[]) {
    const data = tags.map((tag) => ({
        ...tag,
        nameNormalized: tag.name.toLowerCase(),
    }));

    return await prisma.tag.createMany({
        data,
    });
}

export async function findTagById(id: string) {
    return await prisma.tag.findUnique({
        where: { id },
    });
}

export async function findManyTagsByUserId(userId: string) {
    return await prisma.tag.findMany({
        where: { userId },
    });
}

export async function createSingleTestInterest(
    userId: string,
    title: string,
    reflection: string
) {
    return await prisma.interest.create({
        data: {
            userId,
            title,
            reflection,
        },
    });
}

export async function createMultipleTestInterests(interests: {
    userId: string;
    title: string;
    reflection?: string
}[]) {
    return await prisma.interest.createMany({
        data: interests,
    });
}

export async function createTestInterestWithTags(data: {
    title: string;
    userId: string;
    reflection?: string;
    tagIds: string[];
}) {
    return await prisma.interest.create({
        data: {
            title: data.title,
            reflection: data.reflection ?? null,
            userId: data.userId,
            tags: {
                create: data.tagIds.map((id) => ({
                    tagId: id,
                })),
            },
        },
    });
}

export async function findInterestById(id: string) {
    return await prisma.interest.findUnique({
        where: { id },
    });
}

export async function findManyInterestsByUserId(userId: string) {
    return await prisma.interest.findMany({
        where: { userId },
    });
}

export async function findInterestByIdWithTags(id: string) {
    return await prisma.interest.findUnique({
        where: { id },
        include: { tags: true },
    });
}

export async function findInterestTagJoin(id: string) {
    return await prisma.interestTag.findMany({
        where: {
            interestId: id
        }
    });
}