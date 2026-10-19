import { describe, expect, it } from 'vitest';
import { getPaginationPages } from '../lib/pagination';

describe('product pagination', () => {
    it('shows the last three distinct pages at the end of the catalog', () => {
        expect(getPaginationPages(8, 8)).toEqual([6, 7, 8]);
        expect(getPaginationPages(7, 8)).toEqual([6, 7, 8]);
    });

    it('keeps every window consecutive, unique, and within the catalog bounds', () => {
        for (let total = 1; total <= 30; total++) {
            for (let current = 1; current <= total; current++) {
                const pages = getPaginationPages(current, total);
                expect(new Set(pages).size).toBe(pages.length);
                expect(pages).toContain(current);
                expect(pages[0]).toBeGreaterThanOrEqual(1);
                expect(pages.at(-1)).toBeLessThanOrEqual(total);
                pages.slice(1).forEach((page, index) => expect(page).toBe(pages[index] + 1));
            }
        }
    });

    it('handles empty results, small catalogs, and a removed last page', () => {
        expect(getPaginationPages(1, 0)).toEqual([]);
        expect(getPaginationPages(1, 1)).toEqual([1]);
        expect(getPaginationPages(2, 2)).toEqual([1, 2]);
        expect(getPaginationPages(8, 7)).toEqual([5, 6, 7]);
    });
});
