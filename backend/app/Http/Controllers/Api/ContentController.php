<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Models\Post;
use App\Models\Product;
use App\Models\Review;
use App\Support\ApiJson;
use App\Support\MerchantPhone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ContentController extends Controller
{
    public function posts(Request $request, ?string $slug = null)
    {
        $query = Post::where('is_published', true);
        if ($slug) {
            return response()->json(ApiJson::camel($query->where('slug', $slug)->firstOrFail()));
        }
        if ($category = $request->query('category')) {
            $query->where('category', $category);
        }

        return response()->json(ApiJson::camel($query->orderByDesc('created_at')->limit(100)->get()));
    }

    public function contact(Request $request)
    {
        $data = $request->validate(['name' => ['required', 'string', 'min:2', 'max:100'], 'phone' => ['required', 'string', 'max:32'], 'shopName' => ['nullable', 'string', 'max:100'], 'city' => ['nullable', 'string', 'max:100'], 'message' => ['required', 'string', 'min:5', 'max:5000']]);
        $phone = MerchantPhone::normalize($data['phone']);
        abort_unless($phone, 422, 'Enter a valid mobile number.');
        ContactMessage::create(['name' => strip_tags($data['name']), 'phone' => $phone, 'shop_name' => $data['shopName'] ?? null, 'city' => $data['city'] ?? null, 'message' => strip_tags($data['message']), 'is_read' => false, 'ip_address' => $request->ip(), 'user_agent' => mb_substr($request->userAgent() ?? '', 0, 1000)]);

        return response()->json(['success' => true], 201);
    }

    public function reviews(Request $request)
    {
        if ($request->isMethod('get')) {
            return response()->json(ApiJson::camel(Review::where('product_id', $request->validate(['productId' => ['required', 'string', 'max:191']])['productId'])->where('is_approved', true)->orderByDesc('created_at')->get()));
        }
        $customer = Auth::guard('merchant')->user();
        abort_unless($customer && $customer->is_active, 401);
        $data = $request->validate(['productId' => ['required', 'exists:products,id'], 'rating' => ['required', 'integer', 'between:1,5'], 'feedback' => ['nullable', 'string', 'max:2000'], 'image' => ['nullable', 'string', 'max:2000'], 'name' => ['nullable', 'string', 'max:100'], 'email' => ['nullable', 'email', 'max:191']]);
        Product::whereKey($data['productId'])->firstOrFail();
        $review = Review::create(['product_id' => $data['productId'], 'rating' => $data['rating'], 'feedback' => isset($data['feedback']) ? strip_tags($data['feedback']) : null, 'image' => $data['image'] ?? null, 'name' => $customer->owner_name, 'email' => $data['email'] ?? null, 'is_approved' => false]);

        return response()->json(['success' => true, 'review' => ApiJson::camel($review)], 201);
    }
}
