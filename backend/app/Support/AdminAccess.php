<?php

namespace App\Support;

use App\Models\AdminAuditLog;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class AdminAccess
{
    public const PERMISSIONS = ['PRODUCTS_VIEW', 'PRODUCTS_MANAGE', 'PRODUCTS_ARCHIVE', 'PRODUCTS_IMPORT', 'BRANDS_VIEW', 'BRANDS_MANAGE', 'BRANDS_ARCHIVE', 'CATEGORIES_VIEW', 'CATEGORIES_MANAGE', 'CATEGORIES_ARCHIVE', 'MAIN_CATEGORIES_VIEW', 'MAIN_CATEGORIES_MANAGE', 'MAIN_CATEGORIES_ARCHIVE', 'BANNERS_VIEW', 'BANNERS_MANAGE', 'BANNERS_ARCHIVE', 'ORDERS_VIEW', 'ORDERS_MANAGE', 'ORDERS_ARCHIVE', 'CUSTOMERS_VIEW', 'CUSTOMERS_MANAGE', 'CUSTOMERS_ARCHIVE', 'REVIEWS_VIEW', 'REVIEWS_MANAGE', 'REVIEWS_ARCHIVE', 'BLOG_VIEW', 'BLOG_MANAGE', 'BLOG_ARCHIVE', 'SITE_CONTENT_VIEW', 'SITE_CONTENT_MANAGE', 'SITE_CONTENT_ARCHIVE', 'AUDIT_LOG_VIEW'];

    public static function check(string $permission): User
    {
        $user = Auth::guard('web')->user();
        abort_unless($user && ! $user->disabled_at && ! $user->archived_at, 401);
        if ($user->role === 'SUPER_ADMIN') {
            return $user;
        }
        $granted = $user->permissions->pluck('permission')->all();
        $allowed = in_array($permission, $granted, true);
        if (str_ends_with($permission, '_VIEW')) {
            $resource = substr($permission, 0, -5);
            $allowed = $allowed || in_array($resource.'_MANAGE', $granted, true) || in_array($resource.'_ARCHIVE', $granted, true);
        }
        abort_unless($allowed, 403, 'Missing administrator permission: '.$permission);

        return $user;
    }

    public static function audit(string $action, string $type, ?string $id = null, array $metadata = []): AdminAuditLog
    {
        return AdminAuditLog::create(['actor_id' => Auth::guard('web')->id(), 'action' => $action, 'entity_type' => $type, 'entity_id' => $id, 'metadata' => $metadata, 'created_at' => now()]);
    }
}
