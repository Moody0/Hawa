/**
 * Centralized Product Options Parser
 *
 * Business Rules:
 * 1. In canonical data, missing or empty options are represented as "0".
 * 2. In runtime/UI flows, null, undefined, empty string "", or "0"
 *    MUST be interpreted as having NO selectable product options.
 * 3. Individual options labeled "0" are strictly filtered out so customers
 *    never see an option named "0".
 */

export function parseProductOptions(options?: string | null): string[] {
    if (!options) return [];
    const trimmed = String(options).trim();
    if (!trimmed || trimmed === "0") return [];

    return trimmed
        .split(",")
        .map((opt) => opt.trim())
        .filter((opt) => Boolean(opt) && opt !== "0");
}

export function hasSelectableOptions(options?: string | null): boolean {
    return parseProductOptions(options).length > 0;
}
