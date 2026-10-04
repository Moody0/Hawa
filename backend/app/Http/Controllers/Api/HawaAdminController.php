<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use App\Models\Banner;
use App\Models\Brand;
use App\Models\Category;
use App\Models\ContactMessage;
use App\Models\Customer;
use App\Models\MainCategory;
use App\Models\Order;
use App\Models\Post;
use App\Models\Product;
use App\Models\PromoCode;
use App\Models\Review;
use App\Models\Settings;
use App\Models\User;
use App\Support\AdminAccess;
use App\Support\ApiJson;
use App\Support\MerchantPhone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class HawaAdminController extends Controller
{
    public function catalogLookups()
    {
        // Authenticated editors need relation options for their catalog forms;
        // mutations and resource management remain separately permission checked.
        return response()->json([
            'brands' => $this->serializeBrands(Brand::with('mainCategory')->withCount('products')->orderBy('name')->get()),
            'mainCategories' => MainCategory::withCount(['products', 'categories', 'brands'])->orderBy('nav_order')->get()->map(fn ($row) => $this->serialize($row, 'main-categories')),
            'categories' => Category::with('mainCategory')->withCount('products')->orderBy('name')->get()->map(fn ($row) => $this->serialize($row, 'categories')),
        ]);
    }

    private const RESOURCES = [
        'brands' => [Brand::class, 'BRANDS'], 'categories' => [Category::class, 'CATEGORIES'], 'main-categories' => [MainCategory::class, 'MAIN_CATEGORIES'],
        'products' => [Product::class, 'PRODUCTS'], 'banners' => [Banner::class, 'BANNERS'], 'promo-codes' => [PromoCode::class, 'SITE_CONTENT'],
        'orders' => [Order::class, 'ORDERS'], 'customers' => [Customer::class, 'CUSTOMERS'], 'reviews' => [Review::class, 'REVIEWS'],
        'blog' => [Post::class, 'BLOG'], 'messages' => [ContactMessage::class, 'CUSTOMERS'], 'audit-logs' => [AdminAuditLog::class, 'AUDIT_LOG'],
    ];

    private const FIELDS = [
        'brands' => ['name', 'nameEn', 'slug', 'description', 'image', 'group', 'isActive', 'isFeatured', 'mainCategoryId'],
        'categories' => ['name', 'slug', 'description', 'image', 'mainCategoryId', 'isFeatured', 'isActive'],
        'main-categories' => ['name', 'slug', 'description', 'image', 'isActive', 'isFeatured', 'showInNav', 'navOrder'],
        'products' => ['name', 'nameAr', 'nameEn', 'slug', 'description', 'descriptionAr', 'descriptionEn', 'price', 'discountPrice', 'discountType', 'discountValue', 'stock', 'minOrder', 'packaging', 'itemsPerPackage', 'options', 'sku', 'images', 'brandId', 'categoryId', 'mainCategoryId', 'isTrending', 'hidePrice'],
        'banners' => ['title', 'subtitle', 'titleAr', 'subtitleAr', 'image', 'buttonText', 'buttonTextAr', 'link', 'badge', 'badgeAr', 'isActive'],
        'promo-codes' => ['code', 'discountPercentage', 'delegateName', 'isActive'],
        'customers' => ['shopName', 'ownerName', 'phone', 'city', 'address', 'password', 'notes', 'isActive'],
        'reviews' => ['isApproved'], 'blog' => ['title', 'titleAr', 'slug', 'excerpt', 'excerptAr', 'content', 'contentAr', 'image', 'category', 'categoryAr', 'isPublished'],
        'messages' => ['isRead', 'notes'],
    ];

    public function index(Request $request, string $resource)
    {
        [$class,$permission] = $this->resource($resource);
        AdminAccess::check($permission.'_VIEW');
        $query = $class::query();
        if ($request->query('archived') === 'true' && Schema::hasColumn((new $class)->getTable(), 'archived_at')) {
            $query->withoutGlobalScope('active_records')->whereNotNull('archived_at');
        }
        if ($resource === 'products') {
            $query->with(['brand', 'category', 'mainCategory']);
        }
        if ($resource === 'categories') {
            $query->with('mainCategory')->withCount('products');
        }
        if ($resource === 'brands') {
            $query->with('mainCategory')->withCount('products');
        }
        if ($resource === 'main-categories') {
            $query->withCount(['products', 'categories', 'brands']);
        }
        if ($resource === 'orders') {
            $query->with(['items.product', 'customer']);
        }
        if ($resource === 'customers') {
            $query->withCount(['orders', 'wishlist'])->withSum(['orders' => fn ($q) => $q->where('status', '!=', 'CANCELLED')], 'total_amount');
        }
        if ($resource === 'reviews') {
            $query->with('product:id,name');
        }
        if ($search = trim((string) $request->query('search', ''))) {
            abort_if(mb_strlen($search) > 200, 422);
            $columns = match ($resource) {
                'customers' => ['shop_name', 'owner_name', 'phone'],'blog' => ['title', 'title_ar'],'messages' => ['name', 'phone', 'message'],'orders' => ['Name', 'phone', 'shop_name'],default => ['name']
            };
            $query->where(function ($q) use ($columns, $search) {
                foreach ($columns as $col) {
                    $q->orWhere($col, 'like', '%'.addcslashes($search, '%_\\').'%');
                }
            });
        }
        foreach (['brandId' => 'brand_id', 'categoryId' => 'category_id', 'mainCategoryId' => 'main_category_id'] as $key => $col) {
            if ($resource === 'categories' && $key === 'brandId' && $request->filled($key)) {
                $query->whereHas('products', fn ($products) => $products->where('brand_id', $request->query($key)));
                continue;
            }
            if ($request->filled($key) && Schema::hasColumn((new $class)->getTable(), $col)) {
                $query->where($col, $request->query($key));
            }
        }
        if ($resource === 'products' && $request->query('isTrending') === 'true') {
            $query->where('is_trending', true);
        }
        if ($resource === 'customers' && in_array($request->query('status'), ['active', 'pending'])) {
            $query->where('is_active', $request->query('status') === 'active');
        }
        if ($resource === 'customers' && in_array($request->query('active'), ['true', 'false'], true)) {
            $query->where('is_active', $request->query('active') === 'true');
        }
        if ($resource === 'reviews' && in_array($request->query('approved'), ['true', 'false'], true)) {
            $query->where('is_approved', $request->query('approved') === 'true');
        }
        if ($resource === 'messages' && in_array($request->query('status'), ['READ', 'UNREAD'])) {
            $query->where('is_read', $request->query('status') === 'READ');
        }
        if ($resource === 'messages' && $request->filled('isRead')) {
            $query->where('is_read', $request->query('isRead') === 'true');
        }
        $page = max(1, (int) $request->query('page', 1));
        $limit = max(1, min(1000, (int) $request->query('limit', 100)));
        $total = (clone $query)->count();
        if ($cursor = $request->query('cursor')) {
            $record = $class::withoutGlobalScopes()->find($cursor);
            if ($record) {
                $query->where(fn ($q) => $q->where('created_at', '<', $record->created_at)->orWhere(fn ($q) => $q->where('created_at', $record->created_at)->where('id', '<', $record->id)));
            }
        }
        $records = $query->orderByDesc('created_at')->orderByDesc('id')->skip(($page - 1) * $limit)->take($limit)->get();
        $rows = $resource === 'brands' ? $this->serializeBrands($records) : $records->map(fn ($row) => $this->serialize($row, $resource))->values();
        $pagination = ['total' => $total, 'pages' => (int) ceil($total / $limit), 'page' => $page, 'limit' => $limit];
        if (in_array($resource, ['blog', 'reviews', 'customers', 'messages', 'audit-logs'])) {
            return response()->json(['success' => true, 'items' => $rows, 'posts' => $resource === 'blog' ? $rows : [], 'customers' => $resource === 'customers' ? $rows : [], 'messages' => $resource === 'messages' ? $rows : [], 'total' => $total, 'unreadCount' => $resource === 'messages' ? ContactMessage::where('is_read', false)->count() : 0, 'todayCount' => $resource === 'messages' ? ContactMessage::whereDate('created_at', today())->count() : 0, 'nextCursor' => $rows->count() === $limit ? ($rows->last()['id'] ?? null) : null, 'previousCursor' => $cursor ?? null, 'pagination' => [...$pagination, 'hasMore' => $page * $limit < $total, 'nextCursor' => $rows->count() === $limit ? ($rows->last()['id'] ?? null) : null]]);
        }
        if ($resource === 'orders') {
            return response()->json(['orders' => $rows, 'pagination' => $pagination]);
        }
        if ($request->boolean('envelope')) {
            return response()->json(['items' => $rows, 'pagination' => $pagination]);
        }

        return response()->json($rows);
    }

    public function save(Request $request, string $resource, ?string $id = null, bool $import = false)
    {
        [$class,$permission] = $this->resource($resource);
        AdminAccess::check($import ? 'PRODUCTS_IMPORT' : $permission.'_MANAGE');
        abort_unless(isset(self::FIELDS[$resource]), 405);
        $id = $id ?: $request->input('id');
        $record = $id ? $class::whereKey($id)->firstOrFail() : new $class;
        $fields = self::FIELDS[$resource];
        if ($resource === 'categories' && is_string($request->input('name'))) {
            $request->merge(['name' => trim(preg_replace('/\s+/u', ' ', $request->input('name')) ?? $request->input('name'))]);
        }
        $rules = [];
        foreach ($fields as $field) {
            $nullable = in_array($field, ['mainCategoryId', 'discountPrice', 'discountType', 'discountValue', 'description', 'descriptionAr', 'descriptionEn', 'image', 'notes', 'nameAr', 'nameEn', 'options', 'sku', 'itemsPerPackage', 'excerpt', 'excerptAr', 'contentAr', 'titleAr', 'subtitle', 'subtitleAr', 'badge', 'badgeAr', 'link', 'buttonText', 'buttonTextAr', 'delegateName', 'nameEn'], true);
            if (in_array($field, ['price', 'discountPrice', 'discountValue'])) {
                $rules[$field] = ['sometimes', $nullable ? 'nullable' : 'required', 'numeric', 'between:0,99999999.99'];
            } elseif (in_array($field, ['stock', 'minOrder', 'navOrder', 'discountPercentage'])) {
                $rules[$field] = ['sometimes', 'integer', 'min:'.($field === 'minOrder' ? 1 : 0), 'max:'.($field === 'discountPercentage' ? 100 : 2147483647)];
            } elseif (preg_match('/^(is|can|show|hide)/', $field)) {
                $rules[$field] = ['sometimes', 'boolean'];
            } elseif (str_ends_with($field, 'Id')) {
                $rules[$field] = ['sometimes', $nullable ? 'nullable' : 'required', 'string', 'max:191', 'exists:'.match ($field) {
                    'brandId' => 'brands','categoryId' => 'categories',default => 'main_categories'
                }.',id'];
            } else {
                $rules[$field] = ['sometimes', $nullable ? 'nullable' : 'required', 'string', 'max:'.(in_array($field, ['content', 'contentAr'], true) ? 100000 : (str_contains(strtolower($field), 'description') || in_array($field, ['images', 'notes'], true) ? 10000 : 2000))];
            }
        }
        if (! $id) {
            foreach (match ($resource) {
                'products' => ['name', 'images', 'price', 'stock', 'categoryId', 'brandId'],'brands','main-categories' => ['name'],'categories' => ['name'],'banners' => ['image'],'promo-codes' => ['code', 'discountPercentage'],'customers' => ['shopName', 'ownerName', 'phone', 'city', 'address', 'password'],'blog' => ['title', 'content'],default => []
            } as $field) {
                $rules[$field][0] = 'required';
            }
        }
        if (isset($rules['name'])) {
            $rules['name'][] = 'max:191';
        }
        if (in_array($resource, ['brands', 'main-categories'], true)) {
            $rules['name'][] = Rule::unique((new $class)->getTable(), 'name')->ignore($id);
        }
        if ($resource === 'categories') {
            $mainCategoryId = $request->input('mainCategoryId', $record->main_category_id);
            $rules['name'][] = Rule::unique('categories', 'name')
                ->where(fn ($query) => $mainCategoryId ? $query->where('main_category_id', $mainCategoryId) : $query->whereNull('main_category_id'))
                ->ignore($id);
        }
        if ($resource === 'promo-codes') {
            $rules['code'][] = Rule::unique('promo_codes', 'code')->ignore($id);
        }
        if ($resource === 'customers') {
            $rules['phone'][] = function ($attribute, $value, $fail) use ($id) {
                $phone = MerchantPhone::normalize($value);
                if ($phone && Customer::withoutGlobalScopes()->where('phone', $phone)->when($id, fn ($q) => $q->where('id', '!=', $id))->exists()) {
                    $fail('This phone number already has an account.');
                }
            };
        }
        if ($resource === 'brands') {
            $rules['group'] = ['sometimes', Rule::in(['MAIN', 'DIFFERENT'])];
        }
        if ($resource === 'customers') {
            $rules['password'] = [$id ? 'sometimes' : 'required', 'string', 'min:6', 'max:128'];
        }
        $data = $request->validate($rules);
        if ($resource === 'blog') {
            foreach (['content', 'contentAr'] as $field) {
                abort_if(isset($data[$field]) && preg_match('/<\/?[a-z][^>]*>/i', $data[$field]), 422, 'Use Markdown instead of HTML.');
            }
        }
        $input = [];
        foreach ($data as $key => $val) {
            $input[Str::snake($key)] = $val;
        }
        if ($resource === 'promo-codes' && isset($input['code'])) {
            $input['code'] = mb_strtoupper(trim($input['code']));
        }
        if (isset($input['password'])) {
            $input['password'] = Hash::make($input['password']);
        }
        if (isset($input['phone'])) {
            $input['phone'] = MerchantPhone::normalize($input['phone']);
            abort_unless($input['phone'], 422, 'Enter a valid phone number.');
        }
        if (in_array('slug', $fields, true) && (! $record->exists || isset($input['slug']))) {
            $input['slug'] = $this->slug((new $class)->getTable(), $input['slug'] ?? $input['name'] ?? $input['title'] ?? '', $id);
        }
        if ($resource === 'products') {
            $category = Category::find($input['category_id'] ?? $record->category_id);
            abort_unless($category, 422);
            $brand = Brand::find($input['brand_id'] ?? $record->brand_id);
            abort_unless($brand, 422);
            $categoryMainCategoryId = $category->main_category_id;
            if (! empty($input['main_category_id'])) {
                abort_unless(! $categoryMainCategoryId || $input['main_category_id'] === $categoryMainCategoryId, 422, 'The category belongs to a different department.');
            }
            $input['main_category_id'] = $categoryMainCategoryId ?? $input['main_category_id'] ?? $brand->main_category_id;
            $price = (float) ($input['price'] ?? $record->price);
            if (isset($input['discount_price'])) {
                abort_if((float) $input['discount_price'] > $price, 422, 'Discount price must not exceed regular price.');
            }
        }
        $record = DB::transaction(function () use ($record, $input, $id) {
            $record->fill($input)->save();
            AdminAccess::audit($id ? 'UPDATE' : 'CREATE', get_class($record), $record->id);

            return $record;
        });
        $json = $this->serialize($record->fresh(), $resource);

        return response()->json(['ok' => true, 'success' => true, 'data' => $json, match ($resource) {
            'blog' => 'post','customers' => 'customer','reviews' => 'review','messages' => 'message',default => 'record'
        } => $json], $id ? 200 : 201);
    }

    public function archive(Request $request, string $resource, ?string $id = null)
    {
        [$class,$permission] = $this->resource($resource);
        AdminAccess::check($permission.'_ARCHIVE');
        $id = $id ?: $request->input('id');
        $record = $class::whereKey($id)->firstOrFail();
        if ($resource === 'users') {
            abort(405);
        }
        if (in_array($resource, ['brands', 'categories', 'main-categories'])) {
            $column = match ($resource) {
                'brands' => 'brand_id','categories' => 'category_id',default => 'main_category_id'
            };
            abort_if(Product::where($column, $id)->exists(), 409, 'Archive or move related products first.');
            if ($resource === 'main-categories') {
                abort_if(Category::where('main_category_id', $id)->exists(), 409, 'Archive or move related categories first.');
            }
        }
        DB::transaction(function () use ($record) {
            $record->update(['archived_at' => now()]);
            AdminAccess::audit('ARCHIVE', get_class($record), $record->id);
        });

        return response()->json(['success' => true, 'ok' => true]);
    }

    public function settings(Request $request)
    {
        AdminAccess::check($request->isMethod('get') ? 'SITE_CONTENT_VIEW' : 'SITE_CONTENT_MANAGE');
        $settings = Settings::findOrFail('site-settings');
        if (! $request->isMethod('get')) {
            $columns = Schema::getColumnListing('settings');
            $data = [];
            foreach ($request->all() as $key => $value) {
                $column = Str::snake($key);
                if (in_array($column, ['id', 'updated_at'], true)) {
                    continue;
                }abort_unless(in_array($column, $columns, true), 422, 'Unknown settings field: '.$key);
                abort_if(is_string($value) && strlen($value) > 100000, 422);
                $cast = $settings->getCasts()[$column] ?? null;
                if ($cast === 'boolean') {
                    abort_unless(is_bool($value) || in_array($value, [0, 1, '0', '1'], true), 422, 'Invalid boolean settings field.');
                } elseif ($cast === 'array') {
                    abort_unless(is_array($value) || $value === null, 422, 'Invalid structured settings field.');
                    if ($column === 'website_content' && is_array($value)) {
                        $toggles = ['homeHeroEnabled', 'homePrideEnabled', 'homeBrandsEnabled', 'homeCategoriesEnabled', 'homeFeaturedEnabled', 'aboutStoryEnabled', 'aboutValuesEnabled', 'aboutContactEnabled', 'navHomeEnabled', 'navAboutEnabled', 'navBrandsEnabled', 'navProductsEnabled', 'navShippingEnabled', 'navBlogEnabled', 'navContactEnabled'];
                        foreach ($value as $field => $setting) {
                            if (!in_array($field, $toggles, true) && $setting === null) $setting = '';
                            abort_unless(in_array($field, $toggles, true) ? is_bool($setting) : is_string($setting) && mb_strlen($setting) <= 5000, 422, 'Invalid website content field: '.$field);
                            $value[$field] = $setting;
                        }
                    }
                } elseif ($column === 'exchange_rate') {
                    abort_unless(is_numeric($value) && (float) $value > 0, 422, 'Invalid exchange rate.');
                } else {
                    abort_unless(is_string($value) || $value === null, 422, 'Settings values must be text.');
                }
                if (is_string($value) && $value !== '' && $value !== '#' && preg_match('/_(url|link)$/', $column)) {
                    abort_unless(preg_match('~^(https?://|/(?!/))~i', $value) && ! preg_match('/[\x00-\x20\\\\]/', $value), 422, 'Use an https URL or a website path.');
                }
                $data[$column] = $value;
            }
            $settings->update($data);
            AdminAccess::audit('UPDATE', 'Settings', $settings->id);
        }

        return response()->json(ApiJson::camel($settings->fresh()));
    }

    public function users(Request $request, ?string $id = null)
    {
        $actor = Auth::guard('web')->user();
        abort_unless($actor && $actor->role === 'SUPER_ADMIN', 403);
        if ($request->isMethod('get')) {
            return response()->json(['success' => true, 'data' => User::with('permissions')->get()->map(fn ($u) => $this->userJson($u))]);
        }
        $id = $id ?: $request->input('id');
        $user = $id ? User::whereKey($id)->firstOrFail() : new User;
        if ($id && ! $request->filled('password')) {
            $request->replace($request->except('password'));
        }
        if (is_string($request->input('username'))) {
            $request->merge(['username' => mb_strtolower(trim($request->input('username')))]);
        }
        if ($request->isMethod('delete')) {
            abort_if($actor->id === $id, 409, 'Cannot archive your own account.');
            $this->protectSuperAdmin($user, 'ADMIN');
            $user->update(['archived_at' => now()]);
            AdminAccess::audit('ARCHIVE', 'User', $id);

            return response()->json(['success' => true]);
        }
        $data = $request->validate(['username' => ['required', 'string', 'max:191', Rule::unique('users')->ignore($id)], 'password' => [$id ? 'sometimes' : 'required', 'string', 'min:6', 'max:128'], 'role' => ['sometimes', Rule::in(['ADMIN', 'SUPER_ADMIN'])], 'permissions' => ['sometimes', 'array'], 'permissions.*' => [Rule::in(AdminAccess::PERMISSIONS)], 'disabledAt' => ['sometimes', 'nullable', 'date']]);
        if (! isset($data['permissions'])) {
            $data['permissions'] = $id ? $user->permissions->pluck('permission')->filter(function ($permission) use ($request) {
                $resource = preg_replace('/_(VIEW|MANAGE|ARCHIVE|IMPORT)$/', '', $permission);
                $legacy = ['BRANDS' => 'Brands', 'PRODUCTS' => 'Products', 'CATEGORIES' => 'Categories', 'MAIN_CATEGORIES' => 'Categories', 'BANNERS' => 'Banners', 'ORDERS' => 'Orders', 'CUSTOMERS' => 'Orders', 'SITE_CONTENT' => 'PromoCodes', 'REVIEWS' => 'Reviews'][$resource] ?? null;

                return ! $legacy || (! $request->has('canManage'.$legacy) && ! $request->has('canDelete'.$legacy));
            })->values()->all() : [];
            foreach (['Brands' => 'BRANDS', 'Products' => 'PRODUCTS', 'Categories' => 'CATEGORIES', 'Banners' => 'BANNERS', 'Orders' => 'ORDERS', 'PromoCodes' => 'SITE_CONTENT', 'Reviews' => 'REVIEWS'] as $legacy => $resource) {
                if ($request->boolean('canManage'.$legacy)) {
                    $data['permissions'][] = $resource.'_VIEW';
                    $data['permissions'][] = $resource.'_MANAGE';
                }if ($request->boolean('canDelete'.$legacy)) {
                    $data['permissions'][] = $resource.'_ARCHIVE';
                }
            }if ($request->boolean('canManageOrders')) {
                array_push($data['permissions'], 'CUSTOMERS_VIEW', 'CUSTOMERS_MANAGE');
            }if ($request->boolean('canDeleteOrders')) {
                $data['permissions'][] = 'CUSTOMERS_ARCHIVE';
            }
            if ($request->boolean('canManageProducts')) {
                $data['permissions'][] = 'PRODUCTS_IMPORT';
            }
            if ($request->boolean('canManageCategories')) {
                array_push($data['permissions'], 'MAIN_CATEGORIES_VIEW', 'MAIN_CATEGORIES_MANAGE');
            }
            if ($request->boolean('canDeleteCategories')) {
                $data['permissions'][] = 'MAIN_CATEGORIES_ARCHIVE';
            }
        }
        if ($id) {
            $this->protectSuperAdmin($user, $data['role'] ?? $user->role);
        }
        if (array_key_exists('disabledAt', $data) && $data['disabledAt']) {
            abort_if($actor->id === $id, 409, 'Cannot disable your own account.');
            $this->protectSuperAdmin($user, 'ADMIN');
        }
        DB::transaction(function () use ($user, $data, $request) {
            $user->fill(['username' => mb_strtolower(trim($data['username'])), 'role' => $data['role'] ?? $user->role ?? 'ADMIN']);
            if (isset($data['password'])) {
                $user->password = Hash::make($data['password']);
            }if (array_key_exists('disabledAt', $data)) {
                $user->disabled_at = $data['disabledAt'];
            }foreach ($request->all() as $key => $val) {
                if (preg_match('/^can(Manage|Delete)/', $key) && Schema::hasColumn('users', Str::snake($key))) {
                    $user->{Str::snake($key)} = (bool) $val;
                }
            }$user->save();
            if (isset($data['permissions'])) {
                $user->permissions()->delete();
                $user->permissions()->createMany(array_map(fn ($p) => ['permission' => $p, 'created_at' => now()], array_unique($data['permissions'])));
            }AdminAccess::audit('UPDATE', 'User', $user->id);
        });

        return response()->json(['success' => true, 'data' => $this->userJson($user->fresh()->load('permissions'))]);
    }

    private function protectSuperAdmin(User $user, string $nextRole): void
    {
        if ($user->role === 'SUPER_ADMIN' && $nextRole !== 'SUPER_ADMIN') {
            abort_if(User::where('role', 'SUPER_ADMIN')->whereNull('disabled_at')->count() <= 1, 409, 'At least one active super administrator is required.');
        }
    }

    private function userJson(User $u): array
    {
        return [...ApiJson::camel($u), ...app(AuthController::class)->adminData($u)];
    }

    public function credentials(Request $request)
    {
        $user = Auth::guard('web')->user();
        abort_unless($user, 401);
        if (! $request->isMethod('get')) {
            $data = $request->validate(['currentPassword' => ['required', 'string'], 'newUsername' => ['nullable', 'string', 'max:191', Rule::unique('users', 'username')->ignore($user->id)], 'newPassword' => ['nullable', 'string', 'min:12', 'max:128']]);
            abort_unless(Hash::check($data['currentPassword'], $user->password), 422, 'Current password is incorrect.');
            if (! empty($data['newUsername'])) {
                $user->username = mb_strtolower(trim($data['newUsername']));
            }if (! empty($data['newPassword'])) {
                $user->password = Hash::make($data['newPassword']);
            }$user->save();
            $request->session()->put('password_hash_web', Auth::guard('web')->hashPasswordForCookie($user->getAuthPassword()));
        }

        return response()->json(['success' => true, 'user' => $this->userJson($user)]);
    }

    public function bulk(Request $request)
    {
        $data = $request->validate(['action' => ['required', Rule::in(['toggleTrending', 'removeSale', 'deleteProducts', 'deleteCategories', 'renameCategories'])], 'ids' => ['nullable', 'array', 'max:500'], 'ids.*' => ['string', 'max:191'], 'value' => ['nullable', 'boolean'], 'mapping' => ['nullable', 'array', 'max:500'], 'mapping.*.id' => ['required', 'string'], 'mapping.*.newName' => ['required', 'string', 'max:191']]);
        $action = $data['action'];
        AdminAccess::check(match ($action) {
            'deleteProducts' => 'PRODUCTS_ARCHIVE','deleteCategories' => 'CATEGORIES_ARCHIVE','renameCategories' => 'CATEGORIES_MANAGE',default => 'PRODUCTS_MANAGE'
        });
        DB::transaction(function () use ($data, $action, $request) {
            if ($action === 'renameCategories') {
                foreach ($data['mapping'] ?? [] as $row) {
                    Category::whereKey($row['id'])->update(['name' => $row['newName']]);
                }
            } elseif ($action === 'deleteCategories') {
                foreach ($data['ids'] ?? [] as $id) {
                    $this->archive($request, 'categories', $id);
                }
            } else {
                Product::whereIn('id', $data['ids'] ?? [])->update(match ($action) {
                    'toggleTrending' => ['is_trending' => $data['value'] ?? false],'removeSale' => ['discount_price' => null, 'discount_type' => null, 'discount_value' => null],default => ['archived_at' => now()]
                });
            }AdminAccess::audit('BULK', 'Catalog', null, ['action' => $action, 'ids' => $data['ids'] ?? []]);
        });

        return response()->json(['success' => true]);
    }

    public function import(Request $request)
    {
        AdminAccess::check('PRODUCTS_IMPORT');
        $rows = $request->validate(['rows' => ['required', 'array', 'max:1000'], 'rows.*' => ['array']])['rows'];
        $count = 0;
        DB::transaction(function () use ($rows, &$count) {
            foreach ($rows as $row) {
                $value = function (array $keys, string $default = '') use ($row): string {
                    foreach ($keys as $key) {
                        if (isset($row[$key]) && trim((string) $row[$key]) !== '') {
                            return trim((string) $row[$key]);
                        }
                    }

                    return $default;
                };
                $mainName = $value(['Main Category', 'mainCategory', 'MainCategory', 'main_category', 'mainCategoryName', 'القسم الرئيسي']);
                $brandName = $value(['Brand Name', 'brandName', 'Brand', 'brand', 'الشركة', 'الماركة', 'العلامة التجارية', 'اسم الماركة'], 'Unbranded');
                $categoryName = $value(['Sub Category', 'subCategory', 'SubCategory', 'Category', 'category', 'categoryName', 'الفئة', 'القسم الفرعي'], 'General');
                $nameAr = $value(['Name ar', 'nameAr', 'Name Ar', 'Name AR', 'الاسم بالعربي', 'اسم المنتج بالعربي']);
                $nameEn = $value(['Name en', 'nameEn', 'Name En', 'Name EN', 'Name', 'name', 'الاسم بالانجليزي', 'اسم المنتج بالانجليزي', 'اسم المنتج بالإنجليزي']);
                abort_unless($nameAr || $nameEn, 422, 'Product name is required.');
                $main = $mainName ? MainCategory::firstOrCreate(['name' => $mainName], ['slug' => $this->slug('main_categories', $mainName)]) : null;
                $brand = Brand::firstOrCreate(['name' => $brandName], ['slug' => $this->slug('brands', $brandName), 'group' => 'DIFFERENT', 'main_category_id' => $main?->id]);
                $resolvedMainCategory = $main?->id ?? $brand->main_category_id;
                $category = Category::firstOrCreate(['main_category_id' => $resolvedMainCategory, 'name' => $categoryName], ['slug' => $this->slug('categories', $categoryName)]);
                $payload = ['name' => $nameEn ?: $nameAr, 'nameAr' => $nameAr ?: null, 'nameEn' => $nameEn ?: null,
                    'descriptionAr' => $value(['description ar', 'descriptionAr', 'Description Ar', 'الوصف بالعربي', 'وصف المنتج بالعربي']) ?: null,
                    'descriptionEn' => $value(['description en', 'descriptionEn', 'Description En', 'Description', 'description', 'الوصف بالانجليزي', 'وصف المنتج بالانجليزي', 'وصف المنتج بالإنجليزي']) ?: null,
                    'brandId' => $brand->id, 'categoryId' => $category->id, 'mainCategoryId' => $resolvedMainCategory ?? $category->main_category_id,
                    'price' => $value(['Price', 'price', 'السعر'], '0'), 'stock' => $value(['Quantity', 'quantity', 'Stock', 'stock', 'الكمية', 'المخزون'], '0'),
                    'images' => $value(['Images', 'images', 'Image', 'image', 'الصور', 'رابط الصورة', 'رابط صورة المنتج'], '/placeholder.svg'),
                    'sku' => $value(['SKU', 'sku', 'رمز المنتج']) ?: null, 'options' => $value(['Options', 'options', 'Variants', 'variants', 'الخيارات', 'الألوان والأحجام']) ?: null,
                    'packaging' => $value(['Packaging', 'packaging'], 'طرد'), 'itemsPerPackage' => $value(['Items Per Package', 'itemsPerPackage']) ?: null,
                    'minOrder' => $value(['Min Order', 'minOrder'], '1'), 'isTrending' => in_array($value(['Is Trending', 'isTrending', 'مميز']), ['Yes', 'true', '1'])];
                $payload['description'] = $payload['descriptionEn'] ?: $payload['descriptionAr'] ?: $payload['name'];
                $this->saveProduct(Request::create('/', 'POST', $payload));
                $count++;
            }
        });

        return response()->json(['success' => true, 'count' => $count, 'created' => $count]);
    }

    private function saveProduct(Request $request): void
    {
        // Import permission authorizes product creation without granting unrelated CRUD permissions.
        $this->save($request, 'products', null, true);
    }

    public function dashboard()
    {
        AdminAccess::check('ORDERS_VIEW');
        $orders = Order::where('status', '!=', 'CANCELLED');
        $revenue = (float) (clone $orders)->sum('total_amount');
        $total = Order::count();
        $pipeline = [];
        foreach (['pending', 'contacted', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'] as $s) {
            $pipeline[$s] = Order::where('status', strtoupper($s))->count();
        }
        $low = Product::with('category')->where('stock', '<=', 10)->orderBy('stock')->take(8)->get();
        $recent = Order::with('items.product')->latest()->take(8)->get()->map(fn ($o) => [...ApiJson::camel($o), 'customer' => $o->Name, 'product' => $o->items->first()?->product?->name ?? '', 'date' => $o->created_at->format('Y-m-d'), 'amount' => (string) $o->total_amount, 'statusColor' => match ($o->status) {
            'DELIVERED','COMPLETED' => 'emerald','PROCESSING' => 'blue','PENDING' => 'amber','CANCELLED' => 'red','SHIPPED' => 'indigo',default => 'gray'
        }]);
        $sales = DB::table('order_items')->join('orders', 'orders.id', '=', 'order_items.order_id')->whereNull('orders.archived_at')->where('orders.status', '!=', 'CANCELLED')->select('product_id')->selectRaw('SUM(quantity) as units_sold, SUM(quantity * price) as revenue')->groupBy('product_id');
        $top = Product::withoutGlobalScope('active_records')->joinSub($sales, 'sales', fn ($j) => $j->on('sales.product_id', '=', 'products.id'))->select('products.*', 'sales.units_sold', 'sales.revenue')->orderByDesc('sales.units_sold')->take(8)->get()->map(fn ($p) => [...ApiJson::camel($p), 'image' => explode(',', $p->images)[0], 'unitsSold' => (int) $p->units_sold, 'revenue' => (float) $p->revenue, 'price' => (float) $p->price]);
        $trend = [];
        for ($i = 6; $i >= 0; $i--) {
            $day = today()->subDays($i);
            $daily = (clone $orders)->whereDate('created_at', $day);
            $trend[] = ['date' => $day->format('Y-m-d'), 'label' => $day->format('D'), 'revenue' => (float) (clone $daily)->sum('total_amount'), 'orders' => $daily->count()];
        }
        $cities = (clone $orders)->select('city')->selectRaw('COUNT(*) as order_count, SUM(total_amount) as total_revenue')->groupBy('city')->orderByDesc('total_revenue')->take(6)->get()->map(fn ($o) => ['city' => $o->city, 'orderCount' => (int) $o->order_count, 'totalRevenue' => (float) $o->total_revenue]);

        return response()->json(['totalRevenue' => $revenue, 'totalOrders' => $total, 'totalProducts' => Product::count(), 'totalCategories' => Category::count(), 'averageOrderValue' => (clone $orders)->count() ? $revenue / (clone $orders)->count() : 0, 'deliveredOrdersCount' => $pipeline['delivered'] + $pipeline['completed'], 'pipeline' => $pipeline, 'inventory' => ['totalProducts' => Product::count(), 'lowStockCount' => Product::whereBetween('stock', [1, 10])->count(), 'outOfStockCount' => Product::where('stock', '<=', 0)->count(), 'inStockCount' => Product::where('stock', '>', 0)->count()], 'lowStockProducts' => $low->map(fn ($p) => [...ApiJson::camel($p), 'price' => (float) $p->price, 'image' => explode(',', $p->images)[0], 'categoryName' => $p->category?->name ?? '']), 'topProducts' => $top, 'salesTrend' => $trend, 'topCities' => $cities, 'recentOrders' => $recent]);
    }

    private function serialize($row, string $resource): array
    {
        $data = ApiJson::camel($row);
        if (in_array($resource, ['brands', 'main-categories', 'categories'], true)) {
            $data['_count'] = ['products' => (int) ($row->products_count ?? 0)];
            if ($resource !== 'categories') {
                $data['_count']['categories'] = (int) ($row->categories_count ?? 0);
            }if ($resource === 'main-categories') {
                $data['_count']['brands'] = (int) ($row->brands_count ?? 0);
            }
        }
        if ($resource === 'promo-codes') {
            $data['thisMonthSales'] = (float) Order::where('promo_code_id', $row->id)->where('status', '!=', 'CANCELLED')->where('created_at', '>=', now()->startOfMonth())->sum('total_amount');
        }
        if ($resource === 'customers') {
            $data['ordersCount'] = $row->orders_count ?? 0;
            $data['wishlistCount'] = $row->wishlist_count ?? 0;
            $data['totalSpent'] = (float) ($row->orders_sum_total_amount ?? 0);
        }

        return $data;
    }

    private function serializeBrands($brands)
    {
        $categoryCounts = DB::table('products')->whereIn('brand_id', $brands->pluck('id'))
            ->whereNull('products.archived_at')->select('brand_id')
            ->selectRaw('COUNT(DISTINCT category_id) as categories_count')->groupBy('brand_id')
            ->pluck('categories_count', 'brand_id');

        return $brands->map(function ($brand) use ($categoryCounts) {
            $data = $this->serialize($brand, 'brands');
            $data['_count']['categories'] = (int) ($categoryCounts[$brand->id] ?? 0);

            return $data;
        })->values();
    }

    private function resource(string $r): array
    {
        abort_unless(isset(self::RESOURCES[$r]), 404);

        return self::RESOURCES[$r];
    }

    private function slug(string $table, string $text, ?string $ignore = null): string
    {
        $base = Str::slug($text) ?: 'item';
        $slug = $base;
        while (DB::table($table)->where('slug', $slug)->when($ignore, fn ($q) => $q->where('id', '!=', $ignore))->exists()) {
            $slug = $base.'-'.Str::lower(Str::random(6));
        }

        return $slug;
    }
}
