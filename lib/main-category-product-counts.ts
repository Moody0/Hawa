import { getCatalogMainCategories } from './catalog';
export async function getMainCategoryProductCounts(ids: string[], onlyAvailableProducts = false): Promise<Map<string, number>> { const rows = await getCatalogMainCategories(); return new Map(ids.map(id => [id, rows.find(r => r.id === id)?.productCount || 0])); }
