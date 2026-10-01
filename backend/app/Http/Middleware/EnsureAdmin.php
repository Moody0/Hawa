<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::guard('web')->user();
        if (! $user || $user->disabled_at || $user->archived_at || ! in_array($user->role, ['ADMIN', 'SUPER_ADMIN'], true)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        if (session()->has('admin_expires_at') && now()->timestamp > session('admin_expires_at')) {
            Auth::guard('web')->logout();
            session()->forget('admin_expires_at');

            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return $next($request);
    }
}
