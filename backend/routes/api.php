<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContentController;
use App\Http\Controllers\Api\HawaAdminController;
use App\Http\Controllers\Api\HawaCatalogController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\WishlistController;
use App\Support\AdminAccess;
use App\Support\ApiJson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/products', [HawaCatalogController::class, 'products']);
Route::get('/products/trending', [HawaCatalogController::class, 'trending']);
Route::get('/products/{slug}', [HawaCatalogController::class, 'product']);
Route::get('/categories', [HawaCatalogController::class, 'categories']);
Route::get('/main-categories', [HawaCatalogController::class, 'mainCategories']);
Route::get('/brands', [HawaCatalogController::class, 'brands']);
Route::get('/sitemap/products', fn () => response()->json(ApiJson::camel(HawaCatalogController::available()->get(['slug', 'updated_at', 'images']))));
Route::get('/navigation', [HawaCatalogController::class, 'navigation']);
Route::get('/storefront/{key}', [HawaCatalogController::class, 'storefront']);
Route::get('/settings', [HawaCatalogController::class, 'storefront'])->defaults('key', 'getSiteSettings');
Route::get('/blog/{slug?}', [ContentController::class, 'posts']);
Route::post('/contact', [ContentController::class, 'contact'])->middleware('throttle:10,10');
Route::match(['GET', 'POST'], '/reviews', [ContentController::class, 'reviews'])->middleware('throttle:30,1');
Route::post('/orders', [OrderController::class, 'store']);
Route::get('/orders/{id}', [OrderController::class, 'show']);
Route::post('/promotions/validate', [OrderController::class, 'validatePromo']);
Route::prefix('customer')->group(function () {
    Route::post('/auth/register', [AuthController::class, 'merchantRegister']);
    Route::post('/auth/login', [AuthController::class, 'merchantLogin']);
    Route::post('/auth/logout', [AuthController::class, 'merchantLogout']);
    Route::match(['GET', 'PUT', 'PATCH'], '/auth/me', [AuthController::class, 'merchantMe']);
    Route::middleware('merchant')->group(function () {
        Route::get('/orders', [OrderController::class, 'history']);
        Route::post('/orders/claim', [OrderController::class, 'claim']);
        Route::get('/wishlist', [WishlistController::class, 'index']);
        Route::post('/wishlist', [WishlistController::class, 'store']);
        Route::delete('/wishlist', [WishlistController::class, 'destroy']);
    });
});
Route::post('/upload', [UploadController::class, 'store'])->middleware('throttle:30,1');
Route::prefix('admin')->group(function () {
    Route::post('/auth/login', [AuthController::class, 'adminLogin']);
    Route::post('/auth/logout', [AuthController::class, 'adminLogout']);
    Route::get('/auth/me', [AuthController::class, 'adminMe']);
    Route::middleware('admin')->group(function () {
        Route::get('/dashboard', [HawaAdminController::class, 'dashboard']);
        Route::get('/catalog-lookups', [HawaAdminController::class, 'catalogLookups']);
        Route::match(['GET', 'PUT'], '/settings', [HawaAdminController::class, 'settings']);
        Route::match(['GET', 'PATCH'], '/credentials', [HawaAdminController::class, 'credentials']);
        Route::match(['GET', 'POST'], '/users', [HawaAdminController::class, 'users']);
        Route::match(['PATCH', 'DELETE'], '/users/{id}', [HawaAdminController::class, 'users']);
        Route::post('/bulk', [HawaAdminController::class, 'bulk']);
        Route::post('/products/import', [HawaAdminController::class, 'import']);
        Route::patch('/orders/{id}/status', function (Request $request, string $id) {
            AdminAccess::check('ORDERS_MANAGE');

            return app(OrderController::class)->updateStatus($request, $id);
        });
        Route::patch('/orders/{id}/pricing', [OrderController::class, 'updatePricing']);
        Route::delete('/orders/{id}', function (string $id) {
            AdminAccess::check('ORDERS_ARCHIVE');

            return app(OrderController::class)->destroy($id);
        });
        Route::get('/{resource}', [HawaAdminController::class, 'index']);
        Route::post('/{resource}', [HawaAdminController::class, 'save']);
        Route::patch('/{resource}/{id?}', [HawaAdminController::class, 'save']);
        Route::put('/{resource}/{id?}', [HawaAdminController::class, 'save']);
        Route::delete('/{resource}/{id?}', [HawaAdminController::class, 'archive']);
    });
});
