import { describe, expect, it } from 'vitest';
import { normalizeTagName } from '@/modules/tags/tags.helpers.js';

describe('normalizeTagName', () => {
    it('trims and lowercases the tag name', () => {
        expect(normalizeTagName('  ExampleTag  ')).toBe('exampletag');
    });
    it('keeps internal whitespace intact', () => {
        expect(normalizeTagName('  Example Tag  ')).toBe('example tag');
    });
    it('returns an empty string if the input is only whitespace', () => {
        expect(normalizeTagName('   ')).toBe('');
    });
    it('does not modify an already normalized tag name', () => {
        expect(normalizeTagName('normalizedtag')).toBe('normalizedtag');
    });
});