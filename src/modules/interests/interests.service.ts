import prisma from '@/lib/prisma.js';
import type { Prisma } from '@prisma/client';
import type {
    ListInterestsQuery,
    CreateInterestBody,
    PatchInterestBody,
} from '@/modules/interests/interests.schemas.js';
import * as interestsRepo from '@/modules/interests/interests.repo.js';
import { assertTagsExistAndBelongToUser } from '@/modules/tags/tags.service.js';
import { decodeCursor, encodeCursor } from '@/lib/pagination/cursor.js';
import { NotFoundError } from '@/lib/http/errors.js';

type Tx = Prisma.TransactionClient;

function mapTags(tags: { tag: { id: string; name: string } }[]) {
    return tags.map((t) => t.tag);
}

function mapInterest(interest: any) {
    return { ...interest, tags: mapTags(interest.tags) };
}

export async function listInterests(userId: string, query: ListInterestsQuery) {

    const cursorPayload = query.cursor ? decodeCursor(query.cursor) : undefined;

    const { items, nextCursorPayload } = await interestsRepo.findManyPaginated({
        userId,
        limit: query.limit,
        sort: query.sort,
        cursor: cursorPayload,
    });

    return {
        items: items.map(mapInterest),
        nextCursor: nextCursorPayload ? encodeCursor(nextCursorPayload) : null,
    };
}

export async function getInterestById(userId: string, interestId: string) {
    const item = await interestsRepo.findById(userId, interestId);
    if (!item) {
        throw new NotFoundError('Interest not found');
    }
    return mapInterest(item);
}

export async function createInterest(userId: string, data: CreateInterestBody) {
    const interestId = await prisma.$transaction(async (tx) => {
        const createdInterest = await interestsRepo.create({
            tx,
            userId,
            title: data.title,
            ...(data.reflection !== undefined ? { reflection: data.reflection } : {}),
        });

        if (data.tagIds !== undefined) {
            const validTagIds = await assertTagsExistAndBelongToUser(userId, data.tagIds, tx);
            await interestsRepo.replaceTags({
                tx,
                interestId: createdInterest.id,
                tagIds: validTagIds,
            });
        }

        return createdInterest.id;
    });

    return getInterestById(userId, interestId)
}

export async function patchInterest(
    userId: string,
    interestId: string,
    data: PatchInterestBody
) {
    await prisma.$transaction(async (tx) => {
        const updatedInterest = await interestsRepo.update({
            tx,
            userId,
            interestId,
            ...(data.title !== undefined ? { title: data.title } : {}),
            ...(data.reflection !== undefined ? { reflection: data.reflection } : {}),
        });

        if (updatedInterest.count === 0) {
            throw new NotFoundError('Interest not found');
        };

        if (data.tagIds !== undefined) {
            const validTagIds = await assertTagsExistAndBelongToUser(userId, data.tagIds, tx);
            await interestsRepo.replaceTags({
                tx,
                interestId,
                tagIds: validTagIds,
            });
        }
    });
    return getInterestById(userId, interestId);
}

export async function deleteInterest(
    userId: string, 
    interestId: string
) {
    const deletedInterest = await interestsRepo.deleteById(userId, interestId);
    
    if (deletedInterest.count === 0) {
        throw new NotFoundError('Interest not found');
    }
}