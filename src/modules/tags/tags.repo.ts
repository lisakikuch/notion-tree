import prisma from "@/lib/prisma.js";
import type { Prisma } from "@prisma/client";

type Tx = Prisma.TransactionClient;

export async function findManyIdsByUserAndIds(data: {
    tx?: Tx;
    userId: string;
    tagIds: string[];
}) {
    const { tx, userId, tagIds } = data;
    const db = tx ?? prisma;

    if (tagIds.length === 0) return [];

    return db.tag.findMany({
        where: { userId, id: { in: tagIds } },
        select: { id: true },
    });
}

export async function findById(userId: string, tagId: string) {
    const tag = await prisma.tag.findFirst({
        where: {
            id: tagId,
            userId,
        },
    });
    return tag;
}

export async function findManyByIds(userId: string, tagIds: string[]) {
    const tags = await prisma.tag.findMany({
        where: {
            id: {
                in: tagIds,
            },
            userId,
        },
    });
    return tags;
}

export async function create(data: { userId: string; name: string }) {
    const tag = await prisma.tag.create({
        data: {
            userId: data.userId,
            name: data.name,
            nameNormalized: data.name.toLowerCase(),
        },
    });
    return tag;
}

export async function deleteById(userId: string, tagId: string) {
    return await prisma.tag.deleteMany({
        where: {
            id: tagId, 
            userId,
        },
    });
}

