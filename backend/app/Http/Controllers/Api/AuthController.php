<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdminLoginAttempt;
use App\Models\Customer;
use App\Models\User;
use App\Support\AdminAccess;
use App\Support\ApiJson;
use App\Support\MerchantPhone;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;

class AuthController extends Controller
{
    public function merchantRegister(Request $request)
    {
        $request->merge(collect($request->only(['shopName', 'ownerName', 'city', 'address', 'notes']))->map(fn ($value) => is_string($value) ? $this->clean($value, 500) : $value)->all());
        $data = $request->validate([
            'shopName' => ['required', 'string', 'min:2', 'max:100'],
            'ownerName' => ['required', 'string', 'min:2', 'max:100'],
            'phone' => ['required', 'string', 'max:32'],
            'city' => ['required', 'string', 'min:2', 'max:100'],
            'address' => ['required', 'string', 'min:5', 'max:250'],
            'notes' => ['nullable', 'string', 'max:500'],
            'password' => ['required', 'string', 'min:6', 'max:128'],
        ]);
        $phone = MerchantPhone::normalize($data['phone']);
        if (! $phone) {
            return response()->json(['error' => 'Enter a valid mobile number.'], 400);
        }
        if (! preg_match('/[\pL\pN]/u', $data['shopName']) || ! preg_match('/[\pL]/u', $data['ownerName']) || ! preg_match('/[\pL]/u', $data['city']) || ! preg_match('/[\pL\pN]/u', $data['address'])) {
            return response()->json(['error' => 'One or more fields are invalid.'], 400);
        }
        $limiterKey = 'merchant-register:'.$request->ip();
        if (RateLimiter::tooManyAttempts($limiterKey, 5)) {
            return response()->json(['error' => 'Too many registration attempts.'], 429)->header('Retry-After', RateLimiter::availableIn($limiterKey));
        }
        RateLimiter::hit($limiterKey, 3600);
        if (Customer::withoutGlobalScopes()->whereIn('phone', MerchantPhone::variants($phone))->exists()) {
            return response()->json(['error' => 'This phone number already has a merchant account.'], 409);
        }

        try {
            Customer::create([
            'shop_name' => $this->clean($data['shopName'], 100), 'owner_name' => $this->clean($data['ownerName'], 100),
            'phone' => $phone, 'city' => $this->clean($data['city'], 100), 'address' => $this->clean($data['address'], 250),
            'notes' => $this->clean($data['notes'] ?? '', 500) ?: null, 'password' => Hash::make($data['password']), 'is_active' => false,
            ]);
        } catch (QueryException $exception) {
            if (($exception->errorInfo[1] ?? null) !== 1062) throw $exception;
            return response()->json(['error' => 'This phone number already has a merchant account.'], 409);
        }

        return response()->json(['success' => true, 'pendingApproval' => true], 201)->header('Cache-Control', 'no-store');
    }

