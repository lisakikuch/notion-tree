import prisma from '@/lib/prisma.js';

export async function resetDatabase() {
    await prisma.interestTag.deleteMany();
    await prisma.interest.deleteMany();
    await prisma.tag.deleteMany();
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

export async function createMultipleTestTags(tags: { userId: string; name: string }[]) {
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