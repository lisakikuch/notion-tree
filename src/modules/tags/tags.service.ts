import * as tagsRepo from '@/modules/tags/tags.repo.js';
import { NotFoundError, ConflictError, BadRequestError } from '@/lib/http/errors.js';
import { Prisma } from '@prisma/client';

type Tx = Prisma.TransactionClient;

function normalizeTagName(name: string) {
    return name.trim().toLowerCase();
}

function isTagNameConflict(error: unknown): boolean {
    return (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
    );
}

export async function listTagsByUserAndIds(userId: string, tagIds: string[]) {
    if (tagIds.length === 0) return [];

    const uniqueTagIds = Array.from(new Set(tagIds));
    const foundTags = await tagsRepo.findManyByIds(userId, uniqueTagIds);

    return foundTags.map((tag) => ({
        id: tag.id,
        name: tag.name,
    }));
}

export async function getTagById(userId: string, tagId: string) {
    const tag = await tagsRepo.findById(userId, tagId);
    if (!tag) {
        throw new NotFoundError('Tag not found');
    }
    return {
        id: tag.id,
        name: tag.name,
    };
}

export async function createTag(userId: string, data: { name: string }) {
    const name = normalizeTagName(data.name);

    if (!name) {
        throw new BadRequestError('Tag name must not be empty');
    }

    try {
        const tag = await tagsRepo.create({ userId, name });
        return {
            id: tag.id,
            name: tag.name,
        };
    } catch (err) {
        if (isTagNameConflict(err)) {
            throw new ConflictError('Tag name already exists');
        }
        throw err;
    }
}

export async function assertTagsExistAndBelongToUser(
    userId: string,
    tagIds: string[],
    tx?: Tx,
): Promise<string[]> {
    if (tagIds.length === 0) return [];

    const uniqueTagIds = Array.from(new Set(tagIds));

    const foundTags = await tagsRepo.findManyIdsByUserAndIds(
        tx ? { tx, userId, tagIds: uniqueTagIds } : { userId, tagIds: uniqueTagIds },
    );

    if (foundTags.length !== uniqueTagIds.length) {
        const foundTagIds = new Set(foundTags.map((t) => t.id));
        const notFoundTagIds = uniqueTagIds.filter((id) => !foundTagIds.has(id));
        throw new NotFoundError(`Tags not found: ${notFoundTagIds.join(', ')}`);
    }
    return uniqueTagIds;
};