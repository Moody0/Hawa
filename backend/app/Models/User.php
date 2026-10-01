<?php

namespace App\Models;

use App\Models\Concerns\HasStringId;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;
    use HasStringId;

    protected $table = 'users';

    protected $guarded = [];

    protected $attributes = ['can_delete_banners' => true, 'can_delete_categories' => true, 'can_delete_orders' => true, 'can_delete_products' => true, 'can_delete_promo_codes' => true, 'can_manage_banners' => true, 'can_manage_categories' => true, 'can_manage_orders' => true, 'can_manage_products' => true, 'can_manage_promo_codes' => true, 'role' => 'ADMIN', 'can_delete_brands' => true, 'can_manage_brands' => true, 'can_manage_reviews' => true];

    public $incrementing = false;

    protected $keyType = 'string';

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return ['created_at' => 'datetime', 'updated_at' => 'datetime', 'can_delete_banners' => 'boolean', 'can_delete_categories' => 'boolean', 'can_delete_orders' => 'boolean', 'can_delete_products' => 'boolean', 'can_delete_promo_codes' => 'boolean', 'can_manage_banners' => 'boolean', 'can_manage_categories' => 'boolean', 'can_manage_orders' => 'boolean', 'can_manage_products' => 'boolean', 'can_manage_promo_codes' => 'boolean', 'can_delete_brands' => 'boolean', 'can_manage_brands' => 'boolean', 'can_manage_reviews' => 'boolean', 'archived_at' => 'datetime', 'disabled_at' => 'datetime', 'password' => 'hashed'];
    }

    protected static function booted(): void
    {
        static::addGlobalScope('active_records', fn ($q) => $q->whereNull($q->getModel()->getTable().'.archived_at'));
    }

    public function permissions()
    {
        return $this->hasMany(UserPermission::class);
    }
}
