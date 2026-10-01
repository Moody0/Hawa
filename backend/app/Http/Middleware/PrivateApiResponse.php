<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PrivateApiResponse
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);
        if ($request->is('api/*')) {
            $response->headers->set('Cache-Control', 'private, no-store');
        }
        $public = $request->is('api/products*', 'api/navigation', 'api/storefront/*', 'api/orders*', 'api/customer/wishlist');
        if ($public && $response instanceof JsonResponse) {
            $admin = Auth::guard('web')->user();
            $merchant = Auth::guard('merchant')->user();
            $allowed = ($admin && ! $admin->disabled_at && ! $admin->archived_at) || ($merchant && $merchant->is_active && ! $merchant->archived_at);
            $response->setData($this->project($response->getData(true), (bool) $allowed));
        }

        return $response;
    }

    private function project(mixed $value, bool $allowed): mixed
    {
        if (! is_array($value)) {
            return $value;
        }
        $hide = ! $allowed || ($value['hidePrice'] ?? false);
        foreach ($value as $key => $item) {
            if ($hide && in_array($key, ['price', 'discountPrice', 'discountType', 'discountValue'], true)) {
                $value[$key] = null;
            } elseif (! $allowed && in_array($key, ['totalAmount', 'discount'], true)) {
                $value[$key] = 0;
            } else {
                $value[$key] = $this->project($item, $allowed);
            }
        }

        return $value;
    }
}
