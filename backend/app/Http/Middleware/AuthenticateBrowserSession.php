<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Auth\SessionGuard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateBrowserSession
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->hasSession()) {
            return $next($request);
        }

        $guards = [];
        foreach (config('sanctum.guard', []) as $name) {
            $guard = Auth::guard($name);
            if (! $guard instanceof SessionGuard) {
                continue;
            }
            $guards[$name] = $guard;
            $user = $guard->user();
            $stored = $request->session()->get('password_hash_'.$name);

            // Each guard must validate its own user's password. Comparing a
            // merchant's hash to the admin's hash logs both accounts out.
            $expiry = $request->session()->get($name === 'web' ? 'admin_expires_at' : 'merchant_expires_at');
            if ($user && (($expiry !== null && $expiry <= now()->timestamp) || ($user->disabled_at || $user->archived_at || ($name === 'merchant' && ! $user->is_active)) || ($stored !== null
                && ! hash_equals($guard->hashPasswordForCookie($user->getAuthPassword()), $stored)
                && ! hash_equals($user->getAuthPassword(), $stored)))) {
                $guard->logoutCurrentDevice();
                $request->session()->forget([
                    'password_hash_'.$name,
                    $name === 'web' ? 'admin_expires_at' : 'merchant_expires_at',
                ]);
            }
        }

        // Protected routes reject a revoked guard through their existing auth
        // middleware. Login routes can immediately validate fresh credentials.
        $response = $next($request);
        foreach ($guards as $name => $guard) {
            if ($user = $guard->user()) {
                $request->session()->put('password_hash_'.$name, $guard->hashPasswordForCookie($user->getAuthPassword()));
            }
        }

        return $response;
    }
}
