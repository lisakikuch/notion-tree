import prisma from '@/lib/prisma.js';

export async function findManyPaginated(
    userId: string,
    limit: number,
    sort: string,
    cursor: string,
) {
    return prisma.interest.findMany({
        
    })
}

export async function findById(
    userId: string,
    interestId: string
) {
    return prisma.interest.findMany({
        where: {
            id: interestId,
            userId: userId,
        },
        include: {
            tags: true,
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
