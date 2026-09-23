export function formatOrderNumber(orderNumber: number): string {
    return `INV${String(orderNumber).padStart(4, "0")}`;
}
