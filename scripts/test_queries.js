const { getTrendingWeeklyProducts, getBestSellerProducts, getNewArrivalProducts, getHomeRailBrands, getFeaturedCategories } = require('../lib/public-queries');

async function main() {
    const [trending, best, newArrivals, brands, categories] = await Promise.all([
        getTrendingWeeklyProducts(),
        getBestSellerProducts(),
        getNewArrivalProducts(),
        getHomeRailBrands(),
        getFeaturedCategories()
    ]);
    console.log({
        trendingCount: trending.length,
        bestCount: best.length,
        newArrivalsCount: newArrivals.length,
        brandsCount: brands.length,
        categoriesCount: categories.length
    });
    console.log('Brands:', brands);
}

main().catch(console.error);
