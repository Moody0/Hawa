<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Customer;
use App\Models\InventoryMovement;
use App\Models\MainCategory;
use App\Models\Order;
use App\Models\Product;
use App\Models\Settings;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class HawaMigrationTest extends TestCase
{
    use RefreshDatabase;

    protected bool $seed = true;

    private function admin(array $permissions = []): User
    {
        $user = User::create(['username' => 'owner-'.bin2hex(random_bytes(4)), 'password' => Hash::make('secure-admin-password'), 'role' => $permissions ? 'ADMIN' : 'SUPER_ADMIN']);
        foreach ($permissions as $permission) {
            $user->permissions()->create(['permission' => $permission, 'created_at' => now()]);
        }

        return $user;
    }

    private function customer(bool $active = true): Customer
    {
        return Customer::create(['shop_name' => 'Test shop', 'owner_name' => 'Test owner', 'phone' => '963912345678', 'password' => Hash::make('merchant-password'), 'city' => 'حمص', 'address' => 'Test street 123', 'is_active' => $active]);
    }

    private function product(array $attributes = []): Product
    {
        $main = MainCategory::create(['name' => 'Department '.bin2hex(random_bytes(4)), 'slug' => 'department-'.bin2hex(random_bytes(4))]);
        $brand = Brand::create(['name' => 'Brand '.bin2hex(random_bytes(4)), 'slug' => 'brand-'.bin2hex(random_bytes(4)), 'main_category_id' => $main->id]);
        $category = Category::create(['name' => 'Subcategory', 'slug' => 'subcategory-'.bin2hex(random_bytes(4)), 'main_category_id' => $main->id]);

        return Product::create([...['name' => 'Sample product', 'slug' => 'product-'.bin2hex(random_bytes(4)), 'images' => '/logo.png', 'price' => '10.08', 'stock' => 10, 'brand_id' => $brand->id, 'category_id' => $category->id, 'main_category_id' => $main->id], ...$attributes]);
    }

    private function orderPayload(Product $p, int $quantity = 2): array
    {
        return ['items' => [['productId' => $p->id, 'quantity' => $quantity]], 'shopName' => 'Test shop', 'ownerName' => 'Test owner', 'phone' => '0912345678', 'city' => 'حمص', 'streetAddress' => 'Test street 123'];
    }

    public function test_fresh_database_seeds_only_site_settings(): void
    {
        $this->assertSame(1, Settings::count());
        $this->assertSame(0, Product::count());
        $this->assertSame(0, Customer::count());
        $this->assertSame(0, User::count());
        $this->getJson('/api/products')->assertOk()->assertJsonPath('products', [])->assertJsonPath('pagination.total', 0);
        $this->getJson('/api/navigation')->assertOk()->assertExactJson([]);
        $this->getJson('/api/storefront/getNewArrivalProducts')->assertOk()->assertExactJson([]);
    }

    public function test_unpriced_zero_stock_products_are_visible_and_accept_idempotent_quote_requests(): void
    {
        $product = $this->product(['price' => 0, 'stock' => 0]);
        $this->getJson('/api/products?inStock=true')->assertOk()->assertJsonPath('products.0.requiresQuote', true)->assertJsonPath('products.0.price', null);
        $this->actingAs($this->customer(), 'merchant');
        $this->getJson('/api/products?inStock=true')->assertJsonPath('products.0.price', 0);
        $payload = [...$this->orderPayload($product, 3), 'idempotencyKey' => 'unpriced-quote-order-123'];
        $order = $this->postJson('/api/orders', $payload)->assertCreated()->assertJsonPath('isQuoteRequest', true)->assertJsonPath('stockReserved', false)->assertJsonPath('totalAmount', 0)->json();
        $this->postJson('/api/orders', $payload)->assertOk()->assertJsonPath('id', $order['id']);
        $this->assertSame(1, Order::count());
        $this->assertSame(0, $product->fresh()->stock);
        $this->assertSame(0, InventoryMovement::count());
        $this->actingAs($this->admin(), 'web')->patchJson('/api/admin/orders/'.$order['id'].'/status', ['status' => 'CANCELLED'])->assertOk();
        $this->assertSame(0, $product->fresh()->stock);
        $this->assertSame(0, InventoryMovement::count());
    }

    public function test_mixed_quote_cart_does_not_reserve_or_price_any_line(): void
    {
        $quote = $this->product(['price' => 0, 'stock' => 0]);
        $priced = $this->product(['price' => 10, 'stock' => 2]);
        $this->actingAs($this->customer(), 'merchant');
        $payload = [...$this->orderPayload($quote), 'items' => [['productId' => $quote->id, 'quantity' => 2], ['productId' => $priced->id, 'quantity' => 3]], 'idempotencyKey' => 'mixed-quote-cart-order-123'];
        $response = $this->postJson('/api/orders', $payload)->assertCreated()->assertJsonPath('totalAmount', 0)->assertJsonPath('isQuoteRequest', true);
        foreach ($response->json('items') as $line) {
            $this->assertSame(0.0, (float) $line['price']);
        }
        $this->assertSame(2, $priced->fresh()->stock);
        $this->assertSame(0, InventoryMovement::count());
    }

    public function test_hawa_workbook_headers_preserve_brands_english_descriptions_and_images(): void
    {
        $this->actingAs($this->admin(['PRODUCTS_IMPORT']), 'web');
        $row = ['القسم الرئيسي' => 'منظفات', 'القسم الفرعي' => 'منظفات أرضيات', 'اسم الماركة' => 'روكافيرا ', 'اسم المنتج بالعربي' => 'منظف الأرضيات', 'اسم المنتج بالإنجليزي' => 'Floor cleaner', 'وصف المنتج بالإنجليزي' => 'Floor cleaner description', 'السعر' => 0, 'الكمية' => null, 'رابط صورة المنتج' => 'https://i.postimg.cc/example/cleaner.jpg'];
        $this->postJson('/api/admin/products/import', ['rows' => [$row, [...$row, 'اسم الماركة' => 'روكافيرا', 'اسم المنتج بالعربي' => 'منظف آخر']]])->assertOk()->assertJsonPath('count', 2);
        $this->assertSame(1, Brand::count());
        $product = Product::first();
        $this->assertSame('روكافيرا', $product->brand->name);
        $this->assertSame('Floor cleaner', $product->name_en);
        $this->assertSame('Floor cleaner description', $product->description_en);
        $this->assertSame($row['رابط صورة المنتج'], $product->images);
        $this->assertSame('0.00', $product->price);
        $this->assertSame(0, $product->stock);
    }

    public function test_reviewed_workbook_command_validates_imports_and_cannot_duplicate_products(): void
    {
        $this->admin();
        $this->artisan('hawa:import-catalog', ['--dry-run' => true])->assertSuccessful();
        $this->assertSame(0, Product::count());
        $this->assertSame(0, Brand::count());
        $this->artisan('hawa:import-catalog')->assertSuccessful();
        $this->assertSame(142, Product::count());
        $this->assertSame(7, Brand::count());
        $this->assertSame(2, MainCategory::count());
        $this->assertSame(142, Product::where('price', 0)->where('stock', 0)->count());
        $this->assertSame(6, Product::where('images', '/placeholder.svg')->count());
        $this->getJson('/api/products?inStock=true')->assertJsonPath('pagination.total', 142);
        $this->artisan('hawa:import-catalog')->assertSuccessful();
        $this->assertSame(142, Product::count());
    }

    public function test_first_administrator_login_is_immediately_authenticated_and_logout_works(): void
    {
        $admin = $this->admin();
        $this->postJson('/api/admin/auth/login', ['username' => $admin->username, 'password' => 'secure-admin-password'])->assertOk()->assertJsonPath('user.id', $admin->id);
        $this->getJson('/api/admin/auth/me')->assertOk()->assertJsonPath('user.id', $admin->id);
        $this->getJson('/api/admin/products')->assertOk();
        $this->postJson('/api/admin/auth/logout')->assertOk();
        $this->getJson('/api/admin/products')->assertUnauthorized();
    }

    public function test_customer_first_login_and_phone_variants(): void
    {
        $customer = $this->customer();
        $this->postJson('/api/customer/auth/login', ['phone' => '٠٩١٢٣٤٥٦٧٨', 'password' => 'merchant-password'])->assertOk()->assertJsonPath('customer.id', $customer->id);
        $this->getJson('/api/customer/auth/me')->assertOk()->assertJsonPath('authenticated', true);
        $this->postJson('/api/customer/auth/logout')->assertOk();
        $this->getJson('/api/customer/auth/me')->assertJsonPath('authenticated', false);
    }

    public function test_registration_requires_approval_and_does_not_log_customer_in(): void
    {
        $this->postJson('/api/customer/auth/register', ['shopName' => 'Merchant store', 'ownerName' => 'Merchant owner', 'phone' => '0912345678', 'password' => 'merchant-password', 'city' => 'حمص', 'address' => 'Merchant street 123'])->assertCreated()->assertJsonPath('pendingApproval', true);
        $this->postJson('/api/customer/auth/login', ['phone' => '0912345678', 'password' => 'merchant-password'])->assertForbidden();
        $this->getJson('/api/customer/auth/me')->assertJsonPath('authenticated', false);
    }

    public function test_phone_formats_save_as_canonical_plus_963(): void
    {
        $formats = [
            '0987654321',
            '987654321',
            '963987654321',
            '+963987654321',
        ];

        foreach ($formats as $index => $phoneInput) {
            $this->assertSame('+963987654321', \App\Support\MerchantPhone::normalize($phoneInput));
        }

        // Register with local format
        $this->postJson('/api/customer/auth/register', [
            'shopName' => 'Store 987',
            'ownerName' => 'Owner 987',
            'phone' => '0987654321',
            'password' => 'merchant-password',
            'city' => 'حمص',
            'address' => 'Street 987',
        ])->assertCreated();

        $saved = Customer::withoutGlobalScopes()->where('phone', '+963987654321')->first();
        $this->assertNotNull($saved);
        $this->assertSame('+963987654321', $saved->phone);

        // Can login with 987654321 or 963987654321 or +963987654321
        $saved->update(['is_active' => true]);
        $this->postJson('/api/customer/auth/login', ['phone' => '987654321', 'password' => 'merchant-password'])->assertOk();
        $this->postJson('/api/customer/auth/logout')->assertOk();

        $this->postJson('/api/customer/auth/login', ['phone' => '963987654321', 'password' => 'merchant-password'])->assertOk();
        $this->postJson('/api/customer/auth/logout')->assertOk();

        $this->postJson('/api/customer/auth/login', ['phone' => '+963987654321', 'password' => 'merchant-password'])->assertOk();
    }

    public function test_two_guards_and_guard_specific_logout(): void
    {
        $admin = $this->admin();
        $merchant = $this->customer();
        $this->postJson('/api/admin/auth/login', ['username' => $admin->username, 'password' => 'secure-admin-password'])->assertOk();
        $this->postJson('/api/customer/auth/login', ['phone' => '0912345678', 'password' => 'merchant-password'])->assertOk();
        $this->getJson('/api/admin/auth/me')->assertJsonPath('user.id', $admin->id);
        $this->postJson('/api/admin/auth/logout')->assertOk();
        $this->getJson('/api/customer/auth/me')->assertJsonPath('customer.id', $merchant->id);
    }

    public function test_disabled_administrator_cannot_authenticate(): void
    {
        $admin = $this->admin();
        $admin->update(['disabled_at' => now()]);
        $this->postJson('/api/admin/auth/login', ['username' => $admin->username, 'password' => 'secure-admin-password'])->assertUnauthorized();
        $this->actingAs($admin, 'web')->getJson('/api/admin/products')->assertUnauthorized();
    }

    public function test_admin_permissions_are_enforced_for_mutations_and_uploads(): void
    {
        $p = $this->product();
        $admin = $this->admin(['PRODUCTS_VIEW']);
        $this->actingAs($admin, 'web');
        $this->getJson('/api/admin/products')->assertOk();
        $this->patchJson('/api/admin/products/'.$p->id, ['price' => 12])->assertForbidden();
        $this->postJson('/api/upload', ['file' => UploadedFile::fake()->image('logo.jpg'), 'folder' => 'brands'])->assertForbidden();
        $this->getJson('/api/admin/users')->assertForbidden();
        $this->getJson('/api/orders/missing')->assertForbidden();
    }

    public function test_catalog_crud_and_relation_validation(): void
    {
        $this->actingAs($this->admin(), 'web');
        $main = $this->postJson('/api/admin/main-categories', ['name' => 'Food', 'image' => '/logo.png'])->assertCreated()->json('data');
        $brand = $this->postJson('/api/admin/brands', ['name' => 'Hawa partner', 'group' => 'MAIN', 'mainCategoryId' => $main['id']])->assertCreated()->json('data');
        $category = $this->postJson('/api/admin/categories', ['name' => 'Rice', 'mainCategoryId' => $main['id']])->assertCreated()->json('data');
        $otherBrand = $this->postJson('/api/admin/brands', ['name' => 'Second Rice Partner', 'group' => 'MAIN', 'mainCategoryId' => $main['id']])->assertCreated()->json('data');
        $this->postJson('/api/admin/categories', ['name' => ' Rice ', 'mainCategoryId' => $main['id']])->assertUnprocessable();
        $p = $this->postJson('/api/admin/products', ['name' => 'Rice 1kg', 'brandId' => $brand['id'], 'categoryId' => $category['id'], 'price' => '2.35', 'stock' => 24, 'images' => '/logo.png'])->assertCreated()->json('data');
        $secondProduct = $this->postJson('/api/admin/products', ['name' => 'Rice 2kg', 'brandId' => $otherBrand['id'], 'categoryId' => $category['id'], 'price' => '4.50', 'stock' => 12, 'images' => '/logo.png'])->assertCreated()->json('data');
        $this->getJson('/api/admin/categories?brandId='.$otherBrand['id'])->assertOk()->assertJsonCount(1)->assertJsonPath('0.id', $category['id']);
        $this->patchJson('/api/admin/products/'.$p['id'], ['discountPrice' => 3])->assertUnprocessable();
        $this->patchJson('/api/admin/products/'.$p['id'], ['price' => 3, 'stock' => 30])->assertOk();
        $this->deleteJson('/api/admin/categories/'.$category['id'])->assertConflict();
        $this->deleteJson('/api/admin/products/'.$p['id'])->assertOk();
        $this->deleteJson('/api/admin/products/'.$secondProduct['id'])->assertOk();
        $this->getJson('/api/products/'.$p['slug'])->assertNotFound();
        $this->deleteJson('/api/admin/categories/'.$category['id'])->assertOk();
    }

    public function test_prices_are_hidden_for_guests_and_for_hidden_products(): void
    {
        $p = $this->product();
        $this->getJson('/api/products/'.$p->slug)->assertOk()->assertJsonPath('price', null)->assertHeader('Cache-Control', 'no-store, private');
        $this->actingAs($this->customer(), 'merchant')->getJson('/api/products/'.$p->slug)->assertJsonPath('price', 10.08);
        $p->update(['hide_price' => true]);
        $this->getJson('/api/products/'.$p->slug)->assertJsonPath('price', null);
    }

    public function test_department_and_subcategory_filters_are_isolated_and_sorted(): void
    {
        $a = $this->product(['price' => 10]);
        $b = $this->product(['price' => 20]);
        $this->getJson('/api/products?categoryIds='.$a->category_id)->assertJsonCount(1, 'products')->assertJsonPath('products.0.id', $a->id);
        $this->getJson('/api/products?mainCategoryId='.$a->main_category_id)->assertJsonCount(1, 'products');
        $this->getJson('/api/products?sort=price-desc')->assertJsonPath('products.0.id', $b->id);
        $this->getJson('/api/brands?mainCategoryId='.$a->main_category_id)->assertJsonCount(1);
    }

    public function test_order_calculates_cents_and_reserves_stock_once_for_retries(): void
    {
        $p = $this->product(['discount_price' => '9.50']);
        $payload = $this->orderPayload($p);
        $this->actingAs($this->customer(), 'merchant');
        $first = $this->withHeader('X-Idempotency-Key', 'first-order-request-12345')->postJson('/api/orders', $payload)->assertCreated()->assertJsonPath('totalAmount', 19)->json();
        $this->withHeader('X-Idempotency-Key', 'first-order-request-12345')->postJson('/api/orders', $payload)->assertOk()->assertJsonPath('id', $first['id']);
        $this->assertSame(8, $p->fresh()->stock);
        $this->assertSame(1, Order::count());
        $this->assertSame(1, InventoryMovement::count());
        $this->withHeader('X-Idempotency-Key', 'first-order-request-12345')->postJson('/api/orders', $this->orderPayload($p, 3))->assertConflict();
    }

    public function test_stock_insufficiency_and_invalid_options_roll_back_everything(): void
    {
        $p = $this->product(['stock' => 1, 'options' => 'Red,Blue']);
        $payload = $this->orderPayload($p, 2);
        $this->withHeader('X-Idempotency-Key', 'insufficient-request-123')->postJson('/api/orders', $payload)->assertConflict();
        $payload['items'][0]['quantity'] = 1;
        $payload['items'][0]['options'] = 'Green';
        $this->withHeader('X-Idempotency-Key', 'invalid-option-request-123')->postJson('/api/orders', $payload)->assertConflict();
        $this->assertSame(1, $p->fresh()->stock);
        $this->assertSame(0, Order::count());
    }

    public function test_cancellation_releases_stock_once_and_terminal_status_is_enforced(): void
    {
        $p = $this->product();
        $order = $this->withHeader('X-Idempotency-Key', 'cancel-order-request-123')->postJson('/api/orders', $this->orderPayload($p))->assertCreated()->json();
        $this->actingAs($this->admin(), 'web');
        $this->patchJson('/api/admin/orders/'.$order['id'].'/status', ['status' => 'CANCELLED', 'cancellationReason' => 'Customer request'])->assertOk();
        $this->patchJson('/api/admin/orders/'.$order['id'].'/status', ['status' => 'CANCELLED'])->assertOk();
        $this->assertSame(10, $p->fresh()->stock);
        $this->assertSame(1, InventoryMovement::where('type', 'RELEASE')->count());
        $this->patchJson('/api/admin/orders/'.$order['id'].'/status', ['status' => 'PROCESSING'])->assertConflict();
        $this->deleteJson('/api/admin/orders/'.$order['id'])->assertOk();
        $this->assertSame(10, $p->fresh()->stock);
    }

    public function test_guest_order_access_requires_the_correct_token_and_claim_is_protected(): void
    {
        $p = $this->product();
        $order = $this->withHeader('X-Idempotency-Key', 'guest-order-request-123')->postJson('/api/orders', $this->orderPayload($p))->assertCreated()->json();
        $this->getJson('/api/orders/'.$order['id'].'?token=invalid')->assertUnauthorized();
        $this->getJson('/api/orders/'.$order['id'].'?token='.$order['orderToken'])->assertOk();
        $customer = $this->customer();
        $this->actingAs($customer, 'merchant');
        $this->postJson('/api/customer/orders/claim', ['orderId' => $order['id'], 'orderToken' => 'tampered'])->assertForbidden();
        $this->postJson('/api/customer/orders/claim', ['orderId' => $order['id'], 'orderToken' => $order['orderToken']])->assertOk();
        $this->assertSame($customer->id, Order::find($order['id'])->customer_id);
        $this->getJson('/api/customer/orders')->assertJsonCount(1, 'orders');
    }

    public function test_review_moderation_and_published_blog_visibility(): void
    {
        $p = $this->product();
        $this->actingAs($this->customer(), 'merchant');
        $review = $this->postJson('/api/reviews', ['productId' => $p->id, 'rating' => 5, 'feedback' => 'Helpful service'])->assertCreated()->json('review');
        $this->getJson('/api/reviews?productId='.$p->id)->assertExactJson([]);
        $this->actingAs($this->admin(), 'web');
        $this->patchJson('/api/admin/reviews/'.$review['id'], ['isApproved' => true])->assertOk();
        $this->getJson('/api/reviews?productId='.$p->id)->assertJsonCount(1);
        $post = $this->postJson('/api/admin/blog', ['title' => 'Company news', 'content' => 'Real content', 'isPublished' => false])->assertCreated()->json('post');
        $this->getJson('/api/blog/'.$post['slug'])->assertNotFound();
        $this->patchJson('/api/admin/blog', ['id' => $post['id'], 'isPublished' => true])->assertOk();
        $this->getJson('/api/blog/'.$post['slug'])->assertOk();
    }

    public function test_contact_inbox_settings_and_image_conversion(): void
    {
        Storage::fake('public');
        $this->postJson('/api/contact', ['name' => 'Test person', 'phone' => '0912345678', 'message' => 'A real message'])->assertCreated();
        $this->actingAs($this->admin(), 'web');
        $this->getJson('/api/admin/messages')->assertOk()->assertJsonPath('unreadCount', 1);
        $this->putJson('/api/admin/settings', ['footerPhone' => '+963912345678', 'homeTrendingWeeklyEnabled' => false])->assertOk();
        $this->getJson('/api/settings')->assertJsonPath('footerPhone', '+963912345678')->assertJsonPath('homeTrendingWeeklyEnabled', false);
        $this->postJson('/api/upload', ['file' => UploadedFile::fake()->image('logo.jpg', 120, 80), 'folder' => 'brands'])->assertCreated()->assertJsonPath('width', 120);
        $files = Storage::disk('public')->allFiles('brands');
        $this->assertCount(1, $files);
        $this->assertSame('image/webp', getimagesize(Storage::disk('public')->path($files[0]))['mime']);
        $this->postJson('/api/upload', ['file' => UploadedFile::fake()->create('bad.svg', 1, 'image/svg+xml'), 'folder' => 'brands'])->assertUnprocessable();
    }

    public function test_wishlist_add_merge_and_remove_are_idempotent(): void
    {
        $a = $this->product();
        $b = $this->product();
        $this->actingAs($this->customer(), 'merchant');
        foreach (range(1, 2) as $_) {
            $this->postJson('/api/customer/wishlist', ['productId' => $a->id])->assertOk()->assertJsonPath('isWishlisted', true);
        }
        $this->postJson('/api/customer/wishlist', ['action' => 'merge', 'productIds' => [$a->id, $b->id, 'missing']])->assertOk()->assertJsonCount(2, 'wishlistIds');
        $this->getJson('/api/customer/wishlist')->assertJsonCount(2, 'products')->assertJsonCount(2, 'wishlistIds');
        foreach (range(1, 2) as $_) {
            $this->postJson('/api/customer/wishlist', ['action' => 'remove', 'productId' => $a->id])->assertOk();
        }
        $this->deleteJson('/api/customer/wishlist', ['productId' => $b->id])->assertOk();
        $this->getJson('/api/customer/wishlist')->assertJsonCount(0, 'wishlistIds');
    }

    public function test_import_permission_preserves_spreadsheet_aliases_and_rolls_back_bad_rows(): void
    {
        $this->actingAs($this->admin(['PRODUCTS_IMPORT']), 'web');
        $row = ['Main Category' => 'Food', 'Brand Name' => 'Partner', 'Sub Category' => 'Rice', 'Name ar' => 'أرز', 'Price' => '4.30', 'Quantity' => '12', 'SKU' => '123'];
        $this->postJson('/api/admin/products/import', ['rows' => [$row]])->assertOk()->assertJsonPath('count', 1);
        $this->assertSame('4.30', Product::first()->price);
        $this->assertSame(12, Product::first()->stock);
        $this->postJson('/api/admin/products', ['name' => 'Unauthorized'])->assertForbidden();
        $this->postJson('/api/admin/products/import', ['rows' => [[...$row, 'Name ar' => 'Second', 'Brand Name' => 'Other'], [...$row, 'Price' => 'not a number']]])->assertUnprocessable();
        $this->assertSame(1, Product::count());
        $this->assertSame(1, Brand::count());
    }

    public function test_promotion_totals_dashboard_and_user_permission_updates(): void
    {
        $p = $this->product(['price' => '10.08']);
        $this->actingAs($this->admin(), 'web');
        $promo = $this->postJson('/api/admin/promo-codes', ['code' => 'SAVE10', 'discountPercentage' => 10, 'delegateName' => 'Private delegate'])->assertCreated()->json('data');
        $this->postJson('/api/promotions/validate', ['code' => 'save10'])->assertOk()->assertJsonMissing(['delegateName' => 'Private delegate']);
        $this->postJson('/api/orders', [...$this->orderPayload($p), 'promoCodeId' => $promo['id'], 'idempotencyKey' => 'discount-test-order-123'])->assertCreated()->assertJsonPath('totalAmount', 18.14);
        $this->getJson('/api/admin/dashboard')->assertOk()->assertJsonPath('totalOrders', 1)->assertJsonCount(7, 'salesTrend');
        $user = $this->postJson('/api/admin/users', ['username' => 'editor', 'password' => 'secure-editor-password', 'permissions' => ['BRANDS_VIEW', 'BLOG_VIEW']])->assertOk()->json('data');
        $this->patchJson('/api/admin/users/'.$user['id'], ['username' => 'EDITOR', 'password' => '', 'canManageProducts' => false])->assertOk()->assertJsonPath('data.username', 'editor');
        $this->postJson('/api/admin/auth/logout')->assertOk();
        $this->postJson('/api/admin/auth/login', ['username' => 'editor', 'password' => 'secure-editor-password'])->assertOk();
        $this->getJson('/api/admin/brands')->assertOk();
        $this->getJson('/api/admin/blog')->assertOk();
        $this->postJson('/api/admin/brands', ['name' => 'Blocked'])->assertForbidden();
    }

    public function test_featured_categories_follow_admin_selection_and_media_never_sets_session_cookies(): void
    {
        $p = $this->product();
        $this->getJson('/api/storefront/getFeaturedCategories')->assertExactJson([]);
        $p->mainCategory->update(['is_featured' => true]);
        $this->getJson('/api/storefront/getFeaturedCategories')->assertJsonPath('0.id', $p->main_category_id)->assertJsonPath('0.type', 'main-category');
        Storage::fake('public');
        Storage::disk('public')->put('brands/test.webp', 'test');
        $response = $this->get('/uploads/brands/test.webp')->assertOk();
        $this->assertFalse($response->headers->has('Set-Cookie'));
    }

    public function test_secure_setup_command_creates_only_one_hashed_administrator(): void
    {
        $this->artisan('hawa:admin-create', ['username' => 'SetupOwner'])
            ->expectsQuestion('Admin password', 'secure-setup-password')
            ->assertSuccessful();
        $this->assertSame(1, User::count());
        $user = User::first();
        $this->assertSame('setupowner', $user->username);
        $this->assertSame('SUPER_ADMIN', $user->role);
        $this->assertTrue(Hash::check('secure-setup-password', $user->password));
        $this->assertSame(0, Product::count());
        $this->assertSame(0, Customer::count());
    }
}