    public function merchantLogin(Request $request)
    {
        $data = $request->validate(['phone' => ['required', 'string', 'max:32'], 'password' => ['required', 'string', 'max:128']]);
        $phone = MerchantPhone::normalize($data['phone']);
        if (! $phone || strlen($data['password']) < 6) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }
        $ipKey = 'merchant-login-ip:'.$request->ip();
        $key = 'merchant-login:'.$request->ip().':'.$phone;
        if (RateLimiter::tooManyAttempts($ipKey, 50) || RateLimiter::tooManyAttempts($key, 10)) {
            $wait = max(RateLimiter::availableIn($ipKey), RateLimiter::availableIn($key));

            return response()->json(['error' => 'Too many login attempts'], 429)->header('Retry-After', $wait);
        }
        RateLimiter::hit($ipKey, 600);
        RateLimiter::hit($key, 600);
        $customer = Customer::whereIn('phone', MerchantPhone::variants($phone))->first();
        if (! $customer || ! Hash::check($data['password'], $customer->password)) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }
        if (! $customer->is_active) {
            return response()->json(['error' => 'ACCOUNT_PENDING', 'message' => 'Your merchant account is awaiting approval.', 'shopName' => $customer->shop_name, 'phone' => $customer->phone], 403);
        }
        if ($customer->phone !== $phone) {
            try {
                $customer->update(['phone' => $phone]);
            } catch (QueryException) {
                // Keep older accounts usable if the canonical number is already assigned.
            }
        }

        Auth::guard('merchant')->login($customer);
        $request->session()->regenerate();
        $request->session()->put('merchant_expires_at', now()->addDays(7)->timestamp);
        RateLimiter::clear($key);

        return response()->json(['success' => true, 'customer' => $this->merchantData($customer)], 200)->header('Cache-Control', 'no-store');
    }

    public function merchantLogout(Request $request)
    {
        Auth::guard('merchant')->logout();
        $request->session()->forget(['merchant_expires_at', 'password_hash_merchant']);
        $request->session()->regenerate();
        $request->session()->regenerateToken();

        return response()->json(['success' => true])->header('Cache-Control', 'no-store');
    }

    public function merchantMe(Request $request)
    {
        $customer = Auth::guard('merchant')->user();
        if (! $customer || ! $customer->is_active || $customer->archived_at) {
            return response()->json(['authenticated' => false, 'customer' => null])->header('Cache-Control', 'private, no-store');
        }
        if ($request->isMethod('get')) {
            return response()->json(['success' => true, 'authenticated' => true, 'customer' => $this->merchantData($customer, true)])->header('Cache-Control', 'private, no-store');
        }
        $data = $request->validate([
            'shopName' => ['required', 'string', 'min:2', 'max:100'], 'ownerName' => ['required', 'string', 'min:2', 'max:100'],
            'city' => ['required', 'string', 'min:2', 'max:100'], 'address' => ['required', 'string', 'min:4', 'max:250'], 'notes' => ['nullable', 'string', 'max:500'],
        ]);
        $customer->update(['shop_name' => $this->clean($data['shopName'], 100), 'owner_name' => $this->clean($data['ownerName'], 100), 'city' => $this->clean($data['city'], 100), 'address' => $this->clean($data['address'], 250), 'notes' => $this->clean($data['notes'] ?? '', 500) ?: null]);

        return response()->json(['success' => true, 'customer' => $this->merchantData($customer->fresh(), true)])->header('Cache-Control', 'private, no-store');
    }

    public function adminLogin(Request $request)
    {
        $data = $request->validate(['username' => ['required', 'string', 'max:191'], 'password' => ['required', 'string', 'max:128'], 'rememberMe' => ['nullable']]);
        $key = 'admin-login:'.$request->ip().':'.mb_strtolower(trim($data['username']));
        $ipKey = 'admin-login-ip:'.$request->ip();
        if (RateLimiter::tooManyAttempts($key, 10) || RateLimiter::tooManyAttempts($ipKey, 50)) {
            return response()->json(['error' => 'Too many login attempts'], 429)->header('Retry-After', RateLimiter::availableIn($key));
        }
        RateLimiter::hit($key, 600);
        RateLimiter::hit($ipKey, 600);
        $user = User::where('username', mb_strtolower(trim($data['username'])))->whereNull('disabled_at')->first();
        $valid = $user && Hash::check($data['password'], $user->password);
        AdminLoginAttempt::create(['key_hash' => hash('sha256', $key), 'scope' => 'admin', 'successful' => (bool) $valid, 'created_at' => now()]);
        if (! $valid) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }
        Auth::guard('web')->login($user);
        $request->session()->regenerate();
        $remember = filter_var($data['rememberMe'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $request->session()->put('admin_expires_at', now()->addSeconds($remember ? 30 * 86400 : 86400)->timestamp);
        RateLimiter::clear($key);

        return response()->json(['user' => $this->adminData($user)])->header('Cache-Control', 'private, no-store');
    }

    public function adminLogout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->forget(['admin_expires_at', 'password_hash_web']);
        $request->session()->regenerate();
        $request->session()->regenerateToken();

        return response()->json(['success' => true])->header('Cache-Control', 'no-store');
    }

    public function adminMe()
    {
        $user = Auth::guard('web')->user();

        return response()->json(['user' => $user && ! $user->disabled_at && ! $user->archived_at ? $this->adminData($user) : null])->header('Cache-Control', 'private, no-store');
    }

    public function adminData(User $user): array
    {
        $keys = ['id', 'username', 'role', 'can_manage_brands', 'can_delete_brands', 'can_manage_products', 'can_delete_products', 'can_manage_categories', 'can_delete_categories', 'can_manage_banners', 'can_delete_banners', 'can_manage_orders', 'can_delete_orders', 'can_manage_promo_codes', 'can_delete_promo_codes', 'can_manage_reviews'];

        $data = [...ApiJson::camel($user->only($keys)), 'name' => $user->username, 'permissions' => $user->role === 'SUPER_ADMIN' ? AdminAccess::PERMISSIONS : $user->permissions->pluck('permission')->all()];
        foreach (['Brands' => 'BRANDS', 'Products' => 'PRODUCTS', 'Categories' => 'CATEGORIES', 'Banners' => 'BANNERS', 'Orders' => 'ORDERS', 'PromoCodes' => 'SITE_CONTENT', 'Reviews' => 'REVIEWS'] as $legacy => $resource) {
            $data['canManage'.$legacy] = $user->role === 'SUPER_ADMIN' || in_array($resource.'_MANAGE', $data['permissions'], true);
            if ($legacy !== 'Reviews') {
                $data['canDelete'.$legacy] = $user->role === 'SUPER_ADMIN' || in_array($resource.'_ARCHIVE', $data['permissions'], true);
            }
        }

        return $data;
    }

    private function merchantData(Customer $customer, bool $profile = false): array
    {
        $keys = ['id', 'shop_name', 'owner_name', 'phone', 'city', 'is_active'];
        if ($profile) {
            $keys = [...$keys, 'address', 'notes', 'created_at'];
        }

        return ApiJson::camel($customer->only($keys));
    }

    private function clean(?string $value, int $max): string
    {
        return mb_substr(trim(preg_replace('/[\x00-\x1F\x7F-\x9F]/u', '', strip_tags($value ?? '')) ?? ''), 0, $max);
    }
}
