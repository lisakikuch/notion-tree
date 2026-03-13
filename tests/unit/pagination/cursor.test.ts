import { describe, it, expect } from 'vitest';
import { decodeCursor, encodeCursor } from '@/lib/pagination/cursor.js';

describe('Cursor encoding and decoding', () => {
    it('should encode and decode a cursor payload correctly', () => {
        const payload = {
            lastAccessedAt: new Date('2024-01-01T00:00:00Z'),
            id: '123e4567-e89b-12d3-a456-426614174000',
        };
        const encoded = encodeCursor(payload);
        const decoded = decodeCursor(encoded);
        expect(decoded).toEqual(payload);
    });
});