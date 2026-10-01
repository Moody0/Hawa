<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\WishlistItem;
use App\Support\ApiJson;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request)
    {
        $merchant = $request->user('merchant');
        $items = WishlistItem::where('customer_id', $merchant->id)->with(['product.brand'])->orderByDesc('created_at')->take(200)->get();
        if ($request->boolean('idsOnly')) {
            return response()->json(['success' => true, 'wishlistIds' => $items->pluck('product_id'), 'ids' => $items->pluck('product_id')]);
        }
        $products = $items->filter(fn ($item) => $item->product?->brand?->is_active)->pluck('product')->values();

        return response()->json(['success' => true, 'products' => ApiJson::camel($products), 'wishlistIds' => $items->pluck('product_id')]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'action' => ['sometimes', 'in:add,remove,merge'],
            'productId' => ['required_unless:action,merge', 'string', 'max:191'],
            'productIds' => ['required_if:action,merge', 'array', 'max:200'],
            'productIds.*' => ['string', 'max:191'],
        ]);
        $customerId = $request->user('merchant')->id;
        if (($data['action'] ?? 'add') === 'merge') {
            $ids = HawaCatalogController::available()->whereIn('id', $data['productIds'])->pluck('id');
            WishlistItem::insertOrIgnore($ids->map(fn ($id) => ['id' => 'c'.bin2hex(random_bytes(16)), 'customer_id' => $customerId, 'product_id' => $id, 'created_at' => now()])->all());

            return response()->json(['success' => true, 'action' => 'merged', 'wishlistIds' => WishlistItem::where('customer_id', $customerId)->pluck('product_id')]);
        }
        if (($data['action'] ?? 'add') === 'remove') {
            WishlistItem::where('customer_id', $customerId)->where('product_id', $data['productId'])->delete();

            return response()->json(['success' => true, 'action' => 'removed', 'isWishlisted' => false]);
        }
        $product = Product::whereKey($data['productId'])->whereHas('brand', fn ($q) => $q->where('is_active', true))->first();
        if (! $product) {
            return response()->json(['error' => 'Product not found'], 404);
        }
        WishlistItem::insertOrIgnore(['id' => 'c'.bin2hex(random_bytes(16)), 'customer_id' => $customerId, 'product_id' => $product->id, 'created_at' => now()]);

        return response()->json(['success' => true, 'action' => 'added', 'isWishlisted' => true]);
    }

    public function destroy(Request $request)
    {
        $productId = $request->input('productId');
        if (! is_string($productId) || $productId === '' || strlen($productId) > 191) {
            return response()->json(['error' => 'Invalid product ID'], 400);
        }
        WishlistItem::where('customer_id', $request->user('merchant')->id)->where('product_id', $productId)->delete();

        return response()->json(['success' => true])->header('Cache-Control', 'private, no-store');
    }
}
