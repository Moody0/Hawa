export function getPaginationPages(currentPage: number, totalPages: number): number[] {
    const count = Math.min(3, totalPages);
    const start = Math.max(1, Math.min(currentPage - 1, totalPages - count + 1));
    return Array.from({ length: count }, (_, index) => start + index);
}
