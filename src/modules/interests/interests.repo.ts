import prisma from '@/lib/prisma.js';
import type { Prisma } from '@prisma/client';
import type { CursorPayload } from '@/lib/pagination/cursor.js';

type Sort = 'asc' | 'desc';
type Tx = Prisma.TransactionClient;

export async function findManyPaginated(data: {
    userId: string,
    limit: number,
    sort: Sort,
    cursor?: CursorPayload | undefined,
}) {
    const { userId, limit, sort, cursor } = data;

    const orderBy: Prisma.InterestOrderByWithRelationInput[] = [
        { lastAccessedAt: sort },
        { id: sort },
    ];

    const where: Prisma.InterestWhereInput = {
        userId,
        ...(cursor
            ? {
                OR: [
                    {
                        lastAccessedAt:
                            sort === 'desc'
                                ? { lt: cursor.lastAccessedAt }
                                : { gt: cursor.lastAccessedAt },
                    },
                    {
                        AND: [
                            { lastAccessedAt: cursor.lastAccessedAt },
                            { id: sort === 'desc' ? { lt: cursor.id } : { gt: cursor.id } },
                        ],
                    },
                ],
            } : {}),
    };

    const rows = await prisma.interest.findMany({
        where,
        orderBy,
        take: limit + 1, // fetch one extra to determine if there's a next page
        select: {
            id: true,
            title: true,
            lastAccessedAt: true,
            tags: {
                select: {
                    tag: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
        },
    });

    const hasNext = rows.length > limit;
    const items = rows.slice(0, limit);

    const lastItem = items[items.length - 1];

    const nextCursorPayload =
        hasNext && lastItem
            ? { lastAccessedAt: lastItem.lastAccessedAt, id: lastItem.id }
            : null;

    return {
        items,
        nextCursorPayload,
    };
}

export async function findById(
    userId: string,
    interestId: string,
) {
    return prisma.interest.findFirst({
        where: {
            id: interestId,
            userId,
        },
        select: {
            id: true,
            title: true,
            reflection: true,
            lastAccessedAt: true,
            createdAt: true,
            updatedAt: true,
            tags: {
                select: {
                    tag: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
        },
    });
}

export async function create(data: {
    tx: Tx;
    userId: string;
    title: string;
    reflection?: string | null;
}) {
    const { tx, userId, title, reflection } = data;
    const db = tx ?? prisma;

    return db.interest.create({
        data: {
            userId,
            title,
            reflection: reflection ?? null,
        },
    });
}

export async function update(data: {
    tx?: Tx,
    userId: string,
    interestId: string,
    title?: string,
    reflection?: string | null,
}) {
    const { tx, userId, interestId, title, reflection } = data;
    const db = tx ?? prisma;

    return db.interest.updateMany({
        where: {
            id: interestId,
            userId,
        },
        data: {
            ...(title !== undefined ? { title } : {}),
            ...(reflection !== undefined ? { reflection } : {}),
        },
    });
}

export async function replaceTags(data: {
    tx: Tx;
    interestId: string;
    tagIds: string[];
}) {
    const { tx, interestId, tagIds } = data;

    await tx.interestTag.deleteMany({
        where: {
            interestId,
        },
    });

    if (tagIds.length === 0) return;


    await tx.interestTag.createMany({
        data: tagIds.map((tagId) => ({
            interestId,
            tagId,
        })),
        skipDuplicates: true,
    });
}

export async function deleteById(
    userId: string,
    interestId: string
) {
    return prisma.interest.deleteMany({
        where: {
            id: interestId,
            userId,
        },
    });
}
