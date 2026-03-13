import { describe, expect, it } from 'vitest';
import {
    mapTags,
    mapInterestDetail,
    mapInterestListItem
} from '@/modules/interests/interests.helpers.js';
import type {
    InterestTagRow,
    InterestListRow,
    InterestDetailRow
} from '@/modules/interests/interests.types.js';

describe('interests.helpers', () => {
    it('should map tags correctly', () => {
        const input = [
            { tag: { id: '1', name: 'Tag1' } },
            { tag: { id: '2', name: 'Tag2' } },
        ]
        const result = mapTags(input);
        expect(result).toEqual([
            { id: '1', name: 'Tag1' },
            { id: '2', name: 'Tag2' },
        ]);
    });
});

describe('interests.helpers', () => {
    describe('mapInterestListItem', () => {
        it('maps nested tags rows into flat tags', () => {
            const input: InterestListRow = {
                id: '1',
                title: 'Interest 1',
                lastAccessedAt: new Date('2024-01-01T00:00:00Z'),
                tags: [
                    { tag: { id: '1', name: 'Tag1' } },
                    { tag: { id: '2', name: 'Tag2' } },
                ],
            }
            const result = mapInterestListItem(input);
            expect(result).toEqual({
                id: '1',
                title: 'Interest 1',
                lastAccessedAt: new Date('2024-01-01T00:00:00Z'),
                tags: [
                    { id: '1', name: 'Tag1' },
                    { id: '2', name: 'Tag2' },
                ],
            });
        });

        it('returns empty tags array if no tags are present', () => {
            const input: InterestListRow = {
                id: '1',
                title: 'Interest 1',
                lastAccessedAt: new Date('2024-01-01T00:00:00Z'),
                tags: [],
            };
            const result = mapInterestListItem(input);
            expect(result).toEqual({
                id: '1',
                title: 'Interest 1',
                lastAccessedAt: new Date('2024-01-01T00:00:00Z'),
                tags: [],
            });
        });
    });

    describe('mapInterestDetail', () => {
        it('maps nested tags rows into flat tags and keeps detail fields', () => {
            const input: InterestDetailRow = {
                id: '1',
                title: 'Interest 1',
                reflection: 'Reflection text',
                lastAccessedAt: new Date('2024-01-01T00:00:00Z'),
                createdAt: new Date('2024-01-01T00:00:00Z'),
                updatedAt: new Date('2024-01-01T00:00:00Z'),
                tags: [
                    { tag: { id: '1', name: 'Tag1' } },
                    { tag: { id: '2', name: 'Tag2' } },
                ],
            }
            const result = mapInterestDetail(input);
            expect(result).toEqual({
                id: '1',
                title: 'Interest 1',
                reflection: 'Reflection text',
                lastAccessedAt: new Date('2024-01-01T00:00:00Z'),
                createdAt: new Date('2024-01-01T00:00:00Z'),
                updatedAt: new Date('2024-01-01T00:00:00Z'),
                tags: [
                    { id: '1', name: 'Tag1' },
                    { id: '2', name: 'Tag2' },
                ],
            });
        });

        it('returns empty tags array if no tags are present', () => {
            const input: InterestDetailRow = {
                id: '1',
                title: 'Interest 1',
                reflection: 'Reflection text',
                lastAccessedAt: new Date('2024-01-01T00:00:00Z'),
                createdAt: new Date('2024-01-01T00:00:00Z'),
                updatedAt: new Date('2024-01-01T00:00:00Z'),
                tags: [],
            };
            const result = mapInterestDetail(input);
            expect(result).toEqual({
                id: '1',
                title: 'Interest 1',
                reflection: 'Reflection text',
                lastAccessedAt: new Date('2024-01-01T00:00:00Z'),
                createdAt: new Date('2024-01-01T00:00:00Z'),
                updatedAt: new Date('2024-01-01T00:00:00Z'),
                tags: [],
            });
        });

        it('handles null reflection correctly', () => {
            const input: InterestDetailRow = {
                id: '1',
                title: 'Interest 1',
                reflection: null,
                lastAccessedAt: new Date('2024-01-01T00:00:00Z'),
                createdAt: new Date('2024-01-01T00:00:00Z'),
                updatedAt: new Date('2024-01-01T00:00:00Z'),
                tags: [],
            };
            const result = mapInterestDetail(input);
            expect(result).toEqual({
                id: '1',
                title: 'Interest 1',
                reflection: null,
                lastAccessedAt: new Date('2024-01-01T00:00:00Z'),
                createdAt: new Date('2024-01-01T00:00:00Z'),
                updatedAt: new Date('2024-01-01T00:00:00Z'),
                tags: [],
            });
        });
    })
});
