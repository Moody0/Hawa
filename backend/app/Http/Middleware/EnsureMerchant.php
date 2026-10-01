<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureMerchant
{
    public function handle(Request $request, Closure $next): Response
    {
        $merchant = Auth::guard('merchant')->user();
        if (! $merchant || ! $merchant->is_active) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        if (session()->has('merchant_expires_at') && now()->timestamp > session('merchant_expires_at')) {
            Auth::guard('merchant')->logout();
            session()->forget('merchant_expires_at');

            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return $next($request);
    }
}
