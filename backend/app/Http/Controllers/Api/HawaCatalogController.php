<?php

namespace App\Http\Controllers\Api;

use App\Models\Banner;
use App\Models\Brand;
use App\Models\Category;
use App\Models\MainCategory;
use App\Models\Product;
use App\Models\Review;
use App\Models\Settings;
use App\Support\ApiJson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HawaCatalogController extends CatalogController
{
    public static function available()
    {
        return Product::whereHas('brand', fn ($q) => $q->where('is_active', true))->whereHas('category', fn ($q) => $q->where('is_active', true));
    }

    public static function department($query, string $id)
    {
        return $query->where(fn ($q) => $q->where('main_category_id', $id)->orWhereHas('category', fn ($c) => $c->where('main_category_id', $id))->orWhereHas('brand', fn ($b) => $b->where('main_category_id', $id)));
    }

    public function categories(Request $request)
    {
        $query = Category::where('is_active', true)->whereHas('brand', fn ($q) => $q->where('is_active', true))->with('brand')->withCount('products');
        foreach (['brandId' => 'brand_id', 'mainCategoryId' => 'main_category_id', 'slug' => 'slug'] as $key => $column) {
            if ($request->filled($key)) {
                $query->where($column, $request->query($key));
            }
        }

        return response()->json($query->orderByDesc('is_featured')->orderBy('name')->limit(1000)->get()->map(fn ($c) => [...ApiJson::camel($c), '_count' => ['products' => $c->products_count]]));
    }

    public function mainCategories()
    {
        return response()->json(MainCategory::where('is_active', true)->orderBy('nav_order')->orderBy('name')->get()->map(function ($c) {
            $count = self::department(self::available(), $c->id)->count();

            return [...ApiJson::camel($c), 'productCount' => $count, '_count' => ['products' => $count]];
        }));
    }

    public function brands(Request $request)
    {
        return response()->json(Brand::where('is_active', true)->when($request->filled('mainCategoryId'), fn ($q) => $q->where(fn ($b) => $b->where('main_category_id', $request->query('mainCategoryId'))->orWhereHas('products', fn ($p) => self::department($p, $request->query('mainCategoryId')))))->with('mainCategory')->withCount(['products', 'categories'])->orderBy('name')->get()->map(fn ($b) => [...ApiJson::camel($b), '_count' => ['products' => $b->products_count, 'categories' => $b->categories_count]]));
    }

    public function navigation()
    {
        $rows = MainCategory::where('is_active', true)->where('show_in_nav', true)->orderBy('nav_order')->get()->map(function ($c) {
            $products = self::department(self::available(), $c->id)->with('brand')->orderByDesc('is_trending')->latest()->take(3)->get();
            $categories = Category::where('is_active', true)->where('main_category_id', $c->id)->orderBy('name')->get()->unique(fn ($r) => mb_strtolower(trim($r->name)))->take(8)->values();
            $brands = Brand::where('is_active', true)->where(fn ($q) => $q->where('main_category_id', $c->id)->orWhereHas('products', fn ($p) => $p->where('main_category_id', $c->id)))->take(8)->get();

            return [...ApiJson::camel($c), 'nameEn' => $c->description ?: $c->name, 'categories' => ApiJson::camel($categories), 'brands' => ApiJson::camel($brands), 'topProducts' => ApiJson::camel($products), 'trendingProducts' => ApiJson::camel($products)];
        });

        return response()->json($rows);
    }

    public function storefront(Request $request, string $key)
    {
        $settings = Settings::findOrFail('site-settings');
        // Hawa's catalog has no reliable stock counts; products with stock 0
        // must remain eligible for customer-facing home sections.
        $base = self::available()->with(['brand', 'category']);
        $categories = Category::where('is_active', true)->whereHas('brand', fn ($q) => $q->where('is_active', true))->with('brand')->withCount('products');
        $brands = Brand::where('is_active', true)->withCount(['products', 'categories']);
        $mains = MainCategory::where('is_active', true)->orderByDesc('is_featured')->orderBy('nav_order');
        $value = match ($key) {
            'getSiteSettings' => ApiJson::camel($settings),
            'getActiveBanners' => ApiJson::camel(Banner::where('is_active', true)->latest()->get()),
            'getHomeRailBrands' => $brands->orderByDesc('is_featured')->orderBy('name')->get()->map(fn ($b) => [...ApiJson::camel($b), 'nameAr' => $b->name, 'fullName' => $b->name, 'productCount' => $b->products_count, '_count' => ['products' => $b->products_count, 'categories' => $b->categories_count]]),
            'getMainCategoryBrands','getFeaturedMainBrands' => $brands->where('group', 'MAIN')->orderByDesc('is_featured')->get()->map(fn ($b) => [...ApiJson::camel($b), '_count' => ['products' => $b->products_count, 'categories' => $b->categories_count]]),
            'getHomeRailCategories' => $mains->get()->map(fn ($c) => [...ApiJson::camel($c), 'nameAr' => $c->name, 'nameEn' => $c->description ?: $c->name]),
            'getFeaturedCategories' => $this->featuredCategories($settings),
            'getCategoryHighlightCardsData' => $mains->whereNotNull('image')->where('image', '!=', '')->take(4)->get()->map(function ($c) {
                $p = self::department(self::available(), $c->id)->first();

                return ['id' => $c->id, 'slug' => $c->slug, 'subheadingAr' => $c->name, 'subheadingEn' => $c->description ?: $c->name, 'headingAr' => $c->name, 'headingEn' => $c->description ?: $c->name, 'productNameAr' => $p?->name_ar ?: $p?->name ?: $c->name, 'productNameEn' => $p?->name_en ?: $p?->name ?: $c->name, 'priceText' => '', 'heroImage' => $c->image, 'productThumb' => explode(',', $p?->images ?? '')[0], 'productSlug' => $p?->slug ?? ''];
            }),
            'getOnSaleProducts' => ApiJson::camel($base->whereNotNull('discount_price')->latest()->take(12)->get()),
            'getBestSellerProducts' => $this->selectedProducts($base, $settings->home_featured_best_seller_ids, 'bestselling'),
            'getNewArrivalProducts' => $this->selectedProducts($base, $settings->home_featured_new_arrival_ids, 'newest'),
            // Stock is not maintained in Hawa's catalog import, so zero is not
            // a reliable reason to hide an explicitly trending product here.
            'getTrendingWeeklyProducts' => $settings->home_trending_weekly_enabled === false ? [] : $this->selectedProducts(self::available()->with(['brand', 'category']), $settings->home_trending_weekly_product_ids, 'trending'),
            'getTrendingProducts' => ApiJson::camel($base->where('is_trending', true)->latest()->take(32)->get()),
            'getApprovedReviews' => $this->testimonials($settings),
            'getHomeCollectionSections' => $categories->where('is_featured', true)->orderBy('name')->get()->map(function ($c) {
                $p = self::available()->where('category_id', $c->id)->where('stock', '>', 0)->with('brand')->latest()->take(18)->get();

                return ['category' => [...ApiJson::camel($c), 'productCount' => $p->count()], 'products' => ApiJson::camel($p)];
            })->filter(fn ($s) => count($s['products']) > 0)->values(),
            default => abort(404),
        };

        return response()->json($value);
    }

    private function featuredCategories(Settings $settings): array
    {
        $selection = $settings->home_categories_ids;
        $ids = $selection ? json_decode($selection, true) : [];
        if (! is_array($ids)) {
            $ids = array_filter(explode(',', (string) $selection));
        }
        $sub = Category::where('is_active', true)->whereHas('brand', fn ($q) => $q->where('is_active', true))->with('brand')->withCount('products');
        $mains = MainCategory::where('is_active', true);
        if ($ids) {
            $rows = $sub->whereIn('id', $ids)->get()->concat($mains->whereIn('id', $ids)->get())->keyBy('id');
            $rows = collect($ids)->map(fn ($id) => $rows[$id] ?? null)->filter();
        } else {
            $rows = $mains->where('is_featured', true)->orderBy('nav_order')->get()
                ->concat($sub->where('is_featured', true)->latest('updated_at')->take(16)->get());
        }

        return $rows->map(function ($c) {
            $main = $c instanceof MainCategory;
            $query = self::available();
            $query = $main ? self::department($query, $c->id) : $query->where('category_id', $c->id);
            $p = (clone $query)->where('images', '!=', '')->latest()->first();
            $count = $query->count();

            return [...ApiJson::camel($c), 'nameEn' => $c->description ?: $c->name, 'image' => $c->image ?: explode(',', $p?->images ?? '')[0] ?: '/logo.png', 'href' => $main ? '/department/'.rawurlencode($c->slug) : '/products?category='.rawurlencode($c->slug), 'type' => $main ? 'main-category' : 'category', 'isMainCategory' => $main, '_count' => ['products' => $count], 'productCount' => $count];
        })->values()->all();
    }

    private function selectedProducts($query, ?string $selection, string $sort)
    {
        if ($selection !== null) {
            $ids = json_decode($selection, true);
            if (! is_array($ids)) {
                $ids = array_filter(explode(',', $selection));
            }$ids = array_values(array_filter($ids, 'is_string'));
            if (! $ids) {
                return [];
            }$rows = $query->whereIn('id', $ids)->get()->keyBy('id');

            return array_values(array_filter(array_map(fn ($id) => isset($rows[$id]) ? ApiJson::camel($rows[$id]) : null, $ids)));
        }
        if ($sort === 'bestselling') {
            $sales = DB::table('order_items')->join('orders', 'orders.id', '=', 'order_items.order_id')->whereNull('orders.archived_at')->where('orders.status', '!=', 'CANCELLED')->select('product_id')->selectRaw('SUM(quantity) as sold')->groupBy('product_id');
            $query->leftJoinSub($sales, 'sales', fn ($j) => $j->on('sales.product_id', '=', 'products.id'))->select('products.*')->orderByRaw('COALESCE(sales.sold,0) DESC');
        }
        if ($sort === 'trending') {
            $query->where('is_trending', true)->where('images', '!=', '/placeholder.svg')->where('images', '!=', '');
        }

        return ApiJson::camel($query->orderByDesc('products.created_at')->limit(12)->get());
    }

    private function testimonials(Settings $settings)
    {
        if ($settings->home_testimonials_enabled === false) {
            return [];
        }if ($settings->home_testimonials_items) {
            $items = json_decode($settings->home_testimonials_items, true);
            if (is_array($items)) {
                return $items;
            }
        }

        return Review::where('is_approved', true)->with('product')->latest()->limit(12)->get()->map(fn ($r) => ['id' => $r->id, 'name' => $r->name, 'feedback' => $r->feedback ?? '', 'rating' => $r->rating, 'image' => $r->image ?: explode(',', $r->product?->images ?? '')[0], 'productNameAr' => $r->product?->name_ar ?: $r->product?->name ?? '', 'productNameEn' => $r->product?->name_en ?: $r->product?->name ?? '', 'productSlug' => $r->product?->slug ?? '']);
    }
}
