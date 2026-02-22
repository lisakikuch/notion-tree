import prisma from '@/lib/prisma.js';

export async function create(data: {
    userId: string;
    title: string;
    reflection: string
}) {
    return prisma.interest.create({
        data: {
            userId: data.userId,
            title: data.title,
            reflection: data.reflection,
        },
    });
}

export async function update(
    userId: string,
    interestId: string,
    data: {
        title?: string,
        reflection?: string,
    }
) {
    return prisma.interest.updateMany({
        where: {
            id: interestId,
            userId: userId,
        },
        data,
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
