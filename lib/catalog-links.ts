export interface DepartmentLink {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
}

const DEPARTMENT_ALIASES: Record<string, string[]> = {
    food: ['food', 'foods', 'groceries', 'grocery', 'غذائيات', 'مواد غذائية', 'مواد غذائيه'],
    detergents: ['detergents', 'detergent', 'cleaning', 'cleaners', 'منظفات', 'مواد تنظيف'],
};

function normalize(value: string) {
    return value.trim().toLocaleLowerCase().replace(/\s+/g, ' ');
}

export function resolveDepartmentLink(token: string, departments: DepartmentLink[]) {
    const normalizedToken = normalize(token);
    const directMatch = departments.find((department) =>
        [department.id, department.slug, department.name, department.description || '']
            .some((value) => normalize(value) === normalizedToken)
    );
    if (directMatch) return directMatch;

    const aliases = Object.entries(DEPARTMENT_ALIASES)
        .find(([, values]) => values.some((value) => normalize(value) === normalizedToken))?.[1];
    if (!aliases) return null;

    return departments.find((department) =>
        [department.name, department.slug, department.description || '']
            .some((value) => aliases.some((alias) => normalize(value) === normalize(alias)))
    ) || null;
}

/** Resolve old fixed food/detergent banner links to the real department URL. */
export function resolveBannerDestination(link: string | null | undefined, departments: DepartmentLink[]) {
    if (!link) return '/products';

    try {
        const url = new URL(link, 'https://hawa.invalid');
        if (url.origin !== 'https://hawa.invalid') return link;

        if (url.pathname === '/products') {
            const token = url.searchParams.get('mainCategory');
            const department = token ? resolveDepartmentLink(token, departments) : null;
            if (department) return `/departments/${encodeURIComponent(department.slug)}`;
        }

        if (url.pathname.startsWith('/department/')) {
            return url.pathname.replace(/^\/department\//, '/departments/') + url.search + url.hash;
        }

        return `${url.pathname}${url.search}${url.hash}`;
    } catch {
        return link;
    }
}
