<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Brand;
use App\Models\Category;
use App\Models\MainCategory;
use App\Support\ApiJson;
use App\Support\CatalogSearch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CatalogController extends Controller
{
    public function products(Request $request)
    {
        $request->merge([
            'categoryIds' => $request->query('categoryIds', $request->query('category', '')),
            'brandIds' => $request->query('brandIds', $request->query('brand', '')),
            'mainCategoryId' => $request->query('mainCategoryId', $request->query('mainCategory', '')),
            'search' => $request->query('search', $request->query('q', '')),
        ]);
        $request->merge(['sort' => match ($request->query('sort')) {
            'price-asc' => 'price_asc','price-desc' => 'price_desc','newest-arrivals' => 'newest','best_sellers','best-selling',null => 'bestselling',default => $request->query('sort')
        }]);
        $data = $request->validate([
            'page' => ['nullable', 'integer', 'min:1', 'max:100000'], 'limit' => ['nullable', 'integer', 'min:1', 'max:1000'],
            'sort' => ['nullable', 'in:price_asc,price_desc,newest,bestselling,price-asc,price-desc,newest-arrivals,best-selling'], 'categoryIds' => ['nullable', 'string', 'max:4000'],
            'brandIds' => ['nullable', 'string', 'max:4000'], 'mainCategoryId' => ['nullable', 'string', 'max:191'],
            'search' => ['nullable', 'string', 'max:200'], 'knownTotal' => ['nullable', 'integer', 'min:0'],
        ]);
        $limit = min((int) ($data['limit'] ?? 36), 1000);
        $page = (int) ($data['page'] ?? 1);
        $query = HawaCatalogController::available()
            ->with(['brand', 'category']);
        $categoryIds = $this->csvIds($data['categoryIds'] ?? '');
        $brandIds = $this->csvIds($data['brandIds'] ?? '');
        $excluded = $this->csvIds((string) $request->query('excludeIds', ''));
        if ($excluded) {
            $query->whereNotIn('products.id', $excluded);
        }
        if ($categoryIds) {
            // The sidebar lists departments without a brand and subcategories
            // within a brand. Both kinds of selection form one OR group.
            $departments = MainCategory::where('is_active', true)
                ->where(fn ($q) => $q->whereIn('id', $categoryIds)->orWhereIn('slug', $categoryIds))->pluck('id')->all();
            $redirectIds = DB::table('category_slug_redirects')->whereIn('slug', $categoryIds)->pluck('category_id')->all();
            $categories = Category::where('is_active', true)
                ->where(fn ($q) => $q->whereIn('id', [...$categoryIds, ...$redirectIds])->orWhereIn('slug', $categoryIds))->pluck('id')->all();
            $query->where(function ($q) use ($categories, $departments) {
                $q->whereIn('products.category_id', $categories);
                foreach ($departments as $id) {
                    $q->orWhere(fn ($department) => HawaCatalogController::department($department, $id));
                }
            });
        }
        if ($brandIds) {
            $ids = Brand::where('is_active', true)->where(fn ($q) => $q->whereIn('id', $brandIds)->orWhereIn('slug', $brandIds))->pluck('id');
            $query->whereIn('products.brand_id', $ids);
        }
        if (! empty($data['mainCategoryId'])) {
            $department = MainCategory::where('is_active', true)->where(fn ($q) => $q->where('id', $data['mainCategoryId'])->orWhere('slug', $data['mainCategoryId']))->first();
            if ($department) {
                HawaCatalogController::department($query, $department->id);
            } else {
                $query->whereRaw('1 = 0');
            }
        }
        if (in_array($request->query('inStock'), ['true', '1'], true)) {
            $query->where(fn ($q) => $q->where('stock', '>', 0)->orWhere('price', 0)->orWhere('hide_price', true));
        }
        if (in_array($request->query('onSale'), ['true', '1'], true)) {
            $query->whereNotNull('discount_price')->whereColumn('discount_price', '<', 'price');
        }
        if (in_array($request->query('isTrending'), ['true', '1'], true)) {
            $query->where('is_trending', true);
        }
        if (($data['search'] ?? '') !== '') {
            $variants = CatalogSearch::variants($data['search']);
            if ($variants) {
                $query->where(function ($q) use ($variants) {
                    foreach ($variants as $value) {
                        $term = '%'.addcslashes($value, '%_\\').'%';
                        foreach (['name', 'name_ar', 'name_en', 'description', 'description_ar', 'description_en', 'sku'] as $field) {
                            $q->orWhere($field, 'like', $term);
                        }$q->orWhereHas('brand', fn ($b) => $b->where('name', 'like', $term)->orWhere('name_en', 'like', $term));
                    }
                });
            }
        }
        if (($data['sort'] ?? '') === 'bestselling') {
            $sales = DB::table('order_items')
                ->join('orders', 'orders.id', '=', 'order_items.order_id')
                ->whereNull('orders.archived_at')->where('orders.status', '!=', 'CANCELLED')
                ->select('order_items.product_id')
                ->selectRaw('SUM(order_items.quantity) AS units_sold')
                ->groupBy('order_items.product_id');
            $query->leftJoinSub($sales, 'product_sales', fn ($join) => $join->on('product_sales.product_id', '=', 'products.id'))
                ->select('products.*')
                ->orderByRaw('COALESCE(product_sales.units_sold, 0) DESC')
                ->orderByDesc('products.created_at');
        } else {
            match ($data['sort'] ?? '') {
                'price_asc' => $query->orderByRaw('COALESCE(discount_price,price) ASC'),
                'price_desc' => $query->orderByRaw('COALESCE(discount_price,price) DESC'),
                'newest' => $query->orderByDesc('created_at'),
                default => $query->orderByDesc('created_at'),
            };
        }
        $query->orderBy('products.id');
        $skipCount = in_array($request->query('skipCount'), ['true', '1'], true) && array_key_exists('knownTotal', $data);
        $total = ($skipCount || ($page > 1 && array_key_exists('knownTotal', $data))) ? (int) ($data['knownTotal'] ?? 0) : (clone $query)->count();
        $products = $query->skip(($page - 1) * $limit)->take($limit)->get();

        return response()->json(['products' => ApiJson::camel($products), 'pagination' => ['total' => $total, 'pages' => (int) ceil($total / $limit), 'page' => $page, 'limit' => $limit]])->header('Cache-Control', 'private, no-store');
    }

    public function trending()
    {
        $products = HawaCatalogController::available()->with('category')->where('is_trending', true)->get();

        return response()->json(ApiJson::camel($products))->header('Cache-Control', 'private, no-store');
    }

    public function product(string $slug)
    {
        $product = Product::with(['brand', 'category', 'mainCategory'])->where('slug', $slug)->whereHas('brand', fn ($q) => $q->where('is_active', true))->whereHas('category', fn ($q) => $q->where('is_active', true))->firstOrFail();

        return response()->json(ApiJson::camel($product))->header('Cache-Control', 'private, no-store');
    }

    private function csvIds(string $value): array
    {
        return collect(explode(',', $value))->map(fn ($id) => trim($id))->filter(fn ($id) => $id !== '' && strlen($id) <= 191)->unique()->take(100)->values()->all();
    }
}
