import prisma from '@/lib/prisma.js';
import type { Prisma } from '@prisma/client';
import type { CursorPayload } from '@/lib/pagination/cursor.js';

type Sort = 'asc' | 'desc';

export async function findManyPaginated(args: {
    userId: string,
    limit: number,
    sort: Sort,
    cursor?: CursorPayload,
}) {
    const { userId, limit, sort, cursor } = args;

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
            userId: userId,
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
    userId: string;
    title: string;
    reflection?: string | null;
}) {
    return prisma.interest.create({
        data: {
            userId: data.userId,
            title: data.title,
            reflection: data.reflection ?? null,
        },
    });
}

export async function update(
    userId: string,
    interestId: string,
    data: {
        title?: string,
        reflection?: string | null,
    }
) {
    return prisma.interest.updateMany({
        where: {
            id: interestId,
            userId: userId,
        },
        data: {
            ...(data.title !== undefined ? { title: data.title } : {}),
            ...(data.reflection !== undefined ? { reflection: data.reflection } : {}),
        },
    });
}

export async function remove(
    userId: string,
    interestId: string
) {
    return prisma.interest.deleteMany({
        where: {
            id: interestId,
            userId: userId,
        },
    });
}
