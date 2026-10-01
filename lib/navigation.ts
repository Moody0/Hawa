export interface NavBrand {
    id: string;
    name: string;
    nameEn?: string | null;
    slug: string;
    image?: string | null;
}

export interface NavCategory {
    id: string;
    name: string;
    slug: string;
}

export interface NavTopProduct {
    id: string;
    name: string;
    nameAr?: string | null;
    nameEn?: string | null;
    slug: string;
}

export interface NavTrendingProduct {
    id: string;
    name: string;
    nameAr?: string | null;
    nameEn?: string | null;
    slug: string;
    images: string;
    price: number | null;
    discountPrice: number | null;
    brand?: { name: string; nameEn?: string | null } | null;
}

export interface NavMainCategory {
    id: string;
    name: string;
    nameEn?: string;
    slug: string;
    image?: string | null;
    brands: NavBrand[];
    categories: NavCategory[];
    topProducts: NavTopProduct[];
    trendingProducts: NavTrendingProduct[];
}
import { laravelJson } from './laravel-server';
export async function getNavigationData():Promise<NavMainCategory[]>{return laravelJson('/api/navigation',[]);}
