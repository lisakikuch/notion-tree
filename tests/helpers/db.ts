import prisma from '@/lib/prisma.js';

export async function resetDatabase() {
    await prisma.interestTag.deleteMany();
    await prisma.interest.deleteMany();
    await prisma.tag.deleteMany();
}